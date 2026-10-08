"use client";

import { useState } from "react";
import { OrderDetail } from "@/components/orders/order-detail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { orderService, type Order } from "@/services/orders";

export function OrderLookup() {
  const [number, setNumber] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      setOrder(await orderService.lookup(number.trim(), identifier.trim()));
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not find that order. Please check your order number and phone/email.",
      );
      setOrder(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {!order && (
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <Field
              label="Order number"
              name="number"
              required
              placeholder="e.g. ORD-2026-000042"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <Field
              label="Phone number or Email"
              name="identifier"
              required
              placeholder="017XXXXXXXX or user@example.com"
              hint="Enter the phone number or email used when placing the order."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            {error && <FormAlert message={error} />}

            <Button type="submit" disabled={busy || !number || !identifier}>
              {busy ? "Tracking…" : "Track My Order"}
            </Button>
          </form>
        </Card>
      )}

      {order && (
        <>
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm font-semibold">{order.number}</p>
            <button
              type="button"
              onClick={() => setOrder(null)}
              className="text-sm underline"
            >
              Look up another
            </button>
          </div>
          <OrderDetail order={order} />
        </>
      )}
    </div>
  );
}
