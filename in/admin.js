// ===== Admin Dashboard (Orange–White) + Logout + Toast =====
if(!data.ok) return toast(data.error||'Gagal menambah','err');
$('#newUrl').value=''; $('#newLabel').value='';
toast('Link ditambahkan');
refresh();
});


$('#btnLogout').addEventListener('click', ()=>{
clearSession();
loginBox.style.display='block';
appBox.style.display='none';
$('#user').value=''; $('#pass').value='';
toast('Berhasil logout');
});


async function refresh(){
const { status, data } = await listLinks();
if(status!==200 || !data.ok){
clearSession();
loginBox.style.display='block';
appBox.style.display='none';
toast('Sesi habis / belum login','err');
return;
}
const tb = document.querySelector('#tbl tbody');
tb.innerHTML = '';
data.links.forEach(row=>{
const tr = document.createElement('tr');
tr.innerHTML = `
<td><input data-k="label" data-id="${row.id}" value="${row.label||''}"/></td>
<td><input data-k="url" data-id="${row.id}" value="${row.url}" style="width:100%"/></td>
<td>
<button class="btn" data-act="save" data-id="${row.id}">Simpan</button>
<button class="btn" data-act="del" data-id="${row.id}" style="margin-left:6px;">Hapus</button>
</td>`;
tb.appendChild(tr);
});
}


// Delegasi tombol Simpan/Hapus
document.addEventListener('click', async (e)=>{
const b = e.target.closest('button'); if(!b) return;
const id = b.getAttribute('data-id');
const act = b.getAttribute('data-act');
if(act==='save'){
const url = document.querySelector(`input[data-k="url"][data-id="${id}"]`).value.trim();
const label = document.querySelector(`input[data-k="label"][data-id="${id}"]`).value.trim();
if(url && !/^https?:\/\//i.test(url)) return toast('URL harus http(s)://','err');
const { data } = await updLink(id,url,label);
if(!data.ok) return toast(data.error||'Gagal menyimpan','err');
toast('Perubahan disimpan');
refresh();
} else if(act==='del'){
if(!confirm('Hapus link ini?')) return;
const { data } = await delLink(id);
if(!data.ok) return toast(data.error||'Gagal menghapus','err');
toast('Link dihapus');
refresh();
}
});


// Auto render
window.addEventListener('load', ()=>{
if(checkSession()){
loginBox.style.display='none';
appBox.style.display='block';
refresh();
}
});
