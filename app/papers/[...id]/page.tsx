import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { PaperCard } from "@/components/paper-card";
import { fetchArxivPaperById } from "@/lib/arxiv";
import { getOptionalAuth } from "@/lib/auth";
import { getFavoriteIds, getFavoritePreview } from "@/lib/favorites";
import { formatAbsoluteDate } from "@/lib/format";
import { translatePapersWithGemini } from "@/lib/gemini-translate";
import {
  buildLoginHref,
  buildPaperHref,
  buildPaperSummaryPreview,
  getPaperIdFromSegments,
} from "@/lib/papers";

type PaperDetailPageProps = {
  params: Promise<{
    id: string[];
  }>;
};

export const dynamic = "force-dynamic";

export default async function PaperDetailPage({ params }: PaperDetailPageProps) {
  const resolvedParams = await params;
  const paperId = getPaperIdFromSegments(resolvedParams.id ?? []);

  if (!paperId) {
    notFound();
  }

  const paper = await fetchArxivPaperById(paperId);

  if (!paper) {
    notFound();
  }

  const [translatedPaper] = await translatePapersWithGemini([paper]);

  if (!translatedPaper) {
    notFound();
  }

  const { userEmail, userId } = await getOptionalAuth();
  const [favoriteIds, savedData] = userId
    ? await Promise.all([getFavoriteIds(), getFavoritePreview()])
    : [new Set<string>(), { items: [], count: 0 }];
  const detailHref = buildPaperHref(translatedPaper.id);

  return (
    <AppShell
      activeRoute="home"
      isAuthenticated={Boolean(userId)}
      savedCount={savedData.count}
      savedPreview={savedData.items}
      userEmail={userEmail}
    >
      <header className="feed-header detail-header">
        <div>
          <Link className="back-link" href="/">
            ← タイムラインに戻る
          </Link>
          <p className="eyebrow">論文詳細</p>
          <h1>論文の詳細ページ</h1>
          <p className="lead">日本語要約、原文 Abstract、著者情報をまとめて確認できます。</p>
        </div>
        <div className="header-stats">
          <div className="stat-chip">
            <span className="stat-label">カテゴリ</span>
            <strong>{translatedPaper.primaryCategory}</strong>
          </div>
          <div className="stat-chip">
            <span className="stat-label">公開日</span>
            <strong>{formatAbsoluteDate(translatedPaper.publishedAt)}</strong>
          </div>
        </div>
      </header>

      <section className="timeline-section detail-layout">
        <PaperCard
          initialSaved={favoriteIds.has(translatedPaper.id)}
          isAuthenticated={Boolean(userId)}
          loginHref={buildLoginHref(detailHref, "論文を保存するにはログインしてください。")}
          paper={translatedPaper}
          showDetailLink={false}
        />

        <div className="detail-grid">
          <section className="detail-section">
            <div className="section-heading">
              <p className="eyebrow">クイック要約</p>
              <h2>ひと目でわかる日本語要約</h2>
              <p>Gemini API を使って、Abstract を読みやすい日本語で表示しています。</p>
            </div>
            <p className="detail-summary-lead">
              {buildPaperSummaryPreview(
                translatedPaper.translatedSummary ?? translatedPaper.summary,
                420,
              )}
            </p>
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <p className="eyebrow">原題</p>
              <h2>Original title</h2>
            </div>
            <p className="detail-abstract">{translatedPaper.title}</p>
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <p className="eyebrow">メタデータ</p>
              <h2>論文情報</h2>
            </div>
            <div className="detail-meta-grid">
              <div className="detail-meta-card">
                <span>著者</span>
                <strong>
                  {translatedPaper.authors.length > 0
                    ? translatedPaper.authors.join(", ")
                    : "未登録"}
                </strong>
              </div>
              <div className="detail-meta-card">
                <span>カテゴリ</span>
                <strong>
                  {translatedPaper.categories.length > 0
                    ? translatedPaper.categories.join(", ")
                    : translatedPaper.primaryCategory}
                </strong>
              </div>
              <div className="detail-meta-card">
                <span>論文ID</span>
                <strong>{translatedPaper.id}</strong>
              </div>
              <div className="detail-meta-card">
                <span>更新日</span>
                <strong>{formatAbsoluteDate(translatedPaper.updatedAt)}</strong>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <p className="eyebrow">日本語訳</p>
              <h2>日本語 Abstract</h2>
            </div>
            <p className="detail-abstract">
              {translatedPaper.translatedSummary ?? "翻訳結果がまだ利用できません。"}
            </p>
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <p className="eyebrow">Abstract</p>
              <h2>原文 Abstract</h2>
            </div>
            <p className="detail-abstract">{translatedPaper.summary}</p>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
