import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://brilerner.github.io",
  output: "static",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return ![
          "/about/",
          "/about.html/",
          "/portfolio/",
          "/resume/",
          "/year-archive/",
        ].includes(pathname) &&
          !pathname.startsWith("/posts/") &&
          !pathname.startsWith("/publication/");
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
});
