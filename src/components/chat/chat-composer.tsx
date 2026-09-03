"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PlusCircle,
  Send,
  Smile,
  ImageIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { GifPicker } from "@/components/chat/gif-picker";

const EMOJIS = ["😀", "😂", "🥰", "😎", "🔥", "✨", "👋", "🎧", "💜", "🙌", "👀", "💯"];

const ARM_TIMEOUT_MS = 3000;

export function ChatComposer({
  disabled,
  onSend,
  onSkip,
}: {
  disabled?: boolean;
  onSend: (content: string, type?: "text" | "image" | "gif", mediaUrl?: string) => void;
  onSkip: () => void | Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [dragging, setDragging] = useState(false);
  const [skipArmed, setSkipArmed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const armTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isGuest = useAuthStore((s) => s.isGuest);
  const isPremium = useAuthStore((s) => s.isPremium);

  const disarmSkip = useCallback(() => {
    setSkipArmed(false);
    if (armTimeoutRef.current) {
      clearTimeout(armTimeoutRef.current);
      armTimeoutRef.current = null;
    }
  }, []);

  const advanceSkip = useCallback(() => {
    if (disabled) return;

    if (!skipArmed) {
      setSkipArmed(true);
      if (armTimeoutRef.current) clearTimeout(armTimeoutRef.current);
      armTimeoutRef.current = setTimeout(() => {
        setSkipArmed(false);
      }, ARM_TIMEOUT_MS);
      return;
    }

    disarmSkip();
    void onSkip();
  }, [disabled, skipArmed, onSkip, disarmSkip]);

  useEffect(() => {
    return () => {
      if (armTimeoutRef.current) clearTimeout(armTimeoutRef.current);
    };
  }, []);

  const isSkipArmed = !disabled && skipArmed;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || disabled) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          '[role="dialog"], [data-slot="dialog-content"], [data-slot="popover-content"], [data-slot="popover"], [data-open]'
        )
      ) {
        return;
      }
      e.preventDefault();
      advanceSkip();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, advanceSkip]);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim(), "text");
    setValue("");
  };

  const handleMedia = (file: File) => {
    if (isGuest()) {
      toast.info("Create an account to share media.", {
        action: {
          label: "Sign Up",
          onClick: () => (window.location.href = "/auth?tab=signup"),
        },
      });
      return;
    }
    if (!isPremium() && file.size > 500_000) {
      toast.info("Upgrade to Premium for HD media sharing.");
    }
    const url = URL.createObjectURL(file);
    onSend(file.name, "image", url);
  };

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-background via-background/95 to-transparent p-4 md:p-6",
        dragging && "ring-2 ring-inset ring-magenta"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith("image/")) handleMedia(file);
      }}
    >
      <div className="relative mx-auto max-w-4xl">
        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-full border-2 border-dashed border-magenta bg-magenta/10 text-sm font-medium text-magenta">
            Drop image to share
          </div>
        )}
        <div className="flex items-end gap-2 rounded-full border border-outline-variant/40 bg-surface-container/80 p-1.5 pl-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all focus-within:border-magenta/50 focus-within:shadow-[0_0_28px_rgba(232,121,249,0.2)] focus-within:ring-1 focus-within:ring-magenta/30">
          <Popover>
            <PopoverTrigger
              disabled={disabled}
              className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-magenta disabled:opacity-50"
              aria-label="Attach"
            >
              <PlusCircle className="size-5" />
            </PopoverTrigger>
            <PopoverContent
              className="w-48 border-outline-variant/50 bg-surface-container p-2"
              align="start"
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface-container-high"
                onClick={() => fileRef.current?.click()}
              >
                <ImageIcon className="size-4 text-magenta" /> Upload image
              </button>
            </PopoverContent>
          </Popover>

          <textarea
            ref={textareaRef}
            rows={1}
            disabled={disabled}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Say something fun…"
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2.5 text-base text-on-surface outline-none placeholder:text-on-surface-variant/50 disabled:opacity-50"
            aria-label="Message"
          />

          <Popover>
            <PopoverTrigger
              disabled={disabled}
              className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-secondary disabled:opacity-50"
              aria-label="Emoji"
            >
              <Smile className="size-5" />
            </PopoverTrigger>
            <PopoverContent className="grid w-56 grid-cols-6 gap-1 border-outline-variant/50 bg-surface-container p-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="rounded-lg p-1 text-lg transition-transform hover:scale-110 hover:bg-surface-container-high"
                  onClick={() => setValue((v) => v + e)}
                >
                  {e}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <GifPicker
            disabled={disabled}
            onSelectGif={(url, title) => onSend(title || "gif", "gif", url)}
          />

          {/* Dual ESC | SKIP control */}
          <div
            className={cn(
              "mb-0.5 flex h-10 shrink-0 overflow-hidden rounded-full border text-[11px] font-bold tracking-wide uppercase",
              disabled
                ? "pointer-events-none border-outline-variant/30 opacity-50"
                : "border-magenta/40"
            )}
            role="group"
            aria-label="Skip stranger. Press Escape twice to confirm."
          >
            <button
              type="button"
              disabled={disabled}
              onClick={advanceSkip}
              className={cn(
                "px-2.5 transition-colors",
                isSkipArmed
                  ? "bg-magenta/25 text-magenta"
                  : "bg-surface-container-highest/80 text-on-surface-variant hover:text-magenta"
              )}
              aria-label="Arm skip with Escape"
            >
              Esc
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={advanceSkip}
              className={cn(
                "min-w-[4.5rem] border-l px-2.5 transition-all",
                isSkipArmed
                  ? "border-magenta/50 bg-magenta/50 text-white shadow-[inset_0_0_12px_rgba(0,0,0,0.35)]"
                  : "border-magenta/30 bg-gradient-to-r from-primary/30 to-magenta/25 text-on-surface hover:from-primary/40 hover:to-magenta/35"
              )}
              aria-label={isSkipArmed ? "Confirm skip" : "Skip stranger"}
              aria-pressed={isSkipArmed}
            >
              {isSkipArmed ? "confirm?" : "Skip"}
            </button>
          </div>

          <Button
            type="button"
            size="icon"
            disabled={disabled || !value.trim()}
            onClick={submit}
            className="mb-0.5 size-10 shrink-0 rounded-full"
            aria-label="Send message"
          >
            <Send className="size-4 fill-current" />
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleMedia(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
