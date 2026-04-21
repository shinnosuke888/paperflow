import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/actions";
import { formatShortDate } from "@/lib/format";
import { PAPER_CATEGORIES } from "@/lib/site";
import { cx } from "@/lib/utils";
import type { FavoritePreview } from "@/lib/favorites";

type AppShellProps = {
  activeRoute: "home" | "saved";
  userEmail: string;
  savedCount: number;
  savedPreview: FavoritePreview[];
  children: ReactNode;
};

export function AppShell({
  activeRoute,
  userEmail,
  savedCount,
  savedPreview,
  children,
}: AppShellProps) {
  return (
    <div className="page-shell">
      <div className="app-shell">
        <aside className="left-rail panel">
          <div className="brand-block">
            <div className="brand-mark">PF</div>
            <div>
              <span className="eyebrow">Research feed</span>
              <h2>PaperFlow</h2>
            </div>
          </div>

          <nav className="rail-nav">
            <Link className={cx("rail-link", activeRoute === "home" && "is-active")} href="/">
              <span>Timeline</span>
              <small>Latest from arXiv</small>
            </Link>

            <Link
              className={cx("rail-link", activeRoute === "saved" && "is-active")}
              href="/saved"
            >
              <span>Saved</span>
              <small>{savedCount} papers</small>
            </Link>
          </nav>

          <div className="rail-card">
            <span className="eyebrow">Session</span>
            <strong>{userEmail || "Authenticated"}</strong>
            <p>Supabase セッションでお気に入りを同期しています。</p>
          </div>

          <form action={signOutAction} className="signout-form">
            <button className="secondary-button full-width" type="submit">
              Sign out
            </button>
          </form>
        </aside>

        <main className="feed-panel panel">{children}</main>

        <aside className="right-rail panel">
          <section className="sidebar-section">
            <div className="section-heading compact">
              <p className="eyebrow">Saved now</p>
              <h3>Recent bookmarks</h3>
            </div>

            {savedPreview.length > 0 ? (
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
            ) : (
              <div className="sidebar-empty">保存した論文はまだありません。</div>
            )}
          </section>

          <section className="sidebar-section">
            <div className="section-heading compact">
              <p className="eyebrow">Focus areas</p>
              <h3>Quick filters</h3>
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
            <span className="eyebrow">Stack</span>
            <p>Feed: arXiv API</p>
            <p>Auth & DB: Supabase</p>
            <p>Hosting: Vercel</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
