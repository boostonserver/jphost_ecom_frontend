import { api } from "@/lib/api";

/*
 * Delivery zones and rates (an early slice of Phase 14).
 *
 * Money crosses this boundary as DECIMAL strings, exactly like every other
 * money field in the app - the API validates the shape and rejects a float.
 */

export interface ShippingRate {
  id: number;
  method: string;
  label: string;
  base_rate: string;
  /** Null disables free delivery for this zone. */
  free_threshold: string | null;
  is_active: boolean;
}

export interface ShippingZone {
  id: number;
  name: string;
  districts: string[];
  /** The fallback. Defined by what it catches, so it carries no district list. */
  is_default: boolean;
  rates: ShippingRate[];
}

export const shippingService = {
  zones: () => api.get<{ zones: ShippingZone[] }>("/admin/settings/shipping"),

  updateZone: (id: number, payload: { name?: string; districts?: string[] }) =>
    api.patch<{ zones: ShippingZone[] }>(
      `/admin/settings/shipping/zones/${id}`,
      payload,
    ),

  updateRate: (
    id: number,
    payload: {
      label?: string;
      base_rate?: string;
      free_threshold?: string | null;
      is_active?: boolean;
    },
  ) =>
    api.patch<{ zones: ShippingZone[] }>(
      `/admin/settings/shipping/rates/${id}`,
      payload,
    ),
};
