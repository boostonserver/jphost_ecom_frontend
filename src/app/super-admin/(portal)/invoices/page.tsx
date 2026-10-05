"use client";

import { useState } from "react";
import useSWR from "swr";
import { usePlatformAuth } from "@/components/platform/platform-auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatMoney, type Invoice, type InvoiceStatus } from "@/services/billing";
import { canPlatform, platformService } from "@/services/platform";
import {
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  Receipt,
  RotateCcw,
  Send,
  X,
} from "lucide-react";

const METHODS = [
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "cash", label: "Cash" },
  { id: "adjustment", label: "Adjustment" },
];

export default function PlatformInvoicesPage() {
  const { user } = usePlatformAuth();
  const [outstandingOnly, setOutstandingOnly] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(
    null,
  );

  const { data, mutate, isLoading, error } = useSWR(
    ["/platform/invoices", outstandingOnly],
    async () => (await platformService.invoices({ outstanding: outstandingOnly })).items,
    { shouldRetryOnError: false },
  );

  async function run(action: () => Promise<unknown>, success: string) {
    setNotice(null);

    try {
      await action();
      await mutate();
      setNotice({ tone: "success", message: success });
    } catch (e) {
      setNotice({
        tone: "error",
        message: e instanceof ApiError ? e.displayMessage : "Something went wrong",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Invoices & Billing</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Track store subscriptions, payment receipts, issue bills, and mark payments.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm bg-muted/60 px-3 py-1.5 rounded-md border cursor-pointer hover:bg-muted">
          <input
            type="checkbox"
            checked={outstandingOnly}
            onChange={(e) => setOutstandingOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="font-medium">Outstanding only</span>
        </label>
      </div>

      {error != null && (
        <FormAlert
          message={error instanceof ApiError ? error.message : "Failed to load invoices"}
        />
      )}
      {notice && <FormAlert tone={notice.tone} message={notice.message} />}

      <Card className="overflow-x-auto p-0 border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Invoice #</th>
              <th className="px-4 py-3 font-semibold">Store / Client</th>
              <th className="px-4 py-3 font-semibold">Period</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Balance</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && (
              <tr>
                <td colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                  Loading invoices…
                </td>
              </tr>
            )}

            {!isLoading && data?.length === 0 && (
              <tr>
                <td colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                  No invoices found.
                </td>
              </tr>
            )}

            {data?.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono font-medium whitespace-nowrap text-primary">
                  {invoice.number}
                </td>
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {(invoice as unknown as { tenant?: { name: string } }).tenant?.name || `Store #${(invoice as unknown as { tenant_id?: number }).tenant_id ?? "—"}`}
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap text-xs">
                  {invoice.period_start} → {invoice.period_end}
                </td>
                <td className="px-4 py-3 tabular-nums whitespace-nowrap font-medium">
                  {formatMoney(invoice.total, invoice.currency)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 tabular-nums whitespace-nowrap font-semibold",
                    invoice.is_overdue ? "text-rose-600" : (parseFloat(invoice.balance) > 0 ? "text-amber-600" : "text-muted-foreground"),
                  )}
                >
                  {formatMoney(invoice.balance, invoice.currency)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <InvoiceStatusBadge status={invoice.status} isOverdue={invoice.is_overdue} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={openId === invoice.id ? "secondary" : "outline"}
                    onClick={() => setOpenId(openId === invoice.id ? null : invoice.id)}
                    className="text-xs h-8"
                  >
                    {openId === invoice.id ? "Close" : "Manage"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {openId != null && data && (
        <InvoiceDetailPanel
          invoice={data.find((i) => i.id === openId)!}
          canManage={canPlatform(user, "invoice.manage")}
          canRecord={canPlatform(user, "payment.record")}
          onRun={run}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function InvoiceStatusBadge({ status, isOverdue }: { status: InvoiceStatus; isOverdue?: boolean }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Paid
      </span>
    );
  }

  if (status === "overdue" || isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <Clock className="h-3 w-3" /> Overdue
      </span>
    );
  }

  if (status === "issued") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Send className="h-3 w-3" /> Issued
      </span>
    );
  }

  if (status === "draft") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        Draft
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500 border border-zinc-200 line-through">
      Void
    </span>
  );
}

function InvoiceDetailPanel({
  invoice,
  canManage,
  canRecord,
  onRun,
  onClose,
}: {
  invoice: Invoice;
  canManage: boolean;
  canRecord: boolean;
  onRun: (action: () => Promise<unknown>, success: string) => Promise<void>;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "pay" | "edit" | "void">("overview");

  // Mark as Paid form
  const [payMethod, setPayMethod] = useState("bkash");
  const [payAmount, setPayAmount] = useState(invoice.balance);
  const [payRef, setPayRef] = useState("");
  const [payNote, setPayNote] = useState("Marked as paid by Super Admin");

  // Edit Invoice form
  const [editDueAt, setEditDueAt] = useState(invoice.due_at ? invoice.due_at.substring(0, 10) : "");
  const [editDiscount, setEditDiscount] = useState(invoice.discount || "0.00");
  const [editTax, setEditTax] = useState(invoice.tax || "0.00");
  const [editNotes, setEditNotes] = useState((invoice as unknown as { notes?: string }).notes || "");

  // Void form
  const [voidReason, setVoidReason] = useState("");

  const isPaid = invoice.status === "paid";
  const isVoid = invoice.status === "void";

  return (
    <Card className="space-y-6 border-2 border-primary/20 shadow-md">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold font-mono text-primary">
              {invoice.number}
            </CardTitle>
            <InvoiceStatusBadge status={invoice.status} isOverdue={invoice.is_overdue} />
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Store: <strong>{(invoice as unknown as { tenant?: { name: string } }).tenant?.name || "Store"}</strong> • Period: {invoice.period_start} to {invoice.period_end}
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs / Action Buttons */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("overview")}
          className="text-xs"
        >
          Invoice Overview
        </Button>

        {canRecord && !isPaid && !isVoid && (
          <Button
            variant={activeTab === "pay" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("pay")}
            className="text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
          >
            <CreditCard className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            Mark as Paid
          </Button>
        )}

        {canManage && isPaid && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onRun(
                () => platformService.markInvoiceUnpaid(invoice.id),
                "Invoice marked as unpaid and subscription reverted!",
              )
            }
            className="text-xs border-amber-500/40 text-amber-700 hover:bg-amber-50"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-amber-600" />
            Mark as Unpaid
          </Button>
        )}

        {canManage && !isPaid && !isVoid && (
          <Button
            variant={activeTab === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("edit")}
            className="text-xs"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1" />
            Edit Invoice
          </Button>
        )}

        {canManage && invoice.status === "draft" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onRun(() => platformService.issueInvoice(invoice.id), "Invoice issued and email sent!")
            }
            className="text-xs text-blue-700 hover:bg-blue-50 border-blue-300"
          >
            <Send className="h-3.5 w-3.5 mr-1 text-blue-600" />
            Issue Invoice
          </Button>
        )}

        {canManage && !isPaid && !isVoid && (
          <Button
            variant={activeTab === "void" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setActiveTab("void")}
            className="text-xs text-rose-700 hover:bg-rose-50 border-rose-300 ml-auto"
          >
            <Ban className="h-3.5 w-3.5 mr-1" />
            Void
          </Button>
        )}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-4 bg-muted/30 p-4 rounded-lg border">
            <div>
              <dt className="text-muted-foreground text-xs">Total Amount</dt>
              <dd className="font-semibold text-base tabular-nums mt-0.5">
                {formatMoney(invoice.total, invoice.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Amount Received</dt>
              <dd className="font-semibold text-base text-emerald-700 tabular-nums mt-0.5">
                {formatMoney(invoice.paid_amount, invoice.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Balance Due</dt>
              <dd className={cn("font-semibold text-base tabular-nums mt-0.5", parseFloat(invoice.balance) > 0 ? "text-rose-600" : "text-muted-foreground")}>
                {formatMoney(invoice.balance, invoice.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Due Date</dt>
              <dd className="font-medium text-sm mt-0.5">
                {invoice.due_at ? new Date(invoice.due_at).toLocaleDateString() : "Immediate"}
              </dd>
            </div>
          </dl>

          {invoice.line_items && invoice.line_items.length > 0 && (
            <div className="border rounded-md overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-muted/50 text-left border-b">
                  <tr>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium text-center">Qty</th>
                    <th className="px-3 py-2 font-medium text-right">Price</th>
                    <th className="px-3 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.line_items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{item.unit_price}</td>
                      <td className="px-3 py-2 text-right font-medium">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {invoice.payments && invoice.payments.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Payment History ({invoice.payments.length})
              </h4>
              <div className="divide-y border rounded-md text-xs">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-card">
                    <div>
                      <span className="font-semibold capitalize text-foreground">{p.method.replace("_", " ")}</span>
                      {p.reference && <span className="text-muted-foreground ml-2">Ref: {p.reference}</span>}
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Received on {new Date(p.received_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700 tabular-nums text-sm">
                      + {formatMoney(p.amount, p.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Mark as Paid */}
      {activeTab === "pay" && (
        <div className="space-y-4 bg-emerald-50/40 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold">Instant Mark as Paid & Store Activation</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Recording this payment will immediately settle the balance, mark the invoice as Paid, activate the merchant's store, and email the official receipt.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Amount to Pay (BDT)"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              inputMode="decimal"
            />

            <div className="space-y-1.5">
              <label htmlFor="payMethod" className="block text-sm font-medium">
                Payment Method
              </label>
              <select
                id="payMethod"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="TrxID / Reference (Optional)"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="e.g. 9J29X019"
            />
          </div>

          <Field
            label="Internal Note"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            placeholder="Verified on bKash merchant statement..."
          />

          <Button
            onClick={() =>
              onRun(
                () =>
                  platformService.markInvoicePaid(invoice.id, {
                    amount: payAmount,
                    method: payMethod,
                    reference: payRef || undefined,
                    note: payNote || undefined,
                  }),
                "Payment recorded, invoice settled, and store activated!",
              )
            }
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Confirm & Mark as Paid
          </Button>
        </div>
      )}

      {/* Tab: Edit Invoice */}
      {activeTab === "edit" && (
        <div className="space-y-4 bg-muted/20 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Edit Invoice Financials & Dates</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Due Date"
              type="date"
              value={editDueAt}
              onChange={(e) => setEditDueAt(e.target.value)}
            />

            <Field
              label="Discount (BDT)"
              type="number"
              step="0.01"
              value={editDiscount}
              onChange={(e) => setEditDiscount(e.target.value)}
            />

            <Field
              label="Tax (BDT)"
              type="number"
              step="0.01"
              value={editTax}
              onChange={(e) => setEditTax(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Invoice Notes (Visible to Merchant)</label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="border-input bg-background w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Special promo notes or instructions..."
            />
          </div>

          <Button
            onClick={() =>
              onRun(
                () =>
                  platformService.updateInvoice(invoice.id, {
                    due_at: editDueAt || null,
                    discount: editDiscount,
                    tax: editTax,
                    notes: editNotes,
                  }),
                "Invoice updated successfully!",
              )
            }
          >
            Save Invoice Changes
          </Button>
        </div>
      )}

      {/* Tab: Void */}
      {activeTab === "void" && (
        <div className="space-y-3 bg-rose-50/40 p-4 rounded-lg border border-rose-200">
          <h3 className="text-sm font-semibold text-rose-800">Void Invoice</h3>
          <p className="text-xs text-muted-foreground">
            Voiding cancels this invoice permanently. Outstanding balance will become zero.
          </p>
          <Field
            label="Reason for Voiding (Required)"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            placeholder="e.g. Plan upgrade cancelled by customer"
          />
          <Button
            variant="destructive"
            disabled={!voidReason}
            onClick={() =>
              onRun(() => platformService.voidInvoice(invoice.id, voidReason), "Invoice voided!")
            }
          >
            Confirm Void Invoice
          </Button>
        </div>
      )}
    </Card>
  );
}
