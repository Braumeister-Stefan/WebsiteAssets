# How to Host a Frequently Refreshing Dashboard on GitHub Pages

**Scope:** `PerformanceMonitoring` (Python model) + WebsiteAssets (GitHub Pages static site)
**Constraint:** GitHub Pages serves static files only.

---

## 1. Architecture

`webbrowser.open(f"file:///{abs_path}")` has no network presence. The required architecture:

> **Python model writes `analytics.json` → committed/pushed to WebsiteAssets repo root → GitHub Pages serves `/analytics.json` → `dashboard.html` fetches and re-renders on a polling interval.**

No third-party infrastructure, no server, no changes to the Jinja2 rendering path.

---

## 2. Python Model Changes (`performance_monitoring.py`)

### 2.1 Class constants

Add at class level, mirroring existing `REPORT_FILENAME`:
```python
DASHBOARD_FILENAME = "performance_dashboard.html"
JSON_FILENAME = "analytics.json"
```

### 2.2 `_export_json()` — new method

Serialises `self.analytics` to `{output_dir}/analytics.json`.

- All `analytics` dict types are JSON-safe as-is (`float`, `int`, `None→null`, `str`, nested `current_exposure`).
- `max_drawdown_pct`: write raw positive value; sign handling belongs to the display layer.
- `timestamp`: write as-is (ISO 8601 string).
- Write with `ensure_ascii=False, indent=2`.
- `os.makedirs(..., exist_ok=True)` before write.
- Error handling: `try/except OSError` only — not broad `except Exception`.
- Gated by config key `export_json` (bool, default `True`).
- **Call site:** `run()` calls `_export_json()` as step 5, after existing steps 1–4 unchanged.

### 2.3 `_deliver_dashboard()` — extract from `_save_html_report`

Extract `webbrowser.open()` into `_deliver_dashboard(self, html: str, local_path: str) -> None`. `_save_html_report` calls `self._deliver_dashboard(html, abs_path)` after the file write. Split the existing broad `except Exception` into three separate blocks: Jinja2 rendering errors, file-write errors, delivery errors.

### 2.4 Push `analytics.json` to WebsiteAssets

Three options in ascending automation order:

- **Option A (manual):** Copy `analytics.json` to repo root, commit, push manually. No code beyond 2.2.
- **Option B (automated, local):** `_push_to_repo()` calls `subprocess.run(['git', '-C', repo_path, 'add', 'analytics.json'])`, then `git commit`, `git push`. Config keys: `repo_path` (local clone path), `push_to_repo` (bool, default `False`). Only runs when `push_to_repo` is `True`.
- **Option C (GitHub Actions cron):** Workflow in WebsiteAssets runs the model on schedule (e.g. `0 * * * *`), commits output `analytics.json`. Requires model dependencies installable in a runner.

Start with A to validate rendering; move to B or C for automation. B and C can coexist.

---

## 3. Website Changes

### 3.1 `analytics.json` — new file at repo root

Initial content (prevents breakage before first model run):
```json
{
  "timestamp": "",
  "total_return_pct": null,
  "period_return_pct": null,
  "max_drawdown_pct": null,
  "sharpe_ratio": null,
  "volatility_annual_pct": null,
  "current_exposure": {
    "invested_pct": 0.0,
    "cash_pct": 0.0,
    "position_count": 0
  },
  "history_length": 0
}
```

### 3.2 `dashboard.html` — new page

Scaffold: copy `project-particle-simulator.html` exactly (same `<head>`, `<nav>`, `<footer>`, script load order). Body: `<main class="dashboard-page">` containing `<div id="dashboardRoot">` with initial loading state.

Script load order: `utils.js`, `themeManager.js`, `mouseTracking.js`, `js/pages/dashboard.js`, `main.js`.

### 3.3 `css/dashboard.css` — new stylesheet

- 2×2 CSS Grid matching the Jinja2 template layout.
- `.positive`, `.negative`, `.caution`, `.na` classes (same names as Jinja2 template).
- Dot-leader alignment for metric rows.
- `#dashboardRoot .loading` and `#dashboardRoot .error` states.
- Uses existing custom properties from `main.css` — no new colour values.

### 3.4 `js/pages/dashboard.js` — new module

Pattern: `const DashboardPage = (function() { ... })()`. Public API: `{ init }` only.

**Constants:** `REFRESH_INTERVAL_MS = 60000`

**`init()`:** calls `loadData()` immediately, then `setInterval(loadData, REFRESH_INTERVAL_MS)`.

**`loadData()`:**
1. `fetch('/analytics.json', { cache: 'no-cache' })`
2. On success: parse JSON → `renderMetrics(data)`, update `<time id="lastUpdated">` with `data.timestamp`.
3. On failure: set error state in `#dashboardRoot`; preserve any previously rendered metrics.

**`renderMetrics(data)`:**
- Sets `textContent` of metric elements by `id` or `data-metric` attribute.
- Null placeholder: `"—"`.
- `max_drawdown_pct`: `(-Math.abs(data.max_drawdown_pct)).toFixed(2) + '%'`.
- Applies `.positive`, `.negative`, `.caution`, `.na` classes matching Jinja2 template logic.
- `current_exposure` access: `data.current_exposure?.invested_pct` (mirrors Jinja2 {% raw %}`{% set exposure = current_exposure or {} %}`{% endraw %} guard).

**Dependencies:** `Utils` global only. No new external dependencies.

### 3.5 `main.js` routing

Add to `initPageModules()`:
```js
else if (path.includes('dashboard')) { if (typeof DashboardPage !== 'undefined') { DashboardPage.init(); } }
```
Pattern identical to existing `ProjectPage` and `ContactPage` branches.

### 3.6 Nav update — four existing pages

Add `<li><a href="dashboard.html">Dashboard</a></li>` to `<ul class="nav-menu">` in `index.html`, `about.html`, `contact.html`, `project-particle-simulator.html`.

---

## 4. Data Flow

```
PerformanceMonitoring.run()
  steps 1–4: unchanged
  step 5: _export_json() → {output_dir}/analytics.json

analytics.json → WebsiteAssets repo root (Option A/B/C)

GitHub Pages CDN → /analytics.json (cache TTL ~10 min)

DashboardPage.init()
  → fetch('/analytics.json', { cache: 'no-cache' }) immediately
  → renderMetrics(data) → DOM populated
  → setInterval(loadData, 60000)
  → #lastUpdated ← data.timestamp
```

**Refresh ceiling:** ~10 min (GitHub Pages CDN TTL). Sub-10-minute refresh requires a persistent backend (SSE/WebSocket) — not achievable on GitHub Pages. `cache: 'no-cache'` minimises delay within that ceiling.

---

## 5. Unchanged

- `_build_report`, `_print_report`, `_save_report`, Jinja2 template, `webbrowser.open()` local delivery
- `PortfolioAnalytics`, `PortfolioLedger`, pipeline structure
- `themeManager.js`, `animations.js`, `mouseTracking.js`
- All existing pages except the one-line nav addition

---

## 6. Change Summary

**`performance_monitoring.py` — 4 changes:**
1. `JSON_FILENAME` and `DASHBOARD_FILENAME` class constants
2. `_export_json()` (step 5 of `run()`)
3. `_deliver_dashboard(html, local_path)` extracted from `_save_html_report()`
4. Broad `except Exception` split into per-concern blocks

**WebsiteAssets — 6 changes:**
1. `analytics.json` — new file at repo root
2. `dashboard.html` — new page
3. `css/dashboard.css` — new stylesheet
4. `js/pages/dashboard.js` — new module
5. `js/main.js` — one `else if` branch in `initPageModules()`
6. `index.html`, `about.html`, `contact.html`, `project-particle-simulator.html` — one `<li>` nav addition each
