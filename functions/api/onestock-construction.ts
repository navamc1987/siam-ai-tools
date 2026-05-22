type Env = {};

type OnestockMaterialConfig = {
  key: string;
  amount: number;
  sku: string[];
  options?: { sku: string; pack: number }[];
};

type OnestockConstructionTypeConfig = {
  key: string;
  materials: OnestockMaterialConfig[];
};

type OnestockItem = {
  id: string;
  sku: string;
  name: string;
  piecePerPack: number | null;
  piecePerPackUnit: string | null;
  unit: string | null;
  url: string | null;
  priceSummary: { priceAfterDiscount: string | null } | null;
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

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseSelParams(values: string[]) {
  const selections: Record<string, string> = {};
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const sku = trimmed.slice(idx + 1).trim();
    if (!key || !sku) continue;
    selections[key] = sku;
  }
  return selections;
}

async function fetchText(url: string) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "th-TH,th;q=0.9,en;q=0.8",
      referer: "https://www.onestockhome.com/",
    },
  });
  const text = await res.text();
  return { res, text };
}

async function resolveConstructionAssets() {
  const pageUrl = "https://www.onestockhome.com/th/construction_calculator";
  const { res: pageRes, text: pageHtml } = await fetchText(pageUrl);
  if (!pageRes.ok) throw new Error(`Fetch page failed (${pageRes.status})`);

  const desktopMatch = pageHtml.match(
    /src="(\/osh-online\/assets\/desktop-[^"]+\.js)"/
  );
  if (!desktopMatch) throw new Error("Cannot find desktop asset");
  const desktopJsUrl = `https://www.onestockhome.com${desktopMatch[1]}`;

  const { res: desktopRes, text: desktopJs } = await fetchText(desktopJsUrl);
  if (!desktopRes.ok) throw new Error(`Fetch desktop failed (${desktopRes.status})`);

  const showMatch = desktopJs.match(
    /construction_calculators\/show\.jsx"\s*:\s*\(\)\s*=>[^\n]*?import\("\.\/(show-[^"]+\.js)"\)/
  );
  if (!showMatch) throw new Error("Cannot find show asset");
  const showJsUrl = new URL(`./${showMatch[1]}`, desktopJsUrl).toString();

  const { res: showRes, text: showJs } = await fetchText(showJsUrl);
  if (!showRes.ok) throw new Error(`Fetch show failed (${showRes.status})`);

  const hookMatch = showJs.match(/from"\.\/(hooks-[^"]+\.js)"/);
  if (!hookMatch) throw new Error("Cannot find hooks asset");
  const hooksJsUrl = new URL(`./${hookMatch[1]}`, showJsUrl).toString();

  return { pageUrl, desktopJsUrl, showJsUrl, hooksJsUrl };
}

function extractConstructionConfigFromHooks(hooksJs: string) {
  const kStart = hooksJs.indexOf(",K=[");
  if (kStart === -1) throw new Error("Cannot locate K");

  const zStart = hooksJs.indexOf(",Z={kind:\"Document\"");
  if (zStart === -1 || zStart <= kStart) throw new Error("Cannot locate Z");

  const prefix = hooksJs.slice(0, kStart);
  const arrays = new Map<string, unknown[]>();

  const arrayAssignRe = /(?:^|,|const )([A-Za-z_$][A-Za-z0-9_$]*)=\[/g;
  for (const m of prefix.matchAll(arrayAssignRe)) {
    const name = m[1];
    const open = (m.index ?? 0) + m[0].length - 1;

    let depth = 0;
    let close = -1;
    for (let i = open; i < prefix.length; i++) {
      const ch = prefix[i];
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }

    if (close === -1) continue;
    const arrLiteral = prefix.slice(open, close + 1);
    const jsonLike = arrLiteral.replace(
      /([{\[,])([A-Za-z_$][A-Za-z0-9_$]*):/g,
      '$1"$2":'
    );

    try {
      const parsed = JSON.parse(jsonLike) as unknown[];
      arrays.set(name, parsed);
    } catch {
      /* ignore */
    }
  }

  const kOpen = hooksJs.indexOf("[", kStart);
  if (kOpen === -1) throw new Error("Cannot locate K open bracket");

  let kDepth = 0;
  let kClose = -1;
  for (let i = kOpen; i < hooksJs.length; i++) {
    const ch = hooksJs[i];
    if (ch === "[") kDepth++;
    else if (ch === "]") {
      kDepth--;
      if (kDepth === 0) {
        kClose = i;
        break;
      }
    }
  }
  if (kClose === -1) throw new Error("Cannot locate K close bracket");

  const kLiteral = hooksJs.slice(kOpen, kClose + 1);
  const typeMapRe =
    /\{key:"([^"]+)",materials:([A-Za-z_$][A-Za-z0-9_$]*)\}/g;
  const configs: OnestockConstructionTypeConfig[] = [];
  for (const m of kLiteral.matchAll(typeMapRe)) {
    const key = m[1];
    const materialsVar = m[2];
    const materials = arrays.get(materialsVar);
    if (!materials) continue;
    configs.push({ key, materials: materials as OnestockMaterialConfig[] });
  }

  if (configs.length === 0) throw new Error("Invalid config");
  return configs;
}

async function fetchItemsBySku(sku: string[]) {
  const payload = {
    operationName: "ConstructionCalculatorResultHooks",
    query:
      "query ConstructionCalculatorResultHooks($sku:[String!]!){findItemsBySku(sku:$sku){id sku name piecePerPack piecePerPackUnit unit url priceSummary{priceAfterDiscount}}}",
    variables: { sku },
  };

  const res = await fetch("https://www.onestockhome.com/th/graph_api/v1/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      origin: "https://www.onestockhome.com",
      referer: "https://www.onestockhome.com/th/construction_calculator",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`GraphQL failed (${res.status})`);
  const body = (await res.json()) as {
    data?: { findItemsBySku?: OnestockItem[] };
    errors?: Array<{ message?: string }>;
  };

  if (body.errors?.length) throw new Error(body.errors[0]?.message || "GraphQL errors");
  return body.data?.findItemsBySku ?? [];
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const area = clampNumber(Number(url.searchParams.get("area") ?? 0) || 0, 0, 50000);
  const type = (url.searchParams.get("type") ?? "").trim();
  const selections = parseSelParams(url.searchParams.getAll("sel"));
  const debug = url.searchParams.get("debug") === "1";

  const cacheKey = new Request(
    `${url.origin}${url.pathname}?type=${encodeURIComponent(type)}&area=${area}&sel=${encodeURIComponent(
      Object.entries(selections)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("|")
    )}`,
    { method: "GET" }
  );

  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const { pageUrl, desktopJsUrl, showJsUrl, hooksJsUrl } =
      await resolveConstructionAssets();
    const { res: hooksRes, text: hooksJs } = await fetchText(hooksJsUrl);
    if (!hooksRes.ok) throw new Error(`Fetch hooks failed (${hooksRes.status})`);

    const config = extractConstructionConfigFromHooks(hooksJs);
    const types = config.map((c) => c.key);
    const currentType = type || types[0] || "";

    const typeConfig = config.find((c) => c.key === currentType);
    if (!typeConfig) {
      return json(
        { error: "invalid type", allowedTypes: types },
        { status: 400 }
      );
    }

    const selectedSkuByKey: Record<string, string> = {};
    for (const material of typeConfig.materials) {
      const chosen = selections[material.key] ?? material.sku[0];
      if (chosen && material.sku.includes(chosen)) {
        selectedSkuByKey[material.key] = chosen;
      } else if (material.sku[0]) {
        selectedSkuByKey[material.key] = material.sku[0];
      }
    }

    const allSkus = Array.from(
      new Set(typeConfig.materials.flatMap((m) => m.sku).filter(Boolean))
    );
    const items = await fetchItemsBySku(allSkus);
    const itemBySku = new Map(items.map((it) => [it.sku, it] as const));

    const rows = typeConfig.materials.map((material) => {
      const selectedSku = selectedSkuByKey[material.key];
      const item = selectedSku ? itemBySku.get(selectedSku) : undefined;
      const piecePerPack = item?.piecePerPack ?? 1;
      const optionPack =
        material.options?.find((o) => o.sku === selectedSku)?.pack ?? 1;
      const unitPriceRaw = Number(item?.priceSummary?.priceAfterDiscount ?? 0) || 0;
      const unitPrice = unitPriceRaw * piecePerPack;
      const qty =
        area > 0
          ? Math.ceil((material.amount / 100) * area / (optionPack * piecePerPack))
          : 0;
      const unit =
        piecePerPack > 1
          ? item?.piecePerPackUnit ?? "แพ็ก"
          : item?.unit ?? "ชิ้น";

      return {
        key: material.key,
        amountPer100Sqm: material.amount,
        skuOptions: material.sku,
        skuOptionDetails: material.sku.map((sku) => ({
          sku,
          name: itemBySku.get(sku)?.name ?? null,
        })),
        selectedSku,
        name: item?.name ?? null,
        qty,
        unit,
        unitPrice,
        total: qty * unitPrice,
        url: item?.url ? `https://www.onestockhome.com${item.url}` : null,
      };
    });

    const materialSubtotal = rows.reduce((sum, r) => sum + (r.total || 0), 0);

    const payload = {
      source: {
        pageUrl,
        desktopJsUrl,
        showJsUrl,
        hooksJsUrl,
      },
      input: { type: currentType, area, selections: selectedSkuByKey },
      types,
      rows,
      totals: { materialSubtotal },
      debug: debug
        ? {
            hooksBytes: hooksJs.length,
          }
        : undefined,
    };

    const response = json(payload, {
      headers: {
        "cache-control": "public, max-age=600",
      },
    });
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return json({ error: message }, { status: 500 });
  }
};
