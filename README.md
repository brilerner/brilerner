# brilerner.github.io

Brian Lerner's personal research and writing site. It is built with Astro, TypeScript,
content collections, and plain CSS, then deployed as a static site through GitHub Pages.

## Local development

```sh
npm install
npm run dev
```

Run the production checks and build with:

```sh
npm run build
```

Publication and essay authoring instructions live in [CONTENT.md](CONTENT.md).

## Deployment

Pushes to `master` run the GitHub Pages workflow. GitHub Pages must use **GitHub Actions**
as its source.

The Jekyll site that preceded this version is preserved at the annotated Git tag
`pre-astro-redesign-2026-07-30`. To roll back without rewriting shared history, restore
that tree on a new branch and merge the restoration as a normal commit.
