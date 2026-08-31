"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validators";

import { authService } from "@/services/auth";

export default function ForgotPasswordClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const [cooldown, setCooldown] =
    useState(0);
  const RESET_REQUEST_COOLDOWN = 60;

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setCooldown((current) => {
          if (current <= 1) {
            window.clearInterval(
              timer
            );

            return 0;
          }

          return current - 1;
        });
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldown]);



  const onSubmit =
    form.handleSubmit(
      async (values) => {
        if (cooldown > 0) {
          return;
        }

        setLoading(true);

        try {
          await authService.requestPasswordReset(
            values.email
          );

          setSent(true);

          setCooldown(
            RESET_REQUEST_COOLDOWN
          );

          toast.success(
            "If an account exists, a reset link has been sent."
          );
        } catch (error) {
          console.error(
            "PASSWORD RESET REQUEST ERROR:",
            error
          );

          toast.error(
            "Could not send the reset link. Please try again."
          );
        } finally {
          setLoading(false);
        }
      }
    );

  return (
    <div className="mesh-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-5%] top-[10%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[5%] left-[-5%] size-[320px] rounded-full bg-magenta/15 blur-[90px]" />
      </div>

      <div className="relative z-10 mb-10">
        <BrandLogo />
      </div>

      <div className="glass-panel relative z-10 w-full max-w-md rounded-3xl p-8 md:p-10">
        <Link
          href="/auth"
          className="mb-6 inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
        <h1 className="font-heading mb-2 text-2xl font-bold tracking-tight text-on-surface">
          Forgot your password?
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
          No stress — drop your email and we&apos;ll send a reset link. (Demo
          flow, backend-ready.)
        </p>
        {sent ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary-container/30 p-6 text-center">
            <Sparkles className="size-7 text-secondary" />
            <p className="text-sm text-on-secondary-container">
              If an account exists for that email, a reset link is on its way.
              Check your inbox (and spam, just in case).
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-outline" />
                <Input
                  id="reset-email"
                  className="h-12 rounded-2xl border-outline-variant/40 bg-surface-container-low pl-10"
                  placeholder="you@email.com"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || cooldown > 0}
              className="h-12 w-full rounded-2xl"
            >
              {loading
                ? "Sending…"
                : cooldown > 0
                  ? `Try again in ${cooldown}s`
                  : "Send reset link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
