import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { Paper } from "@/types/paper";

type FavoriteBody = {
  paper?: Partial<Paper>;
};

function normalizePaper(payload: Partial<Paper> | undefined): Paper | null {
  if (!payload?.id || !payload.title || !payload.arxivUrl) {
    return null;
  }

  return {
    id: payload.id,
    source: "arxiv",
    title: payload.title,
    summary: payload.summary ?? "",
    authors: Array.isArray(payload.authors) ? payload.authors.filter(Boolean) : [],
    categories: Array.isArray(payload.categories) ? payload.categories.filter(Boolean) : [],
    primaryCategory: payload.primaryCategory ?? "arXiv",
    publishedAt: payload.publishedAt ?? new Date().toISOString(),
    updatedAt: payload.updatedAt ?? payload.publishedAt ?? new Date().toISOString(),
    arxivUrl: payload.arxivUrl,
    pdfUrl: payload.pdfUrl ?? null,
    comment: payload.comment ?? null,
  };
}

async function getAuthorizedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = ((data?.claims ?? null) as { sub?: string } | null)?.sub;

  return {
    supabase,
    userId: userId ?? null,
  };
}

export async function POST(request: Request) {
  const { supabase, userId } = await getAuthorizedClient();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as FavoriteBody;
  const paper = normalizePaper(body.paper);

  if (!paper) {
    return NextResponse.json({ error: "Invalid paper payload" }, { status: 400 });
  }

  const { error } = await supabase.from("favorite_papers").upsert(
    {
      user_id: userId,
      paper_id: paper.id,
      source: paper.source,
      title: paper.title,
      summary: paper.summary,
      authors: paper.authors,
      categories: paper.categories,
      primary_category: paper.primaryCategory,
      arxiv_url: paper.arxivUrl,
      pdf_url: paper.pdfUrl,
      comment: paper.comment,
      published_at: paper.publishedAt,
      updated_at: paper.updatedAt,
    },
    {
      onConflict: "user_id,paper_id",
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: true });
}

export async function DELETE(request: Request) {
  const { supabase, userId } = await getAuthorizedClient();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as FavoriteBody;
  const paperId = body.paper?.id;

  if (!paperId) {
    return NextResponse.json({ error: "Invalid paper payload" }, { status: 400 });
  }

  const { error } = await supabase
    .from("favorite_papers")
    .delete()
    .eq("user_id", userId)
    .eq("paper_id", paperId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: false });
}
