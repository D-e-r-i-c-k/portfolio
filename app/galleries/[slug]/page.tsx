import { client, hasSanityProject } from "@/lib/sanity/client";
import { galleryBySlugQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GalleryImage {
  image?: { asset?: { _ref: string } };
  caption?: string;
  alt?: string;
  price?: number;
}

interface Gallery {
  _id: string;
  title?: string;
  slug?: { current: string };
  event?: { _id: string; title?: string; slug?: { current: string } } | null;
  images?: GalleryImage[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!hasSanityProject)
    return { title: "Gallery | Photography" };
  const { slug } = await params;
  const gallery = await client.fetch<Gallery | null>(galleryBySlugQuery, {
    slug,
  });
  return {
    title: gallery?.title
      ? `${gallery.title} | Galleries | Photography`
      : "Gallery | Photography",
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasSanityProject) notFound();
  const gallery = await client.fetch<Gallery | null>(galleryBySlugQuery, {
    slug,
  });
  if (!gallery) notFound();

  const images = gallery.images ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/galleries"
        className="mb-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← All galleries
      </Link>
      <header className="mb-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {gallery.title ?? "Untitled gallery"}
        </h1>
        {gallery.event?.slug?.current && (
          <Link
            href={`/events/${gallery.event.slug.current}`}
            className="mt-2 inline-block text-muted-foreground hover:underline"
          >
            Event: {gallery.event.title ?? "Untitled"}
          </Link>
        )}
      </header>
      {images.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((item, i) => (
            <li key={i} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                {item.image?.asset && (
                  <Image
                    src={urlFor(item.image, { w: 800, q: 80 })}
                    alt={item.alt ?? item.caption ?? `Photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
              </div>
              <div className="p-3">
                {item.caption && (
                  <p className="text-sm text-foreground">{item.caption}</p>
                )}
                {item.price != null && (
                  <p className="mt-1 text-sm font-medium text-foreground">
                    R {item.price}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No photos in this gallery yet.</p>
      )}
    </div>
  );
}
