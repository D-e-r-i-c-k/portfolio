import { client, hasSanityProject } from "@/lib/sanity/client";
import { eventBySlugQuery } from "@/lib/sanity/queries";
import type { UpcomingEvent } from "@/lib/sanity/types";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!hasSanityProject)
    return { title: "Event | Photography" };
  const { slug } = await params;
  const event = await client.fetch<UpcomingEvent | null>(eventBySlugQuery, {
    slug,
  });
  return {
    title: event?.title ? `${event.title} | Events | Photography` : "Event | Photography",
    description: event?.description ?? undefined,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasSanityProject) notFound();
  const event = await client.fetch<UpcomingEvent | null>(eventBySlugQuery, {
    slug,
  });
  if (!event) notFound();

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString("en-ZA", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const gallerySlug = event.gallery?.slug?.current;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/events"
        className="mb-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← All events
      </Link>
      <article>
        {event.coverImage?.asset && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
            <Image
              src={urlFor(event.coverImage, { w: 1200, q: 85 })}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}
        <header className="mt-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {event.title ?? "Untitled event"}
          </h1>
          {dateStr && (
            <p className="mt-2 text-lg text-muted-foreground">{dateStr}</p>
          )}
          {event.venue && (
            <p className="mt-1 text-muted-foreground">{event.venue}</p>
          )}
        </header>
        {event.description && (
          <div className="mt-6 text-foreground/90">{event.description}</div>
        )}
        {gallerySlug && (
          <div className="mt-10">
            <Link
              href={`/galleries/${gallerySlug}`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View gallery
            </Link>
          </div>
        )}
      </article>
    </div>
  );
}
