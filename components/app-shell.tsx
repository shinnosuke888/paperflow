import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/actions";
import { formatShortDate } from "@/lib/format";
import { buildLoginHref } from "@/lib/papers";
import { PAPER_CATEGORIES } from "@/lib/site";
import { cx } from "@/lib/utils";
import type { FavoritePreview } from "@/lib/favorites";

type AppShellProps = {
  activeRoute: "home" | "saved";
  isAuthenticated: boolean;
  userEmail: string;
  savedCount: number;
  savedPreview: FavoritePreview[];
  children: ReactNode;
};

export function AppShell({
  activeRoute,
  isAuthenticated,
  userEmail,
  savedCount,
  savedPreview,
  children,
}: AppShellProps) {
  const savedHref = isAuthenticated
    ? "/saved"
    : buildLoginHref("/saved", "保存した論文を見るにはログインしてください。");

  return (
    <div className="page-shell">
      <div className="app-shell">
        <aside className="left-rail panel">
          <div className="brand-block">
            <div className="brand-mark">PF</div>
            <div>
              <span className="eyebrow">研究フィード</span>
              <h2>PaperFlow</h2>
            </div>
          </div>

          <nav className="rail-nav">
            <Link className={cx("rail-link", activeRoute === "home" && "is-active")} href="/">
              <span>タイムライン</span>
              <small>arXiv の新着を一覧</small>
            </Link>

            <Link className={cx("rail-link", activeRoute === "saved" && "is-active")} href={savedHref}>
              <span>保存済み</span>
              <small>{isAuthenticated ? `${savedCount} 件` : "ログインで利用"}</small>
            </Link>
          </nav>

          <div className="rail-card">
            <span className="eyebrow">{isAuthenticated ? "セッション" : "ゲスト閲覧"}</span>
            <strong>{isAuthenticated ? userEmail || "ログイン済み" : "ログインして保存を有効化"}</strong>
            <p>
              {isAuthenticated
                ? "Supabase セッションでお気に入りを同期しています。"
                : "論文一覧と詳細ページはそのまま閲覧できます。"}
            </p>
          </div>

          {isAuthenticated ? (
            <form action={signOutAction} className="signout-form">
              <button className="secondary-button full-width" type="submit">
                ログアウト
              </button>
            </form>
          ) : (
            <div className="auth-link-grid">
              <Link className="primary-button full-width" href="/login">
                ログイン / 新規登録
              </Link>
            </div>
          )}
        </aside>

        <main className="feed-panel panel">{children}</main>

        <aside className="right-rail panel">
          <section className="sidebar-section">
            <div className="section-heading compact">
              <p className="eyebrow">{isAuthenticated ? "最近保存した論文" : "保存機能"}</p>
              <h3>{isAuthenticated ? "ブックマーク" : "ログインで使えること"}</h3>
            </div>

            {isAuthenticated && savedPreview.length > 0 ? (
              <div className="saved-mini-list">
                {savedPreview.map((paper) => (
                  <a
                    className="mini-paper"
                    href={paper.arxiv_url}
                    key={paper.paper_id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <strong>{paper.title}</strong>
                    <span>
                      {paper.primary_category ?? "arXiv"} · {formatShortDate(paper.saved_at)}
                    </span>
                  </a>
                ))}
              </div>
            ) : isAuthenticated ? (
              <div className="sidebar-empty">保存した論文はまだありません。</div>
            ) : (
              <div className="sidebar-empty">
                ログインすると、論文の保存、保存一覧、端末をまたいだ同期が使えます。
              </div>
            )}
          </section>

          <section className="sidebar-section">
            <div className="section-heading compact">
              <p className="eyebrow">注目カテゴリ</p>
              <h3>クイックフィルタ</h3>
            </div>
            <div className="tag-cloud">
              {PAPER_CATEGORIES.filter((category) => category.value !== "all").map((category) => (
                <Link
                  className="tag-link"
                  href={`/?category=${encodeURIComponent(category.value)}`}
                  key={category.value}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="sidebar-section note-card">
            <span className="eyebrow">構成</span>
            <p>フィード: arXiv API</p>
            <p>認証 / DB: Supabase</p>
            <p>ホスティング: Vercel</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
