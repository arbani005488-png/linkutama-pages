// POST /api/login  { username, password }
// Env: ADMIN_USER, ADMIN_PASS_SHA256
async function sha256Hex(txt) {
  const data = new TextEncoder().encode(txt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const arr = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0"));
  return arr.join("");
}

function setCookie(name, value, maxAgeSec = 86400) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const { username = "", password = "" } = body;

  const userOk = username === env.ADMIN_USER;
  const passHex = await sha256Hex(password);
  const passOk = passHex === env.ADMIN_PASS_SHA256;
  if (!userOk || !passOk) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid credentials" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // Create session
  const sid = crypto.randomUUID();
  await env.KV_LINKS.put(`session:${sid}`, username, { expirationTtl: 86400 });

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": setCookie("sid", sid)
    }
  });
}