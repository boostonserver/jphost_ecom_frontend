import type { ReactNode } from "react";
import type { Brand, CategoryNode, FlashSale, Product } from "@/services/catalog";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { GroceryHeaderStrip } from "./grocery/grocery-header-strip";
import { GroceryThemeLayout } from "./grocery/grocery-layout";
import { FashionThemeLayout } from "./fashion/fashion-layout";
import { ElectronicsThemeLayout } from "./electronics/electronics-layout";

export interface ThemeHomeProps {
  storeName: string;
  categories: CategoryNode[];
  brands: Brand[];
  flashSale: FlashSale;
  featured: Product[];
  fresh: Product[];
  bestsellers: Product[];
  heroProducts: Product[];
  hasAnything: boolean;
  defaultLayout: ReactNode;
}

export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const REGISTERED_THEMES: Record<string, ThemeMetadata> = {
  default: {
    id: "default",
    name: "Modern Store (Default)",
    description: "Standard clean multi-purpose layout.",
    category: "general",
  },
  fashion: {
    id: "fashion",
    name: "Fashion & Lifestyle",
    description: "Aesthetic lifestyle layout for apparel and beauty.",
    category: "fashion",
  },
  electronics: {
    id: "electronics",
    name: "Electronics & Gadgets",
    description: "Tech specs focused layout with brand highlights.",
    category: "electronics",
  },
  grocery: {
    id: "grocery",
    name: "Grocery & Supermarket (Shwapno Express)",
    description: "Quick buy shopping experience for daily essentials.",
    category: "grocery",
  },
};

/**
 * Renders the top announcement / header strip corresponding to the active theme.
 * Rendered globally by StoreLayout so all pages (Home, Product, Category, Cart) retain it.
 */
export function renderThemeAnnouncement(themeId: string, storeName: string): ReactNode {
  switch (themeId) {
    case "grocery":
      return <GroceryHeaderStrip storeName={storeName} />;
    case "fashion":
      return (
        <div className="bg-[#1c1917] text-stone-300 py-2.5 px-4 text-xs tracking-widest uppercase font-medium border-b border-stone-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
            <span className="hidden sm:inline">✨ Autumn / Winter Collection Drop</span>
            <span className="mx-auto font-semibold text-stone-200">Complimentary Express Nationwide Delivery on Orders over BDT 3,000</span>
            <span className="hidden sm:inline text-stone-400">Bespoke Gift Packaging</span>
          </div>
        </div>
      );
    case "electronics":
      return (
        <div className="bg-[#030712] text-cyan-300 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-400 animate-pulse" /> 100% Genuine Tech</span>
            <span className="mx-auto font-bold text-white">⚡ Official Manufacturer Warranty • 0% EMI Available</span>
            <span className="hidden sm:inline text-slate-400">Hotline: <strong className="text-cyan-300">09612-888999</strong></span>
          </div>
        </div>
      );
    case "default":
    default:
      return <AnnouncementBar />;
  }
}

/**
 * Renders the layout corresponding to the merchant's active theme.
 * If a custom layout component hasn't been implemented yet for this theme,
 * it safely and seamlessly falls back to defaultLayout.
 */
export function renderStoreTheme(themeId: string, props: ThemeHomeProps): ReactNode {
  switch (themeId) {
    case "grocery":
      return <GroceryThemeLayout {...props} />;
    case "fashion":
      return <FashionThemeLayout {...props} />;
    case "electronics":
      return <ElectronicsThemeLayout {...props} />;
    case "default":
    default:
      return props.defaultLayout;
  }
}
