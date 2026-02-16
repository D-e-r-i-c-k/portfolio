"use client";

import Image from "next/image";
import { useCallback } from "react";

interface ProtectedCoverImageProps {
    src: string;
    alt?: string;
    sizes?: string;
    priority?: boolean;
    className?: string;
    containerClassName?: string;
}

/**
 * Client component wrapper for cover images that prevents right-click, drag, and saving.
 * Use this for event/gallery cover images in Server Component pages.
 */
export function ProtectedCoverImage({
    src,
    alt = "",
    sizes,
    priority,
    className = "object-cover",
    containerClassName = "",
}: ProtectedCoverImageProps) {
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    return (
        <div
            className={`relative select-none overflow-hidden ${containerClassName}`}
            onContextMenu={handleContextMenu}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className={`pointer-events-none ${className}`}
                sizes={sizes}
                priority={priority}
                draggable={false}
                style={{ userSelect: "none" }}
            />
        </div>
    );
}
