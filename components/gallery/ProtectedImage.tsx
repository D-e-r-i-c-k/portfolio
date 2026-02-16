"use client";

import Image from "next/image";
import { useCallback } from "react";

interface ProtectedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Preview image with watermark overlay and disabled right-click/drag to deter casual saving.
 * Does not prevent screenshots; full-res is only delivered after purchase.
 */
export function ProtectedImage({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
  priority,
}: ProtectedImageProps) {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
        draggable={false}
        onContextMenu={handleContextMenu}
        style={{ userSelect: "none" }}
      />
      {/* Watermark overlay */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
        aria-hidden
      >
        <span
          className="font-display text-lg font-semibold tracking-widest text-white drop-shadow-md"
          style={{
            transform: "rotate(-25deg)",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          PREVIEW
        </span>
      </div>
    </div>
  );
}
