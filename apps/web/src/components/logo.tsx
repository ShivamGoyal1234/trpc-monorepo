import Link from "next/link";
import { Waves } from "lucide-react";

import { cn } from "~/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-700 text-white shadow-md shadow-cyan-900/40">
        <Waves className="size-4" strokeWidth={2.25} />
      </span>
      {showText && (
        <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-lg text-transparent">
          FormCraft
        </span>
      )}
    </Link>
  );
}
