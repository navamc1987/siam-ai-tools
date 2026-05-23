type Env = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const supabaseUrl = (context.env.SUPABASE_URL ?? "").trim();
  const serviceRoleKey = (context.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "supabase env not configured" }, { status: 500 });

  let payload: unknown;
  try {
    payload = await context.request.json();
  } catch {
    return json({ error: "invalid json" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/estimate_leads`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return json({ error: await res.text() }, { status: 500 });
  return json({ ok: true });
};

