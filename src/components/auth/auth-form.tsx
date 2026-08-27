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

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();

  const tabParam = params.get("tab");
  const guestParam = params.get("guest");

  const tab: "signin" | "signup" =
    tabParam === "signup"
      ? "signup"
      : "signin";

  const setTab = (
    next: "signin" | "signup"
  ) => {
    const q = new URLSearchParams(
      params.toString()
    );

    if (next === "signup") {
      q.set("tab", "signup");
    } else {
      q.delete("tab");
    }

    const query = q.toString();

    router.replace(
      query
        ? `/auth?${query}`
        : "/auth"
    );
  };

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // OTP state
  const [otpRequired, setOtpRequired] =
    useState(false);

  const [otpEmail, setOtpEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [resendingOtp, setResendingOtp] =
    useState(false);

  const [verifyingOtp, setVerifyingOtp] =
    useState(false);

  // Auth store
  const signIn = useAuthStore(
    (state) => state.signIn
  );

  const signUp = useAuthStore(
    (state) => state.signUp
  );

  const verifyEmailOtp = useAuthStore(
    (state) => state.verifyEmailOtp
  );

  const resendVerificationEmail =
    useAuthStore(
      (state) => state.resendVerificationEmail
    );

  const continueAsGuest = useAuthStore(
    (state) => state.continueAsGuest
  );

  const session = useAuthStore(
    (state) => state.session
  );

  const hydrated = useAuthHydration();

  // Sign-in form
  const signInForm =
    useForm<SignInValues>({
      resolver:
        zodResolver(signInSchema),

      defaultValues: {
        email: "",
        password: "",
      },
    });

  // Sign-up form
  const signUpForm =
    useForm<SignUpValues>({
      resolver:
        zodResolver(signUpSchema),

      defaultValues: {
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
      },
    });

  const acceptTermsValue =
    useWatch({
      control: signUpForm.control,
      name: "acceptTerms",
    });

  const fieldClass =
    "h-10 rounded-xl border-outline-variant/40 bg-surface-container-low focus-visible:border-primary/50";

  /*
   * Redirect authenticated users.
   *
   * Do not redirect while the OTP screen
   * is being displayed.
   */
  useEffect(() => {
    if (
      !hydrated ||
      !session ||
      otpRequired
    ) {
      return;
    }

    router.replace("/chats");
  }, [
    hydrated,
    session,
    otpRequired,
    router,
  ]);

  /*
   * Guest mode.
   */
  useEffect(() => {
    if (
      guestParam !== "1" ||
      !hydrated ||
      session
    ) {
      return;
    }

    continueAsGuest();
    router.replace("/chats");
  }, [
    guestParam,
    hydrated,
    session,
    continueAsGuest,
    router,
  ]);

  /*
   * SIGN IN
   */
  const onSignIn =
    signInForm.handleSubmit(
      async (values) => {
        setLoading(true);

        try {
          await signIn(
            values.email,
            values.password
          );

          toast.success(
            "Welcome back to the lounge."
          );

          router.push("/chats");
        } catch (error) {
          console.error(
            "SIGN IN ERROR:",
            error
          );

          if (error instanceof Error) {
            console.error(
              "Message:",
              error.message
            );
          }

          toast.error(
            error instanceof Error
              ? error.message
              : "Could not sign in. Check your credentials."
          );
        } finally {
          setLoading(false);
        }
      }
    );

  /*
   * SIGN UP
   *
   * Supabase creates the account and,
   * when email confirmation is enabled,
   * sends the verification OTP.
   */
  const onSignUp =
    signUpForm.handleSubmit(
      async (values) => {
        setLoading(true);

        try {
          const session =
            await signUp({
              displayName:
                values.displayName,

              email: values.email,

              password:
                values.password,
            });

          /*
           * If Supabase returned a session,
           * email confirmation is not required.
           */
          if (session) {
            toast.success(
              "Account created successfully!"
            );

            router.replace("/chats");

            return;
          }

          /*
           * Normal email verification flow.
           *
           * Supabase returned no session because
           * email confirmation is required.
           */
          setOtpEmail(values.email);

          setOtp("");

          setOtpRequired(true);

          toast.success(
            "Verification code sent to your email."
          );
        } catch (error) {
          console.error(
            "SIGN UP ERROR:",
            error
          );

          if (error instanceof Error) {
            console.error(
              "Message:",
              error.message
            );

            console.error(
              "Stack:",
              error.stack
            );
          }

          toast.error(
            error instanceof Error
              ? error.message
              : "Could not create account. Please check your information and try again."
          );
        } finally {
          setLoading(false);
        }
      }
    );

  /*
   * VERIFY EMAIL OTP
   *
   * Goes through:
   *
   * auth-form
   *     ↓
   * auth-store
   *     ↓
   * authService
   *     ↓
   * Supabase
   */
  const handleVerifyOtp =
    async () => {
      const cleanOtp =
        otp
          .replace(/\D/g, "")
          .slice(0, 6);

      if (cleanOtp.length !== 6) {
        toast.error(
          "Please enter the 6-digit verification code."
        );

        return;
      }

      setVerifyingOtp(true);

      try {
        await verifyEmailOtp(
          otpEmail,
          cleanOtp
        );

        toast.success(
          "Email verified! Welcome to LoungeChat."
        );

        setOtpRequired(false);

        setOtp("");

        setOtpEmail("");

        router.replace("/chats");
      } catch (error) {
        console.error(
          "OTP VERIFICATION ERROR:",
          error
        );

        if (error instanceof Error) {
          console.error(
            "Message:",
            error.message
          );
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Invalid or expired code. Please check the code and try again."
        );
      } finally {
        setVerifyingOtp(false);
      }
    };

  /*
   * RESEND OTP
   */
  const handleResendOtp =
    async () => {
      if (!otpEmail) {
        return;
      }

      setResendingOtp(true);

      try {
        await resendVerificationEmail(
          otpEmail
        );

        setOtp("");

        toast.success(
          "A new verification code has been sent."
        );
      } catch (error) {
        console.error(
          "RESEND OTP ERROR:",
          error
        );

        if (error instanceof Error) {
          console.error(
            "Message:",
            error.message
          );
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Could not resend the verification code."
        );
      } finally {
        setResendingOtp(false);
      }
    };

  /*
   * GUEST
   */
  const handleGuest = () => {
    continueAsGuest();

    toast.message(
      "Browsing as guest — some features are limited."
    );

    router.push("/chats");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 text-center lg:text-left">
        <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
          {tab === "signin"
            ? "Welcome back"
            : "Join the lounge"}
        </h1>

        <p className="mt-0.5 text-sm text-on-surface-variant">
          {tab === "signin"
            ? "Pick up where the vibes left off."
            : "Friends, history, and all the good stuff."}
        </p>
      </div>

      {!otpRequired && (
        <div className="mb-4 flex rounded-xl bg-surface-container-low/80 p-1">
          <button
            type="button"
            onClick={() =>
              setTab("signin")
            }
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
            onClick={() =>
              setTab("signup")
            }
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
      )}

      {tab === "signin" &&
        !otpRequired ? (
        /*
         * SIGN IN FORM
         */
        <form
          onSubmit={onSignIn}
          className="flex flex-col gap-3.5"
          noValidate
        >
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
                className={cn(
                  fieldClass,
                  "pl-10"
                )}
                aria-invalid={
                  !!signInForm.formState
                    .errors.email
                }
                {...signInForm.register(
                  "email"
                )}
              />
            </div>

            {signInForm.formState
              .errors.email && (
                <p
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {
                    signInForm.formState
                      .errors.email.message
                  }
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
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Your password"
                className={cn(
                  fieldClass,
                  "px-10"
                )}
                aria-invalid={
                  !!signInForm.formState
                    .errors.password
                }
                {...signInForm.register(
                  "password"
                )}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            </div>

            {signInForm.formState
              .errors.password && (
                <p
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {
                    signInForm.formState
                      .errors.password.message
                  }
                </p>
              )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-0.5 h-10 w-full rounded-xl"
          >
            {loading
              ? "Signing in…"
              : "Sign In"}

            <ArrowRight className="size-4" />
          </Button>
        </form>
      ) : otpRequired ? (
        /*
         * OTP VERIFICATION SCREEN
         */
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-secondary-container/30 p-5 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-secondary/15">
              <Mail className="size-5 text-secondary" />
            </div>

            <h2 className="font-heading text-lg font-bold text-on-surface">
              Verify your email
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              We sent a 6-digit
              verification code to{" "}
              <span className="font-semibold text-on-surface">
                {otpEmail}
              </span>
              .
            </p>

            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant/80">
              Enter the code below to
              verify your email and finish
              creating your account.
            </p>

            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant/80">
              Didn&apos;t receive the
              code? Check that you entered
              the correct email or check
              your spam/junk folder.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="otp"
              className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Enter the OTP sent to your
              email
            </Label>

            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) => {
                const value =
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);
              }}
              className="h-12 rounded-xl text-center text-xl font-semibold tracking-[0.5em]"
            />
          </div>

          <Button
            type="button"
            disabled={
              verifyingOtp ||
              otp.length !== 6
            }
            onClick={handleVerifyOtp}
            className="h-10 w-full rounded-xl"
          >
            {verifyingOtp
              ? "Verifying…"
              : "Verify Email"}

            <ArrowRight className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={resendingOtp}
            onClick={handleResendOtp}
            className="h-9 w-full rounded-xl text-xs"
          >
            {resendingOtp
              ? "Sending new code…"
              : "Didn't receive it? Resend OTP"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-xl"
            onClick={() => {
              setOtpRequired(false);
              setOtp("");
              setOtpEmail("");
            }}
          >
            Back to Sign Up
          </Button>
        </div>
      ) : (
        /*
         * SIGN UP FORM
         */
        <form
          onSubmit={onSignUp}
          className="flex flex-col gap-2.5"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Display name
            </Label>

            <Input
              placeholder="How others see you"
              className={fieldClass}
              {...signUpForm.register(
                "displayName"
              )}
            />

            {signUpForm.formState
              .errors.displayName && (
                <p
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {
                    signUpForm.formState
                      .errors.displayName
                      .message
                  }
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
              {...signUpForm.register(
                "email"
              )}
            />

            {signUpForm.formState
              .errors.email && (
                <p
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {
                    signUpForm.formState
                      .errors.email.message
                  }
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
                {...signUpForm.register(
                  "password"
                )}
              />

              {signUpForm.formState
                .errors.password && (
                  <p
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {
                      signUpForm.formState
                        .errors.password
                        .message
                    }
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
                {...signUpForm.register(
                  "confirmPassword"
                )}
              />

              {signUpForm.formState
                .errors.confirmPassword && (
                  <p
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {
                      signUpForm.formState
                        .errors
                        .confirmPassword
                        .message
                    }
                  </p>
                )}
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-on-surface-variant sm:text-sm">
            <Checkbox
              checked={
                !!acceptTermsValue
              }
              onCheckedChange={(value) =>
                signUpForm.setValue(
                  "acceptTerms",
                  value === true,
                  {
                    shouldValidate: true,
                  }
                )
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

          {signUpForm.formState
            .errors.acceptTerms && (
              <p
                className="text-xs text-destructive"
                role="alert"
              >
                {
                  signUpForm.formState
                    .errors.acceptTerms
                    .message
                }
              </p>
            )}

          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-xl"
          >
            {loading
              ? "Creating account…"
              : "Create Account"}

            <ArrowRight className="size-4" />
          </Button>
        </form>
      )}

      {!otpRequired && (
        <>
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
            Guests can chat — sign up
            later to keep friends &
            history.
          </p>
        </>
      )}
    </div>
  );
}

export function AuthBrandMark() {
  return (
    <div className="flex items-center gap-2.5 text-2xl tracking-tight">
      <span className="glow-primary flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-magenta to-secondary text-white">
        <MessageCircle
          className="size-[55%] fill-current"
          aria-hidden
        />
      </span>

      <span className="font-logo text-gradient font-normal">
        LoungeChat
      </span>
    </div>
  );
}
