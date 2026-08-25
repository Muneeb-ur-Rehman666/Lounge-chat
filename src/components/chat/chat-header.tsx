"use client";

import { useState } from "react";
import { Ban, BadgeCheck, Flag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusDot } from "@/components/shared/status-dot";
import type { StrangerPartner } from "@/types";
import { toast } from "sonner";

const REPORT_REASONS = [
  { id: "harassment", label: "Harassment" },
  { id: "spam", label: "Spam" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "underage", label: "Suspected underage" },
  { id: "other", label: "Other" },
] as const;

export function ChatHeader({
  partner,
  onReport,
  onBlock,
}: {
  partner: StrangerPartner;
  onReport: (reason: string, details?: string) => Promise<void>;
  onBlock: () => Promise<void>;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState<string>("harassment");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-variant/25 bg-surface-container/70 px-4 backdrop-blur-xl md:h-[4.5rem] md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="relative shrink-0">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 via-magenta/30 to-secondary/30 text-on-surface ring-2 ring-magenta/30 md:size-12">
              <User className="size-5 md:size-6" />
            </div>
            <StatusDot
              status={partner.status}
              className="absolute bottom-0 right-0"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading flex items-center gap-2 truncate text-sm font-semibold text-on-surface md:text-base">
              {partner.displayName}
              {partner.isVerified && !partner.isGuest && (
                <BadgeCheck
                  className="size-4 shrink-0 fill-secondary text-secondary"
                  aria-label="Verified"
                />
              )}
            </h2>
            {partner.interests.length > 0 && (
              <p className="truncate text-xs text-on-surface-variant">
                {partner.interests.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-full hover:bg-destructive/15 hover:text-destructive md:size-10"
                  onClick={() => setReportOpen(true)}
                  aria-label="Report"
                >
                  <Flag className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Report stranger</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-full hover:bg-destructive/15 hover:text-destructive md:size-10"
                  onClick={() => setBlockOpen(true)}
                  aria-label="Block"
                >
                  <Ban className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Block stranger</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report stranger</DialogTitle>
            <DialogDescription>
              Reports help keep the lounge safe. This will not notify the other
              person.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {REPORT_REASONS.map((r) => (
              <label key={r.id} className="flex items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="reason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className="accent-magenta"
                />
                {r.label}
              </label>
            ))}
            <div>
              <Label htmlFor="details">Details (optional)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 bg-surface-container-low"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onReport(reason, details);
                setBusy(false);
                setReportOpen(false);
                toast.success("Report submitted. Thank you.");
              }}
            >
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block this stranger?</DialogTitle>
            <DialogDescription>
              You won&apos;t be matched with them again in this session. The chat
              will end.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onBlock();
                setBusy(false);
                setBlockOpen(false);
                toast.message("User blocked. Chat ended.");
              }}
            >
              Block & end
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
