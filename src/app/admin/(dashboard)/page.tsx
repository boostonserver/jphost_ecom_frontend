"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { formatMoney } from "@/components/catalog/price";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  dashboardService,
  type DashboardKpis,
  type DashboardPeriod,
} from "@/services/dashboard";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const KPI_TONES = {
  sales: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-100 text-emerald-950 dark:border-emerald-900/60 dark:from-emerald-950 dark:via-slate-950 dark:to-teal-950 dark:text-emerald-50",
  orders: "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-100 text-sky-950 dark:border-sky-900/60 dark:from-sky-950 dark:via-slate-950 dark:to-cyan-950 dark:text-sky-50",
  average: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-100 text-amber-950 dark:border-amber-900/60 dark:from-amber-950 dark:via-slate-950 dark:to-yellow-950 dark:text-amber-50",
  customers: "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-100 text-rose-950 dark:border-rose-900/60 dark:from-rose-950 dark:via-slate-950 dark:to-pink-950 dark:text-rose-50",
  open: "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-100 text-indigo-950 dark:border-indigo-900/60 dark:from-indigo-950 dark:via-slate-950 dark:to-blue-950 dark:text-indigo-50",
  stock: "border-lime-200 bg-gradient-to-br from-lime-50 via-white to-green-100 text-lime-950 dark:border-lime-900/60 dark:from-lime-950 dark:via-slate-950 dark:to-green-950 dark:text-lime-50",
} as const;

type KpiTone = keyof typeof KPI_TONES;

export default function AdminHomePage() {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");

  const { data: kpis, isLoading, error } = useSWR(
    ["/admin/dashboard/kpis", period],
    ([, p]: [string, DashboardPeriod]) => dashboardService.kpis(p),
    { shouldRetryOnError: false, keepPreviousData: true },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            How the store is doing, at a glance.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
          aria-label="Period"
          className="border-input bg-background h-9 rounded-md border px-2 text-sm"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {error != null && (
        <FormAlert
          message={
            error instanceof ApiError
              ? error.message
              : "Failed to load the dashboard"
          }
        />
      )}

      {isLoading && !kpis && (
        <Card className="p-6 text-sm">Loading…</Card>
      )}

      {kpis != null && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi
            label={`Total Sales (${periodLabel(period)})`}
            value={formatMoney(kpis.revenue.amount, kpis.revenue.currency)}
            tone="sales"
          />
          <Kpi
            label={`Orders (${periodLabel(period)})`}
            value={String(kpis.orders_count)}
            tone="orders"
          />
          <Kpi
            label="Average order value"
            value={
              kpis.average_order_value != null
                ? formatMoney(kpis.average_order_value, kpis.revenue.currency)
                : "—"
            }
            tone="average"
          />
          <Kpi
            label={`New customers (${periodLabel(period)})`}
            value={String(kpis.new_customers_count)}
            tone="customers"
          />
          <Kpi
            label="Open orders"
            hint="Needs attention"
            value={String(kpis.open_orders_count)}
            href="/admin/orders"
            tone="open"
          />
          <Kpi
            label="Low stock"
            hint="Needs attention"
            value={String(kpis.low_stock_count)}
            href="/admin/inventory"
            tone="stock"
          />
        </div>
      )}

      {kpis != null && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <SalesTrendChart
            data={kpis.sales_trend}
            currency={kpis.revenue.currency}
            period={period}
          />
          <TopProductsTable
            products={kpis.top_products}
            currency={kpis.revenue.currency}
          />
        </div>
      )}
    </div>
  );
}

function SalesTrendChart({
  data,
  currency,
  period,
}: {
  data: DashboardKpis["sales_trend"];
  currency: string;
  period: DashboardPeriod;
}) {
  const values = data.map((point) => Number(point.sales_amount));
  const max = Math.max(...values, 0);
  const width = 640;
  const height = 240;
  const padding = 28;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const scaleY = max > 0 ? max : 1;
  const points = data.map((point, index) => {
    const x =
      data.length <= 1
        ? width / 2
        : padding + (index / (data.length - 1)) * chartWidth;
    const y = height - padding - (Number(point.sales_amount) / scaleY) * chartHeight;

    return { ...point, x, y };
  });
  const path = smoothPath(points);
  const first = data[0]?.date;
  const last = data[data.length - 1]?.date;

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Sales trend</CardTitle>
        <CardDescription>{periodLabel(period)} paid sales</CardDescription>
      </div>

      <div className="h-72">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No sales data yet.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Sales trend line chart"
            className="h-full w-full overflow-visible"
          >
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              className="stroke-border"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              className="stroke-border"
            />
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600 dark:text-emerald-400"
            />
            {points.map((point) => (
              <circle
                key={point.date}
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="hover:fill-emerald-600/10"
              >
                <title>
                  {point.date}: {formatMoney(point.sales_amount, currency)}
                </title>
              </circle>
            ))}
            <text x={padding} y={height - 6} className="fill-muted-foreground text-xs">
              {first}
            </text>
            <text
              x={width - padding}
              y={height - 6}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              {last}
            </text>
            <text x={padding} y={18} className="fill-muted-foreground text-xs">
              {formatMoney(String(max.toFixed(2)), currency)}
            </text>
          </svg>
        )}
      </div>
    </Card>
  );
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
  }

  // Monotone cubic (Fritsch-Carlson) interpolation: unlike a plain
  // Catmull-Rom spline, it never overshoots past the y-value of either
  // endpoint of a segment, so the curve can't dip below the baseline or
  // poke above the highest point.
  const n = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    slope[i] = (points[i + 1].y - points[i].y) / dx[i];
  }

  const tangent: number[] = new Array(n);
  tangent[0] = slope[0];
  tangent[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    tangent[i] =
      slope[i - 1] === 0 || slope[i] === 0 || (slope[i - 1] < 0) !== (slope[i] < 0)
        ? 0
        : (slope[i - 1] + slope[i]) / 2;
  }

  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const alpha = tangent[i] / slope[i];
    const beta = tangent[i + 1] / slope[i];
    const magnitude = Math.hypot(alpha, beta);
    if (magnitude > 3) {
      const tau = 3 / magnitude;
      tangent[i] = tau * alpha * slope[i];
      tangent[i + 1] = tau * beta * slope[i];
    }
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const cp1x = p1.x + dx[i] / 3;
    const cp1y = p1.y + (tangent[i] * dx[i]) / 3;
    const cp2x = p2.x - dx[i] / 3;
    const cp2y = p2.y - (tangent[i + 1] * dx[i]) / 3;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function TopProductsTable({
  products,
  currency,
}: {
  products: DashboardKpis["top_products"];
  currency: string;
}) {
  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Top 10 products</CardTitle>
        <CardDescription>Ranked by units sold</CardDescription>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left text-xs uppercase">
            <tr>
              <th className="py-2 pr-3 font-medium">Product</th>
              <th className="px-3 py-2 text-right font-medium">Sold</th>
              <th className="py-2 pl-3 text-right font-medium">Sales</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="text-muted-foreground py-8 text-center">
                  No paid sales in this period.
                </td>
              </tr>
            )}

            {products.map((product, index) => (
              <tr key={`${product.product_id ?? "deleted"}-${product.product_name}`} className="border-t">
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{product.product_name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  {product.units_sold}
                </td>
                <td className="py-2 pl-3 text-right tabular-nums">
                  {formatMoney(product.sales_amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function periodLabel(period: DashboardPeriod): string {
  return PERIODS.find((p) => p.value === period)?.label.toLowerCase() ?? period;
}

function Kpi({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone: KpiTone;
}) {
  const content = (
    <Card
      className={cn(
        "overflow-hidden",
        KPI_TONES[tone],
        href && "hover:shadow-pop transition-shadow",
      )}
    >
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
    </Card>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
