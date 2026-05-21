const SESSIONS_KEY = 'parking_sessions';
const CARPARKS_URL = 'data/carparks.json';
const HOLIDAYS_KEY = 'parking_holidays';
const HK_HOLIDAYS_DEFAULTS = [
  '2026-01-01', '2026-02-17', '2026-02-18', '2026-02-19',
  '2026-04-03', '2026-04-04', '2026-04-06', '2026-04-07',
  '2026-05-01', '2026-05-25', '2026-06-19', '2026-07-01',
  '2026-09-26', '2026-10-01', '2026-10-19', '2026-12-25', '2026-12-26',
  '2027-01-01', '2027-02-06', '2027-02-08', '2027-02-09',
  '2027-03-26', '2027-03-27', '2027-03-29',
  '2027-04-05', '2027-05-01', '2027-05-13', '2027-06-09', '2027-07-01',
  '2027-09-16', '2027-10-01', '2027-10-08', '2027-12-25', '2027-12-27',
  '2028-01-01', '2028-01-26', '2028-01-27', '2028-01-28',
  '2028-04-04', '2028-04-14', '2028-04-15', '2028-04-17',
  '2028-05-01', '2028-05-02', '2028-05-29',
  '2028-07-01', '2028-10-02', '2028-10-04', '2028-10-26',
  '2028-12-25', '2028-12-26',
  '2029-01-01', '2029-02-13', '2029-02-14', '2029-02-15',
  '2029-03-30', '2029-03-31', '2029-04-02', '2029-04-04',
  '2029-05-01', '2029-05-21',
  '2029-06-16', '2029-07-02', '2029-09-24', '2029-10-01', '2029-10-16',
  '2029-12-25', '2029-12-26',
  '2030-01-01', '2030-02-04', '2030-02-05', '2030-02-06',
  '2030-04-05', '2030-04-19', '2030-04-20', '2030-04-22',
  '2030-05-01', '2030-05-09', '2030-06-05', '2030-07-01',
  '2030-09-13', '2030-10-01', '2030-10-05',
  '2030-12-25', '2030-12-26',
  '2031-01-01', '2031-01-23', '2031-01-24', '2031-01-25',
  '2031-04-05', '2031-04-11', '2031-04-12', '2031-04-14',
  '2031-04-29', '2031-05-01',
  '2031-05-26', '2031-07-01', '2031-09-12', '2031-10-01', '2031-10-24',
  '2031-12-25', '2031-12-26',
  '2032-01-01', '2032-02-11', '2032-02-12', '2032-02-13',
  '2032-03-26', '2032-03-27', '2032-03-29',
  '2032-04-05', '2032-05-01', '2032-05-17',
  '2032-06-14', '2032-07-01', '2032-09-30', '2032-10-01', '2032-10-12',
  '2032-12-25', '2032-12-27',
  '2033-01-01', '2033-01-31', '2033-02-01', '2033-02-02',
  '2033-04-05', '2033-04-15', '2033-04-16', '2033-04-18',
  '2033-05-02', '2033-05-06',
  '2033-06-02', '2033-07-01',
  '2033-09-23', '2033-10-01', '2033-10-14',
  '2033-12-26', '2033-12-27',
  '2034-01-02', '2034-01-19', '2034-01-20', '2034-01-21',
  '2034-03-31', '2034-04-01', '2034-04-03',
  '2034-04-05', '2034-05-01',
  '2034-06-22', '2034-07-01',
  '2034-09-28', '2034-10-01', '2034-10-25',
  '2034-12-25', '2034-12-26',
  '2035-01-01', '2035-02-08', '2035-02-09', '2035-02-10',
  '2035-04-04', '2035-04-23', '2035-04-24', '2035-04-26',
  '2035-05-01', '2035-05-11',
  '2035-06-11', '2035-07-02',
  '2035-09-27', '2035-10-01', '2035-10-17',
  '2035-12-25', '2035-12-26',
];

let state = {
  carparks: [],
  activeSession: null,
  history: [],
};

let timerInterval = null;

// ====== STORAGE ======
function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.activeSession = data.active || null;
    state.history = data.history || [];
  } catch (e) {
    state.activeSession = null;
    state.history = [];
  }
}

function saveSessions() {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify({
    active: state.activeSession,
    history: state.history,
  }));
}

// ====== CAR PARK DATA ======
async function loadCarparks() {
  const res = await fetch(CARPARKS_URL);
  state.carparks = await res.json();
}

// ====== HELPERS ======
function nowInput() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateFromInput(str) {
  if (!str) return null;
  const [datePart, timePart] = str.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

function getCarpark(id) {
  return state.carparks.find(c => c.id === id);
}

function fmtDurationHours(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0) return `${h}小時 ${m}分鐘`;
  return `${m}分鐘`;
}

function fmtDurationElapsed(entryDate) {
  const diff = Date.now() - entryDate.getTime();
  if (diff < 0) return '0小時 00分 00秒';
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}小時 ${String(m).padStart(2, '0')}分 ${String(s).padStart(2, '0')}秒`;
}

function fmtDate(d) {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function fmtTime(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ====== PUBLIC HOLIDAYS ======
function getHolidays() {
  const raw = localStorage.getItem(HOLIDAYS_KEY);
  if (!raw) return new Set(HK_HOLIDAYS_DEFAULTS);
  try {
    const mods = JSON.parse(raw);
    const s = new Set(HK_HOLIDAYS_DEFAULTS);
    for (const d of mods.removed) s.delete(d);
    for (const d of mods.added) s.add(d);
    return s;
  } catch (e) {
    return new Set(HK_HOLIDAYS_DEFAULTS);
  }
}

function saveHolidayMods(added, removed) {
  localStorage.setItem(HOLIDAYS_KEY, JSON.stringify({ added: [...added], removed: [...removed] }));
}

function isPublicHoliday(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return getHolidays().has(`${y}-${m}-${d}`);
}

// ====== CALCULATOR ======
function getRateForTime(scheme, date) {
  const day = isPublicHoliday(date) ? 0 : date.getDay();
  const time = date.getHours() + date.getMinutes() / 60;
  for (const p of scheme.periods) {
    if (p.days && !p.days.includes(day)) continue;
    const [fH, fM] = p.from.split(':').map(Number);
    const [tH, tM] = p.to.split(':').map(Number);
    const from = fH + fM / 60;
    const to = tH + tM / 60;
    if (to < from) {
      if (time >= from || time < to) return { rate: p.hourly, label: p.label };
    } else {
      if (time >= from && time < to) return { rate: p.hourly, label: p.label };
    }
  }
  const fallback = scheme.periods[0];
  return { rate: fallback?.hourly || 0, label: fallback?.label || '' };
}

function calculateFee(carparkId, entryStr, exitStr, schemeOverride) {
  let scheme;
  if (schemeOverride) {
    scheme = schemeOverride;
  } else {
    const cp = getCarpark(carparkId);
    if (!cp) return null;
    scheme = cp.scheme;
  }
  const entry = dateFromInput(entryStr);
  const exit = dateFromInput(exitStr);
  if (!entry || !exit || exit <= entry) return null;

  const diffMs = exit - entry;
  const diffHours = diffMs / 3600000;
  const rawChargedHours = Math.ceil(diffHours);
  const minHours = scheme.min_hours || 1;
  const chargedHours = Math.max(minHours, rawChargedHours);

  let totalFee = 0;
  const labelCounts = {};
  for (let h = 0; h < chargedHours; h++) {
    const current = new Date(entry.getTime() + h * 3600000);
    const { rate, label } = getRateForTime(scheme, current);
    totalFee += rate;
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  }

  const primaryLabel = Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0][0];
  const avgRate = Math.round(totalFee / chargedHours);

  return { durationHours: diffHours, chargedHours, hourlyRate: avgRate, periodLabel: primaryLabel, fee: totalFee };
}

// ====== ACTIVE SESSION ======
function checkIn() {
  const now = nowInput();
  state.activeSession = {
    status: 'active',
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    entry: now,
    carpark_id: null,
    notes: '',
    photo: null,
  };
  saveSessions();
  render();
}

function adjustEntry(newEntry) {
  if (!state.activeSession) return;
  state.activeSession.entry = newEntry;
  saveSessions();
}

function selectCarpark(carparkId) {
  if (!state.activeSession) return;
  state.activeSession.carpark_id = carparkId || null;
  saveSessions();
  render();
}

function saveNotes(notes) {
  if (!state.activeSession) return;
  state.activeSession.notes = notes;
  saveSessions();
}

function savePhoto(dataUrl) {
  if (!state.activeSession) return;
  state.activeSession.photo = dataUrl;
  saveSessions();
  render();
}

function doCheckout(data) {
  if (!state.activeSession) return;
  const s = state.activeSession;
  s.status = 'completed';
  s.exit = data.exit;
  s.carpark_id = data.carpark_id || null;
  s.notes = data.notes || '';

  if (data.carpark_id) {
    const cp = getCarpark(data.carpark_id);
    if (cp) {
      s.rate_snapshot = JSON.parse(JSON.stringify(cp.scheme));
      const calc = calculateFee(data.carpark_id, s.entry, data.exit);
      s.calculated_fee = calc ? calc.fee : null;
    }
  }
  s.manual_fee = data.manual_fee || null;
  s.manual_reason = data.manual_reason || '';
  if (data.photo !== undefined) s.photo = data.photo;

  state.history.unshift(s);
  state.activeSession = null;
  stopTimer();
  saveSessions();
  render();
}

function cancelSession() {
  if (!state.activeSession) return;
  if (!confirm('確定取消當前泊車記錄？')) return;
  state.activeSession = null;
  stopTimer();
  saveSessions();
  render();
}

// ====== TIMER ======
function startTimer() {
  stopTimer();
  timerInterval = setInterval(renderTimer, 1000);
  renderTimer();
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function renderTimer() {
  if (!state.activeSession) return;
  const entry = dateFromInput(state.activeSession.entry);
  if (!entry) return;

  document.getElementById('session-timer').textContent = fmtDurationElapsed(entry);

  if (state.activeSession.carpark_id) {
    const now = nowInput();
    const calc = calculateFee(state.activeSession.carpark_id, state.activeSession.entry, now);
    if (calc) {
      document.getElementById('session-est-fee').textContent = `$${calc.fee}`;
    }
  }
}

// ====== RENDER ======
function render() {
  const sessionSection = document.getElementById('session-section');
  const checkinSection = document.getElementById('checkin-section');

  if (state.activeSession) {
    sessionSection.classList.remove('hidden');
    checkinSection.classList.add('hidden');
    renderActiveSession();
    startTimer();
  } else {
    sessionSection.classList.add('hidden');
    checkinSection.classList.remove('hidden');
    stopTimer();
  }
  updateSummary();
}

function renderActiveSession() {
  const s = state.activeSession;
  document.getElementById('session-entry').value = s.entry;

  const sel = document.getElementById('session-carpark');
  const currentId = s.carpark_id || '';
  sel.innerHTML = '<option value="">— 選擇停車場 —</option>';
  for (const cp of state.carparks) {
    const opt = document.createElement('option');
    opt.value = cp.id;
    opt.textContent = cp.name;
    if (cp.id === currentId) opt.selected = true;
    sel.appendChild(opt);
  }

  const rateDisplay = document.getElementById('session-rate-display');
  const estRow = document.getElementById('session-est-row');
  const feeRow = document.getElementById('session-fee-row');
  if (s.carpark_id) {
    const cp = getCarpark(s.carpark_id);
    if (cp) {
      rateDisplay.textContent = cp.scheme.periods.map(p => `$${p.hourly}/小時 (${p.label})`).join(', ');
      estRow.classList.remove('hidden');
      feeRow.classList.remove('hidden');
    }
  } else {
    rateDisplay.textContent = '';
    estRow.classList.add('hidden');
    feeRow.classList.add('hidden');
  }

  document.getElementById('session-notes').value = s.notes || '';

  const photoPreview = document.getElementById('photo-preview');
  const photoStatus = document.getElementById('photo-status');
  if (s.photo) {
    photoPreview.classList.remove('hidden');
    photoPreview.src = s.photo;
    photoStatus.textContent = '✅ 已儲存相片';
  } else {
    photoPreview.classList.add('hidden');
    photoPreview.src = '';
    photoStatus.textContent = '';
  }
}

function updateSummary() {
  const total = state.history.length;
  let spent = 0;
  for (const s of state.history) {
    spent += (s.manual_fee != null ? s.manual_fee : (s.calculated_fee || 0));
  }
  document.getElementById('total-sessions').textContent = total;
  document.getElementById('total-spent').textContent = `$${spent}`;
  const summary = document.getElementById('summary');
  summary.classList.toggle('hidden', total === 0);

  const cpBtn = document.getElementById('btn-carpark-select');
  if (state.activeSession?.carpark_id) {
    const cp = getCarpark(state.activeSession.carpark_id);
    if (cp) {
      const rates = cp.scheme.periods.map(p => `$${p.hourly}`).join('/');
      cpBtn.textContent = `🅿 ${cp.name} ${rates}`;
    }
  } else {
    cpBtn.textContent = '🅿 停車場';
  }
}

// ====== ESTIMATOR ======
function openEstimator() {
  const modal = document.getElementById('estimator-modal');
  modal.classList.remove('hidden');

  const sel = document.getElementById('est-carpark');
  sel.innerHTML = '<option value="">— 選擇 —</option>';
  for (const cp of state.carparks) {
    const opt = document.createElement('option');
    opt.value = cp.id;
    opt.textContent = cp.name;
    sel.appendChild(opt);
  }

  const entryInput = document.getElementById('est-entry');
  const exitInput = document.getElementById('est-exit');

  if (state.activeSession) {
    entryInput.value = state.activeSession.entry;
    if (state.activeSession.carpark_id) sel.value = state.activeSession.carpark_id;
    const entry = dateFromInput(state.activeSession.entry);
    if (entry) {
      const defExit = new Date(entry.getTime() + 60 * 60 * 1000);
      exitInput.value = toInputStr(defExit);
    }
  } else {
    entryInput.value = nowInput();
    const d = new Date();
    exitInput.value = toInputStr(new Date(d.getTime() + 60 * 60 * 1000));
  }

  updateEstimator();
}

function toInputStr(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function closeEstimator() {
  document.getElementById('estimator-modal').classList.add('hidden');
}

function updateEstimator() {
  const carparkId = document.getElementById('est-carpark').value;
  const entry = document.getElementById('est-entry').value;
  const exit = document.getElementById('est-exit').value;
  const resultDiv = document.getElementById('est-result');
  const warningDiv = document.getElementById('est-warning');

  if (!carparkId || !entry || !exit) {
    resultDiv.classList.add('hidden');
    return;
  }

  const entryDate = dateFromInput(entry);
  const exitDate = dateFromInput(exit);
  if (entryDate && exitDate && exitDate <= entryDate) {
    warningDiv.classList.remove('hidden');
    document.getElementById('est-duration').textContent = '';
    document.getElementById('est-charged').textContent = '';
    document.getElementById('est-rate').textContent = '';
    document.getElementById('est-fee').textContent = '';
    resultDiv.classList.remove('hidden');
    return;
  }
  warningDiv.classList.add('hidden');

  const calc = calculateFee(carparkId, entry, exit);
  if (!calc) {
    resultDiv.classList.add('hidden');
    return;
  }

  resultDiv.classList.remove('hidden');
  document.getElementById('est-duration').textContent = fmtDurationHours(calc.durationHours);
  document.getElementById('est-charged').textContent = `${calc.chargedHours} 小時`;
  document.getElementById('est-rate').textContent = `$${calc.hourlyRate}/小時 (${calc.periodLabel})`;
  document.getElementById('est-fee').textContent = `$${calc.fee}`;
}

// ====== CAR PARK SELECTOR ======
function openCarparkSelector() {
  document.getElementById('carpark-modal').classList.remove('hidden');
  const list = document.getElementById('carpark-list');
  const activeId = state.activeSession?.carpark_id || '';
  list.innerHTML = state.carparks.map(cp => {
    const periodsHtml = cp.scheme.periods.map(p => {
      const timeStr = p.from === '00:00' && p.to === '23:59' ? '' : ` ${p.from}-${p.to}`;
      return `<div class="cp-period">${escHtml(p.label)}${timeStr}: <strong>$${p.hourly}/小時</strong></div>`;
    }).join('');
    const selected = cp.id === activeId;
    return `
      <div class="cp-item${selected ? ' cp-active' : ''}" data-id="${cp.id}">
        <div class="cp-item-name">${escHtml(cp.name)}</div>
        <div class="cp-item-periods">${periodsHtml}</div>
        ${cp.address ? `<div class="cp-item-addr">${escHtml(cp.address)}</div>` : ''}
      </div>
    `;
  }).join('');
}

function closeCarparkSelector() {
  document.getElementById('carpark-modal').classList.add('hidden');
}

function selectCarparkFromList(id) {
  if (state.activeSession) {
    state.activeSession.carpark_id = id || null;
    saveSessions();
    render();
  }
  closeCarparkSelector();
}

// ====== HISTORY ======
function openHistory() {
  document.getElementById('history-modal').classList.remove('hidden');
  renderHistory();
}

function closeHistory() {
  document.getElementById('history-modal').classList.add('hidden');
}

function deleteHistoryItem(idx) {
  if (!confirm('確定刪除此記錄？')) return;
  state.history.splice(idx, 1);
  saveSessions();
  renderHistory();
  updateSummary();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (state.history.length === 0) {
    list.innerHTML = '<p class="empty-msg">暫無泊車記錄。</p>';
    return;
  }

  list.innerHTML = state.history.map((s, i) => {
    const fee = s.manual_fee != null
      ? `$${s.manual_fee} <span class="adj-badge">已調整</span>`
      : (s.calculated_fee != null ? `$${s.calculated_fee}` : '—');
    const carparkName = s.carpark_id
      ? (getCarpark(s.carpark_id)?.name || s.carpark_id)
      : '—';
    const entryDate = dateFromInput(s.entry);
    const exitDate = s.exit ? dateFromInput(s.exit) : null;
    const timeStr = entryDate
      ? (exitDate
        ? `${fmtDate(entryDate)} ${fmtTime(entryDate)} – ${fmtTime(exitDate)}`
        : `${fmtDate(entryDate)} ${fmtTime(entryDate)}`)
      : s.entry;

    return `
      <div class="hist-item" data-index="${i}">
        <div class="hist-item-header">
          <span>${escHtml(carparkName)}</span>
          <span>
            <span class="hist-item-fee">${fee}</span>
            <button class="hist-del-btn" data-index="${i}" title="刪除">🗑</button>
          </span>
        </div>
        <div class="hist-item-time">${escHtml(timeStr)}</div>
        ${s.notes ? `<div class="hist-item-notes">📝 ${escHtml(s.notes)}</div>` : ''}
        ${s.photo ? `<div class="hist-item-notes">📷 相片</div>` : ''}
      </div>
    `;
  }).join('');
}

// ====== DETAIL VIEW ======
function openDetail(index) {
  const s = state.history[index];
  if (!s) return;
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-body');

  const carparkName = s.carpark_id
    ? (getCarpark(s.carpark_id)?.name || s.carpark_id)
    : '—';
  const entry = dateFromInput(s.entry);
  const exit = s.exit ? dateFromInput(s.exit) : null;

  const fee = s.manual_fee != null ? s.manual_fee : (s.calculated_fee != null ? s.calculated_fee : null);

  let calc = null;
  if (s.rate_snapshot && s.entry && s.exit) {
    calc = calculateFee(s.carpark_id, s.entry, s.exit, s.rate_snapshot);
  }

  let html = `<div class="detail-section">`;

  html += `<div class="detail-row"><span class="dl">停車場</span><span class="dv">${escHtml(carparkName)}</span></div>`;
  if (entry) html += `<div class="detail-row"><span class="dl">入場時間</span><span class="dv">${fmtDate(entry)} ${fmtTime(entry)}</span></div>`;
  if (exit) html += `<div class="detail-row"><span class="dl">出場時間</span><span class="dv">${fmtDate(exit)} ${fmtTime(exit)}</span></div>`;

  if (calc) {
    html += `<hr>`;
    html += `<div class="detail-row"><span class="dl">時長</span><span class="dv">${fmtDurationHours(calc.durationHours)}</span></div>`;
    html += `<div class="detail-row"><span class="dl">收費時數</span><span class="dv">${calc.chargedHours} 小時</span></div>`;
    html += `<div class="detail-row"><span class="dl">適用費率</span><span class="dv">$${calc.hourlyRate}/小時 (${calc.periodLabel})</span></div>`;
    if (s.rate_snapshot && s.rate_snapshot.periods) {
      html += `<div class="detail-row"><span class="dl">收費方案</span><span class="dv">`;
      html += s.rate_snapshot.periods.map(p => `${escHtml(p.label)}: $${p.hourly}/小時 (${p.from}-${p.to})`).join('<br>');
      html += `</span></div>`;
    }
    html += `<div class="detail-row detail-total"><span class="dl">計算費用</span><span class="dv">$${calc.fee}</span></div>`;
  }

  if (s.manual_fee != null) {
    html += `<div class="detail-row"><span class="dl">手動調整</span><span class="dv">$${s.manual_fee}`;
    if (s.manual_reason) html += ` (${escHtml(s.manual_reason)})`;
    html += `</span></div>`;
  }

  if (s.notes) {
    html += `<hr>`;
    html += `<div class="detail-row"><span class="dl">備註</span><span class="dv">${escHtml(s.notes)}</span></div>`;
  }

  if (s.photo) {
    if (!s.notes) html += `<hr>`;
    html += `<img src="${s.photo}" class="photo-preview" style="margin-top:8px">`;
  }

  html += `</div>`;
  body.innerHTML = html;
  modal.classList.remove('hidden');
}

function closeDetail() {
  document.getElementById('detail-modal').classList.add('hidden');
}

// ====== EXPORT ======
function exportHistory() {
  const data = JSON.stringify(state.history, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const today = new Date();
  a.download = `parking-history-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ====== CHECKOUT ======
function openCheckout() {
  if (!state.activeSession) return;
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('hidden');

  document.getElementById('co-entry').textContent = state.activeSession.entry;

  const now = nowInput();
  document.getElementById('co-exit').value = now;

  const sel = document.getElementById('co-carpark');
  sel.innerHTML = '<option value="">— 選擇 —</option>';
  for (const cp of state.carparks) {
    const opt = document.createElement('option');
    opt.value = cp.id;
    opt.textContent = cp.name;
    sel.appendChild(opt);
  }
  sel.value = state.activeSession.carpark_id || '';

  document.getElementById('co-notes').value = state.activeSession.notes || '';
  document.getElementById('co-manual-fee').value = '';
  document.getElementById('co-manual-reason').value = '';

  const preview = document.getElementById('co-photo-preview');
  const status = document.getElementById('co-photo-status');
  if (state.activeSession.photo) {
    preview.classList.remove('hidden');
    preview.src = state.activeSession.photo;
    status.textContent = '✅ 已附加相片';
  } else {
    preview.classList.add('hidden');
    preview.src = '';
    status.textContent = '';
  }

  updateCheckoutCalc();
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function updateCheckoutCalc() {
  document.getElementById('co-no-fee-warning').classList.add('hidden');
  const carparkId = document.getElementById('co-carpark').value;
  const entry = state.activeSession?.entry;
  const exit = document.getElementById('co-exit').value;
  const calcDiv = document.getElementById('co-calc');
  const warningDiv = document.getElementById('co-warning');

  if (!carparkId || !entry || !exit) {
    calcDiv.classList.add('hidden');
    return;
  }

  const entryDate = dateFromInput(entry);
  const exitDate = dateFromInput(exit);
  if (entryDate && exitDate && exitDate <= entryDate) {
    warningDiv.classList.remove('hidden');
    document.getElementById('co-duration').textContent = '';
    document.getElementById('co-charged').textContent = '';
    document.getElementById('co-rate').textContent = '';
    document.getElementById('co-fee').textContent = '';
    calcDiv.classList.remove('hidden');
    return;
  }
  warningDiv.classList.add('hidden');

  const calc = calculateFee(carparkId, entry, exit);
  if (!calc) {
    calcDiv.classList.add('hidden');
    return;
  }

  calcDiv.classList.remove('hidden');
  document.getElementById('co-duration').textContent = fmtDurationHours(calc.durationHours);
  document.getElementById('co-charged').textContent = `${calc.chargedHours} 小時`;
  document.getElementById('co-rate').textContent = `$${calc.hourlyRate}/小時 (${calc.periodLabel})`;
  document.getElementById('co-fee').textContent = `$${calc.fee}`;
}

function confirmCheckout() {
  if (!state.activeSession) return;
  const carparkId = document.getElementById('co-carpark').value;
  const manualFee = document.getElementById('co-manual-fee').value;
  if (!carparkId && !manualFee) {
    document.getElementById('co-no-fee-warning').classList.remove('hidden');
    return;
  }
  document.getElementById('co-no-fee-warning').classList.add('hidden');
  doCheckout({
    exit: document.getElementById('co-exit').value,
    carpark_id: document.getElementById('co-carpark').value || null,
    notes: document.getElementById('co-notes').value,
    manual_fee: document.getElementById('co-manual-fee').value
      ? Number(document.getElementById('co-manual-fee').value)
      : null,
    manual_reason: document.getElementById('co-manual-reason').value,
    photo: state.activeSession.photo,
  });
  closeCheckout();
  render();
}

// ====== ADMIN (PUBLIC HOLIDAYS) ======
let _holidayAdded = new Set();
let _holidayRemoved = new Set();

function openAdmin() {
  const modal = document.getElementById('admin-modal');
  modal.classList.remove('hidden');
  const raw = localStorage.getItem(HOLIDAYS_KEY);
  try {
    const mods = raw ? JSON.parse(raw) : { added: [], removed: [] };
    _holidayAdded = new Set(mods.added || []);
    _holidayRemoved = new Set(mods.removed || []);
  } catch (e) {
    _holidayAdded = new Set();
    _holidayRemoved = new Set();
  }
  renderAdminHolidays();
}

function closeAdmin() {
  document.getElementById('admin-modal').classList.add('hidden');
}

function renderAdminHolidays() {
  const list = document.getElementById('admin-holiday-list');
  const merged = new Set(HK_HOLIDAYS_DEFAULTS);
  for (const d of _holidayRemoved) merged.delete(d);
  for (const d of _holidayAdded) merged.add(d);
  const sorted = [...merged].sort();
  list.innerHTML = sorted.map(d => {
    const isDefault = HK_HOLIDAYS_DEFAULTS.includes(d);
    const removed = _holidayRemoved.has(d);
    return `<div class="admin-holiday-item${removed ? ' admin-removed' : ''}" data-date="${d}">
      <span>${d} ${isDefault && removed ? '🔙' : ''}</span>
      <button class="admin-holiday-del" data-date="${d}">✕</button>
    </div>`;
  }).join('');
  document.getElementById('admin-count').textContent = `共 ${sorted.length} 日`;
}

function adminAddDate() {
  const input = document.getElementById('admin-add-input');
  const val = input.value.trim();
  if (!val) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) { alert('請輸入 YYYY-MM-DD 格式'); return; }
  const dateObj = new Date(val + 'T00:00:00');
  if (isNaN(dateObj.getTime())) { alert('無效日期'); return; }
  if (HK_HOLIDAYS_DEFAULTS.includes(val)) {
    _holidayRemoved.delete(val);
  } else {
    _holidayAdded.add(val);
  }
  _holidayRemoved.delete(val);
  saveHolidayMods(_holidayAdded, _holidayRemoved);
  input.value = '';
  renderAdminHolidays();
}

function adminRemoveDate(dateStr) {
  if (HK_HOLIDAYS_DEFAULTS.includes(dateStr)) {
    _holidayRemoved.add(dateStr);
  } else {
    _holidayAdded.delete(dateStr);
  }
  saveHolidayMods(_holidayAdded, _holidayRemoved);
  renderAdminHolidays();
}

function adminResetDefaults() {
  if (!confirm('還原所有公眾假期至預設值？')) return;
  localStorage.removeItem(HOLIDAYS_KEY);
  _holidayAdded = new Set();
  _holidayRemoved = new Set();
  renderAdminHolidays();
}



// ====== EVENT BINDING ======
function bindEvents() {
  document.getElementById('btn-checkin').addEventListener('click', checkIn);

  document.getElementById('session-entry').addEventListener('change', (e) => adjustEntry(e.target.value));

  document.getElementById('session-carpark').addEventListener('change', (e) => selectCarpark(e.target.value));
  document.getElementById('session-notes').addEventListener('input', (e) => saveNotes(e.target.value));

  document.getElementById('btn-photo').addEventListener('click', () => document.getElementById('photo-input').click());
  document.getElementById('photo-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => savePhoto(ev.target.result);
    reader.readAsDataURL(file);
  });

  document.getElementById('btn-checkout').addEventListener('click', openCheckout);
  document.getElementById('btn-cancel-session').addEventListener('click', cancelSession);
  document.getElementById('co-close').addEventListener('click', closeCheckout);
  document.getElementById('co-confirm').addEventListener('click', confirmCheckout);
  document.getElementById('co-exit').addEventListener('change', updateCheckoutCalc);
  document.getElementById('co-carpark').addEventListener('change', updateCheckoutCalc);
  document.getElementById('co-btn-photo').addEventListener('click', () => document.getElementById('co-photo-input').click());
  document.getElementById('co-photo-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById('co-photo-preview');
      preview.classList.remove('hidden');
      preview.src = ev.target.result;
      document.getElementById('co-photo-status').textContent = '✅ 已附加相片';
      if (state.activeSession) {
        state.activeSession.photo = ev.target.result;
        saveSessions();
      }
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('checkout-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCheckout();
  });

  document.getElementById('co-manual-fee').addEventListener('input', () => {
    document.getElementById('co-no-fee-warning').classList.add('hidden');
  });

  document.getElementById('btn-estimate').addEventListener('click', openEstimator);
  document.getElementById('est-close').addEventListener('click', closeEstimator);
  document.getElementById('est-done').addEventListener('click', closeEstimator);
  document.getElementById('est-carpark').addEventListener('change', updateEstimator);
  document.getElementById('est-entry').addEventListener('change', updateEstimator);
  document.getElementById('est-exit').addEventListener('change', updateEstimator);
  document.getElementById('estimator-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEstimator();
  });

  document.getElementById('btn-carpark-select').addEventListener('click', openCarparkSelector);
  document.getElementById('cp-close').addEventListener('click', closeCarparkSelector);
  document.getElementById('carpark-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCarparkSelector();
  });
  document.getElementById('carpark-list').addEventListener('click', (e) => {
    const item = e.target.closest('.cp-item');
    if (item) selectCarparkFromList(item.dataset.id);
  });

  document.getElementById('summary-sessions').addEventListener('click', openHistory);
  document.getElementById('hist-close').addEventListener('click', closeHistory);
  document.getElementById('history-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeHistory();
  });
  document.getElementById('history-list').addEventListener('click', (e) => {
    const delBtn = e.target.closest('.hist-del-btn');
    if (delBtn) {
      const idx = parseInt(delBtn.dataset.index);
      if (!isNaN(idx)) deleteHistoryItem(idx);
      return;
    }
    const item = e.target.closest('.hist-item');
    if (item) {
      const idx = parseInt(item.dataset.index);
      if (!isNaN(idx)) openDetail(idx);
    }
  });

  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.getElementById('detail-done').addEventListener('click', closeDetail);
  document.getElementById('detail-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDetail();
  });

  document.getElementById('btn-export').addEventListener('click', exportHistory);
  document.getElementById('hist-export').addEventListener('click', exportHistory);

  // Admin modal
  document.getElementById('btn-admin').addEventListener('click', openAdmin);
  document.getElementById('admin-close').addEventListener('click', closeAdmin);
  document.getElementById('admin-done').addEventListener('click', closeAdmin);
  document.getElementById('admin-add-btn').addEventListener('click', adminAddDate);
  document.getElementById('admin-add-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') adminAddDate(); });
  document.getElementById('admin-reset-btn').addEventListener('click', adminResetDefaults);
  document.getElementById('admin-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAdmin();
  });
  document.getElementById('admin-holiday-list').addEventListener('click', (e) => {
    const delBtn = e.target.closest('.admin-holiday-del');
    if (delBtn) adminRemoveDate(delBtn.dataset.date);
  });
}

// ====== INIT ======
async function init() {
  await loadCarparks();
  loadSessions();
  bindEvents();
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
