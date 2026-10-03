import { api } from "@/lib/api";
import type { Paginated } from "@/types/auth";

/*
 * Shipments and couriers (Phase 15).
 *
 * Every status here is the NORMALIZED one. Three couriers use three
 * vocabularies for the same journey, and each driver maps its own words into
 * this set server-side - so nothing in the UI ever has to know whether a parcel
 * is with Pathao or RedX to render its timeline.
 */

export type ShipmentStatus =
  | "created"
  | "pickup_requested"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed_delivery"
  | "returning"
  | "returned_to_sender"
  | "cancelled";

export interface ShipmentMilestone {
  status: ShipmentStatus;
  label: string;
  at: string;
}

export interface Shipment {
  status: ShipmentStatus;
  status_label: string;
  tracking_number: string | null;
  courier: { name: string; code: string } | null;
  milestones: ShipmentMilestone[];

  /** Staff shape only — never sent to a customer. */
  id?: number;
  consignment_id?: string | null;
  courier_status_raw?: string | null;
  /** True when the courier said something nobody mapped. A to-do, not an error. */
  unmapped_status?: boolean;
  shipping_cost?: string;
  courier_charge?: string | null;
  /** What the shop made, or lost, on this delivery. */
  delivery_margin?: string | null;
  cod_amount?: string;
  is_cod?: boolean;
  weight_kg?: string | null;
  notes?: string | null;
  order?: { id: number; number: string; email: string } | null;
  history?: {
    from: string | null;
    to: string;
    to_label: string;
    courier_status_raw: string | null;
    actor_type: string;
    actor: string | null;
    note: string | null;
    at: string;
  }[];
  pickup_at?: string | null;
  delivered_at?: string | null;
  created_at?: string | null;
}

export interface CourierCatalogEntry {
  id: number;
  code: string;
  name: string;
  /** Whether a working driver exists — not whether the merchant enabled it. */
  implemented: boolean;
  is_enabled: boolean;
  is_default: boolean;
  has_credentials: boolean;
  available: boolean;
  reason: string | null;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }

  return search.toString();
}

export const shipmentService = {
  list: (
    params: {
      status?: ShipmentStatus | "";
      courier_id?: number;
      q?: string;
      open?: string;
      per_page?: number;
    } = {},
  ) => api.get<Paginated<Shipment>>(`/admin/shipments?${query(params)}`),

  show: (id: number) => api.get<Shipment>(`/admin/shipments/${id}`),

  /**
   * The shipment currently attached to one order, or null.
   *
   * `open=0` because the default listing hides parcels that have finished
   * their journey, and an order page must still show a delivered one.
   * Cancelled shipments are dropped here rather than server-side: the order
   * they came from is shippable again, so the panel should offer to create a
   * new one, not display the abandoned one.
   */
  forOrder: async (orderNumber: string): Promise<Shipment | null> => {
    const { items } = await shipmentService.list({
      q: orderNumber,
      open: "0",
      per_page: 20,
    });

    return (
      items.find(
        (s) => s.order?.number === orderNumber && s.status !== "cancelled",
      ) ?? null
    );
  },

  /** Hands a PACKED order to a courier and moves it to SHIPPED. */
  create: (
    orderNumber: string,
    payload: {
      courier_id?: number;
      tracking_number?: string;
      consignment_id?: string;
      courier_charge?: string;
      weight_kg?: string;
      notes?: string;
    },
  ) => api.post<Shipment>(`/admin/orders/${orderNumber}/shipments`, payload),

  /**
   * What the state machine allows right now.
   *
   * Fetched rather than hardcoded: a client carrying its own copy of the
   * transition table drifts from the server's and then offers moves that 409.
   */
  transitions: (id: number) =>
    api.get<{
      current: ShipmentStatus;
      allowed: { value: ShipmentStatus; label: string }[];
    }>(`/admin/shipments/${id}/transitions`),

  updateStatus: (id: number, status: ShipmentStatus, note?: string) =>
    api.post<Shipment>(`/admin/shipments/${id}/status`, { status, note }),

  cancel: (id: number, reason: string) =>
    api.post<Shipment>(`/admin/shipments/${id}/cancel`, { reason }),

  couriers: () =>
    api.get<{ items: CourierCatalogEntry[] }>("/admin/settings/couriers"),

  updateCourier: (
    code: string,
    payload: {
      is_enabled?: boolean;
      is_default?: boolean;
      /** Omit a field to leave it unchanged; the API merges rather than replaces. */
      config?: Record<string, string>;
    },
  ) =>
    api.patch<{ items: CourierCatalogEntry[] }>(
      `/admin/settings/couriers/${code}`,
      payload,
    ),
};

/** Customer-facing tracking for one order. */
export const trackingService = {
  forOrder: (orderNumber: string) =>
    api.get<
      {
        shipped: boolean;
        status?: string;
        status_label?: string;
      } & Partial<Shipment>
    >(`/orders/${orderNumber}/tracking`),
};
