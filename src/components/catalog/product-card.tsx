import Link from "next/link";
import { PriceRange } from "@/components/catalog/price";
import { QuickAddButton } from "@/components/cart/quick-add-button";
import { Badge } from "@/components/ui/badge";
import { StoreImage } from "@/components/ui/store-image";
import { cn } from "@/lib/utils";
import type { Product } from "@/services/catalog";

/**
 * One product, as a card.
 *
 * Everything shown here comes from the listing payload — which is exactly why
 * the API sends a resolved price range and a primary image instead of making
 * the browser reduce over variants (engineering rule 41).
 *
 * It is a white tile on the page's warm ground rather than bare content on a
 * flat field. That only works now that the two surfaces are actually different
 * lightnesses; before, a card and the page were six thousandths apart and a
 * "card" was an invisible rectangle. The image sits in a `muted` well *below*
 * the tile, so a photograph shot on white does not bleed into the card around
 * it — the commonest way a product grid turns to mush.
 *
 * The Sale badge is the one merchandising claim on it, and it is made only
 * because the listing payload now carries `price_range.discount_percent` —
 * resolved server-side from the price rules actually in force, and rounded
 * down so the badge never promises more than the till gives. Still absent: no
 * rating and no stock line, because no reviews exist yet and stock is Phase 7.
 * A card showing either would be inventing it (PRD 5B rule 10).
 *
 * One badge at a time. A tile carrying "New", "Bestseller" and "-30%" at once
 * reads as decoration and stops meaning anything, so the discount wins when
 * there is one — it is the fact that expires.
 *
 * The whole card is a single link, with no nested interactive elements — a
 * button inside a link is unreachable for a keyboard and ambiguous for a
 * screen reader.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  /** Set on the first row of the first screen so the LCP image is not lazy. */
  priority?: boolean;
}) {
  const percent = product.price_range?.discount_percent ?? 0;

  // An out-of-stock product stays in the listing rather than vanishing
  // (Phase 7 rule 22) - a shopper searching for it should find it and see why
  // it cannot be bought, not conclude the shop does not sell it.
  const soldOut = product.stock?.any_variant_available === false;

  const badge = soldOut
    ? { tone: "neutral" as const, label: "Out of stock" }
    : percent > 0
      ? { tone: "sale" as const, label: `${percent}% OFF` }
      : product.is_new_arrival
        ? { tone: "new" as const, label: "New" }
        : product.is_bestseller
          ? { tone: "primary" as const, label: "Bestseller" }
          : null;

  return (
    // The hover-sensing box (`group`) and the box that visually lifts on
    // hover must be different elements. If the same element both listens
    // for `:hover` and translates itself on hover, a pointer near its edge
    // gets nudged out from under it by the very shift the hover caused —
    // hover ends, the card snaps back, the pointer is over it again, hover
    // restarts. That feedback loop is the "shaking" at the corners. Keeping
    // this wrapper stationary and translating the `Link` off `group-hover`
    // instead breaks the loop: the hit box never moves.
    <div className="group h-full">
      <Link
        href={`/products/${product.slug}`}
        className={cn(
          "border-border/70 bg-card shadow-card relative block h-full rounded-2xl border p-3",
          "transition-[box-shadow,transform,border-color] duration-[--duration-base] ease-[--ease-out]",
          "group-hover:shadow-pop group-hover:border-border motion-safe:group-hover:-translate-y-1",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        <div className="relative">
          <StoreImage
            src={product.primary_image?.url}
            alt={product.primary_image?.alt ?? product.name}
            fallbackLabel={product.name}
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
            // Never crop a product. The catalogue draws from several retailers
            // and their photographs are not one shape — 3:4 portraits from a
            // fashion house, squares from an electronics shop, 5:4 from a
            // supermarket. Cropping them to a square box takes the model's head
            // off. Letterboxing against the well is the cost, and it is small.
            fit="contain"
            className={cn("rounded-xl p-2", soldOut && "opacity-55")}
            imageClassName={cn(
              "transition-transform duration-[--duration-slow] ease-[--ease-out]",
              "motion-safe:group-hover:scale-[1.05]",
            )}
          />

          {badge && (
            <Badge
              tone={badge.tone}
              size="sm"
              className="shadow-card absolute top-2.5 left-2.5"
            >
              {badge.label}
            </Badge>
          )}
        </div>

        {/* Bottom-right of the CARD, level with the price - where a thumb
            reaches on a phone and where shoppers expect a quick-add to be.
            Inside the image well it read as a badge on the photograph. */}
        {product.quick_add && (
          <QuickAddButton
            variantId={product.quick_add.variant_id}
            inStock={product.quick_add.in_stock}
            productName={product.name}
          />
        )}

        {/* Right padding only when the button is there, so a card without one
            does not carry a ragged gutter for nothing. */}
        <div
          className={cn(
            "space-y-1 px-1 pt-3.5 pb-1",
            product.quick_add && "pr-11",
          )}
        >
          {product.brand && (
            <p className="text-muted-foreground truncate text-[0.6875rem] font-semibold tracking-[0.09em] uppercase">
              {product.brand.name}
            </p>
          )}

          <h3 className="group-hover:text-primary line-clamp-2-safe text-sm leading-snug font-medium transition-colors">
            {product.name}
          </h3>

          <PriceRange range={product.price_range} className="pt-1" />
        </div>
      </Link>
    </div>
  );
}
