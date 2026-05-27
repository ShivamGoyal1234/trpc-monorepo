"use client";

import { cn } from "~/lib/utils";

/** Full-viewport deep-ocean backdrop: 3D waves + sea life (fixed layer, always visible). */
export function OceanScene({
  variant = "full",
}: {
  variant?: "full" | "ambient";
}) {
  const isAmbient = variant === "ambient";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        isAmbient && "opacity-95",
      )}
      aria-hidden
    >
      {/* Water column */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0c4a6e 0%, #082f49 35%, #042f3a 62%, #021a24 100%)",
        }}
      />

      {/* Sunlight through surface */}
      <div
        className="ocean-animate-light absolute left-1/2 top-0 h-[50%] w-[85%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(45, 212, 191, 0.45), transparent 72%)",
        }}
      />

      {/* 3D wave stack — perspective on container, each layer tilted in Z */}
      <div
        className="absolute right-0 bottom-0 left-0 h-[min(52vh,480px)]"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 100%",
        }}
      >
        <div
          className="absolute right-0 bottom-0 left-0 h-[72%] w-[115%] -translate-x-[7%]"
          style={{ transform: "rotateX(52deg) translateZ(-80px)", transformStyle: "preserve-3d" }}
        >
          <div className="ocean-animate-wave h-full w-full">
            <svg viewBox="0 0 1440 220" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ocean-wave-back" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#155e75" />
                  <stop offset="100%" stopColor="#0e3d52" />
                </linearGradient>
              </defs>
              <path
                fill="url(#ocean-wave-back)"
                d="M0,130 C200,70 360,180 520,110 C700,45 860,160 1040,95 C1180,50 1320,140 1440,100 L1440,220 L0,220 Z"
              />
            </svg>
          </div>
        </div>

        <div
          className="absolute right-0 bottom-0 left-0 h-[58%] w-[108%] -translate-x-[4%]"
          style={{ transform: "rotateX(38deg) translateZ(-20px)", transformStyle: "preserve-3d" }}
        >
          <div className="ocean-animate-wave h-full w-full" style={{ animationDelay: "-2.5s" }}>
            <svg viewBox="0 0 1440 180" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ocean-wave-mid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0e7490" />
                  <stop offset="100%" stopColor="#155e75" />
                </linearGradient>
              </defs>
              <path
                fill="url(#ocean-wave-mid)"
                d="M0,95 C240,145 420,55 600,100 C780,150 940,60 1120,92 C1280,118 1360,75 1440,88 L1440,180 L0,180 Z"
              />
            </svg>
          </div>
        </div>

        <div
          className="absolute right-0 bottom-0 left-0 h-[42%] w-full"
          style={{ transform: "rotateX(18deg) translateZ(40px)", transformStyle: "preserve-3d" }}
        >
          <div className="ocean-animate-wave h-full w-full" style={{ animationDelay: "-5s" }}>
            <svg viewBox="0 0 1440 120" className="h-full w-full drop-shadow-lg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ocean-wave-front" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#0e7490" />
                </linearGradient>
              </defs>
              <path
                fill="url(#ocean-wave-front)"
                d="M0,60 C150,85 330,40 510,62 C690,88 870,42 1050,65 C1200,82 1340,50 1440,55 L1440,120 L0,120 Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bubbles */}
      {[
        { left: "8%", bottom: "32%", size: 10 },
        { left: "22%", bottom: "48%", size: 6 },
        { left: "68%", bottom: "38%", size: 8 },
        { left: "84%", bottom: "28%", size: 5 },
        { left: "52%", bottom: "55%", size: 7 },
      ].map((b, i) => (
        <span
          key={i}
          className="ocean-animate-bubble absolute rounded-full border-2 border-cyan-300/40 bg-cyan-200/20"
          style={{
            left: b.left,
            bottom: b.bottom,
            width: b.size,
            height: b.size,
            animationDelay: `${i * 1.4}s`,
          }}
        />
      ))}

      {/* Shark */}
      <div
        className={cn(
          "ocean-animate-float-delayed absolute top-[32%] right-[4%] w-[min(320px,42vw)]",
          isAmbient && "opacity-70",
        )}
        style={{ transform: "rotateY(-12deg) rotateZ(-3deg)" }}
      >
        <svg viewBox="0 0 220 90" className="w-full" role="img" aria-label="">
          <ellipse cx="110" cy="52" rx="95" ry="26" fill="#1e3a5f" />
          <ellipse cx="110" cy="54" rx="70" ry="14" fill="#274a6e" opacity="0.6" />
          <path d="M8 52 L-4 40 L-4 64 Z" fill="#152a45" />
          <path d="M168 34 Q192 18 215 30 L206 48 Q182 42 170 48 Z" fill="#2a4a6e" />
          <circle cx="48" cy="48" r="4" fill="#e2e8f0" />
          <circle cx="48" cy="48" r="2" fill="#0f172a" />
          <path d="M95 62 L100 78 L88 66 Z" fill="#334155" />
        </svg>
      </div>

      {/* Clownfish */}
      <div
        className={cn(
          "ocean-animate-float absolute top-[48%] left-[6%] w-24 md:w-28",
          isAmbient && "opacity-80",
        )}
      >
        <svg viewBox="0 0 80 48">
          <ellipse cx="40" cy="26" rx="28" ry="14" fill="#f97316" />
          <ellipse cx="40" cy="26" rx="18" ry="9" fill="#fb923c" />
          <path d="M12 26 L2 20 L2 32 Z" fill="#ea580c" />
          <path
            d="M26 18 L30 34 M36 16 L40 36 M46 18 L50 34"
            stroke="#1e3a5f"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="58" cy="24" r="3" fill="#f8fafc" />
          <circle cx="58" cy="24" r="1.5" fill="#0f172a" />
        </svg>
      </div>

      {/* Blue fish */}
      <div className="ocean-animate-float-delayed absolute top-[58%] left-[48%] w-20">
        <svg viewBox="0 0 70 40">
          <ellipse cx="35" cy="20" rx="26" ry="12" fill="#38bdf8" />
          <path d="M10 20 L0 14 L0 26 Z" fill="#0ea5e9" />
          <circle cx="52" cy="17" r="3" fill="#f0fdfa" />
        </svg>
      </div>

      {/* School of fish */}
      <div className="ocean-animate-float absolute top-[42%] right-[28%] flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 32 16" width={36} height={18} style={{ opacity: 0.7 + i * 0.08 }}>
            <ellipse cx="16" cy="8" rx="14" ry="5" fill="#94a3b8" />
            <path d="M4 8 L0 6 L0 10 Z" fill="#cbd5e1" />
          </svg>
        ))}
      </div>

      {/* Jellyfish */}
      <div className="ocean-animate-float absolute top-[36%] left-[62%] w-24 md:w-28">
        <svg viewBox="0 0 90 110">
          <ellipse cx="45" cy="30" rx="30" ry="22" fill="rgba(125, 211, 252, 0.55)" />
          <ellipse cx="45" cy="28" rx="18" ry="10" fill="rgba(186, 230, 253, 0.35)" />
          {[
            "M24 38 Q22 72 18 100",
            "M34 40 Q36 78 32 102",
            "M45 38 Q46 82 45 108",
            "M56 40 Q54 76 58 100",
            "M66 38 Q70 70 72 96",
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="rgba(186, 230, 253, 0.65)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* Sea turtle */}
      <div className="ocean-animate-float-delayed absolute bottom-[22%] left-[18%] w-32">
        <svg viewBox="0 0 110 72">
          <ellipse cx="55" cy="38" rx="38" ry="24" fill="#0d9488" />
          <ellipse cx="55" cy="38" rx="22" ry="14" fill="#14b8a6" />
          <path d="M18 38 L4 30 L4 46 Z" fill="#0f766e" />
          <path d="M92 38 L106 30 L106 46 Z" fill="#0f766e" />
          <circle cx="82" cy="32" r="3.5" fill="#ecfdf5" />
          <circle cx="82" cy="32" r="1.8" fill="#134e4a" />
        </svg>
      </div>

      {/* Octopus */}
      <div className="ocean-animate-float absolute bottom-[18%] left-[2%] w-28">
        <svg viewBox="0 0 90 80">
          <circle cx="45" cy="28" r="20" fill="#5b6b8a" />
          {[
            "M30 42 Q16 58 12 76",
            "M38 44 Q34 62 32 78",
            "M45 46 Q45 64 45 80",
            "M52 44 Q56 60 58 76",
            "M60 42 Q74 56 78 72",
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="#475569"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <circle cx="38" cy="26" r="3" fill="#f1f5f9" />
          <circle cx="52" cy="26" r="3" fill="#f1f5f9" />
        </svg>
      </div>

      {/* Whale silhouette (distant) */}
      <div className="absolute top-[18%] left-[8%] w-40 opacity-40 md:w-56">
        <svg viewBox="0 0 160 60">
          <ellipse cx="80" cy="35" rx="75" ry="18" fill="#1e293b" />
          <path d="M5 35 L0 28 L0 42 Z" fill="#0f172a" />
        </svg>
      </div>

      {/* Vignette — keeps UI readable over creatures */}
      <div
        className="absolute inset-0"
        style={{
          background: isAmbient
            ? "radial-gradient(ellipse 90% 70% at 50% 35%, transparent 0%, rgba(2, 26, 36, 0.45) 60%, rgba(2, 26, 36, 0.82) 100%)"
            : "radial-gradient(ellipse 75% 55% at 50% 28%, transparent 0%, rgba(2, 26, 36, 0.35) 55%, rgba(2, 26, 36, 0.75) 100%)",
        }}
      />
    </div>
  );
}
