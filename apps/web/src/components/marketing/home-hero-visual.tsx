"use client";

import {
  BarChart3,
  CheckCircle2,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { OceanPanel } from "~/src/components/marketing/marketing-ui";

function MockField({
  label,
  required,
  filled,
}: {
  label: string;
  required?: boolean;
  filled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-300">
        {label}
        {required ? <span className="text-cyan-400"> *</span> : null}
      </p>
      <div
        className={cn(
          "h-9 rounded-lg border px-3 text-xs leading-9",
          filled
            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
            : "border-white/10 bg-white/5 text-slate-500",
        )}
      >
        {filled ? "Answered" : "Your response…"}
      </div>
    </div>
  );
}

export function HomeHeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-md lg:max-w-none", className)}>
      {/* Glow behind stack */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-cyan-500/20 blur-3xl"
        aria-hidden
      />

      <div className="ocean-animate-float relative space-y-4">
        {/* Main form preview card */}
        <OceanPanel className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 truncate text-xs text-slate-400">
              formcraft.io/f/customer-feedback
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-cyan-300/90">Live preview</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-50">
                  Customer feedback
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Published
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Step 2 of 3</span>
                <span>67%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <MockField label="Overall satisfaction" required filled />
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "size-5",
                      n <= 4
                        ? "fill-cyan-400 text-cyan-400"
                        : "text-slate-600",
                    )}
                  />
                ))}
              </div>
              <MockField label="What should we improve?" />
            </div>

            <div className="mt-5 flex gap-2">
              <div className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 text-center text-xs leading-9 text-slate-400">
                Back
              </div>
              <div className="h-9 flex-[1.2] rounded-lg bg-cyan-500 text-center text-xs font-medium leading-9 text-slate-950">
                Next
              </div>
            </div>
          </div>
        </OceanPanel>

        {/* Floating analytics chip */}
        <OceanPanel className="ocean-animate-float-delayed absolute -right-2 top-8 z-10 w-[min(200px,46%)] p-4 shadow-2xl md:-right-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
              <BarChart3 className="size-4" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Completion
              </p>
              <p className="text-lg font-bold tabular-nums text-cyan-300">78%</p>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-emerald-300">
            <TrendingUp className="size-3.5" />
            +12% this week
          </p>
        </OceanPanel>

        {/* Floating AI chip */}
        <OceanPanel className="ocean-animate-float absolute -left-2 bottom-0 z-10 w-[min(210px,52%)] p-3 shadow-2xl md:-left-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-violet-500/20 text-violet-200">
              <Sparkles className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-100">
                AI suggested 4 fields
              </p>
              <p className="flex items-center gap-1 text-[10px] text-slate-400">
                <CheckCircle2 className="size-3 text-emerald-400" />
                Ready to publish
              </p>
            </div>
          </div>
        </OceanPanel>
      </div>
    </div>
  );
}
