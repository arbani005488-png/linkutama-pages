const $ = s => document.querySelector(s);
const api = {
  login: (username, password) => fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ username, password }) }).then(r=>r.json()),
  list: () => fetch('/api/links').then(r=>r.json()),
  add: (url, label) => fetch('/api/links', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ url, label }) }).then(r=>r.json()),
  upd: (id, url, label) => fetch(`/api/links/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ url, label }) }).then(r=>r.json()),
  del: (id) => fetch(`/api/links/${id}`, { method:'DELETE' }).then(r=>r.json()),
};

const loginBox = $('#login');
const appBox = $('#app');

$('#btnLogin')?.addEventListener('click', async () => {
  const username = $('#user').value.trim();
  const password = $('#pass').value;
  const r = await api.login(username, password);
  if (r.ok) {
    loginBox.style.display = 'none';
    appBox.style.display = 'block';
    await refresh();
  } else {
    alert('Login gagal');
  }
});

$('#btnAdd')?.addEventListener('click', async () => {
  const url = $('#newUrl').value.trim();
  const label = $('#newLabel').value.trim();
  if (!url) return alert('URL masih kosong');
  const r = await api.add(url, label);
  if (!r.ok) return alert(r.error || 'Gagal menambah');
  $('#newUrl').value = '';
  $('#newLabel').value = '';
  await refresh();
});

async function refresh(){
  const r = await api.list();
  if (!r.ok) return alert('Unauthorized / sesi habis. Silakan login ulang.');
  const tb = document.querySelector('#tbl tbody');
  tb.innerHTML = '';
  r.links.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="in" data-k="label" data-id="${row.id}" value="${row.label || ''}" style="width:220px"/></td>
      <td><input class="in" data-k="url" data-id="${row.id}" value="${row.url}" style="width:100%"/></td>
      <td>
        <button class="btn" data-act="save" data-id="${row.id}">Simpan</button>
        <button class="btn" data-act="del" data-id="${row.id}" style="margin-left:6px;">Hapus</button>
      </td>`;
    tb.appendChild(tr);
  });
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const id = b.getAttribute('data-id');
  if (b.getAttribute('data-act') === 'save') {
    const url = document.querySelector(\`input[data-k="url"][data-id="\${id}"]\`).value.trim();
    const label = document.querySelector(\`input[data-k="label"][data-id="\${id}"]\`).value.trim();
    const r = await api.upd(id, url, label);
    if (!r.ok) alert(r.error || 'Gagal menyimpan');
    else await refresh();
  }
  if (b.getAttribute('data-act') === 'del') {
    if (!confirm('Hapus link ini?')) return;
    const r = await api.del(id);
    if (!r.ok) alert(r.error || 'Gagal menghapus');
    else await refresh();
  }
});