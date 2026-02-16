import { defineArrayMember, defineField, defineType } from "sanity";

export const galleryType = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "event",
      title: "Event",
      type: "reference",
      to: [{ type: "event" }],
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "defaultPrice",
      title: "Default price per photo (ZAR)",
      type: "number",
      description: "Applied to all photos unless overridden on an individual image.",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
            metadata: ["blurhash", "lqip", "palette"],
          },
          fields: [
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
            {
              name: "alt",
              type: "string",
              title: "Alt text (accessibility)",
            },
            {
              name: "price",
              type: "number",
              title: "Price (ZAR)",
              description:
                "Optional — overrides the gallery default price for this specific photo.",
            },
          ],
        }),
      ],
    }),
  ],
  orderings: [
    { title: "Title A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
    { title: "Title Z–A", name: "titleDesc", by: [{ field: "title", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", event: "event.title", media: "images.0" },
    prepare({ title, event, media }) {
      return {
        title: title || "Untitled gallery",
        subtitle: event ? `Event: ${event}` : "",
        media,
      };
    },
  },
});
