"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "@/lib/validators";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get("tab");
  const guestParam = params.get("guest");
  const tab: "signin" | "signup" = tabParam === "signup" ? "signup" : "signin";
  const setTab = (next: "signin" | "signup") => {
    const q = new URLSearchParams(params.toString());
    if (next === "signup") q.set("tab", "signup");
    else q.delete("tab");
    router.replace(`/auth?${q.toString()}`);
  };
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] =
    useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthHydration();

  useEffect(() => {
    if (hydrated && session) {
      router.replace("/chats");
    }
  }, [hydrated, session, router]);

  useEffect(() => {
    if (guestParam === "1" && hydrated && !session) {
      continueAsGuest();
      router.replace("/chats");
    }
  }, [guestParam, hydrated, session, continueAsGuest, router]);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSignIn = signInForm.handleSubmit(async (values) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      toast.success("Welcome back to the lounge.");
      router.push("/chats");
    } catch {
      toast.error("Could not sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  });

  const onSignUp = signUpForm.handleSubmit(async (values) => {
    setLoading(true);

    try {
      const session = await signUp({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });

      if (!session) {
        setConfirmationEmail(values.email);
        setEmailConfirmationRequired(true);

        toast.success("Check your email to verify your account.");
        return;
      }

      toast.success("Account created. Welcome aboard.");
      router.push("/chats");
    } catch (error) {
      toast.error("Could not create account. Please check your information and try again.")
    } finally {
      setLoading(false);
    }
  });

  const handleGuest = () => {
    continueAsGuest();
    toast.message("Browsing as guest — some features are limited.");
    router.push("/chats");
  };

  const acceptTermsValue = useWatch({
    control: signUpForm.control,
    name: "acceptTerms",
  });

  const fieldClass =
    "h-10 rounded-xl border-outline-variant/40 bg-surface-container-low focus-visible:border-primary/50";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 text-center lg:text-left">
        <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
          {tab === "signin" ? "Welcome back" : "Join the lounge"}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {tab === "signin"
            ? "Pick up where the vibes left off."
            : "Friends, history, and all the good stuff."}
        </p>
      </div>

      <div className="mb-4 flex rounded-xl bg-surface-container-low/80 p-1">
        <button
          type="button"
          onClick={() => setTab("signin")}
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all",
            tab === "signin"
              ? "nav-active-pill text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all",
            tab === "signup"
              ? "nav-active-pill text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Sign Up
        </button>
      </div>

      {tab === "signin" ? (
        <form onSubmit={onSignIn} className="flex flex-col gap-3.5" noValidate>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                className={cn(fieldClass, "pl-10")}
                aria-invalid={!!signInForm.formState.errors.email}
                {...signInForm.register("email")}
              />
            </div>
            {signInForm.formState.errors.email && (
              <p className="text-xs text-destructive" role="alert">
                {signInForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-magenta hover:text-magenta/80"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                className={cn(fieldClass, "px-10")}
                aria-invalid={!!signInForm.formState.errors.password}
                {...signInForm.register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            </div>
            {signInForm.formState.errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {signInForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-0.5 h-10 w-full rounded-xl"
          >
            {loading ? "Signing in…" : "Sign In"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      ) : emailConfirmationRequired ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-secondary-container/30 p-5 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-secondary/15">
              <Mail className="size-5 text-secondary" />
            </div>

            <h2 className="font-heading text-lg font-bold text-on-surface">
              Check your email
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              We sent a verification link to{" "}
              <span className="font-semibold text-on-surface">
                {confirmationEmail}
              </span>
              .
            </p>

            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant/80">
              Verify your email before signing in to your LoungeChat account.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-xl"
            onClick={() => {
              setEmailConfirmationRequired(false);
              setConfirmationEmail("");
            }}
          >
            Back to Sign Up
          </Button>
        </div>
      ) : (
        <form onSubmit={onSignUp} className="flex flex-col gap-2.5" noValidate>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Display name
            </Label>
            <Input
              placeholder="How others see you"
              className={fieldClass}
              {...signUpForm.register("displayName")}
            />
            {signUpForm.formState.errors.displayName && (
              <p className="text-xs text-destructive" role="alert">
                {signUpForm.formState.errors.displayName.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Email
            </Label>
            <Input
              type="email"
              placeholder="you@email.com"
              className={fieldClass}
              {...signUpForm.register("email")}
            />
            {signUpForm.formState.errors.email && (
              <p className="text-xs text-destructive" role="alert">
                {signUpForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Password
              </Label>
              <Input
                type="password"
                placeholder="Min 8 chars"
                className={fieldClass}
                {...signUpForm.register("password")}
              />
              {signUpForm.formState.errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Confirm
              </Label>
              <Input
                type="password"
                placeholder="Repeat"
                className={fieldClass}
                {...signUpForm.register("confirmPassword")}
              />
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive" role="alert">
                  {signUpForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <label className="flex items-start gap-2.5 text-xs text-on-surface-variant sm:text-sm">
            <Checkbox
              checked={!!acceptTermsValue}
              onCheckedChange={(v) =>
                signUpForm.setValue("acceptTerms", v === true, {
                  shouldValidate: true,
                })
              }
            />
            <span>
              I agree to the{" "}
              <Link
                href="/safety"
                className="text-magenta underline-offset-2 hover:underline"
              >
                Safety guidelines
              </Link>{" "}
              and terms of use.
            </span>
          </label>
          {signUpForm.formState.errors.acceptTerms && (
            <p className="text-xs text-destructive" role="alert">
              {signUpForm.formState.errors.acceptTerms.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-xl"
          >
            {loading ? "Creating account…" : "Create Account"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      )}

      <div className="my-3.5 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant/50" />
        <span className="text-xs font-semibold uppercase tracking-wider text-outline">
          or
        </span>
        <div className="h-px flex-1 bg-outline-variant/50" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGuest}
        className="h-10 w-full rounded-xl"
      >
        <Compass className="size-4 text-secondary" />
        Continue as Guest
      </Button>
      <p className="mt-2 text-center text-xs text-on-surface-variant/80">
        Guests can chat — sign up later to keep friends & history.
      </p>
    </div>
  );
}

export function AuthBrandMark() {
  return (
    <div className="flex items-center gap-2.5 text-2xl tracking-tight">
      <span className="glow-primary flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-magenta to-secondary text-white">
        <MessageCircle className="size-[55%] fill-current" aria-hidden />
      </span>
      <span className="font-logo text-gradient font-normal">LoungeChat</span>
    </div>
  );
}
