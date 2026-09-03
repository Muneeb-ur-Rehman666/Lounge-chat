"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

interface StartChattingButtonProps extends React.ComponentProps<typeof Button> {
  showArrow?: boolean;
  arrowClassName?: string;
}

export function StartChattingButton({
  children,
  className,
  size = "lg",
  showArrow = true,
  arrowClassName = "size-5",
  ...props
}: StartChattingButtonProps) {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  const handleStart = () => {
    if (!session) {
      continueAsGuest();
    }
    router.push("/chats");
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleStart}
      {...props}
    >
      {children ?? "Start chatting"}
      {showArrow && <ArrowRight className={arrowClassName} />}
    </Button>
  );
}
