import Image from "next/image";
import Link from "next/link";
import { client, hasSanityProject } from "@/lib/sanity/client";
import {
  siteConfigQuery,
  upcomingEventsQuery,
  recentGalleriesQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { SiteConfig, UpcomingEvent, RecentGallery } from "@/lib/sanity/types";

async function getHomeData() {
  if (!hasSanityProject) {
    return {
      siteConfig: null,
      upcomingEvents: [] as UpcomingEvent[],
      recentGalleries: [] as RecentGallery[],
    };
  }
  try {
    const [siteConfig, upcomingEvents, recentGalleries] = await Promise.all([
      client.fetch<SiteConfig | null>(siteConfigQuery),
      client.fetch<UpcomingEvent[]>(upcomingEventsQuery),
      client.fetch<RecentGallery[]>(recentGalleriesQuery),
    ]);
    return { siteConfig, upcomingEvents, recentGalleries };
  } catch {
    return {
      siteConfig: null,
      upcomingEvents: [] as UpcomingEvent[],
      recentGalleries: [] as RecentGallery[],
    };
  }
}

export default async function HomePage() {
  const { siteConfig, upcomingEvents, recentGalleries } = await getHomeData();
  const featuredGallery = siteConfig?.featuredGallery;
  const heroImage = siteConfig?.heroImage;
  const heroHeadline = siteConfig?.heroHeadline ?? "Moments worth keeping.";
  const heroSubheadline =
    siteConfig?.heroSubheadline ??
    "Events, galleries, and high-quality prints. South Africa.";

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[70vh] w-full overflow-hidden bg-foreground">
        {heroImage?.asset && (
          <Image
            src={urlFor(heroImage, { w: 1920, q: 85 })}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        )}
        {heroImage?.asset && (
          <div className="absolute inset-0 bg-foreground/40" />
        )}
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            {heroHeadline}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90 drop-shadow-md sm:text-xl">
            {heroSubheadline}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/galleries"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-foreground transition-colors hover:bg-white/90"
            >
              View galleries
            </Link>
            <Link
              href="/events"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/80 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Upcoming events
            </Link>
          </div>
        </div>
      </section>

      {/* Featured gallery */}
      {featuredGallery?.slug?.current && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display mb-10 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Featured gallery
          </h2>
          <Link
            href={`/galleries/${featuredGallery.slug.current}`}
            className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="aspect-[16/10] relative overflow-hidden bg-muted">
              {featuredGallery.coverImage?.asset && (
                <Image
                  src={urlFor(featuredGallery.coverImage, { w: 1200, q: 80 })}
                  alt={featuredGallery.title ?? "Featured gallery"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              )}
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold text-foreground group-hover:underline">
                {featuredGallery.title}
              </h3>
              {featuredGallery.imageCount != null && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {featuredGallery.imageCount} photo
                  {featuredGallery.imageCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </Link>
        </section>
      )}

      {/* Next 3 events */}
      <section className="border-t border-border/60 bg-muted/20 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display mb-10 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Upcoming events
          </h2>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No upcoming events at the moment. Check back soon.
            </p>
          )}
          <div className="mt-10">
            <Link
              href="/events"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View all events →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent galleries */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display mb-10 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Recent galleries
        </h2>
        {recentGalleries && recentGalleries.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentGalleries.map((gallery) => (
              <GalleryCard key={gallery._id} gallery={gallery} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No galleries yet. Add content in Sanity Studio.
          </p>
        )}
        <div className="mt-10">
          <Link
            href="/galleries"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all galleries →
          </Link>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }: { event: UpcomingEvent }) {
  const slug = event.slug?.current;
  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

  const content = (
    <>
      <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg bg-muted">
        {event.coverImage?.asset && (
          <Image
            src={urlFor(event.coverImage, { w: 600, q: 80 })}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground">
          {event.title ?? "Untitled event"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{dateStr}</p>
        {event.venue && (
          <p className="mt-0.5 text-sm text-muted-foreground">{event.venue}</p>
        )}
      </div>
    </>
  );

  if (slug) {
    return (
      <Link
        href={`/events/${slug}`}
        className="block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        {content}
      </Link>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {content}
    </div>
  );
}

function GalleryCard({ gallery }: { gallery: RecentGallery }) {
  const slug = gallery.slug?.current;
  const content = (
    <>
      <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg bg-muted">
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
        <h3 className="font-display font-semibold text-foreground">
          {gallery.title ?? "Untitled gallery"}
        </h3>
        {gallery.event?.title && (
          <p className="mt-1 text-sm text-muted-foreground">
            {gallery.event.title}
          </p>
        )}
        {gallery.imageCount != null && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {gallery.imageCount} photo{gallery.imageCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </>
  );

  if (slug) {
    return (
      <Link
        href={`/galleries/${slug}`}
        className="block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        {content}
      </Link>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {content}
    </div>
  );
}
