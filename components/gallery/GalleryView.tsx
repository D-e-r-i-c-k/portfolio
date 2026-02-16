"use client";

import { useState, useMemo } from "react";
import { ProtectedImage } from "./ProtectedImage";
import { GalleryLightbox, type LightboxImage } from "./GalleryLightbox";
import { AddToCartButton } from "./AddToCartButton";

export interface GalleryImageItem {
  thumbnailUrl: string;
  previewUrl: string;
  caption?: string;
  alt?: string;
  price?: number;
}

interface GalleryViewProps {
  gallerySlug: string;
  galleryTitle: string;
  images: GalleryImageItem[];
}

export function GalleryView({
  gallerySlug,
  galleryTitle,
  images,
}: GalleryViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      images.map((img, i) => ({
        src: img.previewUrl,
        alt: img.alt ?? img.caption ?? `${galleryTitle} – Photo ${i + 1}`,
        caption: img.caption,
      })),
    [images, galleryTitle]
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (images.length === 0) {
    return (
      <p className="text-muted-foreground">No photos in this gallery yet.</p>
    );
  }

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((item, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <button
              type="button"
              className="block w-full cursor-zoom-in text-left"
              onClick={() => openLightbox(i)}
              aria-label={`View ${item.alt ?? item.caption ?? `Photo ${i + 1}`} full size`}
            >
              <ProtectedImage
                src={item.thumbnailUrl}
                alt={item.alt ?? item.caption ?? `Photo ${i + 1}`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </button>
            <div className="p-4">
              {item.caption && (
                <p className="text-sm text-foreground">{item.caption}</p>
              )}
              <div className="mt-3 flex flex-col gap-2">
                {item.price != null && (
                  <AddToCartButton
                    gallerySlug={gallerySlug}
                    imageIndex={i}
                    title={item.caption ?? `Photo ${i + 1}`}
                    price={item.price}
                    previewImageUrl={item.thumbnailUrl}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <GalleryLightbox
        images={lightboxImages}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        initialIndex={lightboxIndex}
      />
    </>
  );
}
