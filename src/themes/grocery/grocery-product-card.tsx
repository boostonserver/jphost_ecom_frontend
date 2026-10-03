"use client";

import { Check, Clock, Loader2, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { refreshCart } from "@/components/cart/use-cart";
import { StoreImage } from "@/components/ui/store-image";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { cartService } from "@/services/cart";
import type { Product } from "@/services/catalog";

export function GroceryProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const priceRange = product.price_range;
  const discountPercent = priceRange?.discount_percent ?? 0;
  const isDiscounted = priceRange?.is_discounted ?? false;
  const effectivePrice = priceRange?.min ? Number(priceRange.min).toLocaleString("en-BD") : "0";
  const basePrice = priceRange?.base_min ? Number(priceRange.base_min).toLocaleString("en-BD") : null;
  const soldOut = product.stock?.any_variant_available === false;

  const quickAdd = product.quick_add;
  const canQuickAdd = quickAdd && quickAdd.in_stock;

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (busy || !canQuickAdd || !quickAdd?.variant_id) return;

    setBusy(true);
    try {
      await refreshCart(await cartService.addItem(quickAdd.variant_id, 1));
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch {
      // Failed silently on card; user can open details if needed
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group relative flex flex-col justify-between h-full bg-white rounded-xl border border-stone-200/90 hover:border-red-500 hover:shadow-lg transition-all duration-200 overflow-hidden p-3 sm:p-3.5">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1 mb-2 h-5">
          {soldOut ? (
            <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
              Out of stock
            </span>
          ) : isDiscounted && discountPercent > 0 ? (
            <span className="text-[10px] font-extrabold uppercase bg-red-600 text-white px-2 py-0.5 rounded shadow-xs">
              ৳{discountPercent}% OFF
            </span>
          ) : product.is_bestseller ? (
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
              Top Seller
            </span>
          ) : (
            <span />
          )}

          {/* Shwapno Most Picked Badge */}
          {product.is_featured && !soldOut && (
            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded shadow-xs">
              Most Picked
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-50/60 p-2 flex items-center justify-center">
          <StoreImage
            src={product.primary_image?.url}
            alt={product.primary_image?.alt ?? product.name}
            fallbackLabel={product.name}
            priority={priority}
            sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 45vw"
            fit="contain"
            className={cn("w-full h-full", soldOut && "opacity-50")}
            imageClassName="transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Delivery Tag */}
        <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium italic">
          <Clock className="size-3 text-red-500 shrink-0" />
          <span>Delivery 1-2 hours</span>
        </div>

        {/* Product Title */}
        <h3 className="mt-1.5 text-xs sm:text-sm font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Weight / Brand / Category Subtitle */}
        <p className="mt-1 text-[11px] text-stone-400 font-medium truncate">
          {product.brand?.name ?? "Daily Grocery"}
        </p>

        {/* Price Row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-extrabold text-red-600">
            ৳{effectivePrice}
          </span>
          {isDiscounted && basePrice && (
            <span className="text-xs text-stone-400 line-through">
              ৳{basePrice}
            </span>
          )}
        </div>
      </Link>

      {/* Add to Bag Action Button */}
      <div className="mt-3 pt-2">
        {soldOut ? (
          <button
            type="button"
            disabled
            className="w-full py-2 px-3 text-xs font-semibold rounded-full bg-stone-100 text-stone-400 cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : canQuickAdd ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={busy}
            className={cn(
              "w-full py-2 px-3 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer",
              added
                ? "bg-emerald-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white",
            )}
          >
            {busy ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Adding…</span>
              </>
            ) : added ? (
              <>
                <Check className="size-3.5" />
                <span>Added ✓</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="w-full py-2 px-3 text-xs font-bold rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 border border-red-200"
          >
            <ShoppingBag className="size-3.5" />
            <span>View Options</span>
          </Link>
        )}
      </div>
    </div>
  );
}
