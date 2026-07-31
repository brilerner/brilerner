import fs from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const root = process.cwd();
const publicDir = path.join(root, "public");
const ogDir = path.join(publicDir, "og");
const writingOgDir = path.join(ogDir, "writing");
await fs.mkdir(writingOgDir, { recursive: true });

const newsreader = await fs.readFile(path.join(root, "scripts/fonts/newsreader.ttf"));
const mono = await fs.readFile(path.join(root, "scripts/fonts/ibm-plex-mono.ttf"));
const fonts = [
  { name: "Newsreader", data: newsreader, weight: 400, style: "normal" },
  { name: "IBM Plex Mono", data: mono, weight: 400, style: "normal" },
];

const h = (type, props, ...children) => ({ type, props: { ...props, children } });
const palette = {
  paper: "#FAFAF8",
  ink: "#14171A",
  ink2: "#5C6360",
  rule: "#B9BDB6",
  live: "#1D7A5F",
};

function card({ title, label, detail }) {
  return h(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "68px 76px",
        background: palette.paper,
        color: palette.ink,
        border: `1px solid ${palette.rule}`,
      },
    },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: "22px" } },
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            border: `1px solid ${palette.ink}`,
            fontFamily: "IBM Plex Mono",
            fontSize: "24px",
          },
        },
        "BL",
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: "18px",
            color: palette.ink2,
            textTransform: "uppercase",
          },
        },
        label,
      ),
    ),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "24px" } },
      h(
        "div",
        {
          style: {
            display: "flex",
            maxWidth: "980px",
            fontFamily: "Newsreader",
            fontSize: title.length > 70 ? "55px" : "68px",
            lineHeight: 1.06,
          },
        },
        title,
      ),
      h("div", {
        style: { display: "flex", width: "100%", height: "1px", background: palette.rule },
      }),
      h(
        "div",
        {
          style: {
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: "20px",
            color: palette.ink2,
          },
        },
        detail,
      ),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontFamily: "IBM Plex Mono",
          fontSize: "17px",
          color: palette.live,
        },
      },
      h("div", {
        style: { display: "flex", width: "9px", height: "9px", borderRadius: "50%", background: palette.live },
      }),
      "brilerner.github.io",
    ),
  );
}

async function writeCard(file, data) {
  const svg = await satori(card(data), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  await fs.writeFile(file, png);
}

const cards = [
  ["home.png", "Brian Lerner", "research and writing", "PhD candidate · machine learning for healthcare · Duke University"],
  ["publications.png", "Publications", "research record", "Clinical machine learning · quantum materials · instrumentation"],
  ["writing.png", "Writing", "notes and essays", "Healthcare AI · research practice · conferences"],
  ["cv.png", "Curriculum vitae", "complete archive", "Research · publications · teaching · service"],
  ["colophon.png", "Why this site looks like a readout", "colophon", "What gets measured, shown, and excluded"],
];

for (const [filename, title, label, detail] of cards) {
  await writeCard(path.join(ogDir, filename), { title, label, detail });
}

const essayDir = path.join(root, "src/content/essays");
for (const filename of await fs.readdir(essayDir)) {
  if (!filename.endsWith(".md") && !filename.endsWith(".mdx")) continue;
  const source = await fs.readFile(path.join(essayDir, filename), "utf8");
  const title = source.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "Writing";
  const date = source.match(/^date:\s*(.+)\s*$/m)?.[1] ?? "";
  const slug = filename.replace(/\.mdx?$/, "");
  await writeCard(path.join(writingOgDir, `${slug}.png`), {
    title,
    label: "writing",
    detail: date,
  });
}

const faviconSvg = await fs.readFile(path.join(publicDir, "favicon.svg"), "utf8");
for (const [filename, size] of [
  ["favicon-32.png", 32],
  ["favicon-192.png", 192],
  ["apple-touch-icon.png", 180],
]) {
  const png = new Resvg(faviconSvg, {
    fitTo: { mode: "width", value: size },
    background: palette.paper,
  })
    .render()
    .asPng();
  await fs.writeFile(path.join(publicDir, filename), png);
}
