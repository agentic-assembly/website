import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const assemblies = defineCollection({
  loader: glob({
    pattern: "*/index.{md,mdx}",
    base: "./src/content/assemblies",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      location: z.string().optional(),
      summary: z.string().optional(),
      references: z
        .array(
          z.object({
            title: z.string(),
            url: z.url(),
          }),
        )
        .optional(),
      highlights: z
        .array(
          z
            .object({
              id: z.string(),
              label: z.string(),
              href: z.url().optional(),
              asset: z.string().optional(),
            })
            .refine((h) => Boolean(h.href) !== Boolean(h.asset), {
              message: "Highlight must have exactly one of 'href' or 'asset'",
            }),
        )
        .optional(),
    })
    .strict(),
});

export const collections = { assemblies };
