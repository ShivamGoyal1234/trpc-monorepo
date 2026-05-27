"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { pricingTiers, type PricingTier } from "~/src/components/marketing/home-data";
import {
  OceanPanel,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "~/src/components/marketing/marketing-ui";

function formatPrice(tier: PricingTier, annual: boolean): string {
  if (tier.monthlyPrice === null) return "Custom";
  if (tier.monthlyPrice === 0) return "$0";
  if (annual) {
    const yearly = Math.round(tier.monthlyPrice * 12 * 0.8);
    return `$${yearly}`;
  }
  return `$${tier.monthlyPrice}`;
}

function pricePeriod(tier: PricingTier, annual: boolean): string {
  if (tier.monthlyPrice === null || tier.monthlyPrice === 0) return "";
  return annual ? "/yr" : "/mo";
}

export function HomePricingInteractive() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [selectedId, setSelectedId] = useState("pro");

  const selected = pricingTiers.find((t) => t.id === selectedId) ?? pricingTiers[1]!;

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Pricing</SectionEyebrow>
        <SectionTitle className="mt-2">Plans that scale with you</SectionTitle>
        <SectionLead className="mx-auto">
          Toggle billing, compare tiers, and pick the plan that fits — all on this page.
        </SectionLead>
      </div>

      {/* Billing toggle */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <div
          className="inline-flex rounded-full border border-white/10 bg-slate-950/60 p-1"
          role="group"
          aria-label="Billing period"
        >
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              !annual
                ? "bg-cyan-500/25 text-cyan-100"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              annual
                ? "bg-cyan-500/25 text-cyan-100"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            Annual
            <span className="ml-1.5 text-xs text-teal-300">−20%</span>
          </button>
        </div>
      </div>

      {/* Plan cards — click to select */}
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {pricingTiers.map((tier) => {
          const isSelected = tier.id === selectedId;
          const isHighlighted = tier.highlighted;
          return (
            <li key={tier.id}>
              <button
                type="button"
                onClick={() => setSelectedId(tier.id)}
                className="w-full text-left"
              >
                <OceanPanel
                  className={cn(
                    "flex h-full flex-col p-6 transition-all",
                    isSelected && "ring-2 ring-cyan-400/70 border-cyan-400/40",
                    isHighlighted && !isSelected && "border-cyan-500/30",
                  )}
                >
                  {isHighlighted && (
                    <span className="mb-3 w-fit rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-200">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-50">{tier.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{tier.description}</p>
                  <p className="mt-4 text-3xl font-bold tabular-nums text-slate-50">
                    {formatPrice(tier, annual)}
                    <span className="text-base font-normal text-slate-400">
                      {pricePeriod(tier, annual)}
                    </span>
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-300">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-cyan-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-slate-500">
                    {isSelected ? "Selected plan" : "Click to select"}
                  </p>
                </OceanPanel>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Action bar for selected plan */}
      <OceanPanel className="mt-8 flex flex-col items-center gap-4 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm text-cyan-400">Your selection</p>
          <p className="text-lg font-semibold text-slate-50">
            {selected.name} — {formatPrice(selected, annual)}
            {pricePeriod(selected, annual)}
            {annual && selected.monthlyPrice != null && selected.monthlyPrice > 0 && (
              <span className="ml-2 text-sm font-normal text-teal-300">
                (save 20% vs monthly)
              </span>
            )}
          </p>
        </div>
        {selected.href.startsWith("mailto:") ? (
          <Button
            size="lg"
            className="min-w-[180px] border-white/20 bg-white/5 hover:bg-white/10"
            variant="outline"
            asChild
          >
            <a href={selected.href}>{selected.cta}</a>
          </Button>
        ) : (
          <Button
            size="lg"
            className="min-w-[180px] bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            onClick={() => router.push(selected.href)}
          >
            {selected.cta}
          </Button>
        )}
      </OceanPanel>
    </div>
  );
}
