let currentOrderId = '';
let user = null;
let HARGA_CACHE = null;
let DISKON_RESELLER = 0;
const SATUAN = { like:1000, view:1000, follower:1000, comment:100, share:1000 };
const MIN_ORDER = { like:100, view:100, follower:100, comment:50, share:100 };
const MIN_CHARGE = 5000;

const userData = localStorage.getItem('user');
if (userData) user = JSON.parse(userData);

// ============ DARK MODE ============
function applyTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');
}
function toggleTheme() {
  const current = localStorage.getItem('theme') || 'light';
  localStorage.setItem('theme', current === 'dark' ? 'light' : 'dark');
  applyTheme();
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = (localStorage.getItem('theme') === 'dark') ? '☀' : '☾';
}
applyTheme();

// ============ HEADER ============
function updateHeader() {
  const greet = document.getElementById('userGreet');
  if (greet && user) {
    const levelText = user.level === 'reseller' ? ' • Reseller' : '';
    greet.textContent = 'Halo, ' + user.nama + levelText;
  }
  const saldoEl = document.getElementById('saldoText');
  if (saldoEl && user) saldoEl.textContent = 'Rp ' + (user.saldo || 0).toLocaleString('id-ID');
}

async function refreshSaldo() {
  if (!user) return;
  try {
    const res = await fetch('/api/user/' + user.whatsapp);
    const data = await res.json();
    if (data.success) {
      user.saldo = data.user.saldo;
      user.level = data.user.level;
      localStorage.setItem('user', JSON.stringify(user));
      updateHeader();
    }
  } catch (err) { console.error(err); }
}

// ============ HARGA ============
async function loadHarga() {
  if (HARGA_CACHE) return HARGA_CACHE;
  try {
    const res = await fetch('/api/harga');
    const data = await res.json();
    HARGA_CACHE = data.harga;
    DISKON_RESELLER = data.diskonReseller || 0;
    return HARGA_CACHE;
  } catch (err) { console.error(err); return null; }
}

function hitungTotalLocal(platform, layanan, jumlah) {
  if (!HARGA_CACHE) return { total: 0, hargaSatuan: 0 };
  let hargaSatuan = HARGA_CACHE[platform][layanan];
  if (user && user.level === 'reseller') {
    hargaSatuan = Math.round(hargaSatuan * (1 - DISKON_RESELLER));
  }
  const satuan = SATUAN[layanan];
  let total = Math.ceil((jumlah / satuan) * hargaSatuan);
  if (total < MIN_CHARGE) total = MIN_CHARGE;
  return { total, hargaSatuan };
}

async function updateHarga() {
  const platform = document.getElementById('platform').value;
  const layanan = document.getElementById('layanan').value;
  const hargaCard = document.getElementById('hargaCard');
  const totalCard = document.getElementById('totalCard');

  if (!platform || !layanan) {
    if (hargaCard) hargaCard.classList.add('hidden');
    if (totalCard) totalCard.classList.add('hidden');
    return;
  }

  await loadHarga();
  const { hargaSatuan } = hitungTotalLocal(platform, layanan, 1000);
  const satuanText = layanan === 'comment' ? 'per 100' : 'per 1.000';
  const isReseller = user && user.level === 'reseller';

  const h1 = document.getElementById('hargaSatuan');
  const h2 = document.getElementById('minOrderText');
  if (h1) h1.textContent = 'Rp ' + hargaSatuan.toLocaleString('id-ID') + ' ' + satuanText + (isReseller ? ' (Reseller)' : '');
  if (h2) h2.textContent = MIN_ORDER[layanan] + ' pcs';
  if (hargaCard) hargaCard.classList.remove('hidden');

  hitungTotal();
}

async function hitungTotal() {
  const platform = document.getElementById('platform').value;
  const layanan = document.getElementById('layanan').value;
  const jumlah = parseInt(document.getElementById('jumlah').value) || 0;
  const totalCard = document.getElementById('totalCard');
  if (!totalCard) return;

  if (!platform || !layanan || jumlah <= 0) {
    totalCard.classList.add('hidden');
    return;
  }

  await loadHarga();
  const { total } = hitungTotalLocal(platform, layanan, jumlah);
  document.getElementById('previewTotal').textContent = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('previewSaldo').textContent = 'Rp ' + ((user && user.saldo) || 0).toLocaleString('id-ID');
  const saldoCukup = (user && user.saldo) >= total;
  document.getElementById('previewTotal').style.color = saldoCukup ? '#10b981' : '#ef4444';
  totalCard.classList.remove('hidden');
}

async function tampilkanHargaPlatform() {
  const harga = await loadHarga();
  if (!harga) return;
  ['tiktok', 'instagram', 'facebook'].forEach(p => {
    const elLike = document.getElementById('tag-' + p + '-like');
    const elFollower = document.getElementById('tag-' + p + '-follower');
    if (elLike) elLike.textContent = 'Like Rp ' + harga[p].like.toLocaleString('id-ID');
    if (elFollower) elFollower.textContent = 'Follower Rp ' + harga[p].follower.toLocaleString('id-ID');
  });
}

function pilihPlatform(p) {
  const el = document.getElementById('platform');
  if (!el) return;
  el.value = p;
  const order = document.getElementById('order');
  if (order) order.scrollIntoView({ behavior: 'smooth' });
  updateHarga();
}

document.addEventListener('DOMContentLoaded', () => {
  updateHeader();
  refreshSaldo();
  tampilkanHargaPlatform();
});

// ============ SUBMIT ORDER ============
const orderForm = document.getElementById('orderForm');
if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user) { location.href = '/login.html'; return; }

    const btn = document.getElementById('submitBtn');
    const oldText = btn.textContent;
    btn.textContent = 'Memproses...';
    btn.disabled = true;

    const data = {
      platform: document.getElementById('platform').value,
      layanan:  document.getElementById('layanan').value,
      link:     document.getElementById('link').value,
      jumlah:   parseInt(document.getElementById('jumlah').value),
      whatsapp: user.whatsapp
    };

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      currentOrderId = result.orderId;
      user.saldo = result.saldoSisa;
      localStorage.setItem('user', JSON.stringify(user));
      updateHeader();

      orderForm.classList.add('hidden');
      document.querySelectorAll('.section-title, .platform-list, .fitur-grid, .hero').forEach(el => el.classList.add('hidden'));
      document.getElementById('payBox').classList.remove('hidden');

      document.getElementById('orderIdText').textContent = result.orderId;
      document.getElementById('totalText').textContent = 'Rp ' + result.total.toLocaleString('id-ID');
      document.getElementById('saldoSisaText').textContent = 'Rp ' + result.saldoSisa.toLocaleString('id-ID');
      document.getElementById('waBtn').href = result.waLink;

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Gagal: ' + err.message);
      btn.textContent = oldText;
      btn.disabled = false;
    }
  });
}

// ============ HELPER ============
function zoomQR() {
  const m = document.getElementById('modal');
  if (m) m.classList.remove('hidden');
}
function closeZoom() {
  const m = document.getElementById('modal');
  if (m) m.classList.add('hidden');
}
function copyOrderId() {
  if (!currentOrderId) return;
  navigator.clipboard.writeText(currentOrderId).then(function() {
    alert('ID Order disalin: ' + currentOrderId);
  });
}
function logout() {
  if (!confirm('Yakin ingin keluar?')) return;
  localStorage.removeItem('user');
  localStorage.removeItem('pendingDeposit');
  location.href = '/login.html';
}
