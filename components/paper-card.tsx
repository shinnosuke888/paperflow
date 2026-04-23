"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { formatAbsoluteDate, formatRelativeDate, formatShortDate } from "@/lib/format";
import { buildPaperHref, buildPaperSummaryPreview } from "@/lib/papers";
import { cx } from "@/lib/utils";
import type { Paper } from "@/types/paper";

type PaperCardProps = {
  paper: Paper;
  initialSaved: boolean;
  isAuthenticated: boolean;
  loginHref?: string;
  savedAt?: string | null;
  showDetailLink?: boolean;
  showFullSummary?: boolean;
};

export function PaperCard({
  paper,
  initialSaved,
  isAuthenticated,
  loginHref = "/login",
  savedAt,
  showDetailLink = true,
  showFullSummary = false,
}: PaperCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const detailHref = buildPaperHref(paper.id);
  const displayTitle = paper.translatedTitle ?? paper.title;
  const summarySource = paper.translatedSummary ?? paper.summary;
  const summaryText = showFullSummary
    ? summarySource
    : buildPaperSummaryPreview(summarySource, 260);

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

      if (response.status === 401) {
        router.push(loginHref);
        return;
      }

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
      title: displayTitle,
      text: `${displayTitle} | PaperFlow`,
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
      `${displayTitle} ${paper.arxivUrl}`,
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
        {savedAt ? <span className="meta-text">保存日 {formatShortDate(savedAt)}</span> : null}
      </div>

      <div className="paper-body">
        {paper.authors.length > 0 ? (
          <p className="paper-authors">{paper.authors.slice(0, 4).join(", ")}</p>
        ) : null}
        {showDetailLink ? (
          <Link className="paper-title-link" href={detailHref}>
            <h2 className="paper-title">{displayTitle}</h2>
          </Link>
        ) : (
          <h2 className="paper-title">{displayTitle}</h2>
        )}

        <div className="summary-block">
          <span className="summary-label">{paper.translatedSummary ? "日本語要約" : "要約"}</span>
          <p className={cx("paper-summary", showFullSummary && "is-expanded")}>{summaryText}</p>
        </div>

        {paper.translatedTitle ? <p className="paper-original-title">Original: {paper.title}</p> : null}

        {paper.comment ? <p className="paper-comment">著者メモ: {paper.comment}</p> : null}
      </div>

      <div className="paper-footer">
        <div className="paper-links">
          {showDetailLink ? (
            <Link className="link-button" href={detailHref}>
              詳細
            </Link>
          ) : null}
          <a className="link-button" href={paper.arxivUrl} rel="noreferrer" target="_blank">
            原文
          </a>
          {paper.pdfUrl ? (
            <a className="link-button muted" href={paper.pdfUrl} rel="noreferrer" target="_blank">
              PDF
            </a>
          ) : null}
        </div>

        <div className="paper-actions">
          {isAuthenticated ? (
            <button
              className={cx("action-button", saved && "is-active")}
              disabled={pending}
              onClick={handleFavoriteToggle}
              type="button"
            >
              {saved ? "保存済み" : "保存"}
            </button>
          ) : (
            <Link className="action-button" href={loginHref}>
              ログインして保存
            </Link>
          )}

          <button className="action-button" onClick={handleShare} type="button">
            共有
          </button>
        </div>
      </div>

      {statusMessage ? <p className="inline-error">{statusMessage}</p> : null}
    </article>
  );
}
