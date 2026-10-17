// frontend/src/components/admin/Pagination.tsx
// Shared pagination control used by Dashboard, Members, and Audit Log tabs.

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPage: (p: number) => void
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: PaginationProps) {
  if (totalPages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const visiblePages = () => {
    const max = Math.min(totalPages, 5)
    const pages: number[] = []
    for (let i = 0; i < max; i++) {
      let p = i + 1
      if (totalPages > 5) {
        if (page <= 3) p = i + 1
        else if (page >= totalPages - 2) p = totalPages - 4 + i
        else p = page - 2 + i
      }
      pages.push(p)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
      <p className="text-xs text-sbg-text-muted font-mono">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-[8px] text-sbg-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {visiblePages().map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            aria-current={p === page ? 'page' : undefined}
            className={[
              'w-7 h-7 rounded-[8px] text-xs font-mono transition-colors',
              p === page
                ? 'bg-white text-sbg-black font-semibold'
                : 'text-sbg-text-muted hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-[8px] text-sbg-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
