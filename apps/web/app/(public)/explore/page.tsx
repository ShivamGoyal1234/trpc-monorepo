"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { MarketingFooter } from "~/src/components/marketing/footer";
import { MarketingNavbar } from "~/src/components/marketing/navbar";
import { trpc } from "~/src/lib/trpc";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.public.getPublicForms.useQuery({
    page: 1,
    limit: 24,
    search: search || undefined,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold">Explore public forms</h1>
            <p className="mt-3 text-muted-foreground">
              Discover forms shared by the FormCraft community
            </p>
          </motion.div>

          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search forms…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))
              : data?.items.map((form, i) => (
                  <motion.div
                    key={form.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full transition-shadow hover:shadow-lg hover:shadow-primary/10">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">
                          <Link
                            href={`/f/${form.slug ?? form.id}`}
                            className="hover:text-primary"
                          >
                            {form.title}
                          </Link>
                        </CardTitle>
                        <Badge variant="secondary">Public</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {form.description || "No description"}
                        </p>
                        <Link
                          href={`/f/${form.slug ?? form.id}`}
                          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                        >
                          Open form →
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>

          {!isLoading && !data?.items.length && (
            <p className="mt-12 text-center text-muted-foreground">
              No public forms found. Publish a form with public visibility to
              appear here.
            </p>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
