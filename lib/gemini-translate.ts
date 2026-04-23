import type { Paper } from "@/types/paper";

type PaperTranslation = {
  id: string;
  translatedTitle: string;
  translatedSummary: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const MODEL_NAME = "gemini-2.5-flash";

const globalForGemini = globalThis as typeof globalThis & {
  __paperflowGeminiCache?: Map<string, Promise<PaperTranslation[]>>;
};

function getTranslationCache() {
  if (!globalForGemini.__paperflowGeminiCache) {
    globalForGemini.__paperflowGeminiCache = new Map();
  }

  return globalForGemini.__paperflowGeminiCache;
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY ?? null;
}

function getTranslationPrompt(items: Array<Pick<Paper, "id" | "title" | "summary">>) {
  return `
あなたはコンピュータサイエンス論文の翻訳アシスタントです。
入力 JSON に含まれる各論文の title と summary を、自然で読みやすい日本語に翻訳してください。

守ること:
- 研究内容を勝手に補わない
- モデル名、ベンチマーク名、数式、略語、著者名、URL は必要なら原文を維持する
- title は簡潔で自然な日本語にする
- summary は意味を落とさず日本語にする
- JSON 以外のテキストは返さない

入力:
${JSON.stringify(items)}
`.trim();
}

async function requestGeminiTranslations(
  items: Array<Pick<Paper, "id" | "title" | "summary">>,
): Promise<PaperTranslation[]> {
  const apiKey = getGeminiApiKey();

  if (!apiKey || items.length === 0) {
    return [];
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: getTranslationPrompt(items),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "The paper id from the input JSON.",
                    },
                    translatedTitle: {
                      type: "string",
                      description: "Natural Japanese translation of the paper title.",
                    },
                    translatedSummary: {
                      type: "string",
                      description: "Natural Japanese translation of the paper summary.",
                    },
                  },
                  required: ["id", "translatedTitle", "translatedSummary"],
                },
              },
            },
            required: ["items"],
          },
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini translation failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const jsonText = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!jsonText) {
    return [];
  }

  const parsed = JSON.parse(jsonText) as {
    items?: PaperTranslation[];
  };

  return parsed.items ?? [];
}

export async function translatePapersWithGemini(papers: Paper[]) {
  const apiKey = getGeminiApiKey();

  if (!apiKey || papers.length === 0) {
    return papers;
  }

  const sourceItems = papers.map((paper) => ({
    id: paper.id,
    title: paper.title,
    summary: paper.summary,
  }));
  const cacheKey = JSON.stringify(sourceItems);
  const translationCache = getTranslationCache();

  let translationPromise = translationCache.get(cacheKey);

  if (!translationPromise) {
    translationPromise = requestGeminiTranslations(sourceItems).catch((error) => {
      translationCache.delete(cacheKey);
      throw error;
    });
    translationCache.set(cacheKey, translationPromise);
  }

  try {
    const translatedItems = await translationPromise;
    const translationMap = new Map(translatedItems.map((item) => [item.id, item]));

    return papers.map((paper) => {
      const translated = translationMap.get(paper.id);

      return {
        ...paper,
        translatedTitle: translated?.translatedTitle ?? paper.translatedTitle,
        translatedSummary: translated?.translatedSummary ?? paper.translatedSummary,
      };
    });
  } catch (error) {
    console.error(error);
    return papers;
  }
}
