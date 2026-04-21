export type Paper = {
  id: string;
  source: "arxiv";
  title: string;
  summary: string;
  authors: string[];
  categories: string[];
  primaryCategory: string;
  publishedAt: string;
  updatedAt: string;
  arxivUrl: string;
  pdfUrl: string | null;
  comment: string | null;
};

export type PaperFeed = {
  items: Paper[];
  total: number;
  start: number;
  pageSize: number;
};
