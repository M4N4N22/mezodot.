"use client";

import { MusdOnMezoMark } from "@/components/brand/MusdOnMezoMark";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const rails = [
  {
    quote:
      "Mezo is a Bitcoin economic layer — built for using BTC without selling it, with cheap settlement for apps and agents.",
    name: "Mezo",
    title: "Bitcoin finance network",
  },
  {
    quote:
      "Settle in MUSD — Mezo’s Bitcoin-backed dollar. Tiny fees make micropayments practical for agents buying API access.",
    name: "MUSD",
    title: "Bitcoin-backed stablecoin",
  },
  {
    quote:
      "mezodot. sits on top: agents pay a few cents, unlock a reply, and sellers earn without invoices.",
    name: "mezodot.",
    title: "Pay-per-request for tools",
  },
  {
    quote:
      "No middleman tokens. No accounts to provision. Just wallets, MUSD, and instant unlocks.",
    name: "Instant unlocks",
    title: "Built for software that pays software",
  },
];

export function TrustedRails() {
  return (
    <section className="border-t border-line/80 bg-surface/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-center gap-3">
          <MusdOnMezoMark size="sm" showLabel={false} />
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Trusted rails
          </p>
        </div>
        <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight md:text-4xl">
          Built on Mezo. Settled in MUSD.
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Mezo’s Bitcoin-backed dollar on a network designed for real spend —
          so agents can pay a few cents and unlock access without the usual
          billing stack.
        </p>
      </div>
      <div className="mt-10 flex justify-center px-2">
        <InfiniteMovingCards items={rails} direction="left" speed="slow" />
      </div>
    </section>
  );
}
