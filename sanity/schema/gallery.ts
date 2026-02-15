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
      name: "images",
      title: "Images",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "galleryImage",
          fields: [
            { name: "image", type: "image", title: "Image", options: { hotspot: true } },
            { name: "caption", type: "string", title: "Caption" },
            { name: "alt", type: "string", title: "Alt text (accessibility)" },
            {
              name: "price",
              type: "number",
              title: "Price (ZAR)",
              description: "Selling price for this photo",
            },
          ],
          preview: {
            select: { media: "image", caption: "caption" },
            prepare({ media, caption }) {
              return {
                title: caption || "Image",
                media,
              };
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    { title: "Title A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
    { title: "Title Z–A", name: "titleDesc", by: [{ field: "title", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", event: "event.title", media: "images.0.image" },
    prepare({ title, event, media }) {
      return {
        title: title || "Untitled gallery",
        subtitle: event ? `Event: ${event}` : "",
        media,
      };
    },
  },
});
