"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ExternalLink, Eye, Layout, Palette, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoThemeBarProps {
  isDemo: boolean;
  currentTheme: string;
}

const DEMO_THEMES = [
  {
    id: "grocery",
    name: "Grocery Supermarket",
    icon: "🛒",
    badge: "Shwapno Express",
    desc: "1-click quick-add, per-kg pricing, produce rails",
  },
  {
    id: "fashion",
    name: "Fashion & Boutique",
    icon: "👗",
    badge: "Runway '26",
    desc: "Editorial lifestyle hero, color swatches, elegant type",
  },
  {
    id: "electronics",
    name: "Electronics & Tech",
    icon: "💻",
    badge: "Tech Zone",
    desc: "Spec comparison badges, brand showcases, dark tech look",
  },
  {
    id: "default",
    name: "Modern Retail (Default)",
    icon: "🏪",
    badge: "Multi-Purpose",
    desc: "Clean, balanced e-commerce layout for any product line",
  },
];

const DEMO_COLORS = [
  { name: "Emerald Green", hex: "#16a34a", hover: "#15803d", bg: "bg-emerald-600" },
  { name: "Royal Blue", hex: "#2563eb", hover: "#1d4ed8", bg: "bg-blue-600" },
  { name: "Luxury Amber", hex: "#d97706", hover: "#b45309", bg: "bg-amber-600" },
  { name: "Crimson Red", hex: "#dc2626", hover: "#b91c1c", bg: "bg-red-600" },
  { name: "Deep Violet", hex: "#7c3aed", hover: "#6d28d9", bg: "bg-purple-600" },
  { name: "Obsidian Slate", hex: "#0f172a", hover: "#020617", bg: "bg-slate-900" },
];

export function DemoThemeBar({ isDemo, currentTheme }: DemoThemeBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTheme, setActiveTheme] = useState(currentTheme || "default");
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setActiveTheme(currentTheme || "default");
  }, [currentTheme]);

  // Apply chosen color palette dynamically to CSS variables
  function applyColor(hex: string, hover: string) {
    setActiveColor(hex);
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--primary", hex);
      document.documentElement.style.setProperty("--primary-hover", hover);
      // Also update button and link colors
      document.documentElement.style.setProperty("--color-primary", hex);
    }
  }

  function handleThemeChange(themeId: string) {
    setActiveTheme(themeId);
    setDropdownOpen(false);

    // Build next URL preserving existing queries
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("theme", themeId);
    params.set("demo", "1");
    router.push(`?${params.toString()}`);
  }

  // Only render on demo store or when ?demo=1 / ?preview_theme is set
  if (!isDemo && searchParams?.get("demo") !== "1" && !searchParams?.get("preview_theme")) {
    return null;
  }

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:bg-black border border-stone-700/80 animate-in fade-in"
      >
        <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
        <Palette className="size-4 text-emerald-400" />
        <span>Theme &amp; Style Switcher</span>
      </button>
    );
  }

  const currentThemeObj = DEMO_THEMES.find((t) => t.id === activeTheme) || DEMO_THEMES[0];

  return (
    <aside
      aria-label="Interactive Demo Switcher"
      className="sticky top-0 z-50 w-full border-b border-stone-800 bg-stone-950/95 text-stone-100 backdrop-blur-md shadow-md transition-all select-none"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5 text-xs">
        {/* Left: Demo Store Badge & Theme Selector */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-md bg-stone-800/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Interactive Demo</span>
          </div>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-1.5 font-semibold text-stone-100 hover:bg-stone-800 border border-stone-700/80 transition-colors"
            >
              <span>{currentThemeObj.icon}</span>
              <span className="hidden sm:inline font-bold">{currentThemeObj.name}</span>
              <span className="sm:hidden font-bold">{currentThemeObj.badge}</span>
              <ChevronDown className={cn("size-3.5 text-stone-400 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-stone-700 bg-stone-900/98 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Switch Storefront Layout
                  </div>
                  <div className="space-y-1">
                    {DEMO_THEMES.map((theme) => {
                      const isSelected = theme.id === activeTheme;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleThemeChange(theme.id)}
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors",
                            isSelected
                              ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                              : "hover:bg-stone-800 text-stone-200",
                          )}
                        >
                          <span className="text-base mt-0.5">{theme.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold leading-tight">{theme.name}</span>
                              {isSelected && <Check className="size-3.5 text-emerald-400 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-stone-400 leading-tight mt-0.5 line-clamp-1">
                              {theme.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Live Color Palette Swatches */}
        <div className="hidden lg:flex items-center gap-2 border-x border-stone-800 px-4">
          <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
            <Palette className="size-3 text-stone-400" />
            Color:
          </span>
          <div className="flex items-center gap-1.5">
            {DEMO_COLORS.map((color) => {
              const isSelected = activeColor === color.hex;
              return (
                <button
                  key={color.name}
                  type="button"
                  title={`Apply ${color.name}`}
                  onClick={() => applyColor(color.hex, color.hover)}
                  className={cn(
                    "size-5 rounded-full transition-transform hover:scale-125 focus:outline-hidden",
                    color.bg,
                    isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-stone-950 scale-110" : "opacity-80 hover:opacity-100",
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Right: CTA & Minimize */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://bdbazz.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
          >
            <Sparkles className="size-3.5" />
            <span>Create Your Store</span>
            <ExternalLink className="size-3 opacity-70" />
          </a>

          {/* Minimize / Close Button */}
          <button
            type="button"
            title="Minimize Demo Bar"
            onClick={() => setIsMinimized(true)}
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
