import { api } from "@/lib/api";

export interface ThemeInfo {
  id: string;
  name: string;
  description: string;
  category_hint: string;
  is_system?: boolean;
  preview_image?: string;
}

export interface ThemeCustomization {
  primary_color?: string | null;
  announcement_text?: string | null;
  announcement_enabled?: boolean;
  banner_headline?: string | null;
  dark_mode_preference?: string | null;
}

export interface StoreThemeSettings {
  active_theme: string;
  allowed_themes: string[];
  allowed_categories: (string | number)[];
  available_themes: ThemeInfo[];
  customization?: ThemeCustomization;
}

export const adminThemeService = {
  getSettings: () => api.get<StoreThemeSettings>("/admin/theme"),

  activate: (themeId: string) =>
    api.post<StoreThemeSettings>("/admin/theme/activate", { theme: themeId }),

  updateCustomization: (customization: ThemeCustomization) =>
    api.post<StoreThemeSettings>("/admin/theme/customization", customization),
};
