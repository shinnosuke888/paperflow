import Link from "next/link";

import { buildTimelineHref } from "@/lib/papers";

type PaginationControlsProps = {
  page: number;
  hasNextPage: boolean;
  query: string;
  category: string;
};

export function PaginationControls({
  page,
  hasNextPage,
  query,
  category,
}: PaginationControlsProps) {
  return (
    <div className="pagination-row">
      {page > 1 ? (
        <Link
          className="secondary-button"
          href={buildTimelineHref({ page: page - 1, query, category })}
        >
          前のページ
        </Link>
      ) : (
        <span />
      )}

      {hasNextPage ? (
        <Link
          className="secondary-button"
          href={buildTimelineHref({ page: page + 1, query, category })}
        >
          次のページ
        </Link>
      ) : null}
    </div>
  );
}
