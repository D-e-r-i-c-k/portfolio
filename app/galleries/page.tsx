import { client, hasSanityProject } from "@/lib/sanity/client";
import { allGalleriesQuery } from "@/lib/sanity/queries";
import type { RecentGallery } from "@/lib/sanity/types";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";

export const metadata = {
  title: "Galleries | Photography",
  description: "Browse photo galleries from events and sessions.",
};

export default async function GalleriesPage() {
  const galleries =
    hasSanityProject ?
      await client.fetch<RecentGallery[]>(allGalleriesQuery)
      : ([] as RecentGallery[]);

  return (
    <div className="animate-fade-in-up mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display mb-10 text-3xl font-semibold tracking-tight text-foreground">
        Galleries
      </h1>
      {galleries && galleries.length > 0 ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => {
            const slug = gallery.slug?.current;
            return (
              <li key={gallery._id}>
                {slug ? (
                  <Link
                    href={`/galleries/${slug}`}
                    className="hover-lift block overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      {gallery.coverImage?.asset && (
                        <Image
                          src={urlFor(gallery.coverImage, { w: 600, q: 80 })}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-display font-semibold text-foreground">
                        {gallery.title ?? "Untitled gallery"}
                      </h2>
                      {gallery.event?.title && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {gallery.event.title}
                        </p>
                      )}
                      {gallery.imageCount != null && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {gallery.imageCount} photo
                          {gallery.imageCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="hover-lift overflow-hidden rounded-lg border border-border bg-card">
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      {gallery.coverImage?.asset && (
                        <Image
                          src={urlFor(gallery.coverImage, { w: 600, q: 80 })}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-display font-semibold text-foreground">
                        {gallery.title ?? "Untitled gallery"}
                      </h2>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground">
          No galleries yet. Add galleries in Sanity Studio.
        </p>
      )}
    </div>
  );
}
