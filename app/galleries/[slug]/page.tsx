import { client, hasSanityProject } from "@/lib/sanity/client";
import { galleryBySlugQuery } from "@/lib/sanity/queries";
import { thumbnailUrlFor, previewUrlFor } from "@/lib/sanity/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryView } from "@/components/gallery/GalleryView";

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
  defaultPrice?: number;
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

  const defaultPrice = gallery.defaultPrice;

  const images = (gallery.images ?? []).map((item) => ({
    thumbnailUrl: item.image?.asset ? thumbnailUrlFor(item.image) : "",
    previewUrl: item.image?.asset ? previewUrlFor(item.image) : "",
    caption: item.caption,
    alt: item.alt,
    price: item.price ?? defaultPrice,
  })).filter((img) => img.thumbnailUrl);

  return (
    <div className="animate-fade-in-up mx-auto max-w-6xl px-6 py-12">
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
      <GalleryView
        gallerySlug={slug}
        galleryTitle={gallery.title ?? "Gallery"}
        images={images}
      />
    </div>
  );
}
