import type { Paper } from "@/types/paper";

type TimelineHrefOptions = {
  page?: number;
  query: string;
  category: string;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength).trim();
  const lastSpace = sliced.lastIndexOf(" ");

  if (lastSpace < maxLength * 0.6) {
    return `${sliced}…`;
  }

  return `${sliced.slice(0, lastSpace)}…`;
}

export function buildPaperSummaryPreview(summary: string, maxLength = 240) {
  const normalized = normalizeText(summary);

  if (!normalized) {
    return "要約はまだありません。";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  let candidate = "";

  for (const sentence of sentences) {
    const nextValue = candidate ? `${candidate} ${sentence}` : sentence;

    if (nextValue.length > maxLength && candidate) {
      break;
    }

    candidate = nextValue;

    if (candidate.length >= Math.min(maxLength, 180)) {
      break;
    }
  }

  return truncateAtWord(candidate || normalized, maxLength);
}

export function buildPaperHref(paperId: string) {
  const encodedId = paperId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `/papers/${encodedId}`;
}

export function getPaperIdFromSegments(segments: string[]) {
  return segments.map((segment) => decodeURIComponent(segment)).join("/");
}

export function buildTimelineHref({ page = 1, query, category }: TimelineHrefOptions) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category !== "all") {
    params.set("category", category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `/?${search}` : "/";
}

export function buildLoginHref(next: string, message?: string) {
  const params = new URLSearchParams();

  if (message) {
    params.set("message", message);
  }

  params.set("next", next);

  return `/login?${params.toString()}`;
}

export function getPaperMetaDescription(paper: Paper) {
  return buildPaperSummaryPreview(paper.summary, 160);
}
