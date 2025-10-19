export async function onRequest(context) {
  const { KV_LINKS } = context.env;
  const json = (await KV_LINKS.get("links")) || "[]";
  let links;
  try { links = JSON.parse(json); } catch (e) { links = []; }
  if (!Array.isArray(links) || links.length === 0) {
    return new Response("Tidak ada link.", { status: 204 });
  }
  const pick = links[Math.floor(Math.random() * links.length)];
  return Response.redirect(pick.url, 302);
}