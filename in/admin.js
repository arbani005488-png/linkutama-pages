const $ = s => document.querySelector(s);
const loginBox = $('#login');
const appBox = $('#app');
const API = p => fetch(p).then(r=>r.json());

async function login(username, password){
  const r = await fetch('/api/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,password})
  });
  return r.json();
}
async function listLinks(){ return API('/api/links'); }
async function addLink(url,label){
  const r = await fetch('/api/links',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,label})});
  return r.json();
}
async function updLink(id,url,label){
  const r = await fetch('/api/links/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,label})});
  return r.json();
}
async function delLink(id){ return API('/api/links/'+id+'?delete=1'); }

$('#btnLogin').addEventListener('click', async ()=>{
  const u=$('#user').value.trim(), p=$('#pass').value.trim();
  const res=await login(u,p);
  if(res.ok){
    loginBox.style.display='none';
    appBox.style.display='block';
    refresh();
  }else alert(res.error||'Login gagal');
});

$('#btnAdd').addEventListener('click',async()=>{
  const url=$('#newUrl').value.trim(), label=$('#newLabel').value.trim();
  if(!/^https?:\/\//i.test(url)) return alert('URL harus http(s)://');
  const r=await addLink(url,label);
  if(!r.ok) return alert(r.error||'Gagal menambah');
  $('#newUrl').value=''; $('#newLabel').value='';
  refresh();
});

document.addEventListener('click',async e=>{
  const b=e.target.closest('button'); if(!b) return;
  const id=b.dataset.id, act=b.dataset.act;
  if(act==='save'){
    const url=$(`input[data-k="url"][data-id="${id}"]`).value.trim();
    const label=$(`input[data-k="label"][data-id="${id}"]`).value.trim();
    const r=await updLink(id,url,label);
    if(!r.ok) alert(r.error||'Gagal simpan'); else refresh();
  }else if(act==='del'){
    if(!confirm('Hapus link ini?')) return;
    const r=await delLink(id);
    if(!r.ok) alert(r.error||'Gagal hapus'); else refresh();
  }
});

async function refresh(){
  const r=await listLinks();
  if(!r.ok){ alert('Sesi habis / belum login.'); return; }
  const tb=$('#tbl tbody'); tb.innerHTML='';
  r.links.forEach(row=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><input data-k="label" data-id="${row.id}" value="${row.label||''}"/></td>
    <td><input data-k="url" data-id="${row.id}" value="${row.url}" style="width:100%"/></td>
    <td>
      <button class="btn" data-act="save" data-id="${row.id}">Simpan</button>
      <button class="btn" data-act="del" data-id="${row.id}" style="margin-left:6px;">Hapus</button>
    </td>`;
    tb.appendChild(tr);
  });
}
