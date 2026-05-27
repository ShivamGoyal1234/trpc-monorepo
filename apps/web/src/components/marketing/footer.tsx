import Link from "next/link";

import { Logo } from "~/src/components/logo";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3002";

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#021a24]/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Build beautiful forms with AI assistance, analytics, and a modern
            drag-and-drop editor.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/#features" className="transition-colors hover:text-cyan-200">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="transition-colors hover:text-cyan-200">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/#workflow" className="transition-colors hover:text-cyan-200">
                Workflow
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="transition-colors hover:text-cyan-200">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/explore" className="transition-colors hover:text-cyan-200">
                Explore
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Account</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/login" className="transition-colors hover:text-cyan-200">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-cyan-200">
                Sign up
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition-colors hover:text-cyan-200">
                Dashboard
              </Link>
            </li>
            <li>
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cyan-200"
              >
                API docs
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} FormCraft. All rights reserved.
      </div>
    </footer>
  );
}
