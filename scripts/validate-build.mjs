import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "parse5";

const root = process.cwd();
const dist = path.join(root, "dist");
const required = [
  "index.html",
  "publications/index.html",
  "publications/clinical/index.html",
  "publications/physics/index.html",
  "writing/index.html",
  "writing/here-we-go/index.html",
  "writing/mlhc-2025/index.html",
  "writing/chil-2026/index.html",
  "cv/index.html",
  "cv.pdf",
  "colophon/index.html",
  "404.html",
  "rss.xml",
  "sitemap-index.xml",
  "favicon.svg",
  "favicon-32.png",
  "favicon-192.png",
  "apple-touch-icon.png",
  "about.html",
];

const failures = [];
const exists = async (file) => fs.access(file).then(() => true, () => false);
for (const file of required) {
  if (!(await exists(path.join(dist, file)))) failures.push(`missing ${file}`);
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(full)));
    else files.push(full);
  }
  return files;
}

const allFiles = await listFiles(dist);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const fileSet = new Set(allFiles.map((file) => path.relative(dist, file)));
const documents = new Map();

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function attribute(node, name) {
  return node.attrs?.find((attr) => attr.name === name)?.value;
}

function elements(document, tagName) {
  const matches = [];
  walk(document, (node) => {
    if (!tagName || node.tagName === tagName) matches.push(node);
  });
  return matches;
}

function hasClass(node, className) {
  return (attribute(node, "class") ?? "").split(/\s+/).includes(className);
}

function textContent(node) {
  let text = node.nodeName === "#text" ? node.value : "";
  for (const child of node.childNodes ?? []) text += textContent(child);
  return text;
}

for (const file of htmlFiles) {
  const relative = path.relative(dist, file);
  const source = await fs.readFile(file, "utf8");
  documents.set(relative, { document: parse(source), source });
}

function resolveInternal(reference, fromFile) {
  if (
    !reference ||
    reference.startsWith("mailto:") ||
    reference.startsWith("tel:") ||
    reference.startsWith("data:")
  ) {
    return null;
  }
  const resolved = new URL(reference, `https://local/${fromFile.replace(/index\.html$/, "")}`);
  if (resolved.hostname !== "local") return null;
  const pathname = decodeURIComponent(resolved.pathname).replace(/^\/+/, "");
  const candidates =
    pathname === ""
      ? ["index.html"]
      : pathname.endsWith("/")
        ? [`${pathname}index.html`]
        : [pathname, `${pathname}/index.html`];
  const target = candidates.find((candidate) => fileSet.has(candidate));
  return { target, pathname, hash: resolved.hash };
}

let maxScriptBytes = 0;
for (const [relative, { document, source }] of documents) {
  const metas = elements(document, "meta");
  const noindex = metas.some(
    (meta) => attribute(meta, "name") === "robots" && attribute(meta, "content")?.includes("noindex"),
  );
  const isRedirect = noindex && metas.some((meta) => attribute(meta, "http-equiv") === "refresh");

  if (!isRedirect) {
    if (elements(document, "main").length !== 1) failures.push(`${relative}: expected one main`);
    if (!elements(document, "aside").some((node) => hasClass(node, "sidebar"))) {
      failures.push(`${relative}: sidebar missing`);
    }
    if (!elements(document, "title").length) failures.push(`${relative}: title missing`);
    if (!metas.some((meta) => attribute(meta, "name") === "description")) {
      failures.push(`${relative}: meta description missing`);
    }
    if (!elements(document, "link").some((link) => attribute(link, "rel") === "canonical")) {
      failures.push(`${relative}: canonical link missing`);
    }
  }

  if (/google-analytics|googletagmanager|goatcounter|plausible/i.test(source)) {
    failures.push(`${relative}: analytics reference found`);
  }

  let pageScriptBytes = 0;
  for (const script of elements(document, "script")) {
    const src = attribute(script, "src");
    if (src?.startsWith("http")) failures.push(`${relative}: external script ${src}`);
    if (src) {
      const resolved = resolveInternal(src, relative);
      if (resolved?.target) {
        pageScriptBytes += (await fs.stat(path.join(dist, resolved.target))).size;
      }
    } else {
      pageScriptBytes += Buffer.byteLength(textContent(script));
    }
  }
  maxScriptBytes = Math.max(maxScriptBytes, pageScriptBytes);

  for (const node of elements(document)) {
    const references = [
      node.tagName === "a" || node.tagName === "link" ? attribute(node, "href") : undefined,
      node.tagName === "script" || node.tagName === "img" ? attribute(node, "src") : undefined,
      node.tagName === "object" ? attribute(node, "data") : undefined,
    ].filter(Boolean);

    for (const reference of references) {
      const resolved = resolveInternal(reference, relative);
      if (!resolved) continue;
      if (!resolved.target) {
        failures.push(`${relative}: broken internal reference ${reference}`);
        continue;
      }
      if (resolved.hash) {
        const targetDocument = documents.get(resolved.target)?.document;
        if (
          targetDocument &&
          !elements(targetDocument).some(
            (targetNode) => attribute(targetNode, "id") === resolved.hash.slice(1),
          )
        ) {
          failures.push(`${relative}: missing anchor ${reference}`);
        }
      }
    }
  }
}

const publicationDocument = documents.get("publications/index.html")?.document;
if (publicationDocument) {
  const publications = elements(publicationDocument, "li").filter((node) =>
    hasClass(node, "publication"),
  );
  const citations = elements(publicationDocument, "meta").filter(
    (node) => attribute(node, "name") === "citation_title",
  );
  if (publications.length !== 11) failures.push(`expected 11 publications, found ${publications.length}`);
  if (citations.length !== 11) failures.push(`expected 11 citation titles, found ${citations.length}`);
}

const fontFiles = allFiles.filter((file) => file.endsWith(".woff2"));
const fontBytes = (
  await Promise.all(fontFiles.map(async (file) => (await fs.stat(file)).size))
).reduce((total, size) => total + size, 0);
if (fontBytes > 140_000) failures.push(`font budget exceeded: ${fontBytes} bytes`);
if (maxScriptBytes > 30_000) failures.push(`script budget exceeded: ${maxScriptBytes} bytes`);

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${htmlFiles.length} HTML files · 11 publications · ${fontBytes} font bytes · ${maxScriptBytes} max script bytes`,
);
