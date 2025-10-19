// CRUD untuk link (update + delete full fix)

async function auth(context) {
  const cookie = context.request.headers.get("Cookie") || "";
  const m = /(?:^|; )sid=([^;]+)/.exec(cookie);
  if (!m) return null;
  return await context.env.KV_LINKS.get(`session:${decodeURIComponent(m[1])}`);
}

async function load(KV) {
  const raw = await KV.get("links");
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
async function save(KV, arr) {
  await KV.put("links", JSON.stringify(arr));
}

const json = (d, s = 200) => new Response(JSON.stringify(d), {
  status: s,
  headers: { "Content-Type": "application/json" }
});

export async function onRequest(context) {
  const { request, env } = context;
  const user = await auth(context);
  if (!user) return json({ ok: false, error: "Unauthorized" }, 401);

  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const method = request.method;
  const KV = env.KV_LINKS;

  // === LIST ===
  if (method === "GET" && parts.length === 2) {
    const arr = await load(KV);
    return json({ ok: true, links: arr });
  }

  // === CREATE ===
  if (method === "POST" && parts.length === 2) {
    const body = await request.json().catch(() => ({}));
    const linkUrl = (body.url || "").trim();
    const label = (body.label || "").trim();
    if (!/^https?:\/\//i.test(linkUrl))
      return json({ ok: false, error: "URL harus http(s)://" }, 400);

    const arr = await load(KV);
    const id = Date.now().toString(36);
    arr.push({ id, url: linkUrl, label });
    await save(KV, arr);
    return json({ ok: true, id });
  }

  // === DELETE (DELETE atau fallback GET ?delete=1) ===
  if (
    (method === "DELETE" && parts.length === 3) ||
    (method === "GET" && parts.length === 3 && url.searchParams.get("delete") === "1")
  ) {
    const id = parts[2];
    const arr = await load(KV);
    const next = arr.filter(x => x.id !== id);
    await save(KV, next); // tulis ulang meskipun id tidak ketemu
    return json({ ok: true });
  }

  // === UPDATE (PUT atau fallback POST ?update=1) ===
  const isUpdate =
    (method === "PUT" && parts.length === 3) ||
    (method === "POST" && parts.length === 3 && url.searchParams.get("update") === "1");

  if (isUpdate) {
    const id = parts[2];
    const body = await request.json().catch(() => ({}));
    const linkUrl = (body.url || "").trim();
    const label = (body.label || "").trim();
    const arr = await load(KV);
    const i = arr.findIndex(x => x.id === id);
    if (i === -1) return json({ ok: false, error: "Not found" });
    if (linkUrl && !/^https?:\/\//i.test(linkUrl))
      return json({ ok: false, error: "URL tidak valid" }, 400);
    arr[i] = { ...arr[i], ...(linkUrl ? { url: linkUrl } : {}), label };
    await save(KV, arr);
    return json({ ok: true });
  }

  return json({ ok: false, error: "Method not allowed" }, 405);
}
