import { api } from "@/lib/api";

export type DashboardPeriod = "today" | "7d" | "30d";

export interface DashboardKpis {
  period: DashboardPeriod;
  range: { from: string; to: string };
  revenue: { amount: string; currency: string };
  orders_count: number;
  /** null when nothing in the period is paid yet — never render this as 0. */
  average_order_value: string | null;
  new_customers_count: number;
  /** Current backlog, not filtered by period — see the PRD's rule 5. */
  open_orders_count: number;
  low_stock_count: number;
  sales_trend: Array<{
    date: string;
    sales_amount: string;
    orders_count: number;
  }>;
  top_products: Array<{
    product_id: number | null;
    product_name: string;
    units_sold: number;
    sales_amount: string;
  }>;
}

/** The admin dashboard home page's summary tiles (Phase 26 slice 1). */
export const dashboardService = {
  kpis: (period: DashboardPeriod = "30d") =>
    api.get<DashboardKpis>(`/admin/dashboard/kpis?period=${period}`),
};
