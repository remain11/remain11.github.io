import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const noteSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
});

const tech = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tech' }),
  schema: noteSchema,
});

const templates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/templates' }),
  schema: noteSchema,
});

const cpNotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cpNotes' }),
  schema: noteSchema,
});

export const collections = { tech, templates, cpNotes };
