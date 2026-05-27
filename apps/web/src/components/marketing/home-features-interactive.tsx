"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { featureTabs } from "~/src/components/marketing/home-data";
import { OceanPanel, SectionEyebrow, SectionLead, SectionTitle } from "~/src/components/marketing/marketing-ui";

export function HomeFeaturesInteractive() {
  const [tab, setTab] = useState(featureTabs[0]!.id);
  const active = featureTabs.find((t) => t.id === tab) ?? featureTabs[0]!;

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Capabilities</SectionEyebrow>
        <SectionTitle className="mt-2">Everything in one builder</SectionTitle>
        <SectionLead className="mx-auto">
          Pick a lane — build, brand, or grow — and explore what FormCraft includes.
        </SectionLead>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-12">
        <TabsList className="mx-auto flex h-auto w-full max-w-md flex-wrap justify-center gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1">
          {featureTabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-lg px-5 py-2 text-sm data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100 data-[state=active]:shadow-none"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {featureTabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-8 outline-none">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <OceanPanel className="p-6 md:p-8">
                <h3 className="text-2xl font-bold text-slate-50">{t.headline}</h3>
                <p className="mt-3 text-slate-300">{t.summary}</p>
                <p className="mt-6 text-xs uppercase tracking-wider text-cyan-400/80">
                  {t.items.length} tools in this group
                </p>
              </OceanPanel>

              <ul className="grid gap-3">
                {t.items.map((item, i) => (
                  <li key={item.title}>
                    <OceanPanel
                      className={cn(
                        "flex gap-4 p-5 transition-all duration-300",
                        tab === t.id && "hover:border-cyan-400/25",
                      )}
                    >
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                        <item.icon className="size-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h4 className="font-semibold text-slate-50">{item.title}</h4>
                        <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                      </div>
                    </OceanPanel>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick preview of active tab label for screen readers */}
      <p className="sr-only">Showing {active.label} features</p>
    </div>
  );
}
