import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyDownloadToken } from "@/lib/download-token";

/**
 * POST /api/send-download-email
 *
 * Validates the download token, extracts the buyer email,
 * and sends a download link via Resend.
 */
export async function POST(request: NextRequest) {
    try {
        const { token } = (await request.json()) as { token: string };

        if (!token) {
            return NextResponse.json(
                { error: "Missing token" },
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

        const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const downloadUrl = `${siteUrl}/api/download?token=${encodeURIComponent(token)}`;

        const photoCount = payload.assets.length;
        const photoLabel = photoCount === 1 ? "1 photo" : `${photoCount} photos`;

        const expiryDate = new Date(payload.exp).toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error } = await resend.emails.send({
            from: "Photos <noreply@resend.dev>",
            to: payload.email,
            subject: `Your ${photoLabel} — Download Ready`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
                        Your photos are ready! 📸
                    </h1>
                    <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                        Thank you for your purchase. Your ${photoLabel} ${photoCount === 1 ? "is" : "are"}
                        ready to download at full resolution.
                    </p>
                    <div style="margin: 32px 0; text-align: center;">
                        <a href="${downloadUrl}"
                           style="display: inline-block; background: #1a1a1a; color: #ffffff;
                                  padding: 14px 32px; border-radius: 8px; text-decoration: none;
                                  font-size: 16px; font-weight: 600;">
                            Download Photos
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #8a8a8a; line-height: 1.6;">
                        This link expires on <strong>${expiryDate}</strong>.
                        Please download your photos before then.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;" />
                    <p style="font-size: 12px; color: #aaa;">
                        If the button doesn't work, copy and paste this link into your browser:<br />
                        <a href="${downloadUrl}" style="color: #666; word-break: break-all;">${downloadUrl}</a>
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("[Email] Failed to send:", error);
            return NextResponse.json(
                { error: "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({ sent: true });
    } catch (error) {
        console.error("[Email] Error:", error);
        return NextResponse.json(
            { error: "Internal error" },
            { status: 500 }
        );
    }
}
