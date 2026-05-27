"use client";

import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";
import { homeSections } from "~/src/components/marketing/home-data";

export function HomeSectionNav() {
  const [active, setActive] = useState<string>("features");

  useEffect(() => {
    const ids = homeSections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-16 z-40 border-b border-white/10 bg-[#021a24]/90 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
        {homeSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
              setActive(section.id);
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === section.id
                ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
            )}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
