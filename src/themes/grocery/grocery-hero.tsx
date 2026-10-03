"use client";

import {
  Apple,
  Baby,
  ChevronRight,
  Coffee,
  Egg,
  Fish,
  LayoutGrid,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HeroCarousel } from "@/components/catalog/hero-carousel";
import type { CategoryNode, Product } from "@/services/catalog";

const CATEGORY_ICONS: Record<string, any> = {
  food: UtensilsCrossed,
  grocery: UtensilsCrossed,
  vegetables: Apple,
  fruits: Apple,
  meat: Fish,
  fish: Fish,
  dairy: Coffee,
  baby: Baby,
  egg: Egg,
};

export function GroceryHero({
  categories,
  heroProducts,
  storeName,
}: {
  categories: CategoryNode[];
  heroProducts: Product[];
  storeName: string;
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Left: SHOP BY CATEGORY Sidebar */}
        <div className="hidden lg:block bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="bg-[#b91c1c] text-white px-4 py-3 flex items-center justify-between font-bold text-sm tracking-wide uppercase">
            <span className="flex items-center gap-2">
              <LayoutGrid className="size-4 text-amber-300" />
              Shop by Category
            </span>
          </div>

          <ul className="divide-y divide-stone-100 max-h-[460px] overflow-y-auto">
            {categories.slice(0, 10).map((cat) => {
              const Icon =
                CATEGORY_ICONS[cat.slug.toLowerCase()] ||
                (cat.name.toLowerCase().includes("egg") ? Egg : LayoutGrid);

              return (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    onMouseEnter={() => setActiveCategory(cat.id)}
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-red-600 hover:bg-red-50/60 transition-colors"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className="size-4 text-stone-400 group-hover:text-red-500 shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <ChevronRight className="size-3.5 text-stone-300 shrink-0" />
                  </Link>
                </li>
              );
            })}

            {categories.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-stone-400">
                Browse our fresh catalogue
              </li>
            )}
          </ul>
        </div>

        {/* Right 3 Cols: Hero Banner Carousel + Promo Mini Cards */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Hero Slider */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-red-700 to-amber-600 shadow-md">
            {heroProducts.length > 0 ? (
              <HeroCarousel products={heroProducts} storeName={storeName} />
            ) : (
              <div className="py-16 px-8 text-white flex flex-col justify-center min-h-[300px]">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300 bg-red-800/60 px-3 py-1 rounded-full w-fit mb-3">
                  <Sparkles className="size-3.5" />
                  Daily Fresh Market
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold max-w-lg leading-tight">
                  Taza Bazar &amp; Daily Essentials Delivered in Minutes
                </h1>
                <p className="mt-3 text-red-100 text-sm max-w-md">
                  Shop 100% authentic groceries, fresh produce, meat &amp; household items at the best prices.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link
                    href="/products"
                    className="bg-white text-red-700 hover:bg-red-50 font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-all"
                  >
                    Shop Groceries Now
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mini Promo Blocks (Eggs, Frozen, Coffee, Essentials) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Fresh Eggs", subtitle: "Farm fresh daily", color: "from-amber-50 to-amber-100/50", border: "border-amber-200" },
              { label: "Frozen Foods", subtitle: "Ready to cook", color: "from-sky-50 to-sky-100/50", border: "border-sky-200" },
              { label: "Beverages", subtitle: "Tea & Coffee", color: "from-orange-50 to-orange-100/50", border: "border-orange-200" },
              { label: "Daily Cooking", subtitle: "Rice, Dal & Oil", color: "from-emerald-50 to-emerald-100/50", border: "border-emerald-200" },
            ].map((promo, idx) => (
              <Link
                key={idx}
                href="/products"
                className={`bg-gradient-to-br ${promo.color} border ${promo.border} rounded-xl p-3 text-center hover:shadow-md transition-all group block`}
              >
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-red-700 transition-colors">
                  {promo.label}
                </h4>
                <p className="text-[10px] text-stone-500 mt-0.5">{promo.subtitle}</p>
                <span className="mt-2 inline-block text-[10px] font-semibold text-red-700 bg-white/80 px-2 py-0.5 rounded-full border border-stone-200/50">
                  Shop Now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
