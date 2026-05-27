"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { UserAvatar } from "~/src/components/user-avatar";
import { useAuthStore } from "~/src/store/auth.store";
import { useUiStore } from "~/src/store/ui.store";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  forms: "Forms",
  new: "New form",
  edit: "Edit",
  responses: "Responses",
  analytics: "Analytics",
  settings: "Settings",
};

function buildBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let href = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    href += `/${part}`;
    const isId = part.length > 20 || /^[a-f0-9-]{36}$/i.test(part);
    if (isId) continue;
    crumbs.push({
      href,
      label: SEGMENT_LABELS[part] ?? part,
    });
  }

  return crumbs;
}

export function DashboardHeader({ title }: { title?: string }) {
  const pathname = usePathname();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const crumbs = buildBreadcrumbs(pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/dashboard/forms?search=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
    <header className="ocean-glass-subtle sticky top-0 z-30">
      <div className="flex min-h-14 flex-wrap items-center gap-3 px-4 py-2 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0 flex-1">
          {title ? (
            <h1 className="text-lg font-semibold">{title}</h1>
          ) : (
            <nav
              className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
              aria-label="Breadcrumb"
            >
              {crumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  {i === crumbs.length - 1 ? (
                    <span className="text-foreground">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        <form
          onSubmit={handleSearch}
          className="relative hidden w-full max-w-xs sm:block md:max-w-sm"
        >
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <UserAvatar
            name={user?.name}
            image={user?.image}
            className="hidden sm:flex"
          />
        </div>
      </div>
    </header>
  );
}
