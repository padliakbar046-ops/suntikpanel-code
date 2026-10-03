const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><polyline points="20 6 9 17 4 12"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  reply: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>'
};

function getPlatformIcon(platform) {
  if (platform === 'tiktok') return '<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12z" fill="#000"/></svg>';
  if (platform === 'instagram') return '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig2)"/><circle cx="12" cy="12" r="4.2" stroke="#fff" stroke-width="1.8" fill="none"/><circle cx="17.6" cy="6.4" r="1.2" fill="#fff"/><defs><linearGradient id="ig2" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FEDA75"/><stop offset="0.3" stop-color="#FA7E1E"/><stop offset="0.55" stop-color="#D62976"/><stop offset="0.8" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs></svg>';
  if (platform === 'facebook') return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#1877F2"/><path d="M15.5 12.5h-2.3V20h-3v-7.5H8.6v-2.6h1.6V8.4c0-1.8 1-2.9 2.9-2.9.9 0 1.7.1 1.9.1v2.2h-1.3c-.9 0-1.1.4-1.1 1v1.1h2.4l-.5 2.6z" fill="#fff"/></svg>';
  return '🌐';
}
function getPlatformClass(p) {
  if (p === 'tiktok') return 'p-tiktok';
  if (p === 'instagram') return 'p-instagram';
  if (p === 'facebook') return 'p-facebook';
  return '';
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const map = { orders: 0, deposits: 1, tickets: 2 };
  document.querySelector('.tab[data-tab="' + tab + '"]').classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  const navs = document.querySelectorAll('.nav-item');
  if (navs[map[tab]]) navs[map[tab]].classList.add('active');
}

// ============ ORDERS ============
async function loadOrders() {
  try {
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    const allOrders = data.orders || [];
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'pending').length;
    const paid = allOrders.filter(o => o.status === 'paid').length;
    const revenue = allOrders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total, 0);
    const today = new Date().toDateString();
    const todayCount = allOrders.filter(o => new Date(o.createdAt).toDateString() === today).length;

    document.getElementById('revenueMain').textContent = 'Rp' + revenue.toLocaleString('id-ID');
    document.getElementById('revenueSub').textContent = 'Dari ' + paid + ' pesanan selesai';
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statPaid').textContent = paid;
    document.getElementById('statToday').textContent = todayCount;
    document.getElementById('lastUpdate').textContent = 'Update ' + new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });

    const list = document.getElementById('orderList');
    list.innerHTML = '';
    if (allOrders.length === 0) { list.innerHTML = '<div class="empty">Belum ada pesanan</div>'; return; }

    allOrders.forEach(o => {
      const card = document.createElement('div');
      card.className = 'order-card ' + o.status;
      const aksi = o.status === 'pending'
        ? '<button class="oc-btn oc-btn-green" onclick="confirmOrder(\'' + o.orderId + '\')">' + ICON.check + ' SELESAI</button>' +
          '<button class="oc-btn oc-btn-blue" onclick="chatWa(\'' + (o.whatsapp || o.kontak || '') + '\')">' + ICON.chat + ' CHAT</button>'
        : '<button class="oc-btn oc-btn-blue" onclick="copyOrder(\'' + o.orderId + '\')">' + ICON.copy + ' SALIN</button>' +
          '<button class="oc-btn oc-btn-blue" onclick="chatWa(\'' + (o.whatsapp || o.kontak || '') + '\')">' + ICON.chat + ' CHAT</button>';

      card.innerHTML =
        '<div class="oc-header">' +
          '<div class="oc-id"><div class="oc-platform ' + getPlatformClass(o.platform) + '">' + getPlatformIcon(o.platform) + '</div>' +
          '<div class="oc-id-text"><b>' + o.platform.toUpperCase() + '</b><small>' + formatTime(o.createdAt) + '</small></div></div>' +
          '<span class="oc-badge ' + o.status + '">' + o.status + '</span>' +
        '</div>' +
        '<div class="oc-body">' +
          '<div class="oc-field"><small>Layanan</small><b>' + o.layanan + '</b></div>' +
          '<div class="oc-field"><small>Jumlah</small><b>' + o.jumlah.toLocaleString('id-ID') + ' pcs</b></div>' +
          '<div class="oc-field full"><small>Target</small><b>' + o.link + '</b></div>' +
          '<div class="oc-field full"><small>Customer</small><b>' + (o.nama || '-') + ' · ' + (o.whatsapp || o.kontak || '-') + '</b></div>' +
        '</div>' +
        '<div class="oc-price-row"><small>TOTAL BAYAR</small><b>Rp ' + o.total.toLocaleString('id-ID') + '</b></div>' +
        '<div class="oc-actions">' + aksi + '</div>';
      list.appendChild(card);
    });
  } catch (err) { console.error(err); document.getElementById('orderList').innerHTML = '<div class="empty">Gagal memuat data</div>'; }
}

// ============ DEPOSITS ============
async function loadDeposits() {
  try {
    const res = await fetch('/api/admin/deposits');
    const data = await res.json();
    const all = data.deposits || [];
    const pending = all.filter(d => d.status === 'pending').length;
    const confirmed = all.filter(d => d.status === 'confirmed').length;
    const rejected = all.filter(d => d.status === 'rejected').length;
    const totalConfirmed = all.filter(d => d.status === 'confirmed').reduce((s, d) => s + d.nominal, 0);

    document.getElementById('depPending').textContent = pending;
    document.getElementById('depConfirmed').textContent = confirmed;
    document.getElementById('depRejected').textContent = rejected;
    document.getElementById('depTotal').textContent = 'Rp' + totalConfirmed.toLocaleString('id-ID');
    const badge = document.getElementById('depositBadge');
    badge.textContent = pending;
    badge.style.display = pending > 0 ? 'inline-block' : 'none';
    document.getElementById('depUpdate').textContent = 'Update ' + new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });

    const list = document.getElementById('depositList');
    list.innerHTML = '';
    if (all.length === 0) { list.innerHTML = '<div class="empty">Belum ada deposit</div>'; return; }

    all.forEach(d => {
      const card = document.createElement('div');
      card.className = 'deposit-card ' + d.status;
      let aksi = d.status === 'pending'
        ? '<button class="dc-btn dc-btn-green" onclick="confirmDeposit(\'' + d.depositId + '\')">' + ICON.check + ' KONFIRMASI</button>' +
          '<button class="dc-btn dc-btn-red" onclick="rejectDeposit(\'' + d.depositId + '\')">' + ICON.close + ' TOLAK</button>'
        : '<button class="dc-btn dc-btn-blue" onclick="chatWa(\'' + d.whatsapp + '\')">' + ICON.chat + ' CHAT WA</button>';

      card.innerHTML =
        '<div class="dc-header"><div class="dc-id"><b>' + d.depositId + '</b><small>' + formatTime(d.createdAt) + '</small></div><span class="dc-badge ' + d.status + '">' + d.status + '</span></div>' +
        '<div class="dc-amount"><small>NOMINAL</small><b>Rp ' + d.nominal.toLocaleString('id-ID') + '</b></div>' +
        '<div class="dc-info">WhatsApp: <b>' + d.whatsapp + '</b></div>' +
        '<div class="dc-actions">' + aksi + '</div>';
      list.appendChild(card);
    });
  } catch (err) { console.error(err); }
}

// ============ TICKETS ============
async function loadTickets() {
  try {
    const res = await fetch('/api/admin/tickets');
    const data = await res.json();
    const all = data.tickets || [];
    const open = all.filter(t => t.status === 'open').length;
    const badge = document.getElementById('ticketBadge');
    badge.textContent = open;
    badge.style.display = open > 0 ? 'inline-block' : 'none';
    document.getElementById('tktUpdate').textContent = 'Update ' + new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });

    const list = document.getElementById('ticketList');
    list.innerHTML = '';
    if (all.length === 0) { list.innerHTML = '<div class="empty">Belum ada tiket</div>'; return; }

    all.forEach(t => {
      const card = document.createElement('div');
      card.className = 'deposit-card ' + (t.status === 'closed' ? 'confirmed' : t.status === 'answered' ? '' : 'pending');
      card.innerHTML =
        '<div class="dc-header"><div class="dc-id"><b>' + t.ticketId + '</b><small>' + formatTime(t.createdAt) + '</small></div><span class="dc-badge ' + (t.status === 'closed' ? 'confirmed' : t.status === 'answered' ? 'answered' : 'pending') + '">' + t.status + '</span></div>' +
        '<div style="font-size:13px;font-weight:800;margin-bottom:6px;color:#1a2a3a">' + t.subjek + '</div>' +
        '<div class="dc-info"><b>Kategori:</b> ' + t.kategori + ' · <b>Dari:</b> ' + t.nama + ' (' + t.whatsapp + ')</div>' +
        '<div style="background:#f7faff;border-radius:10px;padding:10px;font-size:12px;color:#4a5a6a;margin-bottom:10px;line-height:1.5">' + t.pesan + '</div>' +
        '<div class="dc-actions">' +
          '<button class="dc-btn dc-btn-green" onclick="replyTicket(\'' + t.ticketId + '\')">' + ICON.reply + ' BALAS</button>' +
          '<button class="dc-btn dc-btn-blue" onclick="chatWa(\'' + t.whatsapp + '\')">' + ICON.chat + ' WA</button>' +
          (t.status !== 'closed' ? '<button class="dc-btn dc-btn-red" onclick="closeTicket(\'' + t.ticketId + '\')">' + ICON.close + ' TUTUP</button>' : '') +
        '</div>';
      list.appendChild(card);
    });
  } catch (err) { console.error(err); }
}

// ============ ACTIONS ============
async function confirmOrder(id) {
  if (!confirm('Tandai order ' + id + ' sebagai selesai?')) return;
  await fetch('/api/confirm/' + id, { method: 'POST' });
  loadOrders();
}
async function confirmDeposit(id) {
  if (!confirm('Konfirmasi deposit ' + id + '?')) return;
  try {
    const res = await fetch('/api/admin/deposit/confirm/' + id, { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    alert('Deposit dikonfirmasi.\nSaldo user sekarang: Rp ' + data.saldoBaru.toLocaleString('id-ID'));
    loadDeposits(); loadOrders();
  } catch (err) { alert('Gagal: ' + err.message); }
}
async function rejectDeposit(id) {
  if (!confirm('Tolak deposit ' + id + '?')) return;
  await fetch('/api/admin/deposit/reject/' + id, { method: 'POST' });
  loadDeposits();
}
async function replyTicket(id) {
  const pesan = prompt('Tulis balasan untuk tiket ' + id + ':');
  if (!pesan) return;
  await fetch('/api/ticket/' + id + '/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: 'admin', pesan })
  });
  alert('Balasan terkirim');
  loadTickets();
}
async function closeTicket(id) {
  if (!confirm('Tutup tiket ' + id + '?')) return;
  await fetch('/api/ticket/' + id + '/close', { method: 'POST' });
  loadTickets();
}
function copyOrder(id) { navigator.clipboard.writeText(id).then(() => alert('ID ' + id + ' disalin')); }
function chatWa(wa) {
  if (!wa) { alert('Nomor WA tidak tersedia'); return; }
  const clean = wa.replace(/[^0-9]/g, '').replace(/^0/, '62');
  window.open('https://wa.me/' + clean, '_blank');
}

// ============ INIT ============
function loadAll() { loadOrders(); loadDeposits(); loadTickets(); }
loadAll();
setInterval(loadAll, 15000);
