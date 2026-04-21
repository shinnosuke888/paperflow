import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { PaperCard } from "@/components/paper-card";
import { TimelineFilters } from "@/components/timeline-filters";
import { requireAuth } from "@/lib/auth";
import { fetchArxivPapers } from "@/lib/arxiv";
import { getFavoriteIds, getFavoritePreview } from "@/lib/favorites";
import { isKnownCategory } from "@/lib/site";
import { firstParam, parsePage } from "@/lib/utils";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const query = firstParam(params.q)?.trim() ?? "";
  const categoryParam = firstParam(params.category);
  const category = isKnownCategory(categoryParam) ? (categoryParam ?? "all") : "all";
  const page = parsePage(firstParam(params.page));

  const { userEmail } = await requireAuth();
  const [favoriteIds, savedData] = await Promise.all([getFavoriteIds(), getFavoritePreview()]);

  let papers = await fetchArxivPapers({
    query,
    category,
    page,
  }).catch(() => null);

  if (!papers) {
    papers = {
      items: [],
      total: 0,
      start: 0,
      pageSize: 20,
    };
  }

  const hasNextPage = papers.start + papers.items.length < papers.total;

  return (
    <AppShell
      activeRoute="home"
      userEmail={userEmail}
      savedCount={savedData.count}
      savedPreview={savedData.items}
    >
      <header className="feed-header">
        <div>
          <p className="eyebrow">Open research, real time</p>
          <h1>Paper timeline</h1>
          <p className="lead">
            arXiv の新着論文を X のような流れで追い、面白いものだけを保存します。
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-chip">
            <span className="stat-label">Results</span>
            <strong>{papers.total.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Saved</span>
            <strong>{favoriteIds.size}</strong>
          </div>
        </div>
      </header>

      <TimelineFilters category={category} query={query} />

      <section className="timeline-section">
        {query || category !== "all" ? (
          <div className="section-caption">
            <span>Filter</span>
            <strong>
              {query ? `"${query}"` : "All"} {category !== "all" ? `· ${category}` : ""}
            </strong>
          </div>
        ) : null}

        {papers.items.length > 0 ? (
          <div className="timeline-list">
            {papers.items.map((paper) => (
              <PaperCard
                key={paper.id}
                initialSaved={favoriteIds.has(paper.id)}
                paper={paper}
              />
            ))}
          </div>
        ) : (
          <div className="empty-card">
            <h2>論文を読み込めませんでした</h2>
            <p>
              arXiv からの取得結果が空でした。検索語やカテゴリを変えて再試行してください。
            </p>
          </div>
        )}

        <PaginationControls
          category={category}
          hasNextPage={hasNextPage}
          page={page}
          query={query}
        />
      </section>
    </AppShell>
  );
}
