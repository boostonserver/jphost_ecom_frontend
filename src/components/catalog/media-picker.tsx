"use client";

import { Check, Loader2, Search, Trash2, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { catalogService, type Media } from "@/services/catalog";

export interface MediaPickerProps {
  open: boolean;
  multiple?: boolean;
  title?: string;
  buttonLabel?: string;
  onClose: () => void;
  onSelect: (media: Media[]) => void;
}

/**
 * WordPress-style Media Library Dialog.
 *
 * Provides two tabs:
 * 1. "Upload files": Drag & drop dropzone + file select button.
 * 2. "Media Library": Grid with search, checkmark selection badges,
 *    and an Attachment Details sidebar.
 */
export function MediaPicker({
  open,
  multiple = false,
  title = "Media Library",
  buttonLabel,
  onClose,
  onSelect,
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
  const [picked, setPicked] = useState<Media[]>([]);
  const [activeItem, setActiveItem] = useState<Media | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    open ? ["/admin/media", search] : null,
    async () => (await catalogService.admin.media({ q: search, per_page: 80 })).items,
    {
      shouldRetryOnError: false,
      refreshInterval: (items) =>
        items?.some((m) => m.status === "processing") ? 2000 : 0,
    },
  );

  if (!open) return null;

  async function upload(files: FileList | null) {
    if (!files?.length) return;

    setError(null);
    setUploading(true);

    try {
      const uploadedMedia: Media[] = [];
      for (const file of Array.from(files)) {
        const m = await catalogService.admin.uploadMedia(file);
        if (m) uploadedMedia.push(m);
      }

      await mutate();
      setActiveTab("library");

      if (uploadedMedia.length > 0) {
        if (multiple) {
          setPicked((cur) => [...cur, ...uploadedMedia]);
        } else {
          setPicked([uploadedMedia[0]]);
        }
        setActiveItem(uploadedMedia[0]);
        setAltText(uploadedMedia[0].alt ?? "");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.displayMessage : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function toggle(media: Media) {
    setActiveItem(media);
    setAltText(media.alt ?? "");

    setPicked((current) => {
      const already = current.some((m) => m.id === media.id);
      if (already) {
        return current.filter((m) => m.id !== media.id);
      }
      return multiple ? [...current, media] : [media];
    });
  }

  async function saveActiveAlt() {
    if (!activeItem) return;
    setSavingAlt(true);
    try {
      await catalogService.admin.updateMedia(activeItem.id, { alt: altText });
      await mutate();
    } catch {
      // ignore silently
    } finally {
      setSavingAlt(false);
    }
  }

  const selectedCount = picked.length;
  const actionText =
    buttonLabel ??
    (multiple
      ? selectedCount > 0
        ? `Insert ${selectedCount} image${selectedCount > 1 ? "s" : ""}`
        : "Insert into product"
      : "Set product image");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
    >
      <div className="bg-card flex h-[90vh] w-full max-w-5xl flex-col rounded-xl border border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-5 py-3.5 bg-muted/30">
          <div className="flex items-center gap-6">
            <h2 className="font-semibold text-lg">{title}</h2>
            {/* WP-Style Tabs */}
            <div className="flex gap-1 border-b border-transparent">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === "upload"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Upload files
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === "library"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Media Library
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 border-b">
            <FormAlert message={error} />
          </div>
        )}

        {/* Tab 1: Upload Files */}
        {activeTab === "upload" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                upload(e.dataTransfer.files);
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full max-w-xl p-12 border-2 border-dashed rounded-2xl transition-all text-center",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 bg-background",
              )}
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                {uploading ? (
                  <Loader2 className="size-10 animate-spin" />
                ) : (
                  <UploadCloud className="size-10" />
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {uploading ? "Uploading files to server…" : "Drop files anywhere to upload"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                or select image files from your computer
              </p>
              <label className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => upload(e.target.files)}
                  disabled={uploading}
                />
                Select Files
              </label>
              <p className="text-xs text-muted-foreground/80 mt-6">
                Maximum upload file size: 10 MB. Supported formats: JPG, PNG, WebP, AVIF.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Media Library */}
        {activeTab === "library" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter Bar */}
            <div className="flex items-center justify-between border-b px-5 py-2.5 bg-muted/10 gap-3">
              <div className="relative w-64 max-w-xs">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media items…"
                  className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {data?.length ?? 0} media items
              </span>
            </div>

            {/* Content Area: Grid + Attachment Details Sidebar */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading && (
                  <div className="flex items-center justify-center p-12 text-sm text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin" /> Loading library…
                  </div>
                )}

                {!isLoading && data?.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
                    <p className="font-medium text-foreground">No media found</p>
                    <p className="text-xs mt-1">Upload images using the "Upload files" tab.</p>
                  </div>
                )}

                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
                  {data?.map((media) => {
                    const isSelected = picked.some((m) => m.id === media.id);
                    const isCurrent = activeItem?.id === media.id;

                    return (
                      <li key={media.id}>
                        <button
                          type="button"
                          onClick={() => toggle(media)}
                          className={cn(
                            "group relative block w-full aspect-square overflow-hidden rounded-lg border-2 text-left transition-all",
                            isSelected
                              ? "border-primary ring-2 ring-primary/40 shadow-xs"
                              : isCurrent
                                ? "border-foreground/40"
                                : "border-border/60 hover:border-border",
                          )}
                        >
                          <img
                            src={media.thumb_url}
                            alt={media.alt ?? media.filename}
                            loading="lazy"
                            className="size-full object-cover transition-transform group-hover:scale-105"
                          />

                          {/* WP-Style Selection Checkmark Badge */}
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                              <Check className="size-3 stroke-[3]" />
                            </span>
                          )}

                          {media.status === "processing" && (
                            <span className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                              Processing…
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* WP-Style Attachment Details Sidebar */}
              {activeItem && (
                <div className="w-72 shrink-0 border-l bg-muted/20 p-4 flex flex-col gap-3 overflow-y-auto text-xs">
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-wide border-b pb-2">
                    Attachment Details
                  </h4>

                  <div className="aspect-square w-full rounded-md border bg-card overflow-hidden flex items-center justify-center">
                    <img
                      src={activeItem.thumb_url}
                      alt={activeItem.alt ?? ""}
                      className="size-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 text-muted-foreground border-b pb-3">
                    <p className="font-semibold text-foreground truncate" title={activeItem.filename}>
                      {activeItem.filename}
                    </p>
                    <p>{(activeItem.size / 1024).toFixed(0)} KB · {activeItem.mime}</p>
                    {activeItem.width && activeItem.height && (
                      <p>{activeItem.width} by {activeItem.height} pixels</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-foreground">Alt Text</label>
                    <textarea
                      rows={2}
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      onBlur={saveActiveAlt}
                      placeholder="Describe the purpose of the image"
                      className="w-full bg-background border border-input rounded-md p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {savingAlt ? "Saving alt text…" : "Leave blank if decorative."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t px-5 py-3 bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {selectedCount > 0 ? (
              <span className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {selectedCount} image{selectedCount > 1 ? "s" : ""} selected
                </span>
                <button
                  type="button"
                  onClick={() => setPicked([])}
                  className="text-primary hover:underline"
                >
                  Clear selection
                </button>
              </span>
            ) : (
              <span>Click on images to select</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={selectedCount === 0}
              onClick={() => {
                onSelect(picked);
                setPicked([]);
                onClose();
              }}
            >
              {actionText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

