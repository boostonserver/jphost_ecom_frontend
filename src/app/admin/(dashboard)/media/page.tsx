"use client";

import {
  Check,
  Copy,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { catalogService, type Media } from "@/services/catalog";
import { can } from "@/types/auth";

/**
 * WordPress-style Dedicated Media Library.
 *
 * Matches the user reference design from bookishbd.joypurhost.dev:
 * - "+ Add New Media" toggle revealing large dashed dropzone
 * - Type & Date filters + search bar
 * - Grid of media items with titles
 * - Full "Attachment details" modal with large preview, metadata, Alt text,
 *   Caption, Description, and Copy URL button.
 */
export default function AdminMediaPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("images");
  const [filterDate, setFilterDate] = useState("all");
  const [selected, setSelected] = useState<Media | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [notice, setNotice] = useState<
    { tone: "error" | "success"; message: string } | null
  >(null);

  const { data, isLoading, mutate } = useSWR(
    ["/admin/media", search],
    async () => (await catalogService.admin.media({ q: search, per_page: 100 })).items,
    {
      shouldRetryOnError: false,
      refreshInterval: (items) =>
        items?.some((m) => m.status === "processing") ? 2000 : 0,
    },
  );

  async function run(action: () => Promise<unknown>, success: string) {
    setNotice(null);

    try {
      await action();
      await mutate();
      setNotice({ tone: "success", message: success });

      return true;
    } catch (e) {
      setNotice({
        tone: "error",
        message: e instanceof ApiError ? e.displayMessage : "Something went wrong",
      });

      return false;
    }
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);

    try {
      await run(async () => {
        for (const file of Array.from(files)) {
          await catalogService.admin.uploadMedia(file);
        }
      }, `Uploaded ${files.length} file${files.length === 1 ? "" : "s"}`);
    } finally {
      setUploading(false);
    }
  }

  // Filter media items
  const filteredData = (data ?? []).filter((m) => {
    if (filterType === "images" && !m.mime.startsWith("image/")) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Manage, search, and upload reusable media assets across your store.
          </p>
        </div>

        {can(user, "media.upload") && (
          <Button
            type="button"
            onClick={() => setShowUploadZone((prev) => !prev)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            Add New Media
          </Button>
        )}
      </div>

      {notice && <FormAlert tone={notice.tone} message={notice.message} />}

      {/* Expandable Upload Dropzone (Screenshot 2) */}
      {showUploadZone && (
        <Card className="p-5 border-border shadow-xs animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <span className="text-sm font-semibold flex items-center gap-2">
              <UploadCloud className="size-4 text-primary" />
              Upload New Media
            </span>
            <button
              onClick={() => setShowUploadZone(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="size-4" />
            </button>
          </div>

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
              "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all text-center",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-primary/40 bg-muted/10 hover:border-primary/70",
            )}
          >
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              {uploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <ImageIcon className="size-6" />
              )}
            </div>
            <h3 className="text-base font-bold text-foreground">
              {uploading ? "Uploading files to server…" : "Drop files anywhere to upload"}
            </h3>
            <p className="text-xs text-muted-foreground my-1.5">or</p>
            <label className="bg-background border border-input hover:bg-muted text-foreground cursor-pointer px-4 py-2 rounded-md font-medium text-xs shadow-xs inline-flex items-center gap-1.5 transition-colors">
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
            <p className="text-[11px] text-muted-foreground/80 mt-4">
              Maximum upload file size: 10 MB per file. Supported: JPG, PNG, WebP, GIF, SVG, AVIF, PDF.
            </p>
          </div>
        </Card>
      )}

      {/* Filter & Search Bar (Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 border rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-background border border-input rounded-md px-3 py-1.5 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="images">Images only</option>
            <option value="all">All media items</option>
          </select>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-background border border-input rounded-md px-3 py-1.5 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All dates</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by title or filename…"
            className="w-full bg-background border border-input rounded-md pl-3 pr-8 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-16 text-sm text-muted-foreground gap-2">
          <Loader2 className="size-4 animate-spin" /> Loading media assets…
        </div>
      )}

      {!isLoading && filteredData.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <p className="font-semibold text-foreground">No media assets found</p>
          <p className="text-xs mt-1">Click "Add New Media" above to upload photos.</p>
        </Card>
      )}

      {/* Media Grid (Screenshot 1) */}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredData.map((media) => (
          <li key={media.id}>
            <button
              type="button"
              onClick={() => setSelected(media)}
              className="group block w-full overflow-hidden rounded-lg border border-border bg-card shadow-xs hover:border-primary/60 transition-all text-left"
            >
              <span className="bg-muted block aspect-square overflow-hidden relative">
                <img
                  src={media.thumb_url}
                  alt={media.alt ?? media.filename}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {media.status === "processing" && (
                  <span className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    Processing…
                  </span>
                )}
              </span>
              <span className="block truncate p-2 text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                {media.title || media.alt || media.filename}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Attachment Details Modal (Screenshot 3) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-card flex flex-col md:flex-row max-h-[90vh] w-full max-w-4xl rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Left Preview Pane */}
            <div className="flex-1 bg-black/40 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r min-h-[260px] md:min-h-[460px]">
              <img
                src={selected.medium_url}
                alt={selected.alt ?? ""}
                className="max-h-[75vh] max-w-full rounded object-contain shadow-lg"
              />
            </div>

            {/* Right Form Pane */}
            <div className="w-full md:w-96 flex flex-col min-h-0 bg-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-5 py-3.5 bg-muted/20">
                <h3 className="font-bold text-base text-foreground">Attachment details</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* File Metadata */}
                <div className="space-y-1 text-muted-foreground pb-3 border-b text-[11px]">
                  <p className="truncate">
                    <strong className="text-foreground">File name:</strong> {selected.filename}
                  </p>
                  <p>
                    <strong className="text-foreground">File type:</strong> {selected.mime}
                  </p>
                  <p>
                    <strong className="text-foreground">File size:</strong>{" "}
                    {(selected.size / 1024).toFixed(2)} KB
                  </p>
                  {selected.width && selected.height && (
                    <p>
                      <strong className="text-foreground">Dimensions:</strong>{" "}
                      {selected.width} by {selected.height} pixels
                    </p>
                  )}
                </div>

                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    await run(
                      () =>
                        catalogService.admin.updateMedia(selected.id, {
                          alt: String(form.get("alt") || ""),
                          title: String(form.get("title") || ""),
                        }),
                      "Media details updated successfully",
                    );
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Alternative Text
                    </label>
                    <input
                      name="alt"
                      defaultValue={selected.alt ?? ""}
                      placeholder="Describe the image for SEO & accessibility"
                      className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Title
                    </label>
                    <input
                      name="title"
                      defaultValue={selected.title ?? selected.filename}
                      className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Caption
                    </label>
                    <textarea
                      rows={2}
                      name="caption"
                      placeholder="Optional caption"
                      className="w-full bg-background border border-input rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      name="description"
                      placeholder="Optional description"
                      className="w-full bg-background border border-input rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      File URL
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={selected.medium_url}
                        className="flex-1 bg-muted/40 border border-input rounded-md px-2.5 py-1 text-[11px] text-muted-foreground font-mono truncate"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(selected.medium_url);
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="shrink-0 text-xs px-2.5 py-1 h-auto"
                      >
                        {copiedUrl ? (
                          <>
                            <Check className="size-3 text-green-600 mr-1" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3 mr-1" /> Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between border-t pt-4 mt-2">
                    {can(user, "media.delete") && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm("Are you sure you want to permanently delete this media file?")) {
                            const ok = await run(
                              () => catalogService.admin.deleteMedia(selected.id),
                              "Media deleted permanently",
                            );
                            if (ok) setSelected(null);
                          }
                        }}
                        className="text-destructive hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="size-3.5" />
                        Delete permanently
                      </button>
                    )}

                    <Button type="submit" size="sm">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

