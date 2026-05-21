# Parking — HK Parking Fee Tracker (PWA)

Pure HTML/CSS/JS PWA with no backend. Open `index.html` via any static server (VSCode Live Server, `npx serve`, etc).

## Structure

```
index.html          — single-page app (check-in, timer, estimator, history)
app.js              — all logic: calculator, state, timer, modals, export
style.css           — mobile-first (max-width 480px)
data/carparks.json  — car park definitions with rate schemes
manifest.json       — PWA manifest
sw.js               — service worker (offline cache)
Agent.md            — external, generic behavioral guidelines (not project-specific)
```

## Key design decisions

- **No backend** — everything in localStorage, no build step, no API key needed
- **Self-contained sessions** — each saved session carries its own `rate_snapshot` so historical fees stay correct even when rates change
- **Live timer** — counts up from entry time; estimated fee updates every second if carpark selected
- **<1hr → 1hr rounding** — always rounds charged hours up, min 1 hour

## Car park data format (`data/carparks.json`)

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "lat": 22.4444,
  "lng": 114.0278,
  "scheme": {
    "round_up": true,
    "min_hours": 1,
    "periods": [
      { "label": "Standard", "from": "07:00", "to": "23:59", "hourly": 28 }
    ]
  }
}
```

Supports overnight periods (when `to < from`). Rate is determined by entry time.

## Rate calculator

Located in `app.js:calculateFee()`. Takes carpark ID + entry/exit ISO strings → returns `{ durationHours, chargedHours, hourlyRate, periodLabel, fee }`.

## Modals (all in-page overlays)

| Modal | Purpose |
|---|---|
| **Estimator** | Standalone "what if?" fee calc, no state, no save. Pre-fills entry from active session, defaults exit to +1hr. |
| **Checkout** | Finalizes session: exit time, carpark, optional manual fee override + reason, notes, photo. Saves to history. |
| **History** | Lists past sessions. Export button downloads JSON. |

## Session states

- **Active** (one at a time) — stored under `parking_sessions.active` in localStorage
- **Completed** — stored under `parking_sessions.history[]`

## Export

Button calls `exportHistory()` → downloads `parking-history-YYYY-MM-DD.json` containing all completed sessions.

## Testing

Open with VSCode Live Server (right-click `index.html` → Open with Live Server). Camera requires `localhost` or `127.0.0.1` (secure context). Everything else works over plain HTTP.
