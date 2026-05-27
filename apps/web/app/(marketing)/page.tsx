"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Waves } from "lucide-react";

import { Button } from "~/components/ui/button";
import { HomeHashScroll } from "~/src/components/marketing/home-hash-scroll";
import { HomeHeroVisual } from "~/src/components/marketing/home-hero-visual";
import { HomeFaqInteractive } from "~/src/components/marketing/home-faq-interactive";
import { HomeFeaturesInteractive } from "~/src/components/marketing/home-features-interactive";
import { HomePricingInteractive } from "~/src/components/marketing/home-pricing-interactive";
import { HomeSectionNav } from "~/src/components/marketing/home-section-nav";
import { HomeWorkflowInteractive } from "~/src/components/marketing/home-workflow-interactive";
import {
  OceanBand,
  OceanPanel,
  SectionEyebrow,
} from "~/src/components/marketing/marketing-ui";

const stats = [
  { value: "10k+", label: "Responses collected" },
  { value: "50+", label: "Field types & widgets" },
  { value: "< 2 min", label: "Avg. form setup" },
];

export default function MarketingPage() {
  const router = useRouter();

  return (
    <div className="relative">
      <HomeHashScroll />
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <OceanPanel className="p-8 md:p-10 lg:max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
              <Waves className="size-3.5 shrink-0" aria-hidden />
              AI-powered form platform
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-slate-50 md:text-5xl lg:text-[3.25rem]">
              Build forms people
              <span className="mt-2 block bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
                actually finish
              </span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-300 md:text-lg">
              One page for features, workflow, pricing, and FAQs — scroll or use
              the section tabs below to explore.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="h-11 gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                onClick={() => router.push("/register")}
              >
                Get started free
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 border-white/20 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See pricing
              </Button>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-slate-300">
              {[
                "Interactive feature tours",
                "Step-by-step workflow",
                "Live plan comparison",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="size-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </OceanPanel>
          <HomeHeroVisual className="hidden min-h-[320px] lg:block" />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <OceanPanel
              key={s.label}
              className="flex flex-col items-center px-4 py-5 text-center sm:items-start sm:text-left"
            >
              <span className="text-2xl font-bold tabular-nums text-cyan-300 md:text-3xl">
                {s.value}
              </span>
              <span className="mt-1 text-sm text-slate-400">{s.label}</span>
            </OceanPanel>
          ))}
        </div>
      </section>

      <HomeSectionNav />

      <OceanBand id="features">
        <HomeFeaturesInteractive />
      </OceanBand>

      <section id="workflow" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-20 md:py-24">
        <HomeWorkflowInteractive />
      </section>

      <OceanBand id="pricing">
        <HomePricingInteractive />
      </OceanBand>

      <section id="faq" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-20 md:py-24">
        <HomeFaqInteractive />
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-6xl scroll-mt-32 px-4 pb-24">
        <OceanPanel className="relative overflow-hidden px-6 py-12 text-center md:px-12 md:py-14">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-600/10"
            aria-hidden
          />
          <div className="relative">
            <SectionEyebrow className="text-center">Get started</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
              Ready to launch your next form?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-300">
              Create a free account or browse public forms on Explore.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 min-w-[200px] bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                onClick={() => router.push("/register")}
              >
                Create free account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 min-w-[200px] border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
                onClick={() => {
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Compare plans
              </Button>
            </div>
            <Button
              size="lg"
              variant="ghost"
              className="mt-3 text-slate-300 hover:bg-white/5 hover:text-slate-100"
              asChild
            >
              <Link href="/explore">
                <Globe className="mr-2 size-4" />
                Browse public forms
              </Link>
            </Button>
          </div>
        </OceanPanel>
      </section>
    </div>
  );
}
