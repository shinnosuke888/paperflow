import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { PaperCard } from "@/components/paper-card";
import { TimelineFilters } from "@/components/timeline-filters";
import { getOptionalAuth } from "@/lib/auth";
import { fetchArxivPapers } from "@/lib/arxiv";
import { getFavoriteIds, getFavoritePreview } from "@/lib/favorites";
import { translatePapersWithGemini } from "@/lib/gemini-translate";
import { buildLoginHref, buildTimelineHref } from "@/lib/papers";
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
  const currentPath = buildTimelineHref({
    query,
    category,
    page,
  });

  const { userEmail, userId } = await getOptionalAuth();
  const [favoriteIds, savedData] = userId
    ? await Promise.all([getFavoriteIds(), getFavoritePreview()])
    : [new Set<string>(), { items: [], count: 0 }];

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

  papers = {
    ...papers,
    items: await translatePapersWithGemini(papers.items),
  };

  const hasNextPage = papers.start + papers.items.length < papers.total;

  return (
    <AppShell
      activeRoute="home"
      userEmail={userEmail}
      isAuthenticated={Boolean(userId)}
      savedCount={savedData.count}
      savedPreview={savedData.items}
    >
      <header className="feed-header">
        <div>
          <p className="eyebrow">研究論文をひらく</p>
          <h1>論文タイムライン</h1>
          <p className="lead">
            arXiv の新着論文をタイムライン形式で追い、気になった論文だけを保存できます。
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-chip">
            <span className="stat-label">論文数</span>
            <strong>{papers.total.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span className="stat-label">保存</span>
            <strong>{favoriteIds.size}</strong>
          </div>
        </div>
      </header>

      {!userId ? (
        <div className="info-banner">
          <strong>ゲストとして閲覧中です。</strong>
          <span>論文の保存はログイン後に使えます。読むだけならそのまま続けられます。</span>
        </div>
      ) : null}

      <TimelineFilters category={category} query={query} />

      <section className="timeline-section">
        {query || category !== "all" ? (
          <div className="section-caption">
            <span>絞り込み</span>
            <strong>
              {query ? `「${query}」` : "すべて"} {category !== "all" ? `· ${category}` : ""}
            </strong>
          </div>
        ) : null}

        {papers.items.length > 0 ? (
          <div className="timeline-list">
            {papers.items.map((paper) => (
              <PaperCard
                key={paper.id}
                initialSaved={favoriteIds.has(paper.id)}
                isAuthenticated={Boolean(userId)}
                loginHref={buildLoginHref(currentPath, "論文を保存するにはログインしてください。")}
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
