import crypto from "crypto";

/* ------------------------------------------------------------------ */
/*  PayFast configuration                                             */
/* ------------------------------------------------------------------ */

const SANDBOX_HOST = "sandbox.payfast.co.za";
const PRODUCTION_HOST = "www.payfast.co.za";

/** Use sandbox when merchant_id is one of the well-known test values. */
function isSandbox(): boolean {
    const id = process.env.PAYFAST_MERCHANT_ID ?? "";
    return id === "10000100" || id === "10004002";
}

export function getPayFastUrl(): string {
    return `https://${isSandbox() ? SANDBOX_HOST : PRODUCTION_HOST}/eng/process`;
}

/* ------------------------------------------------------------------ */
/*  Signature generation                                              */
/* ------------------------------------------------------------------ */

/**
 * PayFast-specific URL encoding:
 * - Trim whitespace
 * - Spaces → "+"
 * - Uppercase hex escapes (%XX)
 */
function pfUrlEncode(value: string): string {
    return encodeURIComponent(value.trim())
        .replace(/%20/g, "+")
        .replace(/%[0-9a-f]{2}/gi, (match) => match.toUpperCase());
}

/**
 * Build the MD5 signature that PayFast expects.
 *
 * From the PayFast docs:
 * 1. Take all the submitted variables and create a "parameter string"
 *    by concatenating key=urlencode(value) pairs in the DOCUMENTED ORDER
 *    (not alphabetical), separated by "&".
 * 2. If a passphrase is set, append "&passphrase=urlencode(passphrase)".
 * 3. MD5 hash the result.
 *
 * The signature is NOT included as a field in the hash computation.
 */
export function generateSignature(
    data: Record<string, string>,
    passphrase?: string
): string {
    // Build the param string from ordered entries (skip blanks)
    const paramString = Object.entries(data)
        .filter(([, v]) => v !== "" && v !== undefined)
        .map(([k, v]) => `${k}=${pfUrlEncode(v)}`)
        .join("&");

    const withPassphrase =
        passphrase ? `${paramString}&passphrase=${pfUrlEncode(passphrase)}` : paramString;

    return crypto.createHash("md5").update(withPassphrase).digest("hex");
}

/* ------------------------------------------------------------------ */
/*  Build payment form data                                           */
/* ------------------------------------------------------------------ */

export interface PaymentItem {
    title: string;
    price: number;
}

export interface PaymentFormData {
    /** The complete set of form fields (including signature). Raw values — browser handles encoding. */
    fields: Record<string, string>;
    /** The PayFast URL to POST the form to. */
    actionUrl: string;
}

/**
 * Build the full set of form fields for a PayFast payment.
 *
 * Field order follows the PayFast documentation:
 *   1. Merchant details (merchant_id, merchant_key)
 *   2. URLs (return_url, cancel_url, notify_url)
 *   3. Buyer details (optional — omitted here)
 *   4. Transaction details (m_payment_id, amount, item_name)
 *
 * @param paymentId - Unique reference for this payment (e.g. UUID).
 * @param items     - Cart items (title + price in ZAR).
 * @param returnUrl - Where to redirect after success.
 * @param cancelUrl - Where to redirect if cancelled.
 * @param notifyUrl - Webhook URL for ITN.
 */
export function buildPaymentData(
    paymentId: string,
    items: PaymentItem[],
    returnUrl: string,
    cancelUrl: string,
    notifyUrl: string
): PaymentFormData {
    const merchantId = process.env.PAYFAST_MERCHANT_ID ?? "";
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? "";
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    const total = items.reduce((sum, item) => sum + item.price, 0);
    const itemName =
        items.length === 1
            ? items[0].title
            : `${items.length} photos`;

    // Field order matters for PayFast signature — follow their documented order
    const data: Record<string, string> = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        m_payment_id: paymentId,
        amount: total.toFixed(2),
        item_name: itemName,
    };

    // Generate signature from these fields (passphrase only if it's non-empty)
    const signature = generateSignature(data, passphrase || undefined);

    // Return raw values — the hidden form submission handles encoding
    return {
        fields: { ...data, signature },
        actionUrl: getPayFastUrl(),
    };
}

/* ------------------------------------------------------------------ */
/*  ITN (Instant Transaction Notification) validation                 */
/* ------------------------------------------------------------------ */

/**
 * Validate an incoming ITN from PayFast.
 * Returns true if the signature is valid.
 */
export function validateITNSignature(
    body: Record<string, string>
): boolean {
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    // Rebuild the param string from all fields EXCEPT "signature"
    const { signature: receivedSig, ...rest } = body;

    const paramString = Object.entries(rest)
        .filter(([, v]) => v !== "" && v !== undefined)
        .map(([k, v]) => `${k}=${pfUrlEncode(v)}`)
        .join("&");

    const withPassphrase =
        passphrase ? `${paramString}&passphrase=${pfUrlEncode(passphrase)}` : paramString;

    const expectedSig = crypto.createHash("md5").update(withPassphrase).digest("hex");

    return expectedSig === receivedSig;
}
