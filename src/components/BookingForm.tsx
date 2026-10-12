"use client";

import { useActionState, useState } from "react";
import { createBooking, type BookingFormState } from "@/app/(site)/book/actions";

type Props = {
  sessionId: string;
  unitPriceCents: number;
  currency: string;
  maxSeats: number;
  allowOnline: boolean;
  allowOnSite: boolean;
};

function money(cents: number, currency: string) {
  return `${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency}`;
}

export function BookingForm({ sessionId, unitPriceCents, currency, maxSeats, allowOnline, allowOnSite }: Props) {
  const [state, action, pending] = useActionState<BookingFormState, FormData>(createBooking, {});
  const [seats, setSeats] = useState(1);
  const [method, setMethod] = useState(allowOnline ? "ONLINE" : "ON_SITE");

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="name">Full name *</label>
          <input id="name" name="name" required className="field" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone / WhatsApp</label>
          <input id="phone" name="phone" className="field" autoComplete="tel" />
        </div>
        {maxSeats > 1 && (
          <div>
            <label className="label" htmlFor="seats">Number of places</label>
            <select
              id="seats"
              name="seats"
              className="field"
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            >
              {Array.from({ length: Math.min(maxSeats, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {maxSeats <= 1 && <input type="hidden" name="seats" value="1" />}
      <div>
        <label className="label" htmlFor="message">Message (optional)</label>
        <textarea id="message" name="message" rows={3} className="field" placeholder="Allergies, questions..." />
      </div>

      <fieldset>
        <legend className="label">Payment</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          {allowOnline && (
            <label className={`card p-4 cursor-pointer ${method === "ONLINE" ? "ring-2 ring-highlight" : ""}`}>
              <input type="radio" name="method" value="ONLINE" checked={method === "ONLINE"} onChange={() => setMethod("ONLINE")} className="mr-2" />
              <strong>Pay online now</strong>
              <span className="block text-sm text-muted mt-1">Card, Apple Pay, Google Pay. Secure payment by Stripe.</span>
            </label>
          )}
          {allowOnSite && (
            <label className={`card p-4 cursor-pointer ${method === "ON_SITE" ? "ring-2 ring-highlight" : ""}`}>
              <input type="radio" name="method" value="ON_SITE" checked={method === "ON_SITE"} onChange={() => setMethod("ON_SITE")} className="mr-2" />
              <strong>Pay on site</strong>
              <span className="block text-sm text-muted mt-1">Your place is reserved, you pay when you arrive.</span>
            </label>
          )}
        </div>
      </fieldset>

      {state.error && <p className="text-red-500 font-semibold">{state.error}</p>}

      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
        <p className="text-xl">
          Total: <strong>{money(unitPriceCents * seats, currency)}</strong>
        </p>
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Please wait..." : method === "ONLINE" ? "Continue to payment" : "Confirm my booking"}
        </button>
      </div>
    </form>
  );
}
