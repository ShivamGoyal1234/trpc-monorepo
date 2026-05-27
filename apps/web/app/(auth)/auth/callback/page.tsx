"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { setAuthToken } from "~/src/lib/trpc";
import { trpc } from "~/src/lib/trpc";
import { useAuthStore } from "~/src/store/auth.store";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = searchParams.get("token");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    setTokenReady(true);
  }, [token]);

  const me = trpc.auth.me.useQuery(undefined, {
    enabled: tokenReady,
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      toast.error("Missing sign-in token");
      router.replace("/login");
      return;
    }

    if (me.isError) {
      toast.error("Google sign-in failed");
      router.replace("/login");
      return;
    }

    if (me.data && token) {
      setAuth(
        {
          id: me.data.id,
          email: me.data.email,
          name: me.data.name,
          image: me.data.image,
          role: me.data.role,
        },
        token,
      );
      toast.success("Signed in with Google");
      router.replace(callbackUrl);
    }
  }, [callbackUrl, me.data, me.isError, router, setAuth, token]);

  return (
    <div className="py-8 text-center text-muted-foreground">
      Completing Google sign-in…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-muted-foreground">Loading…</div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
