type Env = {};

type DriveFile = {
  id: string;
  name?: string;
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

function decodeHexAndUnicodeEscapes(input: string) {
  return input
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

function extractDriveIvdJson(html: string) {
  const m = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([\s\S]*?)';/);
  if (!m) return null;
  return decodeHexAndUnicodeEscapes(m[1]);
}

function collectFilesFromParsedNode(
  node: unknown,
  out: Map<string, DriveFile>
) {
  if (Array.isArray(node)) {
    const id = typeof node[0] === "string" ? node[0] : undefined;
    const name =
      typeof node[2] === "string"
        ? node[2]
        : typeof node[1] === "string"
          ? node[1]
          : undefined;

    if (id && /^[a-zA-Z0-9_-]{10,}$/.test(id) && !out.has(id)) {
      out.set(id, { id, name });
    }

    for (const item of node) collectFilesFromParsedNode(item, out);
    return;
  }

  if (node && typeof node === "object") {
    for (const value of Object.values(node as Record<string, unknown>)) {
      collectFilesFromParsedNode(value, out);
    }
  }
}

function extractFileIdsFromHtml(html: string) {
  const out = new Map<string, DriveFile>();

  const fileUrlRe = /\/file\/d\/([a-zA-Z0-9_-]{10,})/g;
  for (const m of html.matchAll(fileUrlRe)) {
    const id = m[1];
    if (id && !out.has(id)) out.set(id, { id });
  }

  const ivd = extractDriveIvdJson(html);
  if (ivd) {
    try {
      const parsed = JSON.parse(ivd) as unknown;
      collectFilesFromParsedNode(parsed, out);
    } catch {
      /* ignore */
    }
  }

  return [...out.values()];
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const folderId = (url.searchParams.get("folderId") ?? "").trim();

  if (!folderId || !/^[a-zA-Z0-9_-]{10,}$/.test(folderId)) {
    return json({ error: "folderId is required" }, { status: 400 });
  }

  const cacheKey = new Request(`${url.origin}${url.pathname}?folderId=${folderId}`, {
    method: "GET",
  });
  const cache = (caches as any).default as Cache;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const driveUrl = new URL(`https://drive.google.com/drive/folders/${folderId}`);
  driveUrl.searchParams.set("hl", "en");

  const res = await fetch(driveUrl.toString(), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; SiamAiToolsBot/1.0; +https://siamai.cloud)",
      accept: "text/html",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    return json(
      { error: "Failed to fetch Google Drive folder", status: res.status, body },
      { status: 502 }
    );
  }

  const html = await res.text();
  const files = extractFileIdsFromHtml(html).filter((f) => f.id !== folderId);

  const response = json(
    {
      folderId,
      files,
    },
    {
      status: 200,
      headers: { "cache-control": "public, max-age=300" },
    }
  );

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
};

