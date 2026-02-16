import { client, hasSanityProject } from "@/lib/sanity/client";
import { allEventsQuery } from "@/lib/sanity/queries";
import type { UpcomingEvent } from "@/lib/sanity/types";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";

export const metadata = {
  title: "Events | Photography",
  description: "Upcoming and past photography events.",
};

export default async function EventsPage() {
  const events =
    hasSanityProject ?
      await client.fetch<UpcomingEvent[]>(allEventsQuery)
      : ([] as UpcomingEvent[]);

  return (
    <div className="animate-fade-in-up mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display mb-10 text-3xl font-semibold tracking-tight text-foreground">
        Events
      </h1>
      {events && events.length > 0 ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const slug = event.slug?.current;
            const dateStr = event.date
              ? new Date(event.date).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              : "";
            return (
              <li key={event._id}>
                {slug ? (
                  <Link
                    href={`/events/${slug}`}
                    className="hover-lift block overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
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
                      <h2 className="font-display font-semibold text-foreground">
                        {event.title ?? "Untitled event"}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {dateStr}
                      </p>
                      {event.venue && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {event.venue}
                        </p>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="hover-lift overflow-hidden rounded-lg border border-border bg-card">
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      {event.coverImage?.asset && (
                        <Image
                          src={urlFor(event.coverImage, { w: 600, q: 80 })}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-display font-semibold text-foreground">
                        {event.title ?? "Untitled event"}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {dateStr}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground">
          No events yet. Add events in Sanity Studio.
        </p>
      )}
    </div>
  );
}
