import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { GroceryProductCard } from "./grocery-product-card";
import type { Product } from "@/services/catalog";

export function GroceryProductRail({
  title,
  subtitle,
  href,
  products,
  badgeText,
}: {
  title: string;
  subtitle?: string;
  href: string;
  products: Product[];
  badgeText?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-5">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-4 pb-2 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-red-600 rounded-full" />
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-stone-900">
                {title}
              </h2>
              {badgeText && (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-stone-500 mt-1 pl-3.5">{subtitle}</p>
            )}
          </div>

          <Link
            href={href}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* High Density Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.slice(0, 12).map((product) => (
            <GroceryProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
