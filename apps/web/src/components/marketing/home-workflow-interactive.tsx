"use client";

import { useState } from "react";

import { cn } from "~/lib/utils";
import { workflowSteps } from "~/src/components/marketing/home-data";
import { OceanPanel, SectionEyebrow, SectionLead, SectionTitle } from "~/src/components/marketing/marketing-ui";

export function HomeWorkflowInteractive() {
  const [activeId, setActiveId] = useState(workflowSteps[0]!.id);
  const active = workflowSteps.find((s) => s.id === activeId) ?? workflowSteps[0]!;

  return (
    <div>
      <SectionEyebrow>Workflow</SectionEyebrow>
      <SectionTitle className="mt-2">Three steps to live forms</SectionTitle>
      <SectionLead>
        Click a step to see what happens at each stage of your form lifecycle.
      </SectionLead>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        {workflowSteps.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn(
                "flex-1 rounded-xl border px-4 py-4 text-left transition-all",
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/15 shadow-lg shadow-cyan-900/20"
                  : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/60",
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-cyan-300" : "text-slate-500",
                )}
              >
                {item.step}
              </span>
              <span className="mt-1 block font-semibold text-slate-50">{item.title}</span>
            </button>
          );
        })}
      </div>

      <OceanPanel className="mt-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-cyan-400">Step {active.step}</p>
            <h3 className="mt-1 text-xl font-bold text-slate-50">{active.title}</h3>
            <p className="mt-3 text-slate-300">{active.description}</p>
          </div>
          <div
            key={active.id}
            className="max-w-lg rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300 transition-opacity duration-300"
          >
            {active.detail}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {workflowSteps.map((item) => (
            <span
              key={item.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                item.id === activeId ? "bg-cyan-400" : "bg-white/10",
              )}
              aria-hidden
            />
          ))}
        </div>
      </OceanPanel>
    </div>
  );
}
