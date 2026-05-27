"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Logo } from "~/src/components/logo";
import { useAuthStore } from "~/src/store/auth.store";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3002";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/explore", label: "Explore" },
  { href: DOCS_URL, label: "Docs", external: true },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#021a24]/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-300 transition-colors hover:text-cyan-200"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate-300 transition-colors hover:text-cyan-200"
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={() => router.push("/login")}
              >
                Sign in
              </Button>
              <Button
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                onClick={() => router.push("/register")}
              >
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#021a24]/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) =>
              l.external ? (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-300"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-slate-300"
                >
                  {l.label}
                </Link>
              ),
            )}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <Button
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard");
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      router.push("/login");
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      router.push("/register");
                    }}
                  >
                    Get started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
