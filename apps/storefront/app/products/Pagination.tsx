import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
}

export function Pagination({ currentPage, totalPages, query }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", page.toString());
    return `/products?${params.toString()}`;
  };

  return (
    <div className="flex justify-center gap-2 mt-8">
      <Link
        href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
        className={`px-4 py-2 rounded bg-gray-200 ${
          currentPage === 1 ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        Previous
      </Link>
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
        className={`px-4 py-2 rounded bg-gray-200 ${
          currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        Next
      </Link>
    </div>
  );
}
