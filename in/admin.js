document.getElementById('btnLogin').addEventListener('click', async () => {
  const username = document.getElementById('user').value.trim();
  const password = document.getElementById('pass').value.trim();

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.ok) {
    alert('Login berhasil ✅');
    window.location.href = '/alternatif';
  } else {
    alert('Login gagal ❌');
  }
});
