"use client";

import { useRef, useState } from "react";
import { Film, Search, X, Loader2, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GifItem } from "@/app/api/gifs/route";

const QUICK_CATEGORIES = [
  { label: "🔥 Trending", query: "" },
  { label: "😂 Laugh", query: "laugh" },
  { label: "❤️ Love", query: "love" },
  { label: "🎉 Party", query: "party" },
  { label: "😲 Shock", query: "shock" },
  { label: "💃 Dance", query: "dance" },
  { label: "👏 Clap", query: "clap" },
  { label: "🐱 Cat", query: "cat" },
];

export function GifPicker({
  onSelectGif,
  disabled,
}: {
  onSelectGif: (url: string, title: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("🔥 Trending");
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchGifs = async (searchQuery: string) => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/gifs?q=${encodeURIComponent(searchQuery)}`
        : "/api/gifs";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setGifs(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load GIFs:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && gifs.length === 0) {
      void fetchGifs(query);
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setActiveCategory("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchGifs(value.trim());
    }, 300);
  };

  const handleCategoryClick = (cat: (typeof QUICK_CATEGORIES)[number]) => {
    setActiveCategory(cat.label);
    setQuery(cat.query);
    fetchGifs(cat.query);
  };

  const handlePick = (gif: GifItem) => {
    onSelectGif(gif.url, gif.title);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-magenta disabled:opacity-50",
          open && "bg-surface-container-highest text-magenta"
        )}
        aria-label="Send a GIF"
        title="Send a GIF (KLIPY)"
      >
        <span className="flex items-center gap-0.5 font-heading text-[11px] font-extrabold tracking-tight">
          GIF
        </span>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-[340px] rounded-3xl border border-outline-variant/40 bg-surface-container-high/95 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:w-[380px]"
      >
        {/* Header & Source Badge */}
        <div className="mb-2.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Film className="size-4 text-magenta" />
            <span className="font-heading text-sm font-bold text-on-surface">
              GIFs
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-magenta/15 px-2 py-0.5 text-[10px] font-semibold text-magenta">
            <Sparkles className="size-3" />
            KLIPY
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search KLIPY GIFs…"
            className="h-9 rounded-xl border-outline-variant/30 bg-surface-container py-1 pl-9 pr-8 text-xs placeholder:text-on-surface-variant/50 focus-visible:border-magenta/50 focus-visible:ring-magenta/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                fetchGifs("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-on-surface-variant hover:text-on-surface"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95",
                activeCategory === cat.label
                  ? "bg-gradient-to-r from-primary/30 to-magenta/30 font-semibold text-white shadow-[0_0_12px_rgba(232,121,249,0.25)] ring-1 ring-magenta/40"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* GIF Grid */}
        <div className="custom-scrollbar grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="col-span-2 flex h-36 flex-col items-center justify-center gap-2">
              <Loader2 className="size-6 animate-spin text-magenta" />
              <p className="text-xs text-on-surface-variant">
                Finding fresh GIFs…
              </p>
            </div>
          ) : gifs.length === 0 ? (
            <div className="col-span-2 flex h-36 flex-col items-center justify-center gap-1 text-center">
              <p className="text-xs font-semibold text-on-surface">
                No GIFs found
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Try searching for something else like &quot;dance&quot; or
                &quot;vibe&quot;.
              </p>
            </div>
          ) : (
            gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => handlePick(gif)}
                className="group relative aspect-video w-full overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container transition-all hover:scale-[1.02] hover:border-magenta/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
                title={gif.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gif.previewUrl || gif.url}
                  alt={gif.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent p-1 px-1.5 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {gif.title}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
