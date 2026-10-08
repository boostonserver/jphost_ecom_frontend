import { cookies, headers } from "next/headers";
import { serverFetch } from "@/lib/server-api";
import { isCentralHost } from "@/lib/tenant";

export const VALID_THEMES = ["grocery", "fashion", "electronics", "default"] as const;
export type ValidTheme = (typeof VALID_THEMES)[number];

export function isValidTheme(theme: string | null | undefined): theme is ValidTheme {
  return typeof theme === "string" && VALID_THEMES.includes(theme as ValidTheme);
}

/**
 * Resolves the active theme for the current request.
 *
 * Precedence:
 * 1. Query parameter ?theme= (e.g. for testing / direct preview links)
 * 2. If host is demo (e.g. demo.bdbazz.com): check `demo_theme` cookie
 * 3. Tenant database configuration: GET /store/theme
 * 4. Fallback default
 */
export async function resolveStoreTheme(searchTheme?: string): Promise<{
  themeId: string;
  isDemo: boolean;
}> {
  const incoming = await headers();
  const host = incoming.get("host") ?? "";
  const isDemo =
    host.startsWith("demo.") ||
    host.includes("demo") ||
    searchTheme !== undefined;

  // 1. Direct query param override
  if (isValidTheme(searchTheme)) {
    return { themeId: searchTheme, isDemo };
  }

  // 2. Demo store session cookie
  if (isDemo) {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_theme")?.value;
    if (isValidTheme(demoCookie)) {
      return { themeId: demoCookie, isDemo: true };
    }
  }

  // 3. Tenant active theme from API
  try {
    const res = await serverFetch<{ active_theme: string }>("/store/theme", 0);
    const active = res.active_theme || "default";
    return {
      themeId: isValidTheme(active) ? active : "default",
      isDemo,
    };
  } catch {
    // If backend unreachable or in demo mode with no selection, default to grocery for demo
    return {
      themeId: isDemo ? "grocery" : "default",
      isDemo,
    };
  }
}
