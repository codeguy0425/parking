# Parking — HK Parking Fee Tracker (PWA)

Pure HTML/CSS/JS PWA with no backend. Live at **https://codeguy0425.github.io/parking/** (GitHub Pages). Open locally via VSCode Live Server, `npx serve`, etc.

## Structure

```
index.html            — single-page app (check-in, timer, estimator, history, modals)
app.js                — all logic: calculator, state, timer, modals, export, holidays
style.css             — mobile-first (max-width 480px)
data/carparks.json    — car park definitions with rate schemes
manifest.json         — PWA manifest
sw.js                 — service worker (offline cache, bump version on every change)
AGENTS.md             — this file (project-specific instructions)
Agent.md              — external, generic behavioral guidelines (not project-specific)
```

## Key design decisions

- **No backend** — everything in localStorage, no build step, no API key needed
- **Self-contained sessions** — each saved session carries its own `rate_snapshot` so historical fees stay correct even when rates change
- **Live timer** — counts up from entry time; estimated fee updates every second if carpark selected
- **<1hr → 1hr rounding** — always rounds charged hours up, min 1 hour
- **Blended per-hour rate** — `calculateFee()` iterates each charged hour via `getRateForTime()` to handle crossings between different periods (weekday↔weekend, day↔night)
- **Public holiday awareness** — `getRateForTime()` calls `isPublicHoliday()`; if the date is a known HK public holiday, it maps `getDay()` to `0` (Sunday) so weekend/holiday rate periods match

## Car park data format (`data/carparks.json`)

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

- `days` (optional): `0`=Sun … `6`=Sat. Without `days`, the period applies every day.
- `from`/`to`: supports overnight periods (when `to < from`).
- Rate is determined by the entry time of each charged hour.

## HK Public Holidays

Built-in defaults (`HK_HOLIDAYS_DEFAULTS` in `app.js`) cover 2026–2035:
- **2026–2027**: GovHK official
- **2028–2030**: published sources
- **2031–2035**: estimated (especially lunar holidays — may need user correction)

### Admin panel

Click the **🗓** button in the top-right header corner to open the holiday admin modal. Users can:
- Add individual dates
- Remove dates (default dates get marked with strikethrough + 🔙)
- Restore all defaults

Modifications persist in localStorage under `parking_holidays` as `{ added: [...], removed: [...] }`.

## Rate calculator

`calculateFee(carparkId, entryStr, exitStr, schemeOverride)` → `{ durationHours, chargedHours, hourlyRate, periodLabel, fee }`

Calls `getRateForTime(scheme, date)` per charged hour, using `isPublicHoliday(date)` to treat public holidays as day `0`.

## Modals (all in-page overlays)

| Modal | Purpose |
|---|---|
| **Estimator** | Standalone "what if?" fee calc, no state, no save. Pre-fills entry from active session, defaults exit to +1hr. |
| **Carpark Selector** | Lists all carparks with period breakdowns. Click to set active session's carpark. |
| **Checkout** | Finalizes session: exit time, carpark, optional manual fee override + reason, notes, photo. Saves to history. |
| **History** | Lists past sessions. Click an item → detail modal. Delete button per item. Export button downloads JSON. |
| **Detail** | Shows full session breakdown (entry/exit, duration, fee calc, rate snapshot, notes, photo). |
| **Admin (Holidays)** | Add/remove public holiday dates, restore defaults. |

## Session states

- **Active** (one at a time) — stored under `parking_sessions.active` in localStorage
- **Completed** — stored under `parking_sessions.history[]`

## Export

Button calls `exportHistory()` → downloads `parking-history-YYYY-MM-DD.json` containing all completed sessions.

## Service worker

- Cache-first strategy
- Version (`parking-hk-vX`) must be **bumped on every file change**
- Uses `skipWaiting()` + `clients.claim()` + cleans old caches on activate

## Testing

Open with VSCode Live Server (right-click `index.html` → Open with Live Server). Camera requires `localhost` or `127.0.0.1` (secure context). Everything else works over plain HTTP.
