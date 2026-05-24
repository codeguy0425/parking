# 🅿 泊車 HK — Hong Kong Parking Fee Tracker

[![Live](https://img.shields.io/badge/live-https://codeguy0425.github.io/parking/-blue)](https://codeguy0425.github.io/parking/)

A mobile-first **PWA** for tracking parking sessions and estimating fees in Hong Kong. No backend, no build step, no API keys — everything runs in the browser with `localStorage` persistence.

---

## Features

- **Check-in/Check-out** — One-tap check-in starts a live count-up timer. Check-out saves the session with optional photo, notes, and manual fee override.
- **Live Fee Estimation** — While checked in, select a car park and see the estimated fee update every second based on elapsed time.
- **Per-Hour Rate Calculator** — Blended per-hour rate logic handles weekday/weekend/holiday periods, day/night rates, overnight crossings, and HK public holiday awareness.
- **16 Car Parks** — Pre-loaded with Yuen Long, Tin Shui Wai, Kwun Tong, and Kowloon Bay car parks and their real rate schemes.
- **Estimator Modal** — Standalone "what if?" calculator to estimate fees for any car park without starting a session.
- **History & Export** — All completed sessions are saved locally. View details (fee breakdown, rate snapshot, notes, photo), delete individual entries, or export everything as JSON.
- **Public Holiday Admin** — Built-in HK public holidays (2026–2035) with UI to add/remove dates. Holidays are treated as Sunday rates automatically.
- **Offline PWA** — Service worker caches all assets for offline use.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML5, CSS3, JavaScript (ES2020+) |
| Styling | Mobile-first, max-width 480px, no framework |
| Persistence | `localStorage` |
| PWA | `manifest.json` + Service Worker (`sw.js`) |
| Data | Static JSON (`data/carparks.json`) |
| Hosting | GitHub Pages |

---

## Project Structure

```
parking/
├── index.html            # Single-page app — all UI in one file
├── app.js                # All logic: calculator, state, timer, modals, export, holidays
├── style.css             # Mobile-first styles (max-width 480px)
├── manifest.json         # PWA manifest (display: standalone)
├── sw.js                 # Service worker (cache-first, versioned)
├── data/
│   └── carparks.json     # 16 car parks with rate scheme definitions
├── AGENTS.md             # Project-specific instructions for AI agents
├── Agent.md              # Generic behavioral guidelines
└── README.md             # This file
```

---

## Getting Started

### Local development

**Option A — VSCode Live Server**
1. Open the project folder in VSCode
2. Right-click `index.html` → "Open with Live Server"

**Option B — `npx serve`**
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.

> Camera features require `localhost` or `127.0.0.1` (secure context). Everything else works over plain HTTP.

### Production

The app is deployed via **GitHub Pages** at:
https://codeguy0425.github.io/parking/

To deploy your own fork, push to a `gh-pages` branch or configure GitHub Pages to serve from the root of `main`.

---

## Usage

### Check in
1. Tap **入場** — a session card appears with a live timer.
2. Adjust the entry time if needed.
3. Select a **car park** from the dropdown. The estimated fee updates every second.
4. Optionally add **notes** (e.g. "B2, near lift") and a **photo**.

### Check out
1. Tap **🌟 出場** to open the checkout modal.
2. Confirm/adjust the exit time and car park.
3. The calculated fee appears automatically. Optionally enter a **manual fee override** with a reason.
4. Tap **💾 儲存記錄** to save to history.

### Estimate a fee
Tap **🔮 估算** to open the standalone estimator — pick a car park, entry/exit times, and see the breakdown.

### View history
Tap the summary card ("X 次記錄" at the bottom) or tap **📋** in the history modal. Click any entry for full details. Delete entries with 🗑.

### Export
Tap **📤 匯出** or the export button inside the history modal to download all sessions as a JSON file.

### Manage public holidays
Tap **🗓** in the top-right header corner. Add individual dates, remove default dates (shown with strikethrough + 🔙), or restore defaults.

---

## Car Park Data Format

Car parks are defined in `data/carparks.json` as an array of objects:

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "address": "Street, Area",
  "scheme": {
    "round_up": true,
    "min_hours": 1,
    "periods": [
      { "label": "Weekday", "from": "07:00", "to": "23:59", "hourly": 28, "days": [1,2,3,4,5] },
      { "label": "Weekend/Holiday", "from": "07:00", "to": "23:59", "hourly": 34, "days": [0,6] },
      { "label": "Night", "from": "00:00", "to": "07:00", "hourly": 15 }
    ]
  }
}
```

| Field | Description |
|---|---|
| `days` (optional) | `0` = Sunday … `6` = Saturday. Omit to apply every day. |
| `from` / `to` | Time range. Supports overnight periods (when `to < from`). |
| `hourly` | Fee per hour in HKD during this period. |

---

## Rate Calculator Logic

`calculateFee(carparkId, entryStr, exitStr, schemeOverride)` performs the following:

1. **Duration** — Difference between entry and exit in hours.
2. **Charged hours** — `Math.ceil(duration)`, floored to `min_hours` (default 1).
3. **Per-hour iteration** — For each charged hour, calls `getRateForTime()` using the entry time of that hour.
4. **Public holiday awareness** — `getRateForTime()` checks `isPublicHoliday()`; if the date is a known HK public holiday, `getDay()` is treated as `0` (Sunday).
5. **Blended result** — Returns total fee, average hourly rate, dominant period label, and charged hours.

Each saved session carries its own `rate_snapshot` so historical fees stay correct even when rates change.

---

## Offline / PWA

- **Service worker** (`sw.js`) uses a cache-first strategy with versioned cache (`parking-hk-vN`).
- **Version must be bumped** on every file change to trigger re-cache.
- All core assets (`index.html`, `style.css`, `app.js`, `manifest.json`, `data/carparks.json`) are cached on install.
- Offline fallback: stale cache is served if the network is unavailable.

---

## Testing

No automated test framework. Manual testing:
1. Open with VSCode Live Server or `npx serve`
2. Check in, select a car park, verify live timer and fee estimation
3. Check out, verify the fee breakdown, save to history
4. Open history, view details, verify rate snapshot matches
5. Use the estimator modal and compare with manual calculation
6. Add/remove public holidays in the admin panel and verify rate changes
7. Test offline: stop the dev server, reload — the app should still load

---

## License

This project is unlicensed — no license has been specified.
