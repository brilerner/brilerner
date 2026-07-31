import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { site } from "../data/site";

export async function GET() {
  const essays = (await getCollection("essays", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: `${site.name} · writing`,
    description: "Notes on healthcare AI, research practice, and conferences.",
    site: site.url,
    items: essays.map((essay) => ({
      title: essay.data.title,
      description: essay.data.summary,
      pubDate: essay.data.date,
      link: `/writing/${essay.id}/`,
    })),
  });
}
