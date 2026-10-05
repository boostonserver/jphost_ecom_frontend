"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  billingService,
  formatMoney,
  type Invoice,
  type InvoiceStatus,
  type PaymentInstructions,
} from "@/services/billing";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Send,
  X,
} from "lucide-react";

export default function AdminInvoicesPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  const {
    data: invoices,
    isLoading,
    error,
    mutate,
  } = useSWR(
    "/admin/billing/invoices",
    async () => (await billingService.invoices({ per_page: 50 })).items,
    { shouldRetryOnError: false },
  );

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/billing" className="text-muted-foreground text-xs hover:text-foreground">
          ← Back to Subscription & Plan
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Store Invoices & Billing</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Review your subscription invoices, payment receipts, and submit payment confirmation.
        </p>
      </div>

      {error != null && (
        <FormAlert
          message={
            error instanceof ApiError ? error.message : "Failed to load invoices"
          }
        />
      )}

      <Card className="overflow-x-auto p-0 border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Invoice #</th>
              <th className="px-4 py-3 font-semibold">Period</th>
              <th className="px-4 py-3 font-semibold">Due Date</th>
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

            {!isLoading && invoices?.length === 0 && (
              <tr>
                <td colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                  No invoices on record for this store.
                </td>
              </tr>
            )}

            {invoices?.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono font-medium whitespace-nowrap text-primary">
                  {invoice.number}
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap text-xs">
                  {invoice.period_start} → {invoice.period_end}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  {invoice.due_at ? new Date(invoice.due_at).toLocaleDateString() : "Immediate"}
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
                  <InvoiceStatusBadge
                    status={invoice.status}
                    overdue={invoice.is_overdue}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={openId === invoice.id ? "secondary" : "outline"}
                    onClick={() => setOpenId(openId === invoice.id ? null : invoice.id)}
                    className="text-xs h-8"
                  >
                    {openId === invoice.id ? "Close" : "View & Pay"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {openId != null && (
        <InvoiceDetail
          id={openId}
          onUpdated={() => mutate()}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function InvoiceDetail({
  id,
  onUpdated,
  onClose,
}: {
  id: number;
  onUpdated: () => void;
  onClose: () => void;
}) {
  const { data: invoice, isLoading, mutate: mutateInvoice } = useSWR(
    `/admin/billing/invoices/${id}`,
    () => billingService.invoice(id),
    { shouldRetryOnError: false },
  );

  const { data: instructions } = useSWR(
    "/admin/billing/payment-instructions",
    () => billingService.paymentInstructions(),
    { shouldRetryOnError: false },
  );

  // Claim Form state
  const [method, setMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimNote, setClaimNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  if (isLoading) return <Card className="p-6 text-sm">Loading invoice details…</Card>;
  if (!invoice) return null;

  const isUnpaid = invoice.status !== "paid" && invoice.status !== "void" && parseFloat(invoice.balance) > 0;

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trxId) return;

    setSubmitting(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      await billingService.submitProof(invoice!.id, {
        method,
        reference: trxId,
        amount: claimAmount || invoice!.balance,
        notes: claimNote,
      });
      await mutateInvoice();
      onUpdated();
      setClaimSuccess("Payment confirmation submitted successfully! Platform team will verify and activate your invoice.");
      setTrxId("");
    } catch (err) {
      setClaimError(err instanceof ApiError ? err.displayMessage : "Failed to submit payment confirmation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-6 p-6 border-2 border-primary/20 shadow-md">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono text-primary">{invoice.number}</h2>
            <InvoiceStatusBadge status={invoice.status} overdue={invoice.is_overdue} />
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Period: {invoice.period_start} to {invoice.period_end} • Due: {invoice.due_at ? new Date(invoice.due_at).toLocaleDateString() : "Immediate"}
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary grid */}
      <dl className="grid gap-3 text-sm sm:grid-cols-3 bg-muted/30 p-4 rounded-lg border">
        <div>
          <dt className="text-muted-foreground text-xs">Total Bill</dt>
          <dd className="font-semibold text-base tabular-nums mt-0.5">
            {formatMoney(invoice.total, invoice.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Total Paid</dt>
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
      </dl>

      {/* Line items */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Invoice Breakdown</h3>
        <div className="border rounded-md overflow-hidden text-xs">
          <table className="w-full">
            <thead className="bg-muted/50 text-left border-b">
              <tr>
                <th className="px-3 py-2 font-medium">Item Description</th>
                <th className="px-3 py-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.line_items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    {formatMoney(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Payment History</h3>
          <ul className="divide-y border rounded-md text-xs">
            {invoice.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between items-center p-3 bg-card">
                <div>
                  <span className="font-semibold capitalize text-foreground">{payment.method.replace("_", " ")}</span>
                  {payment.reference && <span className="text-muted-foreground ml-2">TrxID: {payment.reference}</span>}
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Received on {new Date(payment.received_at).toLocaleString()}
                  </p>
                </div>
                <span className="font-bold text-emerald-700 tabular-nums text-sm">
                  + {formatMoney(payment.amount, invoice.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* If unpaid, show How to Pay and Submit Proof */}
      {isUnpaid && (
        <div className="space-y-4 pt-2">
          {/* Instructions Box */}
          <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-lg p-4 text-xs space-y-2 text-indigo-950">
            <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
              <CreditCard className="h-4 w-4" />
              <span>How to Pay (বিল পরিশোধের নিয়ম)</span>
            </div>
            {instructions?.bkash_merchant && (
              <p className="font-medium">• <strong>bKash Merchant / Personal:</strong> {instructions.bkash_merchant} (Reference: {invoice.number})</p>
            )}
            {instructions?.nagad_merchant && (
              <p className="font-medium">• <strong>Nagad:</strong> {instructions.nagad_merchant}</p>
            )}
            {instructions?.bank_name && (
              <p className="font-medium">• <strong>Bank:</strong> {instructions.bank_name} | A/C: {instructions.account_number || ""} ({instructions.account_name || ""}) | Branch: {instructions.branch || ""}</p>
            )}
            {instructions?.notes && (
              <p className="text-indigo-800/80 italic pt-1">{instructions.notes}</p>
            )}
          </div>

          {/* Proof Submission Form */}
          <form onSubmit={handleClaimSubmit} className="bg-muted/20 border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Paid Already? Submit Confirmation (টাকা পাঠিয়েছেন? TrxID সাবমিট করুন)
            </h4>

            {claimSuccess && <FormAlert tone="success" message={claimSuccess} />}
            {claimError && <FormAlert tone="error" message={claimError} />}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-xs"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <Field
                  label="Transaction ID (TrxID) / Ref"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 9J29X019"
                  required
                />
              </div>

              <div>
                <Field
                  label="Amount Sent (BDT)"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  placeholder={invoice.balance}
                />
              </div>
            </div>

            <Field
              label="Sender Phone No / Note (Optional)"
              value={claimNote}
              onChange={(e) => setClaimNote(e.target.value)}
              placeholder="e.g. Paid from 017xxxxxxxx..."
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || !trxId}
              className="text-xs"
            >
              {submitting ? "Submitting..." : "Submit Payment Confirmation"}
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}

function InvoiceStatusBadge({
  status,
  overdue,
}: {
  status: InvoiceStatus;
  overdue: boolean;
}) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Paid
      </span>
    );
  }

  if (status === "overdue" || overdue) {
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

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
}
