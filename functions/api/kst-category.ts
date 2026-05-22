type Env = {};

type KstProduct = {
  id: string;
  url: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

function decodeHtml(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function parsePrice(input: string) {
  const m = input.replace(/\s+/g, " ").match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)/);
  if (!m) return null;
  const v = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
}

function toAbsUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `https://www.kstsystem.co.th${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function parseProductsFromHtml(html: string) {
  const products: KstProduct[] = [];

  const cardBlockRe = /<li[^>]*class="product-card"[\s\S]*?<\/li>/g;
  for (const blockMatch of html.matchAll(cardBlockRe)) {
    const block = blockMatch[0] ?? "";

    const hrefMatch =
      block.match(/href="([^"]*\/product\/[^"]+)"/) ?? block.match(/href="([^"]+)"/);
    const href = decodeHtml(hrefMatch?.[1] ?? "").trim();
    if (!href || !href.includes("/product/")) continue;

    const url = toAbsUrl(href);

    const nameMatch =
      block.match(/class="product-name"[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>/) ??
      block.match(/class="product-name"[\s\S]*?>\s*([\s\S]*?)\s*<\/div>/);
    const nameRaw = decodeHtml(nameMatch?.[1] ?? "").replace(/\s+/g, " ").trim();
    if (!nameRaw) continue;

    const priceMatch =
      block.match(/product-price-special[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>/) ??
      block.match(/product-price-original[\s\S]*?>\s*([\s\S]*?)\s*<\/span>/);
    const price = parsePrice(decodeHtml(priceMatch?.[1] ?? ""));

    const imgMatch = block.match(/(?:data-src|src)="([^"]+)"/);
    const imageUrl = imgMatch?.[1] ? toAbsUrl(decodeHtml(imgMatch[1]).trim()) : null;

    const id = url.split("/").pop() || url;
    products.push({ id, url, name: nameRaw, price, imageUrl });
  }

  const legacyRe =
    /<div[^>]*class="product-img"[\s\S]*?<a[^>]*href="([^"]+)"[\s\S]*?(?:data-src|src)="([^"]+)"[\s\S]*?<div[^>]*class="product-name"[\s\S]*?<span>\s*([\s\S]*?)\s*<\/span>[\s\S]*?<div[^>]*class="product-price"[\s\S]*?(?:product-price-special[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>|product-price-original[\s\S]*?>\s*([\s\S]*?)\s*<\/span>)/g;

  for (const m of html.matchAll(legacyRe)) {
    const href = decodeHtml(m[1] ?? "").trim();
    const imageRaw = decodeHtml(m[2] ?? "").trim();
    const nameRaw = decodeHtml(m[3] ?? "").replace(/\s+/g, " ").trim();
    const priceRaw = (m[4] ?? m[5] ?? "").trim();

    if (!href || !nameRaw) continue;

    const url = toAbsUrl(href);
    const id = url.split("/").pop() || url;
    const price = parsePrice(priceRaw);

    products.push({
      id,
      url,
      name: nameRaw,
      price,
      imageUrl: imageRaw ? toAbsUrl(imageRaw) : null,
    });
  }

  const unique = new Map<string, KstProduct>();
  for (const p of products) if (!unique.has(p.url)) unique.set(p.url, p);
  return [...unique.values()];
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const targetUrl = (url.searchParams.get("url") ?? "").trim();
  const debug = url.searchParams.get("debug") === "1";

  if (!targetUrl) return json({ error: "url is required" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(targetUrl);
  } catch {
    return json({ error: "invalid url" }, { status: 400 });
  }

  if (target.protocol !== "https:" || target.hostname !== "www.kstsystem.co.th") {
    return json({ error: "unsupported host" }, { status: 400 });
  }

  const cacheKey = new Request(`${url.origin}${url.pathname}?url=${encodeURIComponent(target.toString())}`, {
    method: "GET",
  });

  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached && !debug) return cached;

  const res = await fetch(target.toString(), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "th-TH,th;q=0.9,en;q=0.8",
    },
  });

  if (!res.ok) return json({ error: `fetch failed (${res.status})` }, { status: 502 });

  const buf = await res.arrayBuffer();
  const html = new TextDecoder("utf-8").decode(buf);
  const products = parseProductsFromHtml(html);

  const body = json(
    {
      url: target.toString(),
      products,
      debug: debug ? { htmlBytes: html.length } : undefined,
    },
    {
      headers: {
        "cache-control": "public, max-age=300",
      },
    }
  );

  if (!debug) {
    context.waitUntil(cache.put(cacheKey, body.clone()));
  }

  return body;
};
