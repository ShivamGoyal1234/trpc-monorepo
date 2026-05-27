import { cn } from "~/lib/utils";

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-3xl font-bold tracking-tight text-slate-50 md:text-4xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SectionLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-3 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Frosted panel tuned for the dark ocean background */
export function OceanPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-950/55 shadow-xl shadow-black/25 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Full-width band so lower sections sit on solid readable ground */
export function OceanBand({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-32 border-y border-white/5 bg-[#021a24]/88 backdrop-blur-sm",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">{children}</div>
    </section>
  );
}
