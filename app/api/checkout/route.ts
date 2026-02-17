import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buildPaymentData } from "@/lib/payfast";
import { createDownloadToken } from "@/lib/download-token";
import { client } from "@/lib/sanity/client";
import { galleryBySlugQuery } from "@/lib/sanity/queries";

interface CheckoutItem {
    gallerySlug: string;
    imageIndex: number;
    title: string;
    price: number;
}

interface CheckoutBody {
    items: CheckoutItem[];
    email: string;
}

interface SanityGallery {
    images?: { asset?: { _ref: string } }[];
}

/**
 * POST /api/checkout
 *
 * Receives cart items + buyer email, resolves Sanity asset refs,
 * generates a download token (JWT), builds PayFast form data,
 * and returns it for auto-submit.
 */
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as CheckoutBody;

        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json(
                { error: "Cart is empty" },
                { status: 400 }
            );
        }

        if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
            return NextResponse.json(
                { error: "Valid email address is required" },
                { status: 400 }
            );
        }

        // Validate items
        for (const item of body.items) {
            if (!item.title || typeof item.price !== "number" || item.price <= 0) {
                return NextResponse.json(
                    { error: "Invalid item in cart" },
                    { status: 400 }
                );
            }
        }

        // Resolve Sanity asset refs from gallery slugs + image indices
        // Group items by gallery to minimize queries
        const gallerySlugs = [...new Set(body.items.map((i) => i.gallerySlug))];
        const galleryCache = new Map<string, SanityGallery>();

        for (const slug of gallerySlugs) {
            const gallery = await client.fetch<SanityGallery | null>(
                galleryBySlugQuery,
                { slug }
            );
            if (gallery) galleryCache.set(slug, gallery);
        }

        // Build asset list for the download token
        const assets: { ref: string; title: string }[] = [];
        for (const item of body.items) {
            const gallery = galleryCache.get(item.gallerySlug);
            const image = gallery?.images?.[item.imageIndex];
            const ref = image?.asset?._ref;
            if (!ref) {
                return NextResponse.json(
                    { error: `Image not found: ${item.title}` },
                    { status: 400 }
                );
            }
            assets.push({ ref, title: item.title });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const paymentId = randomUUID();

        // Generate download token (72h expiry)
        const downloadToken = createDownloadToken(
            assets,
            body.email,
            paymentId
        );

        const paymentData = buildPaymentData(
            paymentId,
            body.items,
            `${siteUrl}/checkout/success?token=${encodeURIComponent(downloadToken)}`,
            `${siteUrl}/checkout/cancel`,
            `${siteUrl}/api/payfast-notify`,
            body.email
        );

        return NextResponse.json(paymentData);
    } catch {
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
