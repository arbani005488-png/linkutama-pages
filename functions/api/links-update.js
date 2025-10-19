// POST /api/links-update   { id, url?, label? }
async function auth(req, env) {
  const cookie = req.headers.get("Cookie") || "";
  const m = /(?:^|; )sid=([^;]+)/.exec(cookie);
  return m ? env.KV_LINKS.get(`session:${decodeURIComponent(m[1])}`) : null;
}
const json = (d, s=200) => new Response(JSON.stringify(d), {status:s, headers:{"Content-Type":"application/json"}});
const load = async KV => JSON.parse((await KV.get("links")) || "[]");
const save = (KV, arr) => KV.put("links", JSON.stringify(arr));

export async function onRequestPost({ request, env }) {
  if (!await auth(request, env)) return json({ ok:false, error:"Unauthorized" }, 401);
  const body = await request.json().catch(()=>({}));
  const { id } = body;
  let { url="", label="" } = body;
  if (!id) return json({ ok:false, error:"Missing id" }, 400);

  const arr = await load(env.KV_LINKS);
  const i = arr.findIndex(x => x.id === id);
  if (i === -1) return json({ ok:false, error:"Not found" }, 404);

  url = (url || "").trim();
  label = (label || "").trim();
  if (url && !/^https?:\/\//i.test(url)) return json({ ok:false, error:"URL harus http(s)://" }, 400);

  arr[i] = { ...arr[i], ...(url ? { url } : {}), label };
  await save(env.KV_LINKS, arr);
  return json({ ok:true });
}
