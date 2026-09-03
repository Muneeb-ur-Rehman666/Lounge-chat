import { NextResponse } from "next/server";

export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width?: number;
  height?: number;
}

// Curated high-reliability fallback GIF collection organized by popular reactions
const FALLBACK_GIFS: GifItem[] = [
  // Trending & Vibes
  {
    id: "vibe-cat",
    title: "Vibing Cat",
    url: "https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif",
    previewUrl: "https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/200w.gif",
  },
  {
    id: "groove-dance",
    title: "Grooving",
    url: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif",
    previewUrl: "https://media.giphy.com/media/blSTtZehjAZ8I/200w.gif",
  },
  {
    id: "chill-wave",
    title: "Chill Waves",
    url: "https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif",
    previewUrl: "https://media.giphy.com/media/l41lI4bYmcsPJX9Go/200w.gif",
  },
  {
    id: "leonardo-cheers",
    title: "Cheers Vibe",
    url: "https://media.giphy.com/media/GCLlQnV7dXZ2E/giphy.gif",
    previewUrl: "https://media.giphy.com/media/GCLlQnV7dXZ2E/200w.gif",
  },

  // Laugh & Funny
  {
    id: "laugh-haha",
    title: "Laughing Hard",
    url: "https://media.giphy.com/media/lszAB3TzFtDxm/giphy.gif",
    previewUrl: "https://media.giphy.com/media/lszAB3TzFtDxm/200w.gif",
  },
  {
    id: "laugh-crying",
    title: "Can't Stop Laughing",
    url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif",
    previewUrl: "https://media.giphy.com/media/10JhviFuU2gWD6/200w.gif",
  },
  {
    id: "laugh-snicker",
    title: "Giggle",
    url: "https://media.giphy.com/media/9MFsKQ8A6HCN2/giphy.gif",
    previewUrl: "https://media.giphy.com/media/9MFsKQ8A6HCN2/200w.gif",
  },
  {
    id: "laugh-office",
    title: "Michael Scott Laugh",
    url: "https://media.giphy.com/media/BY8ORoRpnGdzG/giphy.gif",
    previewUrl: "https://media.giphy.com/media/BY8ORoRpnGdzG/200w.gif",
  },

  // Love & Wholesome
  {
    id: "love-hearts",
    title: "Heart Eyes",
    url: "https://media.giphy.com/media/R6gVNROjBy4UM/giphy.gif",
    previewUrl: "https://media.giphy.com/media/R6gVNROjBy4UM/200w.gif",
  },
  {
    id: "love-hug",
    title: "Big Hug",
    url: "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
    previewUrl: "https://media.giphy.com/media/od5H3PmEG5EVq/200w.gif",
  },
  {
    id: "love-cute",
    title: "Cute Heart",
    url: "https://media.giphy.com/media/uw0KqTWZSm8gg/giphy.gif",
    previewUrl: "https://media.giphy.com/media/uw0KqTWZSm8gg/200w.gif",
  },

  // Party & Celebration
  {
    id: "party-confetti",
    title: "Party Time",
    url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
    previewUrl: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/200w.gif",
  },
  {
    id: "party-celebrate",
    title: "Celebrate",
    url: "https://media.giphy.com/media/3KC2jD2Q38SfS/giphy.gif",
    previewUrl: "https://media.giphy.com/media/3KC2jD2Q38SfS/200w.gif",
  },
  {
    id: "party-disco",
    title: "Disco Dance",
    url: "https://media.giphy.com/media/l2JIdnF6aJXAByLP2/giphy.gif",
    previewUrl: "https://media.giphy.com/media/l2JIdnF6aJXAByLP2/200w.gif",
  },

  // Shock & Surprised
  {
    id: "shock-mindblown",
    title: "Mind Blown",
    url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    previewUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/200w.gif",
  },
  {
    id: "shock-gasp",
    title: "Gasp",
    url: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
    previewUrl: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/200w.gif",
  },
  {
    id: "shock-pikachu",
    title: "Surprised Pikachu",
    url: "https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif",
    previewUrl: "https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/200w.gif",
  },

  // Applause & Clapping
  {
    id: "clap-standing",
    title: "Standing Ovation",
    url: "https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif",
    previewUrl: "https://media.giphy.com/media/7rj2ZgttvgomY/200w.gif",
  },
  {
    id: "clap-applause",
    title: "Clapping Hands",
    url: "https://media.giphy.com/media/nbvFVPiEiJH6JOGIok/giphy.gif",
    previewUrl: "https://media.giphy.com/media/nbvFVPiEiJH6JOGIok/200w.gif",
  },
  {
    id: "clap-leonardo",
    title: "Great Job",
    url: "https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif",
    previewUrl: "https://media.giphy.com/media/unQ3IJU2RG7DO/200w.gif",
  },

  // Dance & Happy
  {
    id: "dance-snoopy",
    title: "Snoopy Dance",
    url: "https://media.giphy.com/media/oXnN2TsfLRde8/giphy.gif",
    previewUrl: "https://media.giphy.com/media/oXnN2TsfLRde8/200w.gif",
  },
  {
    id: "dance-happy",
    title: "Happy Dance",
    url: "https://media.giphy.com/media/DhstvI3CH03DO/giphy.gif",
    previewUrl: "https://media.giphy.com/media/DhstvI3CH03DO/200w.gif",
  },
  {
    id: "dance-carlton",
    title: "Carlton Dance",
    url: "https://media.giphy.com/media/pa37AAGzKXoek/giphy.gif",
    previewUrl: "https://media.giphy.com/media/pa37AAGzKXoek/200w.gif",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = Math.min(parseInt(searchParams.get("per_page") || "24", 10), 50);

  const klipyApiKey =
    process.env.KLIPY_API_KEY ||
    process.env.NEXT_PUBLIC_KLIPY_API_KEY;

  if (klipyApiKey) {
    try {
      const endpoint = q
        ? `https://api.klipy.com/api/v1/${klipyApiKey}/gifs/search?q=${encodeURIComponent(
            q
          )}&page=${page}&per_page=${perPage}`
        : `https://api.klipy.com/api/v1/${klipyApiKey}/gifs/trending?page=${page}&per_page=${perPage}`;

      const res = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const json = await res.json();
        const rawItems = json.data || json.results || json.gifs || [];

        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const gifs: GifItem[] = rawItems
            .map((raw: unknown, idx: number) => {
              const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
              const media = (item.media && typeof item.media === "object" ? item.media : {}) as Record<string, unknown>;
              const images = (item.images && typeof item.images === "object" ? item.images : {}) as Record<string, unknown>;
              const gifMedia = ((media.gif || images.fixed_height || {}) && typeof (media.gif || images.fixed_height) === "object" ? (media.gif || images.fixed_height) : {}) as Record<string, unknown>;
              const tinyMedia = ((media.tinygif || media.nanogif || images.fixed_height_small || gifMedia) && typeof (media.tinygif || media.nanogif || images.fixed_height_small || gifMedia) === "object" ? (media.tinygif || media.nanogif || images.fixed_height_small || gifMedia) : {}) as Record<string, unknown>;

              const url = (gifMedia.url || item.url || item.gif_url || "") as string;
              const previewUrl = (tinyMedia.url || url) as string;
              const dims = Array.isArray(gifMedia.dims) ? (gifMedia.dims as number[]) : undefined;

              return {
                id: (item.id as string) || `klipy-${idx}`,
                title: (item.title as string) || (item.name as string) || q || "KLIPY GIF",
                url,
                previewUrl,
                width: dims?.[0] || (gifMedia.width as number | undefined),
                height: dims?.[1] || (gifMedia.height as number | undefined),
              };
            })
            .filter((g) => !!g.url);

          if (gifs.length > 0) {
            return NextResponse.json({
              source: "klipy",
              data: gifs,
              page,
              perPage,
            });
          }
        }
      } else {
        console.warn("KLIPY API error:", res.status, await res.text().catch(() => ""));
      }
    } catch (error) {
      console.warn("KLIPY API fetch failed, falling back to curated collection:", error);
    }
  }

  let filtered = FALLBACK_GIFS;
  if (q) {
    const query = q.toLowerCase();
    filtered = FALLBACK_GIFS.filter(
      (g) =>
        g.title.toLowerCase().includes(query) ||
        g.id.toLowerCase().includes(query)
    );
    if (filtered.length === 0) {
      filtered = FALLBACK_GIFS;
    }
  }

  return NextResponse.json({
    source: klipyApiKey ? "klipy-fallback" : "curated",
    data: filtered.slice((page - 1) * perPage, page * perPage),
    page,
    perPage,
    total: filtered.length,
    hasKlipyKey: !!klipyApiKey,
  });
}
