"use client";

import { useMemo } from "react";

import { cn } from "~/lib/utils";

type Droplet = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  driftX: number;
  driftY: number;
};

export function OceanDropletBurst({
  active,
  burstKey,
  className,
}: {
  active: boolean;
  burstKey: number;
  className?: string;
}) {
  const droplets = useMemo<Droplet[]>(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 40 + Math.random() * 120;
      return {
        id: i,
        left: 50 + Math.cos(angle) * (dist / 8),
        top: 50 + Math.sin(angle) * (dist / 10),
        size: 4 + Math.random() * 10,
        delay: Math.random() * 0.08,
        driftX: Math.cos(angle) * dist,
        driftY: Math.sin(angle) * dist * 0.6 - 30,
      };
    });
  }, [burstKey]); // eslint-disable-line react-hooks/exhaustive-deps -- recompute droplets on each burst

  if (!active) return null;

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-[200] overflow-hidden", className)}
      aria-hidden
    >
      {/* Splash ring */}
      <span className="ocean-splash-ring absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300/60 bg-cyan-400/10" />

      {droplets.map((d) => (
        <span
          key={d.id}
          className="ocean-droplet absolute rounded-full bg-gradient-to-b from-cyan-200/90 to-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
          style={
            {
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size * 1.35,
              animationDelay: `${d.delay}s`,
              "--drift-x": `${d.driftX}px`,
              "--drift-y": `${d.driftY}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
