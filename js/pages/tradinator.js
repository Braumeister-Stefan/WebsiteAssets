/**
 * Tradinator Page Module
 * Fetches live trading dashboard data and renders metrics, pie chart, and status.
 */

const TradinatorPage = (function() {
    'use strict';

    /** URL of the JSON data file produced by the Tradinator pipeline. */
    const DATA_URL = '/tradinator/dashboard_data.json';

    /** Polling interval in milliseconds. */
    const REFRESH_MS = 60000;

    /** Age threshold above which the data feed is considered stale. */
    const STALE_THRESHOLD_MS = 5 * 60 * 1000;

    /** Slice colours for the exposure pie chart (cycling). */
    const PIE_COLOURS = [
        '#3498db', '#2ecc71', '#e67e22',
        '#9b59b6', '#e74c3c', '#1abc9c'
    ];

    /** Interval handle, retained so polling can be stopped. */
    var _intervalId = null;

    // ── Public entry point ────────────────────────────────────────────────────

    /**
     * Start the dashboard: load data once then poll on interval.
     */
    function init() {
        loadData();
        _intervalId = setInterval(loadData, REFRESH_MS);
    }

    /**
     * Stop polling and release the interval.
     * Call this before navigating away from the page, if needed.
     */
    function destroy() {
        if (_intervalId !== null) {
            clearInterval(_intervalId);
            _intervalId = null;
        }
    }

    // ── Data loading ──────────────────────────────────────────────────────────

    /**
     * Fetch dashboard JSON and dispatch to render functions.
     */
    function loadData() {
        fetch(DATA_URL, { cache: 'no-cache' })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                renderMetrics(data);
                renderPie(data.pie_chart_data || []);
                updateStatus(data.timestamp);
                hideError();
            })
            .catch(function() {
                showError('Dashboard data unavailable. Retrying...');
            });
    }

    // ── Metric rendering ──────────────────────────────────────────────────────

    /**
     * Write metric values into every [data-metric] element on the page.
     * @param {Object} data - Parsed dashboard JSON object.
     */
    function renderMetrics(data) {
        var elements = document.querySelectorAll('[data-metric]');
        elements.forEach(function(el) {
            var key = el.getAttribute('data-metric');
            var raw = resolveMetricValue(key, data);
            el.textContent = formatMetricValue(key, raw);
            applyMetricClass(el, key, raw);
        });
    }

    /**
     * Resolve a metric key to its raw value, including nested keys.
     * @param {string} key - Metric name matching data-metric attribute.
     * @param {Object} data - Full dashboard data object.
     * @returns {number|null} Raw numeric value or null.
     */
    function resolveMetricValue(key, data) {
        if (key === 'position_count') {
            return data.current_exposure ? data.current_exposure.position_count : null;
        }
        return (data[key] !== undefined) ? data[key] : null;
    }

    /**
     * Format a raw value for display according to its metric type.
     * @param {string} key - Metric name.
     * @param {number|null} raw - Raw value.
     * @returns {string} Human-readable string.
     */
    function formatMetricValue(key, raw) {
        if (raw === null || raw === undefined) {
            return '—';
        }
        switch (key) {
            case 'total_return_pct':
            case 'period_return_pct':
            case 'volatility_annual_pct':
                return raw.toFixed(2) + '%';
            case 'max_drawdown_pct':
                // The pipeline stores drawdown as a positive number; negate it so
                // the UI shows it as a loss (e.g. 3.45 → "-3.45%").
                return (-raw).toFixed(2) + '%';
            case 'sharpe_ratio':
                return raw.toFixed(2);
            case 'position_count':
            case 'history_length':
                return raw.toString();
            default:
                return String(raw);
        }
    }

    /**
     * Add a semantic colour class to a metric element based on its value.
     * @param {HTMLElement} el - The metric-value span.
     * @param {string} key - Metric name.
     * @param {number|null} raw - Raw numeric value.
     */
    function applyMetricClass(el, key, raw) {
        el.classList.remove('positive', 'negative', 'caution', 'na');

        if (raw === null || raw === undefined) {
            el.classList.add('na');
            return;
        }

        switch (key) {
            case 'total_return_pct':
            case 'period_return_pct':
                el.classList.add(raw >= 0 ? 'positive' : 'negative');
                break;
            case 'max_drawdown_pct':
                // Always displayed as a loss — always red.
                el.classList.add('negative');
                break;
            case 'sharpe_ratio':
                if (raw >= 1) {
                    el.classList.add('positive');
                } else if (raw < 0) {
                    el.classList.add('negative');
                } else {
                    el.classList.add('caution');
                }
                break;
            // volatility, position_count, history_length: no semantic class.
        }
    }

    // ── Pie chart rendering ───────────────────────────────────────────────────

    /**
     * Draw the portfolio exposure pie chart on canvas #exposurePie.
     * @param {Array<{label: string, value: number}>} slices - Chart data.
     */
    function renderPie(slices) {
        var canvas = document.getElementById('exposurePie');
        if (!canvas) { return; }

        var ctx = canvas.getContext('2d');
        var size = canvas.offsetWidth || 200;
        canvas.width = size;
        canvas.height = size;

        var cx = size / 2;
        var cy = size / 2;
        var radius = size / 2 - 4;

        ctx.clearRect(0, 0, size, size);

        if (!slices.length) {
            drawEmptyPie(ctx, cx, cy, radius);
            buildLegend([]);
            return;
        }

        var total = slices.reduce(function(sum, s) { return sum + s.value; }, 0);
        var angle = -Math.PI / 2; // Start at top.

        slices.forEach(function(slice, i) {
            var sweep = (slice.value / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + sweep);
            ctx.closePath();
            ctx.fillStyle = PIE_COLOURS[i % PIE_COLOURS.length];
            ctx.fill();
            angle += sweep;
        });

        buildLegend(slices);
    }

    /**
     * Draw a placeholder circle when there are no slices.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cx
     * @param {number} cy
     * @param {number} radius
     */
    function drawEmptyPie(ctx, cx, cy, radius) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#cccccc33';
        ctx.fill();
    }

    /**
     * Rebuild the #pieLegend element with coloured swatches and labels.
     * @param {Array<{label: string, value: number}>} slices
     */
    function buildLegend(slices) {
        var legend = document.getElementById('pieLegend');
        if (!legend) { return; }

        legend.innerHTML = '';

        if (!slices.length) {
            legend.textContent = 'No data';
            return;
        }

        var total = slices.reduce(function(sum, s) { return sum + s.value; }, 0);

        slices.forEach(function(slice, i) {
            var pct = total > 0 ? (slice.value / total * 100).toFixed(1) : '0.0';
            var item = document.createElement('div');
            item.className = 'pie-legend-item';

            var swatch = document.createElement('span');
            swatch.className = 'pie-legend-swatch';
            swatch.style.backgroundColor = PIE_COLOURS[i % PIE_COLOURS.length];

            var label = document.createElement('span');
            label.textContent = slice.label + '  ' + pct + '%';

            item.appendChild(swatch);
            item.appendChild(label);
            legend.appendChild(item);
        });
    }

    // ── Status rendering ──────────────────────────────────────────────────────

    /**
     * Update the last-updated timestamp and stale indicator.
     * @param {string} timestamp - ISO 8601 string from the data file.
     */
    function updateStatus(timestamp) {
        var timeEl = document.getElementById('lastUpdated');
        var badge  = document.querySelector('.live-badge');

        var stale = isStale(timestamp);

        if (timeEl) {
            timeEl.textContent = timestamp ? formatTimestamp(timestamp) : 'Never';
        }

        if (badge) {
            if (stale) {
                badge.classList.add('stale');
            } else {
                badge.classList.remove('stale');
            }
        }
    }

    /**
     * Return true when timestamp is empty or older than STALE_THRESHOLD_MS.
     * @param {string} timestamp
     * @returns {boolean}
     */
    function isStale(timestamp) {
        if (!timestamp) { return true; }
        var parsed = new Date(timestamp).getTime();
        if (isNaN(parsed)) { return true; }
        // A future timestamp is treated as stale: it likely indicates a clock
        // skew or bad data, and we should not show "LIVE" in that case.
        var age = Date.now() - parsed;
        return age < 0 || age > STALE_THRESHOLD_MS;
    }

    /**
     * Convert an ISO timestamp to a readable local date/time string.
     * @param {string} timestamp
     * @returns {string}
     */
    function formatTimestamp(timestamp) {
        var d = new Date(timestamp);
        return isNaN(d.getTime()) ? timestamp : d.toLocaleString();
    }

    // ── Error display ─────────────────────────────────────────────────────────

    /**
     * Show a message in the #dashboardError element.
     * @param {string} msg - Error message to display.
     */
    function showError(msg) {
        var el = document.getElementById('dashboardError');
        if (!el) { return; }
        el.textContent = msg;
        el.style.display = 'block';
    }

    /**
     * Hide the #dashboardError element.
     */
    function hideError() {
        var el = document.getElementById('dashboardError');
        if (!el) { return; }
        el.style.display = 'none';
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return { init: init, destroy: destroy };

})();
