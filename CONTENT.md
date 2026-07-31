# Content guide

The site uses Astro content collections. Adding a publication or essay requires one file
and no template edits. `npm run build` validates every entry against its schema.

## Publications

Create one Markdown file in `src/content/publications/`. The filename becomes the stable
anchor on `/publications/`.

Fields:

- `title`: Complete publication title.
- `authors`: Author list in publication order.
- `venue`: Journal or proceedings citation. Omit for in-preparation work.
- `year`: Four-digit publication year.
- `field`: `clinical` or `physics`.
- `status`: `published` or `in-prep`.
- `doi`: Optional complete `https://doi.org/...` URL.
- `pdf`: Optional local path or complete URL.
- `code`: Optional complete source URL.
- `bibtex`: Optional multiline BibTeX.
- `featured`: `true` only for first-author clinical work used for emphasis.

Template:

```md
---
title: "Complete paper title"
authors:
  - "B. Lerner"
  - "A. Collaborator"
venue: "Journal Name, 12(3), 10–20"
year: 2026
field: clinical
status: published
doi: "https://doi.org/10.0000/example"
pdf: "/papers/example.pdf"
code: "https://github.com/example/repository"
bibtex: |
  @article{Lerner_2026,
    title = {Complete paper title},
    author = {Lerner, Brian and Collaborator, Ada},
    year = {2026}
  }
featured: true
---
```

Omit `doi`, `pdf`, `code`, and `bibtex` when unavailable. Do not add placeholder links.

## Essays

Create one Markdown or MDX file in `src/content/essays/`. The filename becomes the URL:
`example.md` renders at `/writing/example/`.

Fields:

- `title`: Essay title.
- `date`: ISO date (`YYYY-MM-DD`).
- `summary`: One plain sentence used on the index, in metadata, and in RSS.
- `tags`: A list of short tags.
- `draft`: Drafts are excluded from routes, the index, sitemap, and RSS.
- `legacyUrl`: Optional previous URL used during migrations.

Template:

```md
---
title: "Essay title"
date: 2026-07-30
summary: "One sentence describing the essay."
tags:
  - research
draft: false
---

Essay text begins here.
```
