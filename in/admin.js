// in/admin.js (versi ringkas & aman)
(function () {
  const $ = s => document.querySelector(s);
  const loginBox = $('#login');
  const appBox = $('#app');

  async function apiLogin(username, password) {
    const r = await fetch('/api/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    return r.json();
  }
  async function apiList() {
    const r = await fetch('/api/links');
    return r.json();
  }
  async function apiAdd(url, label) {
    const r = await fetch('/api/links', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ url, label })
    });
    return r.json();
  }
  async function apiUpd(id, url, label) {
    const r = await fetch('/api/links/' + id, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ url, label })
    });
    return r.json();
  }
  async function apiDel(id) {
    const r = await fetch('/api/links/' + id, { method:'DELETE' });
    return r.json();
  }

  async function refresh() {
    const r = await apiList();
    if (!r.ok) { alert('Unauthorized / sesi habis. Silakan login ulang.'); return; }
    const tb = document.querySelector('#tbl tbody');
    tb.innerHTML = '';
    r.links.forEach(function(row){
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input class="in" data-k="label" data-id="' + row.id + '" value="' + (row.label || '') + '" style="width:220px"/></td>' +
        '<td><input class="in" data-k="url" data-id="' + row.id + '" value="' + row.url + '" style="width:100%"/></td>' +
        '<td>' +
          '<button class="btn" data-act="save" data-id="' + row.id + '">Simpan</button>' +
          '<button class="btn" data-act="del" data-id="' + row.id + '" style="margin-left:6px;">Hapus</button>' +
        '</td>';
      tb.appendChild(tr);
    });
  }

  // Event: Login
  var btnLogin = document.getElementById('btnLogin');
  if (btnLogin) {
    btnLogin.addEventListener('click', async function () {
      var username = document.getElementById('user').value.trim();
      var password = document.getElementById('pass').value;
      try {
        var r = await apiLogin(username, password);
        if (r && r.ok) {
          loginBox.style.display = 'none';
          appBox.style.display = 'block';
          await refresh();
        } else {
          alert((r && r.error) || 'Login gagal');
        }
      } catch (e) {
        alert('Login gagal');
      }
    });
  }

  // Event: tabel aksi
  document.addEventListener('click', async function (e) {
    var b = e.target && e.target.closest('button');
    if (!b) return;
    var id = b.getAttribute('data-id');
    var act = b.getAttribute('data-act');
    if (act === 'save') {
      var url = document.querySelector('input[data-k="url"][data-id="' + id + '"]').value.trim();
      var label = document.querySelector('input[data-k="label"][data-id="' + id + '"]').value.trim();
      var r = await apiUpd(id, url, label);
      if (!r.ok) alert(r.error || 'Gagal menyimpan'); else refresh();
    } else if (act === 'del') {
      if (!confirm('Hapus link ini?')) return;
      var r2 = await apiDel(id);
      if (!r2.ok) alert(r2.error || 'Gagal menghapus'); else refresh();
    }
  });
})();
