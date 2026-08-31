"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    Sparkles,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";

import { authService } from "@/services/auth";

import {
    resetPasswordSchema,
    type ResetPasswordValues,
} from "@/lib/validators";

export default function ResetPasswordClient() {
    const router = useRouter();

    const [loading, setLoading] =
        useState(false);

    const [checkingSession, setCheckingSession] =
        useState(true);

    const [sessionValid, setSessionValid] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const form =
        useForm<ResetPasswordValues>({
            resolver:
                zodResolver(
                    resetPasswordSchema
                ),

            defaultValues: {
                password: "",
                confirmPassword: "",
            },
        });

    /*
     * Verify that the recovery link produced
     * a valid Supabase session.
     *
     * Supabase handles the recovery session
     * when the user returns to the application.
     */
    useEffect(() => {
        const supabase =
            createClient();

        let mounted = true;

        const checkSession =
            async () => {
                try {
                    const {
                        data: {
                            session,
                        },
                        error,
                    } =
                        await supabase.auth.getSession();

                    if (!mounted) {
                        return;
                    }

                    if (error) {
                        console.error(
                            "RECOVERY SESSION ERROR:",
                            error
                        );

                        setSessionValid(false);
                        return;
                    }

                    setSessionValid(
                        !!session
                    );
                } catch (error) {
                    console.error(
                        "RECOVERY SESSION CHECK ERROR:",
                        error
                    );

                    if (mounted) {
                        setSessionValid(false);
                    }
                } finally {
                    if (mounted) {
                        setCheckingSession(false);
                    }
                }
            };

        const {
            data: {
                subscription,
            },
        } =
            supabase.auth.onAuthStateChange(
                (event, session) => {
                    if (
                        event ===
                        "PASSWORD_RECOVERY" &&
                        session
                    ) {
                        setSessionValid(true);
                        setCheckingSession(false);
                    }
                }
            );

        void checkSession();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const onSubmit =
        form.handleSubmit(
            async (values) => {
                if (!sessionValid) {
                    toast.error(
                        "This password reset link is invalid or has expired. Please request a new one."
                    );

                    return;
                }

                setLoading(true);

                try {
                    await authService.updatePassword(
                        values.password
                    );

                    toast.success(
                        "Your password has been updated."
                    );

                    /*
                     * End the recovery/auth session after
                     * the password has successfully changed.
                     */
                    try {
                        await authService.signOut();
                    } catch (signOutError) {
                        /*
                         * The password change itself succeeded.
                         * Log the cleanup failure but do not
                         * tell the user that the password failed.
                         */
                        console.error(
                            "RECOVERY SIGN-OUT ERROR:",
                            signOutError
                        );
                    }

                    router.replace(
                        "/auth"
                    );
                } catch (error) {
                    console.error(
                        "PASSWORD UPDATE ERROR:",
                        error
                    );

                    if (
                        error instanceof Error &&
                        error.message.includes(
                            "No active password recovery session"
                        )
                    ) {
                        setSessionValid(
                            false
                        );

                        toast.error(
                            "Your reset link has expired. Please request a new password reset."
                        );

                        return;
                    }

                    toast.error(
                        error instanceof Error
                            ? error.message
                            : "Could not update your password. Please try again."
                    );
                } finally {
                    setLoading(false);
                }
            }
        );

    /*
     * Still checking whether the recovery
     * session exists.
     */
    if (checkingSession) {
        return (
            <div className="mesh-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute right-[-5%] top-[10%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />

                    <div className="absolute bottom-[5%] left-[-5%] size-[320px] rounded-full bg-magenta/15 blur-[90px]" />
                </div>

                <div className="glass-panel relative z-10 w-full max-w-md rounded-3xl p-8 text-center md:p-10">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary/15">
                        <Sparkles className="size-5 text-secondary" />
                    </div>

                    <h1 className="font-heading text-xl font-bold text-on-surface">
                        Verifying reset link…
                    </h1>

                    <p className="mt-2 text-sm text-on-surface-variant">
                        Checking your password recovery session.
                    </p>
                </div>
            </div>
        );
    }

    /*
     * No valid recovery session.
     */
    if (!sessionValid) {
        return (
            <div className="mesh-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute right-[-5%] top-[10%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />

                    <div className="absolute bottom-[5%] left-[-5%] size-[320px] rounded-full bg-magenta/15 blur-[90px]" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="glass-panel rounded-3xl p-8 text-center md:p-10">
                        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/15">
                            <Lock className="size-6 text-destructive" />
                        </div>

                        <h1 className="font-heading text-2xl font-bold text-on-surface">
                            Reset link expired
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                            This password reset link is no longer
                            valid. Please request a new reset link
                            and try again.
                        </p>

                        <div className="mt-6 flex flex-col gap-3">
                            <Button
                                type="button"
                                className="h-11 w-full rounded-2xl"
                                onClick={() =>
                                    router.replace(
                                        "/auth/forgot-password"
                                    )
                                }
                            >
                                Request a new reset link
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 w-full rounded-2xl"
                                onClick={() =>
                                    router.replace(
                                        "/auth"
                                    )
                                }
                            >
                                Back to sign in
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mesh-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-5%] top-[10%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />

                <div className="absolute bottom-[5%] left-[-5%] size-[320px] rounded-full bg-magenta/15 blur-[90px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-panel rounded-3xl p-8 md:p-10">
                    <Link
                        href="/auth"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                    >
                        <ArrowLeft className="size-4" />
                        Back to sign in
                    </Link>

                    <div className="mb-6">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary/15">
                            <Sparkles className="size-5 text-secondary" />
                        </div>

                        <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
                            Set a new password
                        </h1>

                        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                            Choose a new password for your
                            LoungeChat account.
                        </p>
                    </div>

                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col gap-4"
                        noValidate
                    >
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reset-password">
                                New password
                            </Label>

                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-outline" />

                                <Input
                                    id="reset-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your new password"
                                    className="h-12 rounded-2xl border-outline-variant/40 bg-surface-container-low px-10"
                                    {...form.register(
                                        "password"
                                    )}
                                />

                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                                    onClick={() =>
                                        setShowPassword(
                                            (value) =>
                                                !value
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

                            {form.formState.errors.password && (
                                <p
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {
                                        form.formState.errors
                                            .password.message
                                    }
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirm-reset-password">
                                Confirm new password
                            </Label>

                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-outline" />

                                <Input
                                    id="confirm-reset-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Repeat your new password"
                                    className="h-12 rounded-2xl border-outline-variant/40 bg-surface-container-low px-10"
                                    {...form.register(
                                        "confirmPassword"
                                    )}
                                />

                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (value) =>
                                                !value
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <Eye className="size-4" />
                                    ) : (
                                        <EyeOff className="size-4" />
                                    )}
                                </button>
                            </div>

                            {form.formState.errors.confirmPassword && (
                                <p
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {
                                        form.formState.errors
                                            .confirmPassword
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="mt-1 h-12 w-full rounded-2xl"
                        >
                            {loading
                                ? "Updating password…"
                                : "Update password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}