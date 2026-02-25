import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "./client";
import { encryptUrl } from "../obfuscate";

const builder = createImageUrlBuilder(client);

/**
 * Build a proxy URL that securely encrypts the Sanity CDN URL to prevent high-res leakage.
 */
function secureProxyUrl(sanityUrl: string): string {
  // If we're somehow running in a browser context (e.g. client component),
  // we can't encrypt. Return the original to avoid crashing, though we only use this on server.
  if (typeof window !== "undefined") {
    return sanityUrl;
  }
  return `/api/image-proxy/${encryptUrl(sanityUrl)}`;
}

/**
 * Build a Sanity image URL. Use for previews only (max width/quality).
 * For public gallery display, pass options to limit size and quality (e.g. w: 1200, q: 80).
 */
export function urlFor(
  source: SanityImageSource,
  options?: { w?: number; h?: number; q?: number; fit?: "max" | "min" | "fill" | "clip" }
): string {
  let b = builder.image(source);
  if (options?.w) b = b.width(options.w);
  if (options?.h) b = b.height(options.h);
  if (options?.q) b = b.quality(options.q);
  if (options?.fit) b = b.fit(options.fit);
  return secureProxyUrl(b.url());
}

/** Thumbnail for grid cards: 400px, 70% quality — fast loading. */
export function thumbnailUrlFor(source: SanityImageSource): string {
  return urlFor(source, { w: 400, q: 70, fit: "max" });
}

/** Preview for lightbox: 800px, 75% quality — decent quality but not full-res. */
export function previewUrlFor(source: SanityImageSource): string {
  return urlFor(source, { w: 800, q: 75, fit: "max" });
}
