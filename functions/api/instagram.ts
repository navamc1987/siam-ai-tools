type Env = {
  INSTAGRAM_ACCESS_TOKEN?: string;
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp?: string;
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.INSTAGRAM_ACCESS_TOKEN) {
    return json(
      { error: "INSTAGRAM_ACCESS_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? 18) || 18, 1),
    50
  );

  const cacheKey = new Request(`${url.origin}${url.pathname}?limit=${limit}`, {
    method: "GET",
  });
  const cache = (caches as any).default as Cache;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const endpoint = new URL("https://graph.instagram.com/me/media");
  endpoint.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp"
  );
  endpoint.searchParams.set("limit", String(limit));
  endpoint.searchParams.set("access_token", env.INSTAGRAM_ACCESS_TOKEN);

  const igRes = await fetch(endpoint.toString(), {
    headers: { accept: "application/json" },
  });

  if (!igRes.ok) {
    const body = await igRes.text();
    return json(
      { error: "Failed to fetch Instagram media", status: igRes.status, body },
      { status: 502 }
    );
  }

  const raw = (await igRes.json()) as { data?: InstagramMedia[] };
  const data = (raw.data ?? []).filter(
    (m) => m.permalink && (m.media_url || m.thumbnail_url)
  );

  const res = json(
    { data },
    {
      status: 200,
      headers: {
        "cache-control": "public, max-age=300",
      },
    }
  );

  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
};

