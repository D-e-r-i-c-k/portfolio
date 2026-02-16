import type { MetadataRoute } from "next";
import { client, hasSanityProject } from "@/lib/sanity/client";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://photography.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_URL}/galleries`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ];

    if (!hasSanityProject) return staticRoutes;

    const [events, galleries] = await Promise.all([
        client.fetch<{ slug: { current: string }; _updatedAt: string }[]>(
            `*[_type == "event"] { slug, _updatedAt }`
        ),
        client.fetch<{ slug: { current: string }; _updatedAt: string }[]>(
            `*[_type == "gallery"] { slug, _updatedAt }`
        ),
    ]);

    const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
        url: `${SITE_URL}/events/${e.slug.current}`,
        lastModified: new Date(e._updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    const galleryRoutes: MetadataRoute.Sitemap = galleries.map((g) => ({
        url: `${SITE_URL}/galleries/${g.slug.current}`,
        lastModified: new Date(g._updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...eventRoutes, ...galleryRoutes];
}
