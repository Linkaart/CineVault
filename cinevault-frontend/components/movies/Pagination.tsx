"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PAGE_SIZE = 20;

function buildHref(searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return `/movies${qs ? `?${qs}` : ""}`;
}

export default function Pagination({ count, currentPage }: { count: number; currentPage: number }) {
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Fenêtre de pages autour de la page courante (max 5 numéros affichés)
  const windowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const pages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  );

  return (
    <nav
      aria-label="Pagination du catalogue"
      className="flex items-center justify-center gap-2 mt-10"
    >
      <Link
        href={buildHref(searchParams, currentPage - 1)}
        aria-disabled={!hasPrev}
        tabIndex={hasPrev ? 0 : -1}
        className={`px-3 py-1.5 rounded-full text-sm border transition focus-ring ${
          hasPrev
            ? "border-white/15 text-paper/80 hover:border-marquee/50 hover:text-marquee"
            : "border-white/5 text-smoke/40 pointer-events-none"
        }`}
      >
        ← Précédent
      </Link>

      {windowStart > 1 && (
        <>
          <Link
            href={buildHref(searchParams, 1)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-sm text-paper/70 hover:text-marquee transition focus-ring"
          >
            1
          </Link>
          {windowStart > 2 && <span className="text-smoke px-1">…</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(searchParams, page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition focus-ring ${
            page === currentPage
              ? "bg-marquee text-void font-semibold shadow-gold"
              : "text-paper/70 hover:text-marquee"
          }`}
        >
          {page}
        </Link>
      ))}

      {windowEnd < totalPages && (
        <>
          {windowEnd < totalPages - 1 && <span className="text-smoke px-1">…</span>}
          <Link
            href={buildHref(searchParams, totalPages)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-sm text-paper/70 hover:text-marquee transition focus-ring"
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildHref(searchParams, currentPage + 1)}
        aria-disabled={!hasNext}
        tabIndex={hasNext ? 0 : -1}
        className={`px-3 py-1.5 rounded-full text-sm border transition focus-ring ${
          hasNext
            ? "border-white/15 text-paper/80 hover:border-marquee/50 hover:text-marquee"
            : "border-white/5 text-smoke/40 pointer-events-none"
        }`}
      >
        Suivant →
      </Link>
    </nav>
  );
}
