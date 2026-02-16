"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryLightboxProps {
  images: LightboxImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex: number;
}

export function GalleryLightbox({
  images,
  open,
  onOpenChange,
  initialIndex,
}: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, open]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, goPrev, goNext]);

  if (images.length === 0) return null;

  const current = images[index]!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] border-0 bg-black/95 p-0 focus:outline-none">
        <DialogTitle className="sr-only">
          {current.alt || `Image ${index + 1} of ${images.length}`}
        </DialogTitle>
        <div className="relative flex h-[80vh] w-full items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-2 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={goPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <div
            className="relative h-full w-full max-w-5xl select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              className="pointer-events-none object-contain"
              sizes="95vw"
              priority
              draggable={false}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={goNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
        <div className="border-t border-white/20 px-4 py-2 text-center text-sm text-white/90">
          <span>
            {index + 1} / {images.length}
          </span>
          {current.caption && (
            <p className="mt-1 text-white/70">{current.caption}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
