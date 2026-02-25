import { NextRequest, NextResponse } from "next/server";
import { decryptUrl } from "@/lib/obfuscate";

/**
 * GET /api/image-proxy/[q]
 *
 * Proxies an encrypted Sanity CDN URL to hide the original asset ID from the client.
 * This prevents users from removing the ?w=800 parameters and downloading the full-rs
 * unwatermarked images without paying.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ q: string }> }) {
    const { q } = await params;

    if (!q) {
        return new NextResponse("Missing query", { status: 400 });
    }

    const decryptedUrl = decryptUrl(q);

    if (!decryptedUrl || !decryptedUrl.startsWith("https://cdn.sanity.io/images/")) {
        return new NextResponse("Forbidden or invalid URL", { status: 403 });
    }

    try {
        const res = await fetch(decryptedUrl);

        if (!res.ok) {
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        // Forward the image buffer and caching headers
        const arrayBuffer = await res.arrayBuffer();

        const headers = new Headers();
        headers.set("Content-Type", res.headers.get("Content-Type") || "image/jpeg");
        // Instruct browsers and CDN to cache this aggressively since the URL includes the crop/width params securely
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(arrayBuffer, { headers });
    } catch (err) {
        console.error("[Image Proxy] Error fetching image:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
