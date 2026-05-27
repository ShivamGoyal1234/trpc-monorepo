"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginSchema } from "@repo/schemas";
import type { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { GoogleSignInButton } from "~/src/components/auth/google-sign-in-button";
import { trpc } from "~/src/lib/trpc";
import { toastTrpcError } from "~/src/lib/trpc-error";
import { useAuthStore } from "~/src/store/auth.store";

type LoginForm = z.infer<typeof LoginSchema>;

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          image: data.user.image,
          role: data.user.role,
        },
        data.token,
      );
      toast.success("Welcome back!");
      const callback = searchParams.get("callbackUrl") ?? "/dashboard";
      router.push(callback);
    },
    onError: toastTrpcError,
  });

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error?.startsWith("google_")) return;

    const messages: Record<string, string> = {
      google_denied: "Google sign-in was cancelled.",
      google_failed: "Google sign-in failed. Please try again.",
      google_invalid: "Invalid Google sign-in response.",
      google_state: "Google sign-in expired. Please try again.",
      google_not_configured: "Google sign-in is not configured.",
    };

    toast.error(messages[error] ?? "Google sign-in failed.");
    router.replace("/login");
  }, [router, searchParams]);

  const fillDemo = () => {
    form.setValue("email", "demo@formcraft.io");
    form.setValue("password", "Demo@1234");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <div className="mb-6 rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium">Demo credentials</p>
        <p className="mt-1 text-sm text-muted-foreground">
          demo@formcraft.io / Demo@1234
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Use demo credentials
        </button>
      </div>

      <GoogleSignInButton label="Sign in with Google" />

      <form
        onSubmit={handleSubmit((data) => login.mutate(data))}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-muted-foreground">Loading…</div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
