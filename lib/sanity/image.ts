import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "./client";

const builder = createImageUrlBuilder(client);

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
  return b.url();
}

/** Preview-only: max 1200px, 80% quality (for protected gallery display before watermark is added). */
export function previewUrlFor(source: SanityImageSource): string {
  return urlFor(source, { w: 1200, q: 80, fit: "max" });
}
