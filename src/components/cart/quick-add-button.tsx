"use client";

import { Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { refreshCart } from "@/components/cart/use-cart";
import { ApiError } from "@/lib/api";
import { cartService } from "@/services/cart";
import { cn } from "@/lib/utils";

/**
 * Add one of this to the bag, from the listing card.
 *
 * Only rendered for a product with exactly one buyable variant — the server
 * decides that and sends `quick_add: null` otherwise, so the button cannot
 * appear on something that needs a choice made.
 *
 * It sits inside a card that is itself a link, so every handler stops
 * propagation AND prevents the default: without both, adding to the bag would
 * also navigate to the product page, which is precisely the trip this button
 * exists to save.
 */
export function QuickAddButton({
  variantId,
  inStock,
  productName,
}: {
  variantId: number;
  inStock: boolean;
  productName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [failed, setFailed] = useState(false);

  async function add(event: React.MouseEvent) {
    // The card is a link. Both calls are needed.
    event.preventDefault();
    event.stopPropagation();

    if (busy || !inStock) return;

    setBusy(true);
    setFailed(false);

    try {
      await refreshCart(await cartService.addItem(variantId, 1));

      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch (caught) {
      // No toast from a listing card: a shopper scrolling a grid should not get
      // a modal. The button itself reports, and the cart page gives the detail.
      setFailed(caught instanceof ApiError);
      window.setTimeout(() => setFailed(false), 2500);
    } finally {
      setBusy(false);
    }
  }

  const label = inStock
    ? added
      ? `${productName} added to your bag`
      : `Add ${productName} to your bag`
    : `${productName} is out of stock`;

  return (
    <button
      type="button"
      onClick={(event) => void add(event)}
      disabled={!inStock || busy}
      aria-label={label}
      title={inStock ? "Add to bag" : "Out of stock"}
      className={cn(
        "absolute right-3 bottom-3 z-10 flex size-9 items-center justify-center rounded-full",
        "shadow-card transition-[background-color,transform,opacity] duration-[--duration-fast]",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        // Always visible - on touch there is no hover to reveal it, and a
        // control that only appears on hover is a control half the shoppers
        // never find. It lifts slightly with the card on a pointer device.
        "motion-safe:group-hover:scale-105",
        // A ring rather than a plain fill: the button sits on the card's own
        // surface here, not over a photograph, so it needs its own edge.
        "ring-border ring-1",
        added
          ? "bg-success text-success-foreground"
          : failed
            ? "bg-destructive text-destructive-foreground"
            : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground",
        !inStock && "cursor-not-allowed opacity-40",
      )}
    >
      {busy ? (
        <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
      ) : added ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Plus className="size-4" aria-hidden />
      )}
    </button>
  );
}
