import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  page: number;
  lastPage: number;
  perPage: number;
  total: number;
  label: string;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  page,
  lastPage,
  perPage,
  total,
  label,
  onPageChange,
}: AdminPaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-muted-foreground text-sm">
        Showing {from}-{to} of {total} {label}
      </p>

      {lastPage > 1 && (
        <nav className="flex items-center gap-1" aria-label={`${label} pages`}>
          <PageButton
            disabled={page <= 1}
            label="Previous page"
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </PageButton>

          {pageWindow(page, lastPage).map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                className="text-muted-foreground px-1 text-sm"
                aria-hidden
              >
                ...
              </span>
            ) : (
              <PageButton
                key={entry}
                current={entry === page}
                label={`Page ${entry}`}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </PageButton>
            ),
          )}

          <PageButton
            disabled={page >= lastPage}
            label="Next page"
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" aria-hidden />
          </PageButton>
        </nav>
      )}
    </div>
  );
}

function PageButton({
  children,
  current = false,
  disabled = false,
  label,
  onClick,
}: {
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={current ? "page" : undefined}
      aria-label={label}
      disabled={disabled || current}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
        current
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:bg-accent",
        (disabled || current) && "pointer-events-none opacity-50",
      )}
    >
      {children}
    </button>
  );
}

function pageWindow(page: number, lastPage: number): Array<number | "gap"> {
  const pages = new Set<number>([1, lastPage, page]);

  for (const offset of [-1, 1]) {
    const neighbour = page + offset;

    if (neighbour >= 1 && neighbour <= lastPage) pages.add(neighbour);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) out.push("gap");
    out.push(value);
  });

  return out;
}
