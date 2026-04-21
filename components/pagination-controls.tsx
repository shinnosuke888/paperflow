import Link from "next/link";

type PaginationControlsProps = {
  page: number;
  hasNextPage: boolean;
  query: string;
  category: string;
};

function buildHref({
  page,
  query,
  category,
}: {
  page: number;
  query: string;
  category: string;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category !== "all") {
    params.set("category", category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `/?${search}` : "/";
}

export function PaginationControls({
  page,
  hasNextPage,
  query,
  category,
}: PaginationControlsProps) {
  return (
    <div className="pagination-row">
      {page > 1 ? (
        <Link className="secondary-button" href={buildHref({ page: page - 1, query, category })}>
          Previous
        </Link>
      ) : (
        <span />
      )}

      {hasNextPage ? (
        <Link className="secondary-button" href={buildHref({ page: page + 1, query, category })}>
          Next page
        </Link>
      ) : null}
    </div>
  );
}
