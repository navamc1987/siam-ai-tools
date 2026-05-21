type Env = {};

type DriveFile = {
  id: string;
  name?: string;
};

type DriveFolder = {
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

function sanitizeJsStringForJsonParse(input: string) {
  return input.replace(/\\(?![\\/"bfnrtu])/g, "");
}

function extractDriveIvdJson(html: string) {
  const m = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([\s\S]*?)';/);
  if (!m) return null;
  return sanitizeJsStringForJsonParse(decodeHexAndUnicodeEscapes(m[1]));
}

function collectEntriesFromParsedNode(
  node: unknown,
  files: Map<string, DriveFile>,
  folders: Map<string, DriveFolder>
) {
  if (Array.isArray(node)) {
    const id = typeof node[0] === "string" ? node[0] : undefined;
    const mime = typeof node[3] === "string" ? node[3] : undefined;
    const name =
      typeof node[2] === "string"
        ? node[2]
        : typeof node[1] === "string"
          ? node[1]
          : undefined;

    const isFolder = mime === "application/vnd.google-apps.folder";

    if (id && mime && /^[a-zA-Z0-9_-]{10,}$/.test(id)) {
      if (isFolder) {
        if (!folders.has(id)) folders.set(id, { id, name });
      } else {
        if (!files.has(id)) files.set(id, { id, name });
      }
    }

    for (const item of node) collectEntriesFromParsedNode(item, files, folders);
    return;
  }

  if (node && typeof node === "object") {
    for (const value of Object.values(node as Record<string, unknown>)) {
      collectEntriesFromParsedNode(value, files, folders);
    }
  }
}

function extractEntriesFromHtml(html: string) {
  const files = new Map<string, DriveFile>();
  const folders = new Map<string, DriveFolder>();

  const fileUrlRe = /\/file\/d\/([a-zA-Z0-9_-]{10,})/g;
  for (const m of html.matchAll(fileUrlRe)) {
    const id = m[1];
    if (id && !files.has(id)) files.set(id, { id });
  }

  const ivd = extractDriveIvdJson(html);
  if (ivd) {
    try {
      const parsed = JSON.parse(ivd) as unknown;
      collectEntriesFromParsedNode(parsed, files, folders);
    } catch {
      /* ignore */
    }
  }

  return { files: [...files.values()], folders: [...folders.values()] };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const folderId = (url.searchParams.get("folderId") ?? "").trim();
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? 0) || 0, 0),
    200
  );
  const debug = url.searchParams.get("debug") === "1";
  const includeFolders = url.searchParams.get("includeFolders") === "1";

  if (!folderId || !/^[a-zA-Z0-9_-]{10,}$/.test(folderId)) {
    return json({ error: "folderId is required" }, { status: 400 });
  }

  const cacheKey = new Request(
    `${url.origin}${url.pathname}?folderId=${folderId}&limit=${limit}&includeFolders=${includeFolders ? 1 : 0}&debug=${debug ? 1 : 0}`,
    {
    method: "GET",
    }
  );
  const cache = (caches as any).default as Cache;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const driveUrl = new URL(`https://drive.google.com/drive/folders/${folderId}`);
  driveUrl.searchParams.set("hl", "en");
  driveUrl.searchParams.set("usp", "sharing");

  const res = await fetch(driveUrl.toString(), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
      referer: "https://drive.google.com/",
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
  const extracted = extractEntriesFromHtml(html);
  const rawFiles = extracted.files.filter((f) => f.id !== folderId);
  const rawFolders = extracted.folders.filter((f) => f.id !== folderId);
  const files = limit > 0 ? rawFiles.slice(0, limit) : rawFiles;

  const response = json(
    {
      folderId,
      files,
      total: rawFiles.length,
      ...(includeFolders ? { folders: rawFolders, folderTotal: rawFolders.length } : {}),
      ...(debug
        ? {
            debug: {
              fetchedStatus: res.status,
              htmlLength: html.length,
              hasDriveIvd: /_DRIVE_ivd/.test(html),
            },
          }
        : {}),
    },
    {
      status: 200,
      headers: { "cache-control": "public, max-age=300" },
    }
  );

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
};
