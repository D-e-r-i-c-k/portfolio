import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buildPaymentData } from "@/lib/payfast";

interface CheckoutItem {
    title: string;
    price: number;
}

interface CheckoutBody {
    items: CheckoutItem[];
}

/**
 * POST /api/checkout
 *
 * Receives cart items from the frontend, builds the PayFast form data
 * (with signature), and returns it so the client can auto-submit.
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

        // Validate items
        for (const item of body.items) {
            if (!item.title || typeof item.price !== "number" || item.price <= 0) {
                return NextResponse.json(
                    { error: "Invalid item in cart" },
                    { status: 400 }
                );
            }
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const paymentId = randomUUID();

        const paymentData = buildPaymentData(
            paymentId,
            body.items,
            `${siteUrl}/checkout/success`,
            `${siteUrl}/checkout/cancel`,
            `${siteUrl}/api/payfast-notify`
        );

        return NextResponse.json(paymentData);
    } catch {
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
