// POST /api/links-delete   { id }
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
  const { id } = await request.json().catch(()=>({}));
  if (!id) return json({ ok:false, error:"Missing id" }, 400);
  const arr = await load(env.KV_LINKS);
  const next = arr.filter(x => x.id !== id);
  await save(env.KV_LINKS, next);  // tulis ulang walau id tak ketemu
  return json({ ok:true });
}
