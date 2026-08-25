"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

import {
    resetPasswordSchema,
    type ResetPasswordValues,
} from "@/lib/validators";

export default function ResetPasswordClient() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        setLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.updateUser({
                password: values.password,
            });

            if (error) {
                throw error;
            }

            toast.success("Your password has been updated.");

            router.push("/auth");
        } catch {
            toast.error(
                "Could not update your password. The reset link may have expired."
            );
        } finally {
            setLoading(false);
        }
    });

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
                            Choose a new password for your LoungeChat account.
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
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your new password"
                                    className="h-12 rounded-2xl border-outline-variant/40 bg-surface-container-low px-10"
                                    {...form.register("password")}
                                />

                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
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
                                <p className="text-xs text-destructive" role="alert">
                                    {form.formState.errors.password.message}
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
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Repeat your new password"
                                    className="h-12 rounded-2xl border-outline-variant/40 bg-surface-container-low px-10"
                                    {...form.register("confirmPassword")}
                                />

                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                                    onClick={() =>
                                        setShowConfirmPassword((value) => !value)
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
                                <p className="text-xs text-destructive" role="alert">
                                    {form.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="mt-1 h-12 w-full rounded-2xl"
                        >
                            {loading ? "Updating password…" : "Update password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}