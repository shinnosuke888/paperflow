import { XMLParser } from "fast-xml-parser";

import { DEFAULT_SEARCH_QUERY, TIMELINE_PAGE_SIZE } from "@/lib/site";
import type { Paper, PaperFeed } from "@/types/paper";

type FetchPaperOptions = {
  query?: string;
  category?: string;
  page?: number;
};

type ArxivEntry = {
  id?: string;
  title?: string;
  summary?: string;
  published?: string;
  updated?: string;
  author?: Array<{ name?: string }> | { name?: string };
  category?: Array<{ term?: string }> | { term?: string };
  link?:
    | Array<{ href?: string; title?: string; rel?: string; type?: string }>
    | { href?: string; title?: string; rel?: string; type?: string };
  "arxiv:primary_category"?: {
    term?: string;
  };
  "arxiv:comment"?: string;
};

type ArxivFeedResponse = {
  feed?: {
    entry?: ArxivEntry[] | ArxivEntry;
    "opensearch:totalResults"?: number | string;
  };
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
  isArray: (tagName) => ["entry", "author", "category", "link"].includes(tagName),
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function sanitizeText(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeArxivUrl(url: string) {
  return url.replace("http://", "https://");
}

function buildSearchQuery(query?: string, category?: string) {
  const normalizedQuery = sanitizeText(query);
  const parts: string[] = [];

  if (normalizedQuery) {
    parts.push(`all:"${normalizedQuery.replace(/"/g, "")}"`);
  }

  if (category && category !== "all") {
    parts.push(`cat:${category}`);
  }

  if (parts.length === 0) {
    return DEFAULT_SEARCH_QUERY;
  }

  return parts.join(" AND ");
}

function parseEntry(entry: ArxivEntry): Paper {
  const authors = toArray(entry.author)
    .map((author) => sanitizeText(author.name))
    .filter(Boolean);

  const categories = toArray(entry.category)
    .map((category) => sanitizeText(category.term))
    .filter(Boolean);

  const links = toArray(entry.link);
  const id = sanitizeText(entry.id);
  const fallbackPdfUrl = id ? id.replace("/abs/", "/pdf/") + ".pdf" : null;
  const pdfUrl =
    links.find((link) => link.title === "pdf" || link.type === "application/pdf")?.href ??
    fallbackPdfUrl;

  return {
    id: id.split("/abs/").pop() ?? id,
    source: "arxiv",
    title: sanitizeText(entry.title),
    summary: sanitizeText(entry.summary),
    translatedTitle: null,
    translatedSummary: null,
    authors,
    categories,
    primaryCategory:
      sanitizeText(entry["arxiv:primary_category"]?.term) || categories[0] || "arXiv",
    publishedAt: sanitizeText(entry.published),
    updatedAt: sanitizeText(entry.updated),
    arxivUrl: normalizeArxivUrl(id),
    pdfUrl: pdfUrl ? normalizeArxivUrl(pdfUrl) : null,
    comment: sanitizeText(entry["arxiv:comment"]) || null,
  };
}

async function fetchArxivFeed(params: URLSearchParams, revalidate = 900) {
  const response = await fetch(`https://export.arxiv.org/api/query?${params.toString()}`, {
    headers: {
      "User-Agent": "PaperFlow/0.1 (open research timeline)",
    },
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch papers from arXiv.");
  }

  const xml = await response.text();
  return parser.parse(xml) as ArxivFeedResponse;
}

export async function fetchArxivPapers({
  query,
  category = "all",
  page = 1,
}: FetchPaperOptions = {}): Promise<PaperFeed> {
  const start = (page - 1) * TIMELINE_PAGE_SIZE;
  const searchQuery = buildSearchQuery(query, category);
  const params = new URLSearchParams({
    search_query: searchQuery,
    start: String(start),
    max_results: String(TIMELINE_PAGE_SIZE),
    sortBy: "submittedDate",
    sortOrder: "descending",
  });
  const parsed = await fetchArxivFeed(params);
  const feed = parsed.feed;
  const entries = toArray(feed?.entry).map(parseEntry);
  const total = Number(feed?.["opensearch:totalResults"] ?? entries.length);

  return {
    items: entries,
    total,
    start,
    pageSize: TIMELINE_PAGE_SIZE,
  };
}

export async function fetchArxivPaperById(id: string) {
  const params = new URLSearchParams({
    id_list: id,
  });
  const parsed = await fetchArxivFeed(params, 3600);
  const entry = toArray(parsed.feed?.entry).map(parseEntry)[0];

  return entry ?? null;
}
