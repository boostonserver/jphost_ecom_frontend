"use client";

import { Expand, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Price, PriceTiers } from "@/components/catalog/price";
import { AddToCart } from "@/components/cart/add-to-cart";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/inventory/stock-badge";
import { Lightbox } from "@/components/ui/lightbox";
import { StoreImage } from "@/components/ui/store-image";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Product, Variant } from "@/services/catalog";

/**
 * Product detail with a gallery and a variant picker.
 *
 * The interactive part of an otherwise server-rendered page: choosing "Black"
 * then "M" has to resolve to a specific variant, and swap the price and the
 * gallery with it.
 *
 * Combinations that do not exist are disabled rather than hidden. A shopper
 * who picks Black and finds Size L greyed out learns something ("that one is
 * not made in L"); one who finds L silently missing just thinks the page is
 * broken.
 *
 * Stock arrived in Phase 7 and is a SIGNAL, never a count — the API does not
 * send a quantity and this component could not display one if it wanted to.
 *
 * Add-to-cart arrived in Phase 8 and sits under the variant picker, so the
 * control and the thing it acts on are adjacent.
 *
 * Absent on purpose: delivery estimates, which need an address (Phase 14).
 */
export function ProductDetail({
  product,
  theme = "default",
}: {
  product: Product;
  theme?: string;
}) {
  const variants = useMemo(() => product.variants ?? [], [product.variants]);

  // Group the attribute options across every variant, preserving order.
  const attributes = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        name: string;
        values: Map<number, { id: number; value: string; hex: string | null }>;
      }
    >();

    for (const variant of variants) {
      for (const attribute of variant.attributes) {
        if (!map.has(attribute.attribute_id)) {
          map.set(attribute.attribute_id, {
            id: attribute.attribute_id,
            name: attribute.attribute ?? "Option",
            values: new Map(),
          });
        }

        map.get(attribute.attribute_id)!.values.set(attribute.value_id, {
          id: attribute.value_id,
          value: attribute.value,
          hex: attribute.color_hex,
        });
      }
    }

    return [...map.values()].map((a) => ({
      ...a,
      values: [...a.values.values()],
    }));
  }, [variants]);

  const [selection, setSelection] = useState<Record<number, number>>(() => {
    const initial = variants.find((v) => v.is_default) ?? variants[0];
    const picked: Record<number, number> = {};

    for (const attribute of initial?.attributes ?? []) {
      picked[attribute.attribute_id] = attribute.value_id;
    }

    return picked;
  });

  const [quantity, setQuantity] = useState(1);

  const selected = useMemo(
    () => findVariant(variants, selection),
    [variants, selection],
  );

  const gallery = useMemo(() => {
    const all = product.images ?? [];

    // Images bound to the chosen variant win; otherwise show the unbound ones,
    // so a colour swap changes the gallery without emptying it.
    const forVariant = selected
      ? all.filter((image) => image.variant_id === selected.id)
      : [];

    const resolved =
      forVariant.length > 0
        ? forVariant
        : all.filter((image) => image.variant_id === null);

    return resolved.length > 0 ? resolved : all;
  }, [product.images, selected]);

  // Clamped rather than reset in an effect: the gallery shrinks when a variant
  // with fewer photographs is chosen, and clamping keeps that a pure render.
  const [requestedImage, setRequestedImage] = useState(0);
  const imageIndex = Math.min(requestedImage, Math.max(gallery.length - 1, 0));
  const current = gallery[imageIndex];

  const [zoomed, setZoomed] = useState(false);

  const tabs: TabItem[] = [];

  if (product.description) {
    tabs.push({
      id: "description",
      label: "Description",
      content: (
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      ),
    });
  }

  if (selected) {
    tabs.push({
      id: "specifications",
      label: "Specifications",
      content: (
        <dl className="max-w-lg divide-border divide-y text-sm">
          <SpecRow
            label="SKU"
            value={<span className="font-mono">{selected.sku}</span>}
          />
          {product.brand && (
            <SpecRow label="Brand" value={product.brand.name} />
          )}
          {selected.attributes.map((attribute) => (
            <SpecRow
              key={attribute.attribute_id}
              label={attribute.attribute ?? "Option"}
              value={attribute.value}
            />
          ))}
          {selected.weight && (
            <SpecRow label="Weight" value={`${selected.weight} kg`} />
          )}
        </dl>
      ),
    });
  }

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* --- gallery -------------------------------------------------- */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="group relative">
            {theme === "grocery" && (
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  ⚡ Shwapno Express
                </span>
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                  🥬 100% Supermarket Fresh
                </span>
              </div>
            )}
            {theme === "fashion" && (
              <div className="absolute top-4 left-4 z-10">
                <span className="rounded-none bg-stone-900/90 text-stone-100 font-semibold px-3 py-1 text-[11px] uppercase tracking-widest backdrop-blur-sm border border-stone-700/50">
                  Runway '26 Collection
                </span>
              </div>
            )}
            {theme === "electronics" && (
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <span className="rounded-md bg-cyan-950/90 text-cyan-300 font-bold px-3 py-1 text-xs border border-cyan-500/40 backdrop-blur-sm shadow-md">
                  🛡️ Official Warranty
                </span>
              </div>
            )}
            <StoreImage
              src={current?.url}
              alt={current?.alt ?? product.name}
              fallbackLabel={product.name}
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              // Same reason as the card: the shopper is here to look at the
              // whole product, so nothing may be cropped away.
              fit="contain"
              className="rounded-2xl p-3"
            />

            {current && (
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label="View image full screen"
                className="bg-card/90 text-foreground shadow-card hover:bg-card absolute right-3 bottom-3 inline-flex size-10 items-center justify-center rounded-full backdrop-blur transition-colors"
              >
                <Expand className="size-4" />
              </button>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="scrollbar-none mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setRequestedImage(index)}
                  aria-label={`View image ${index + 1} of ${gallery.length}`}
                  aria-current={index === imageIndex}
                  className={cn(
                    "size-18 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                    index === imageIndex
                      ? "border-primary"
                      : "border-transparent hover:border-border",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.thumb_url}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="size-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- buy box -------------------------------------------------- */}
        <div className="space-y-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {theme === "grocery" && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 uppercase tracking-wide border border-red-200">
                  Grocery &amp; Daily Essentials
                </span>
              )}
              {theme === "fashion" && (
                <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900 uppercase tracking-wider border border-amber-300/40">
                  Artisan Lookbook
                </span>
              )}
              {theme === "electronics" && (
                <span className="rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-xs font-bold text-cyan-300 uppercase tracking-wider border border-cyan-500/30">
                  Verified Tech Specs
                </span>
              )}
              {product.brand && (
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="text-primary text-xs font-semibold tracking-widest uppercase hover:underline"
                >
                  {product.brand.name}
                </Link>
              )}
              {product.is_new_arrival && (
                <Badge tone="new" size="sm">
                  New
                </Badge>
              )}
              {product.is_bestseller && (
                <Badge tone="primary" size="sm">
                  Bestseller
                </Badge>
              )}
            </div>

            <h1
              className={cn(
                "mt-2 text-3xl font-bold lg:text-4xl",
                theme === "fashion" && "font-serif tracking-tight text-stone-900",
                theme === "grocery" && "text-stone-900 font-extrabold tracking-tight",
                theme === "electronics" && "tracking-tight font-black",
              )}
            >
              {product.name}
            </h1>

            {product.short_description && (
              <p className="text-muted-foreground mt-3 max-w-prose">
                {product.short_description}
              </p>
            )}
          </div>

          {/*
            Resolved server-side. The client never computes a price — a browser
            deciding what something costs is exactly what engineering rule 2
            forbids, whether it is a total or a single unit.
          */}
          <div className="space-y-4">
            <Price
              pricing={selected?.pricing}
              fallback={selected?.price}
              size="lg"
            />
            <PriceTiers tiers={selected?.pricing?.tiers} />

            {/*
              Shown against the SELECTED variant, not the product: "Only a few
              left" is true of one colour and false of another, and the badge
              has to follow the picker or it is a lie half the time.
            */}
            {selected?.stock && (
              <div className="flex items-center gap-2">
                <StockBadge status={selected.stock.status} size="md" />
                {selected.stock.status === "out_of_stock" && (
                  <span className="text-muted-foreground text-sm">
                    This option is not available right now.
                  </span>
                )}
              </div>
            )}
          </div>

          {attributes.map((attribute) => (
            <fieldset key={attribute.id}>
              <legend className="mb-2.5 text-sm font-medium">
                {attribute.name}
                {selection[attribute.id] && (
                  <span className="text-muted-foreground ml-2 font-normal">
                    {
                      attribute.values.find(
                        (value) => value.id === selection[attribute.id],
                      )?.value
                    }
                  </span>
                )}
              </legend>

              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => {
                  const available = isAvailable(
                    variants,
                    selection,
                    attribute.id,
                    value.id,
                  );
                  const isSelected = selection[attribute.id] === value.id;

                  return (
                    <button
                      key={value.id}
                      type="button"
                      disabled={!available}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelection((current) => ({
                          ...current,
                          [attribute.id]: value.id,
                        }))
                      }
                      title={value.value}
                      className={cn(
                        "min-h-10 rounded-lg border px-3.5 text-sm transition-colors",
                        value.hex ? "flex items-center gap-2" : "",
                        isSelected
                          ? "border-primary bg-primary-soft text-primary-soft-foreground font-medium"
                          : "border-border hover:border-muted-foreground/50",
                        !available &&
                          "cursor-not-allowed line-through opacity-40 hover:border-border",
                      )}
                    >
                      {value.hex && (
                        <span
                          aria-hidden
                          className="border-border inline-block size-4 rounded-full border"
                          style={{ backgroundColor: value.hex }}
                        />
                      )}
                      {value.value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="border-border border-t pt-5 space-y-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {theme === "grocery" ? "Quantity (পরিমাণ):" : "Quantity:"}
              </span>
              <div
                className={cn(
                  "flex items-center rounded-lg border",
                  theme === "electronics"
                    ? "border-slate-800 bg-slate-900"
                    : "border-border bg-card",
                )}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              {theme === "grocery" && selected?.weight && (
                <span className="text-muted-foreground text-xs font-medium">
                  ≈ {(Number(selected.weight) * quantity).toFixed(1)} kg total
                </span>
              )}
            </div>

            {/*
              Keyed on the variant so switching from a stocked colour to a
              sold-out one resets the transient "Added" state - otherwise the
              button would still be showing a tick for a variant the shopper
              has since moved away from.
            */}
            <AddToCart
              key={selected?.id ?? "none"}
              variantId={selected?.id ?? null}
              stockStatus={selected?.stock?.status}
              quantity={quantity}
              className={
                theme === "grocery"
                  ? "bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-12 text-base shadow-md hover:shadow-lg w-full sm:w-auto px-8"
                  : theme === "fashion"
                    ? "bg-primary hover:bg-primary-hover text-primary-foreground font-semibold uppercase tracking-widest text-xs h-12 shadow-sm w-full sm:w-auto px-8"
                    : theme === "electronics"
                      ? "bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-12 shadow-md shadow-primary/20 w-full sm:w-auto px-8"
                      : undefined
              }
              label={
                theme === "grocery"
                  ? "Add to Basket (ব্যাগ-এ যোগ করুন)"
                  : theme === "fashion"
                    ? "Add to Shopping Bag"
                    : theme === "electronics"
                      ? "Buy Now • Add to Cart"
                      : undefined
              }
            />

            {/* --- Theme Assurance & Delivery Trust Box --------------------- */}
            {theme === "grocery" && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 space-y-3 mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-red-800">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-600 animate-ping" />
                    ⚡ Shwapno Express Delivery
                  </span>
                  <span className="text-red-700 font-semibold">Dhaka &amp; Nationwide</span>
                </div>
                <p className="text-xs text-red-900/80 leading-relaxed">
                  Order now &amp; receive fresh at your doorstep in <strong>60–120 minutes</strong> across Dhaka or express delivery nationwide.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-red-200 text-xs text-stone-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>🥬</span> <span>100% Quality &amp; Freshness</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>🚚</span> <span>Certified Depots</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>🔄</span> <span>Doorstep Instant Return</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>📞</span> <span>Order Helpline: 16469</span>
                  </div>
                </div>
              </div>
            )}

            {theme === "fashion" && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider font-serif">
                  <span>✨ The Boutique Guarantee</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                  <div className="flex items-center gap-2 font-medium">
                    <span>🎁</span> <span>Bespoke Luxury Gift Packaging</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span>🧵</span> <span>Pure Artisan Weave &amp; Natural Dyes</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span>🔄</span> <span>14-Day Boutique Exchange</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span>🚚</span> <span>Bespoke Nationwide Courier</span>
                  </div>
                </div>
              </div>
            )}

            {theme === "electronics" && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <span>🛡️ Official Tech Protection</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-medium">
                    <span>🛡️</span> <span>1-Year Official Brand Warranty</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span>⚡</span> <span>Same-Day Dhaka Tech Courier</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span>💳</span> <span>0% EMI on 18 Major Credit Cards</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span>🔄</span> <span>7-Day Replacement for Defects</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-border border-t pt-5">
            <p className="text-muted-foreground text-sm">
              {selected ? (
                <>
                  SKU <span className="font-mono">{selected.sku}</span>
                </>
              ) : (
                "Choose an option to see the price"
              )}
            </p>
          </div>

          {tabs.length > 0 && <Tabs items={tabs} />}
        </div>
      </div>

      <Lightbox
        open={zoomed}
        onClose={() => setZoomed(false)}
        images={gallery.map((image) => ({
          id: image.id,
          url: image.url,
          alt: image.alt,
        }))}
        index={imageIndex}
        onIndexChange={setRequestedImage}
      />
    </>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** The variant whose combination matches every current selection. */
function findVariant(
  variants: Variant[],
  selection: Record<number, number>,
): Variant | null {
  const picked = Object.entries(selection);

  return (
    variants.find((variant) =>
      picked.every(([attributeId, valueId]) =>
        variant.attributes.some(
          (a) =>
            a.attribute_id === Number(attributeId) && a.value_id === valueId,
        ),
      ),
    ) ?? (picked.length === 0 ? (variants[0] ?? null) : null)
  );
}

/**
 * Would picking this value still leave a real variant, given everything else
 * already chosen?
 */
function isAvailable(
  variants: Variant[],
  selection: Record<number, number>,
  attributeId: number,
  valueId: number,
): boolean {
  const hypothetical = { ...selection, [attributeId]: valueId };

  return variants.some((variant) =>
    Object.entries(hypothetical).every(([id, value]) =>
      variant.attributes.some(
        (a) => a.attribute_id === Number(id) && a.value_id === value,
      ),
    ),
  );
}
