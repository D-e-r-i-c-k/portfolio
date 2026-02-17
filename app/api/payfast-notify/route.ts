import { NextRequest, NextResponse } from "next/server";
import { validateITNSignature } from "@/lib/payfast";

/**
 * POST /api/payfast-notify
 *
 * PayFast sends an Instant Transaction Notification (ITN) here
 * after a payment is completed (or fails).
 *
 * This endpoint:
 * 1. Parses the URL-encoded form body
 * 2. Validates the signature
 * 3. Checks the payment status
 * 4. Logs the result (order storage / download delivery is a future step)
 */
export async function POST(request: NextRequest) {
    try {
        const text = await request.text();
        const params = new URLSearchParams(text);
        const body: Record<string, string> = {};
        params.forEach((value, key) => {
            body[key] = value;
        });

        // Validate signature
        const isValid = validateITNSignature(body);
        if (!isValid) {
            console.error("[PayFast ITN] Invalid signature", body);
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        const paymentStatus = body.payment_status;
        const paymentId = body.m_payment_id;
        const amount = body.amount_gross;

        console.log(
            `[PayFast ITN] Payment ${paymentId}: status=${paymentStatus}, amount=R${amount}`
        );

        if (paymentStatus === "COMPLETE") {
            // TODO: Store order in Sanity or database
            // TODO: Generate signed download URLs for full-res photos
            console.log(`[PayFast ITN] ✅ Payment ${paymentId} completed successfully`);
        } else {
            console.log(`[PayFast ITN] ⚠️ Payment ${paymentId} status: ${paymentStatus}`);
        }

        // PayFast expects a 200 OK response
        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[PayFast ITN] Error processing notification:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
