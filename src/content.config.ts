import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const publications = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    venue: z.string().optional(),
    year: z.number().int(),
    field: z.enum(["clinical", "physics"]),
    status: z.enum(["published", "in-prep"]),
    doi: z.url().optional(),
    pdf: z.string().optional(),
    code: z.url().optional(),
    bibtex: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/essays" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    legacyUrl: z.string().optional(),
  }),
});

export const collections = { publications, essays };
