import { api } from "@/lib/api";

export interface ThemeInfo {
  id: string;
  name: string;
  description: string;
  category_hint: string;
  is_system?: boolean;
  preview_image?: string;
}

export interface StoreThemeSettings {
  active_theme: string;
  allowed_themes: string[];
  allowed_categories: (string | number)[];
  available_themes: ThemeInfo[];
}

export const adminThemeService = {
  getSettings: () => api.get<StoreThemeSettings>("/admin/theme"),

  activate: (themeId: string) =>
    api.post<StoreThemeSettings>("/admin/theme/activate", { theme: themeId }),
};
