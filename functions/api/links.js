// CRUD Links
// GET /api/links
// POST /api/links  { url, label }
// PUT /api/links/:id  { url, label }
// DELETE /api/links/:id

async function auth(context) {
  const { request, env } = context;
  const cookie = request.headers.get("Cookie") || "";
  const match = /(?:^|; )sid=([^;]+)/.exec(cookie);
  if (!match) return null;
  const sid = decodeURIComponent(match[1]);
  const u = await env.KV_LINKS.get(`session:${sid}`);
  return u; // username or null
}

async function loadLinks(KV) {
  const raw = (await KV.get("links")) || "[]";
  try { return JSON.parse(raw); } catch { return []; }
}

async function saveLinks(KV, arr) {
  await KV.put("links", JSON.stringify(arr));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

export async function onRequest(context) {
  const user = await auth(context);
  if (!user) return json({ ok: false, error: "Unauthorized" }, 401);

  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  if (method === "GET") {
    const links = await loadLinks(env.KV_LINKS);
    return json({ ok: true, links });
  }

  if (method === "POST") {
    const body = await request.json().catch(() => ({}));
    const { url: linkUrl = "", label = "" } = body;
    if (!/^https?:\/\//i.test(linkUrl)) return json({ ok: false, error: "URL harus http(s)" }, 400);
    const links = await loadLinks(env.KV_LINKS);
    const id = Date.now().toString(36);
    links.push({ id, url: linkUrl, label });
    await saveLinks(env.KV_LINKS, links);
    return json({ ok: true, id });
  }

  if (method === "PUT") {
    const id = url.pathname.split("/").pop();
    const body = await request.json().catch(() => ({}));
    const { url: linkUrl = "", label = "" } = body;
    const links = await loadLinks(env.KV_LINKS);
    const i = links.findIndex(x => x.id === id);
    if (i === -1) return json({ ok: false, error: "Not found" }, 404);
    if (linkUrl && !/^https?:\/\//i.test(linkUrl)) return json({ ok: false, error: "URL harus http(s)" }, 400);
    links[i] = { ...links[i], ...(linkUrl ? { url: linkUrl } : {}), label };
    await saveLinks(env.KV_LINKS, links);
    return json({ ok: true });
  }

  if (method === "DELETE") {
    const id = url.pathname.split("/").pop();
    const links = await loadLinks(env.KV_LINKS);
    const next = links.filter(x => x.id !== id);
    if (next.length === links.length) return json({ ok: false, error: "Not found" }, 404);
    await saveLinks(env.KV_LINKS, next);
    return json({ ok: true });
  }

  return json({ ok: false, error: "Method not allowed" }, 405);
}