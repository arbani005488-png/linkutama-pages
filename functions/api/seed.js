// GET /api/seed?token=XYZ
// Env: SEED_TOKEN (optional)
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!env.SEED_TOKEN || token !== env.SEED_TOKEN) {
    return new Response("Forbidden", { status: 403 });
  }
  const sample = [
    { id: "a1", url: "https://example.com/1", label: "Example 1" },
    { id: "a2", url: "https://example.com/2", label: "Example 2" }
  ];
  await env.KV_LINKS.put("links", JSON.stringify(sample));
  return new Response("OK", { status: 200 });
}