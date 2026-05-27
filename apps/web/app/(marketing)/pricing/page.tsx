"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Pricing lives on the homepage — keep this route for old links. */
export default function PricingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/#pricing");
    const el = document.getElementById("pricing");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [router]);

  return null;
}
