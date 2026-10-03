const fs = require('fs');
const path = require('path');
const provider = require('./provider');

const DB_FILE    = path.join(__dirname, '..', 'orders.json');
const USERS_FILE = path.join(__dirname, '..', 'users.json');

function readJSON(f) { return JSON.parse(fs.readFileSync(f)); }
function writeJSON(f, d) { fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// Status IrvanKede: Pending, Processing, Success, Error, Partial
function mapStatus(s) {
  const x = String(s || '').toLowerCase();
  if (x === 'success' || x === 'completed') return 'success';
  if (x === 'partial') return 'partial';
  if (x === 'error' || x === 'canceled' || x === 'cancelled') return 'error';
  if (x === 'processing') return 'processing';
  if (x === 'pending') return 'processing';
  return 'processing';
}

async function syncOnce() {
  const orders = readJSON(DB_FILE);
  const list = Object.values(orders).filter(o => o.status === 'processing' && o.provider_order_id);
  if (!list.length) return { checked: 0, updated: 0 };

  console.log('[SYNC] Cek ' + list.length + ' order processing...');
  let updated = 0;

  for (const o of list) {
    try {
      const st = await provider.status(o.provider_order_id);
      if (!st.success) {
        console.log('[SYNC] ' + o.orderId + ': gagal cek status - ' + st.note);
        continue;
      }
      const newStatus = mapStatus(st.status);
      if (newStatus === o.status) continue;

      o.status = newStatus;
      o.provider_status = st.status;
      o.provider_start_count = st.start_count;
      o.provider_remains = st.remains;
      o.provider_charge = st.charge;
      o.provider_note = st.note || '';
      o.updatedAt = new Date().toISOString();

      if (newStatus === 'error' && o.refundStatus !== 'refunded') {
        const users = readJSON(USERS_FILE);
        if (users[o.whatsapp]) {
          users[o.whatsapp].saldo = (users[o.whatsapp].saldo || 0) + o.total;
          writeJSON(USERS_FILE, users);
          o.refundStatus = 'refunded';
          o.status = 'refunded';
          o.refundedAt = new Date().toISOString();
          o.refundReason = 'Auto refund: provider error';
          console.log('[SYNC] Auto refund ' + o.orderId + ' -> Rp ' + o.total);
        }
      }

      updated++;
      console.log('[SYNC] ' + o.orderId + ': ' + o.status + ' (' + st.status + ')');
    } catch (err) {
      console.error('[SYNC] Gagal cek ' + o.orderId + ': ' + err.message);
    }
  }

  writeJSON(DB_FILE, orders);
  return { checked: list.length, updated };
}

function startSync() {
  const minutes = parseInt(process.env.SYNC_INTERVAL_MINUTES || '5', 10);
  console.log('[SYNC] Cron aktif, interval ' + minutes + ' menit, mode=' + provider.mode);
  setTimeout(syncOnce, 10 * 1000);
  setInterval(syncOnce, minutes * 60 * 1000);
}

module.exports = { syncOnce, startSync };
