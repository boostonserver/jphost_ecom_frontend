"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import {
  ArrowLeft,
  Check,
  FolderPlus,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { MediaPicker } from "@/components/catalog/media-picker";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { catalogService, type Media } from "@/services/catalog";
import { inventoryService } from "@/services/inventory";

/**
 * WordPress & WooCommerce style 2-column Product Creator.
 *
 * Left column: Title, Full Description, Pricing & Inventory, Short Description, Product Gallery.
 * Right column: Publish Box, Featured Image (Product Image), Categories, Brand.
 */
export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("0.00");
  const [comparePrice, setComparePrice] = useState("");
  const [cost, setCost] = useState("");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [brandId, setBrandId] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("published");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);

  // Media states
  const [featuredImage, setFeaturedImage] = useState<Media | null>(null);
  const [galleryImages, setGalleryImages] = useState<Media[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"featured" | "gallery">("featured");

  // Category quick-add state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const { data: brands } = useSWR("/admin/brands", () => catalogService.admin.brands());
  const { data: categories, mutate: mutateCategories } = useSWR(
    "/admin/categories",
    () => catalogService.admin.categories(),
  );

  const brandList = Array.isArray(brands)
    ? brands
    : Array.isArray(brands?.items)
      ? brands.items
      : [];
  const categoryList = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.items)
      ? categories.items
      : [];

  function handleGenerateSku() {
    const prefix = name
      .trim()
      .slice(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "PRD") || "PRD";
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${rand}`);
  }

  function toggleCategory(catId: number) {
    setCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
  }

  async function handleCreateCategory() {
    if (!newCatName.trim()) return;
    setCreatingCategory(true);
    try {
      const cat = await catalogService.admin.createCategory({ name: newCatName.trim() });
      await mutateCategories();
      setCategoryIds((prev) => [...prev, cat.id]);
      setNewCatName("");
      setShowNewCatInput(false);
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setCreatingCategory(false);
    }
  }

  function removeGalleryImage(mediaId: number) {
    setGalleryImages((prev) => prev.filter((img) => img.id !== mediaId));
  }

  async function submit(saveStatus?: "draft" | "published" | "archived") {
    setError(null);
    setSaving(true);
    const finalStatus = saveStatus ?? status;

    try {
      // 1. Create Base Product
      const payload: Record<string, unknown> = {
        name,
        sku,
        price,
        product_type: "simple",
        brand_id: brandId ? Number(brandId) : null,
        category_ids: categoryIds,
        short_description: shortDescription || null,
        description: description || null,
        status: finalStatus,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        is_bestseller: isBestseller,
      };

      if (comparePrice && Number(comparePrice) > Number(price)) {
        payload.compare_price = comparePrice;
      }
      if (cost && Number(cost) > 0) {
        payload.cost = cost;
      }

      const product = await catalogService.admin.createProduct(payload);

      // 2. Sync Images (Featured Image + Gallery)
      const imagesToSync: Array<{
        media_id: number;
        is_primary: boolean;
        sort_order: number;
      }> = [];

      if (featuredImage) {
        imagesToSync.push({
          media_id: featuredImage.id,
          is_primary: true,
          sort_order: 0,
        });
      }

      galleryImages.forEach((img, idx) => {
        if (!featuredImage || img.id !== featuredImage.id) {
          imagesToSync.push({
            media_id: img.id,
            is_primary: !featuredImage && idx === 0,
            sort_order: (featuredImage ? 1 : 0) + idx,
          });
        }
      });

      if (imagesToSync.length > 0) {
        try {
          await catalogService.admin.syncImages(product.id, imagesToSync);
        } catch (imgErr) {
          console.error("Failed to sync product images", imgErr);
        }
      }

      // 3. Set Starting Stock Quantity
      const qty = Number(stockQuantity);
      if (qty > 0 && product.variants?.[0]?.id) {
        try {
          await inventoryService.receive({
            variant_id: product.variants[0].id,
            quantity: qty,
            note: "Initial stock on product creation",
          });
        } catch (invErr) {
          console.error("Failed to set starting stock", invErr);
        }
      }

      router.push(`/admin/products/${product.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError("Failed to create product", 0));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            href="/admin/products"
            className="text-muted-foreground flex items-center gap-1.5 text-xs hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to products
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Add new product</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => submit("draft")}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            loading={saving}
            onClick={() => submit("published")}
          >
            Publish Product
          </Button>
        </div>
      </div>

      {error && (
        <FormAlert
          message={
            error.fieldError("sku") ??
            error.fieldError("price") ??
            error.fieldError("compare_price") ??
            error.fieldError("name") ??
            error.displayMessage
          }
        />
      )}

      {/* WordPress-style 2-Column Grid Layout */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        noValidate
      >
        {/* Left Column: 8 cols (Main Content) */}
        <div className="space-y-6 lg:col-span-8">
          {/* 1. Product Name */}
          <Card className="space-y-2 p-5">
            <label htmlFor="product_name" className="text-sm font-semibold">
              Product name <span className="text-destructive">*</span>
            </label>
            <input
              id="product_name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Traditional Embroidered Silk Panjabi"
              className="border-input bg-background h-11 w-full rounded-md border px-3 text-base font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {error?.fieldError("name") && (
              <p className="text-destructive text-xs">{error.fieldError("name")}</p>
            )}
          </Card>

          {/* 2. Detailed Description */}
          <Card className="space-y-2 p-5">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-semibold">
                Product description
              </label>
              <span className="text-muted-foreground text-xs">
                Supports full formatting & details
              </span>
            </div>
            <textarea
              id="description"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of materials, sizing, fabric specifications, care instructions..."
              className="border-input bg-background w-full rounded-md border p-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </Card>

          {/* 3. Product Data (WooCommerce Box: Price & Stock) */}
          <Card className="space-y-5 p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <CardTitle className="text-base">Product Data</CardTitle>
                <CardDescription>
                  Pricing, SKU code, and starting stock inventory
                </CardDescription>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Simple Product
              </span>
            </div>

            {/* Pricing Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Regular price (৳) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                {error?.fieldError("price") && (
                  <p className="text-destructive text-xs">{error.fieldError("price")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Compare-at price (৳)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="Original price"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <p className="text-muted-foreground text-xs">Crossed-out was price</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cost per item (৳)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Merchant cost"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <p className="text-muted-foreground text-xs">For profit calculation</p>
              </div>
            </div>

            {/* Inventory Row */}
            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    SKU (Stock Keeping Unit) <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
                  >
                    <Sparkles className="size-3" /> Auto-generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PANJ-001"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 font-mono text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                {error?.fieldError("sku") && (
                  <p className="text-destructive text-xs">{error.fieldError("sku")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Starting Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="50"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <p className="text-muted-foreground text-xs">
                  Initial on-hand inventory quantity
                </p>
              </div>
            </div>

            {/* Badges / Flags */}
            <div className="flex flex-wrap gap-5 border-t pt-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                Featured Product
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                New Arrival
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                Bestseller
              </label>
            </div>
          </Card>

          {/* 4. Product Short Description */}
          <Card className="space-y-2 p-5">
            <label htmlFor="short_desc" className="text-sm font-semibold">
              Product short description
            </label>
            <textarea
              id="short_desc"
              rows={3}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A brief snippet displayed under the title on single product pages and cards..."
              className="border-input bg-background w-full rounded-md border p-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </Card>

          {/* 5. Product Gallery (WordPress Style) */}
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <CardTitle className="text-base">Product Gallery</CardTitle>
                <CardDescription>
                  Additional photos shown on the product detail page carousel
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPickerTarget("gallery");
                  setPickerOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="size-4" /> Add gallery images
              </Button>
            </div>

            {galleryImages.length === 0 ? (
              <div
                onClick={() => {
                  setPickerTarget("gallery");
                  setPickerOpen(true);
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-8 text-center transition hover:border-primary/50"
              >
                <UploadCloud className="size-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Add product gallery images</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Click to select multiple photos from Media Library
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.thumb_url}
                      alt={img.alt || ""}
                      className="size-full object-cover transition group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(img.id)}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-destructive"
                      title="Remove image"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: 4 cols (Sidebar) */}
        <div className="space-y-6 lg:col-span-4">
          {/* 1. Publish Card (WP Publish Meta Box) */}
          <Card className="space-y-4 p-5">
            <CardTitle className="text-base">Publish</CardTitle>

            <div className="space-y-2 border-y py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "published" | "archived")
                  }
                  className="border-input bg-background rounded-md border px-2 py-1 text-xs font-medium"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visibility:</span>
                <span className="font-medium text-xs">Public</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => submit("draft")}
                className="w-1/2"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                size="sm"
                loading={saving}
                onClick={() => submit("published")}
                className="w-1/2"
              >
                Publish
              </Button>
            </div>
          </Card>

          {/* 2. Product Image / Featured Image (WP Featured Image Meta Box) */}
          <Card className="space-y-3 p-5">
            <CardTitle className="text-base">Product Image</CardTitle>
            <CardDescription className="text-xs">
              Primary featured photo shown on catalog cards and store listings
            </CardDescription>

            {featuredImage ? (
              <div className="space-y-2">
                <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImage.medium_url || featuredImage.thumb_url}
                    alt={featuredImage.alt || "Product featured image"}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPickerTarget("featured");
                        setPickerOpen(true);
                      }}
                    >
                      Change image
                    </Button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFeaturedImage(null)}
                  className="text-destructive text-xs hover:underline block"
                >
                  Remove product image
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setPickerTarget("featured");
                  setPickerOpen(true);
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-10 text-center transition hover:border-primary/50 hover:bg-muted/30"
              >
                <ImageIcon className="size-10 text-muted-foreground mb-2" />
                <span className="text-primary text-sm font-medium hover:underline">
                  Set product image
                </span>
                <span className="text-muted-foreground text-xs mt-1">
                  Upload or choose from Media Library
                </span>
              </div>
            )}
          </Card>

          {/* 3. Product Categories (WP Categories Meta Box) */}
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Categories</CardTitle>
              <button
                type="button"
                onClick={() => setShowNewCatInput((v) => !v)}
                className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
              >
                <Plus className="size-3" /> Add category
              </button>
            </div>

            {/* Quick Category Form */}
            {showNewCatInput && (
              <div className="rounded-md border bg-muted/30 p-2.5 space-y-2">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="border-input bg-background h-8 w-full rounded border px-2 text-xs"
                />
                <div className="flex justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowNewCatInput(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    loading={creatingCategory}
                    onClick={handleCreateCategory}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-md border p-3">
              {categoryList.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-xs hover:bg-muted/50 rounded px-1.5 py-1 cursor-pointer"
                  style={{ paddingLeft: `${Math.max(6, category.depth * 14)}px` }}
                >
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="rounded border-gray-300 text-primary"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
              {categoryList.length === 0 && (
                <p className="text-muted-foreground text-xs py-2 text-center">
                  No categories yet.
                </p>
              )}
            </div>
          </Card>

          {/* 4. Product Brand */}
          <Card className="space-y-3 p-5">
            <CardTitle className="text-base">Brand</CardTitle>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs"
            >
              <option value="">No brand</option>
              {brandList.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </Card>
        </div>
      </form>

      {/* WordPress-Style MediaPicker Modal */}
      <MediaPicker
        open={pickerOpen}
        multiple={pickerTarget === "gallery"}
        title={pickerTarget === "gallery" ? "Add to Product Gallery" : "Set Product Featured Image"}
        buttonLabel={pickerTarget === "gallery" ? "Add to gallery" : "Set product image"}
        onClose={() => setPickerOpen(false)}
        onSelect={(selected) => {
          if (pickerTarget === "featured") {
            if (selected[0]) setFeaturedImage(selected[0]);
          } else {
            setGalleryImages((cur) => {
              const existingIds = new Set(cur.map((img) => img.id));
              const newItems = selected.filter((img) => !existingIds.has(img.id));
              return [...cur, ...newItems];
            });
          }
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

