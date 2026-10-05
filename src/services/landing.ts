import { serverFetch } from "@/lib/server-api";
import type { LandingCmsSettings } from "@/services/platform";

export async function loadPublicLandingData(): Promise<LandingCmsSettings | null> {
  try {
    return await serverFetch<LandingCmsSettings>("/platform/landing-page", 10);
  } catch (error) {
    console.error("Failed to load public landing data:", error);
    return null;
  }
}
