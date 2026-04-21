import { AppShell } from "@/components/app-shell";
import { PaperCard } from "@/components/paper-card";
import { requireAuth } from "@/lib/auth";
import { getAllFavorites } from "@/lib/favorites";
import type { Paper } from "@/types/paper";

export const dynamic = "force-dynamic";

function favoriteToPaper(favorite: Awaited<ReturnType<typeof getAllFavorites>>[number]): Paper {
  return {
    id: favorite.paper_id,
    source: "arxiv",
    title: favorite.title,
    summary: favorite.summary,
    authors: favorite.authors,
    categories: favorite.categories,
    primaryCategory: favorite.primary_category ?? favorite.categories[0] ?? "arXiv",
    publishedAt: favorite.published_at ?? favorite.saved_at,
    updatedAt: favorite.updated_at ?? favorite.saved_at,
    arxivUrl: favorite.arxiv_url,
    pdfUrl: favorite.pdf_url,
    comment: favorite.comment,
  };
}

export default async function SavedPage() {
  const { userEmail } = await requireAuth();
  const favorites = await getAllFavorites();
  const savedPreview = favorites.slice(0, 6).map((favorite) => ({
    paper_id: favorite.paper_id,
    title: favorite.title,
    primary_category: favorite.primary_category,
    saved_at: favorite.saved_at,
    arxiv_url: favorite.arxiv_url,
  }));

  return (
    <AppShell
      activeRoute="saved"
      userEmail={userEmail}
      savedCount={favorites.length}
      savedPreview={savedPreview}
    >
      <header className="feed-header">
        <div>
          <p className="eyebrow">Your stack</p>
          <h1>Saved papers</h1>
          <p className="lead">後で読む論文、引用候補、追跡したいトピックをここに残します。</p>
        </div>
        <div className="header-stats">
          <div className="stat-chip">
            <span className="stat-label">Library</span>
            <strong>{favorites.length}</strong>
          </div>
        </div>
      </header>

      <section className="timeline-section">
        {favorites.length > 0 ? (
          <div className="timeline-list">
            {favorites.map((favorite) => (
              <PaperCard
                key={favorite.paper_id}
                initialSaved
                paper={favoriteToPaper(favorite)}
                savedAt={favorite.saved_at}
              />
            ))}
          </div>
        ) : (
          <div className="empty-card">
            <h2>まだ保存された論文はありません</h2>
            <p>タイムラインから気になる論文を保存すると、ここに並びます。</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
