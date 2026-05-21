import fs from "node:fs";
import path from "node:path";

const defaultUrls = [
  "https://www.onestockhome.com/th/product_categories/cement-board-8-mm/items_table",
  "https://www.onestockhome.com/th/product_categories/metal-sheet/items_table",
  "https://www.onestockhome.com/th/product_categories/pvc-water-pipes/items_table",
];

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractLinksToMarkdown(html) {
  return html.replace(
    /<a\b[^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>([\s\S]*?)<\/a>/gi,
    (_, h1, h2, h3, inner) => {
      const href = h1 || h2 || h3 || "";
      const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const abs = href.startsWith("http") ? href : `https://www.onestockhome.com${href}`;
      return `[${text}](${abs})`;
    }
  );
}

function htmlToLines(html) {
  let s = html;
  s = s.replace(/<script\b[\s\S]*?<\/script>/gi, "\n");
  s = s.replace(/<style\b[\s\S]*?<\/style>/gi, "\n");
  s = extractLinksToMarkdown(s);
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|li|tr|h\d)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  return s
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseItemsFromLines(lines) {
  const items = [];
  const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const linkRe = /\[([^\]]+)\]\((https:\/\/www\.onestockhome\.com\/th\/items\/\d+\/[^)]+)\)/g;
    const matches = [...line.matchAll(linkRe)];
    if (matches.length === 0) continue;
    for (const m of matches) {
      const title = m[1].trim();
      const url = m[2];
      const idMatch = url.match(/\/items\/(\d+)\//);
      const id = idMatch ? idMatch[1] : "";
      if (!id || !title) continue;
      if (seen.has(id)) continue;

      let j = i + 1;
      let brand = "";
      let price = null;
      let unit = "";

      for (; j < Math.min(lines.length, i + 12); j++) {
        const t = lines[j];
        const codeMatch = t.match(/^รหัสสินค้า\s+(\d+)/);
        if (codeMatch) continue;
        if (!brand && !t.startsWith("รหัสสินค้า") && isNaN(Number(t.replace(/,/g, "")))) {
          brand = t;
          continue;
        }
        const n = Number(t.replace(/,/g, ""));
        if (price === null && Number.isFinite(n) && n >= 0) {
          price = n;
          continue;
        }
        if (price !== null && !unit) {
          unit = t;
          break;
        }
      }

      items.push({ id, title, url, brand, price, unit });
      seen.add(id);
      i = Math.max(i, j);
    }
  }
  return items;
}

async function fetchAndParse(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "th-TH,th;q=0.9,en;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const html = await res.text();
  const lines = htmlToLines(html);
  const items = parseItemsFromLines(lines);
  return { url, count: items.length, items };
}

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const urls = args.filter((a) => !a.startsWith("--") && a !== outPath);
const targetUrls = urls.length > 0 ? urls : defaultUrls;

const results = [];
for (const url of targetUrls) {
  const r = await fetchAndParse(url);
  results.push(r);
}

const payload = {
  fetchedAt: new Date().toISOString(),
  sources: results.map((r) => ({ url: r.url, count: r.count })),
  items: results.flatMap((r) => r.items.map((it) => ({ ...it, source: r.url }))),
};

if (outPath) {
  const abs = path.isAbsolute(outPath) ? outPath : path.resolve(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(payload, null, 2), "utf-8");
} else {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}
