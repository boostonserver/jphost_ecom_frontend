"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart/use-cart";

export function FloatingCartWidget() {
  const { cart } = useCart();
  const itemCount = cart?.summary.items_count ?? 0;
  const subtotal = cart?.summary.subtotal
    ? Number(cart.summary.subtotal).toLocaleString("en-BD")
    : null;

  if (itemCount === 0) {
    return null;
  }

  return (
    <aside aria-label="Quick bag access" className="fixed right-3 bottom-6 sm:right-6 sm:bottom-10 z-40 animate-in fade-in slide-in-from-right-4 duration-300">
      <Link
        href="/cart"
        className="flex items-center gap-3 bg-[#b91c1c] hover:bg-red-800 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-2xl border-2 border-white transition-all transform hover:scale-105 active:scale-95 group"
        title="View your shopping bag"
      >
        <div className="relative flex items-center justify-center size-8 rounded-full bg-red-800/80 text-white">
          <ShoppingBag className="size-4 group-hover:animate-bounce" />
          <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-950 text-[11px] font-black px-1.5 py-0.2 rounded-full shadow-xs leading-tight">
            {itemCount}
          </span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold text-red-100 tracking-wider">
            {itemCount} {itemCount === 1 ? "Item" : "Items"}
          </span>
          {subtotal && (
            <span className="text-xs sm:text-sm font-extrabold text-white">
              ৳{subtotal}
            </span>
          )}
        </div>
      </Link>
    </aside>
  );
}
