// ===== Admin Dashboard (final) =====
// login, list, tambah, update, hapus – stabil untuk Cloudflare Pages

const $ = s => document.querySelector(s);
const loginBox = $('#login');
const appBox   = $('#app');

// ---------- helper ----------
async function api(path, opts = {}) {
  const r = await fetch(path, opts);
  let data = {};
  try { data = await r.json(); } catch (_) {}
  return { status: r.status, data };
}

function toast(msg){ alert(msg); }

// ---------- API wrappers ----------
async function doLogin(username, password) {
  return api('/api/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
}

async function listLinks() {
  return api('/api/links');
}

async function addLink(url, label) {
  return api('/api/links', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ url, label })
  });
}

// gunakan endpoint POST khusus agar stabil di Pages
async function updLink(id, url, label) {
  return api('/api/links-update', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ id, url, label })
  });
}

async function delLink(id) {
  return api('/api/links-delete', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ id })
  });
}

// ---------- UI logic ----------
$('#btnLogin').addEventListener('click', async () => {
  const u = $('#user').value.trim();
  const p = $('#pass').value;
  const { status, data } = await doLogin(u, p);
  if (status === 200 && data.ok) {
    loginBox.style.display = 'none';
    appBox.style.display   = 'block';
    refresh();
  } else {
    toast(data.error || 'Login gagal');
  }
});

$('#btnAdd').addEventListener('click', async () => {
  const url   = $('#newUrl').value.trim();
  const label = $('#newLabel').value.trim();
  if (!/^https?:\/\//i.test(url)) return toast('URL harus diawali http(s)://');

  const { data } = await addLink(url, label);
  if (!data.ok) return toast(data.error || 'Gagal menambah link');

  $('#newUrl').value = '';
  $('#newLabel').value = '';
  refresh();
});

async function refresh() {
  const { status, data } = await listLinks();
  if (status !== 200 || !data.ok) {
    toast('Sesi habis / belum login.');
    loginBox.style.display = 'block';
    appBox.style.display   = 'none';
    return;
  }

  const tb = document.querySelector('#tbl tbody');
  tb.innerHTML = '';
  data.links.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input data-k="label" data-id="${row.id}" value="${row.label || ''}" /></td>
      <td><input data-k="url"   data-id="${row.id}" value="${row.url}" style="width:100%" /></td>
      <td>
        <button class="btn" data-act="save" data-id="${row.id}">Simpan</button>
        <button class="btn" data-act="del"  data-id="${row.id}" style="margin-left:6px;">Hapus</button>
      </td>`;
    tb.appendChild(tr);
  });
}

// event delegation untuk tombol Simpan/Hapus
document.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;

  const id  = b.getAttribute('data-id');
  const act = b.getAttribute('data-act');

  if (act === 'save') {
    const url   = document.querySelector(`input[data-k="url"][data-id="${id}"]`).value.trim();
    const label = document.querySelector(`input[data-k="label"][data-id="${id}"]`).value.trim();
    if (url && !/^https?:\/\//i.test(url)) return toast('URL harus diawali http(s)://');

    const { data } = await updLink(id, url, label);
    if (!data.ok) return toast(data.error || 'Gagal menyimpan perubahan');
    refresh();
  }

  if (act === 'del') {
    if (!confirm('Hapus link ini?')) return;
    const { data } = await delLink(id);
    if (!data.ok) return toast(data.error || 'Gagal menghapus link');
    refresh();
  }
});
