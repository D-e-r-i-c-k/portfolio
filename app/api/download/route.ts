import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import archiver from "archiver";

/**
 * GET /api/download?token=xxx
 *
 * Validates the download token, fetches full-resolution images
 * from Sanity CDN, bundles them into a ZIP, and streams the result.
 */
export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
        return NextResponse.json(
            { error: "Missing download token" },
            { status: 400 }
        );
    }

    let payload;
    try {
        payload = verifyDownloadToken(token);
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Invalid token";
        return NextResponse.json({ error: message }, { status: 403 });
    }

    // Build full-res Sanity CDN URLs from asset refs
    // Sanity ref format: "image-<id>-<WxH>-<ext>"
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

    const imageUrls = payload.assets.map((asset) => {
        // Parse ref: "image-abcdef123-1920x1080-jpg" → id + ext
        const parts = asset.ref.replace("image-", "").split("-");
        const ext = parts.pop(); // "jpg"
        const id = parts.join("-"); // everything before the extension
        return {
            url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}.${ext}`,
            filename: `${asset.title.replace(/[^a-zA-Z0-9 _-]/g, "")}.${ext}`,
        };
    });

    // Create a streaming ZIP archive
    const archive = archiver("zip", { zlib: { level: 5 } });

    // Fetch all images in parallel and append to archive
    const fetchPromises = imageUrls.map(async ({ url, filename }, i) => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`[Download] Failed to fetch image ${i}: ${res.status}`);
                return;
            }
            const buffer = Buffer.from(await res.arrayBuffer());
            archive.append(buffer, { name: filename });
        } catch (err) {
            console.error(`[Download] Error fetching image ${i}:`, err);
        }
    });

    await Promise.all(fetchPromises);
    archive.finalize();

    // Convert archiver's Node stream to a Web ReadableStream
    const readable = new ReadableStream({
        start(controller) {
            archive.on("data", (chunk: Buffer) => {
                controller.enqueue(new Uint8Array(chunk));
            });
            archive.on("end", () => {
                controller.close();
            });
            archive.on("error", (err) => {
                console.error("[Download] Archive error:", err);
                controller.error(err);
            });
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="photos.zip"`,
            "Cache-Control": "no-store",
        },
    });
}
