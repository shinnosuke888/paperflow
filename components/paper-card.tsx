"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { formatAbsoluteDate, formatRelativeDate, formatShortDate } from "@/lib/format";
import { cx } from "@/lib/utils";
import type { Paper } from "@/types/paper";

type PaperCardProps = {
  paper: Paper;
  initialSaved: boolean;
  savedAt?: string | null;
};

export function PaperCard({ paper, initialSaved, savedAt }: PaperCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleFavoriteToggle() {
    if (pending) {
      return;
    }

    const nextSaved = !saved;

    setPending(true);
    setSaved(nextSaved);
    setStatusMessage("");

    try {
      const response = await fetch("/api/favorites", {
        method: nextSaved ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paper,
        }),
      });

      if (!response.ok) {
        throw new Error("Favorite update failed");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setSaved(!nextSaved);
      setStatusMessage("保存状態の更新に失敗しました。");
    } finally {
      setPending(false);
    }
  }

  async function handleShare() {
    const payload = {
      title: paper.title,
      text: `${paper.title} | PaperFlow`,
      url: paper.arxivUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") {
          return;
        }
      }
    }

    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      `${paper.title} ${paper.arxivUrl}`,
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <article className="paper-card">
      <div className="paper-meta">
        <span className="pill accent">{paper.primaryCategory}</span>
        <span className="pill">arXiv</span>
        <span className="meta-text" title={formatAbsoluteDate(paper.publishedAt)}>
          {formatRelativeDate(paper.publishedAt)}
        </span>
        {savedAt ? <span className="meta-text">Saved {formatShortDate(savedAt)}</span> : null}
      </div>

      <div className="paper-body">
        {paper.authors.length > 0 ? (
          <p className="paper-authors">{paper.authors.slice(0, 4).join(", ")}</p>
        ) : null}
        <h2 className="paper-title">{paper.title}</h2>
        <p className="paper-summary">{paper.summary}</p>

        {paper.comment ? <p className="paper-comment">Author note: {paper.comment}</p> : null}
      </div>

      <div className="paper-footer">
        <div className="paper-links">
          <a className="link-button" href={paper.arxivUrl} rel="noreferrer" target="_blank">
            Read
          </a>
          {paper.pdfUrl ? (
            <a className="link-button muted" href={paper.pdfUrl} rel="noreferrer" target="_blank">
              PDF
            </a>
          ) : null}
        </div>

        <div className="paper-actions">
          <button
            className={cx("action-button", saved && "is-active")}
            disabled={pending}
            onClick={handleFavoriteToggle}
            type="button"
          >
            {saved ? "Saved" : "Save"}
          </button>

          <button className="action-button" onClick={handleShare} type="button">
            Share
          </button>
        </div>
      </div>

      {statusMessage ? <p className="inline-error">{statusMessage}</p> : null}
    </article>
  );
}
