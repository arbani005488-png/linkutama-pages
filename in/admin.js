const $ = s => document.querySelector(s);

async function api(path, opts={}) {
  const r = await fetch(path, opts);
  const data = await r.json().catch(()=>({}));
  return { status: r.status, data, r };
}

async function login(username, password) {
  return api('/api/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
}

async function listLinks() { return api('/api/links'); }
async function addLink(url,label){
  return api('/api/links', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url,label}) });
}
async function updLink(id,url,label){
  return api('/api/links/'+id, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url,label}) });
}
async function delLink(id){ return api('/api/links/'+id, { method:'DELETE' }); }

const loginBox = $('#login');
const appBox = $('#app');

$('#btnLogin').addEventListener('click', async () => {
  const u = $('#user').value.trim();
  const p = $('#pass').value;
  const { status, data } = await login(u,p);
  if (status===200 && data.ok){
    loginBox.style.display='none';
    appBox.style.display='block';
    refresh();
  } else {
    alert(data.error || 'Login gagal');
  }
});

$('#btnAdd').addEventListener('click', async () => {
  const url = $('#newUrl').value.trim();
  const label = $('#newLabel').value.trim();
  if(!/^https?:\/\//i.test(url)) return alert('URL harus http(s)://');
  const { data } = await addLink(url,label);
  if(!data.ok) return alert(data.error || 'Gagal menambah');
  $('#newUrl').value=''; $('#newLabel').value='';
  refresh();
});

async function refresh(){
  const { status, data } = await listLinks();
  if(status!==200 || !data.ok){ alert('Sesi habis / belum login.'); return; }
  const tb = document.querySelector('#tbl tbody'); tb.innerHTML='';
  data.links.forEach(row=>{
    const tr=document.createElement('tr');
    tr.innerHTML =
      `<td><input data-k="label" data-id="${row.id}" value="${row.label||''}" /></td>
       <td><input data-k="url" data-id="${row.id}" value="${row.url}" style="width:100%"/></td>
       <td>
         <button class="btn" data-act="save" data-id="${row.id}">Simpan</button>
         <button class="btn" data-act="del" data-id="${row.id}" style="margin-left:6px;">Hapus</button>
       </td>`;
    tb.appendChild(tr);
  });
}

document.addEventListener('click', async e=>{
  const b=e.target.closest('button'); if(!b) return;
  const id=b.getAttribute('data-id'); const act=b.getAttribute('data-act');
  if(act==='save'){
    const url=document.querySelector(`input[data-k="url"][data-id="${id}"]`).value.trim();
    const label=document.querySelector(`input[data-k="label"][data-id="${id}"]`).value.trim();
    const { data } = await updLink(id,url,label);
    if(!data.ok) alert(data.error||'Gagal simpan'); else refresh();
  }
  if(act==='del'){
    if(!confirm('Hapus link ini?')) return;
    const { data } = await delLink(id);
    if(!data.ok) alert(data.error||'Gagal hapus'); else refresh();
  }
});
