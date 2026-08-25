import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://loungechat.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/auth`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/premium`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/safety`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/community`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
