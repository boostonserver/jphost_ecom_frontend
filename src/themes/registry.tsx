import type { ReactNode } from "react";
import type { Brand, CategoryNode, FlashSale, Product } from "@/services/catalog";
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
