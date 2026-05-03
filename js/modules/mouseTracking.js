/**
 * Enhanced Mouse Tracking Module - Dark Theme with Glow Effects
 */

const MouseTracker = (function() {
    'use strict';

    // Private state
    let canvas = null;
    let ctx = null;
    let mouseX = 0;           // smoothed cursor position (lerped each frame)
    let mouseY = 0;
    let targetX = 0;          // raw cursor position from mousemove
    let targetY = 0;
    let isEnabled = false;
    let animationFrame = null;
    let particles = [];
    let _resizeHandler = null; // named ref so destroy() can remove it

    // Per-frame cached values — updated once at the top of animate()
    let _dark = false;
    let _accentColor = '#3498db';
    let _now = 0;

    // Full configuration — every tunable dimension exposed
    const config = {
        // Particle pool
        particleCount: 10,
        particleSize: 4,
        particleSizeMin: 2,
        particleCountCap: 150,        // hard ceiling including burst particles
        initialVelocity: 0.8,
        replenishmentChance: 0.01,
        replenishmentSpread: 250,

        // Physics
        magneticRadius: 200,
        magneticStrength: 0.01,
        friction: 0.99,
        burstMouseAttractionEnabled: true,
        maxVelocity: 15,

        // Burst effect
        burstCount: 8,
        burstSpeed: 3,
        burstLife: 60,
        burstSizeMax: 5,

        // Cursor ring / dot
        ringSize: 40,
        dotSize: 5,
        ringOpacity: 0.6,
        ringBorderWidth: 1.5,

        // Cursor smoothing
        smoothing: 0.06,

        // Visual
        staticOpacity: 0.4,
        glowBlur: 20,
        canvasOpacity: 0.8,
        canvasZIndex: 9998,
        pulseSpeed: 0.002,
        pulseAmplitude: 0.2,
        pulseBase: 0.8,
        pulseEnabled: null,       // null = auto (dark mode only)
        glowEnabled: null,        // null = auto (dark mode only)
        accentColorDark: '#64b5f6',
        accentColorLight: '#3498db',

        // Connection lines
        connectionsEnabled: null, // null = auto (dark mode only)
        connectionDistance: 120,
        connectionOpacityMax: 0.15,
        connectionLineWidth: 1,
        connectionIncludesBurstParticles: false,

        // Enhanced blue glow palette for dark theme
        colorPalette: [
            'rgba(100, 181, 246, {opacity})',  // Bright blue
            'rgba(144, 202, 249, {opacity})',  // Light blue
            'rgba(66, 165, 245, {opacity})',   // Medium blue
            'rgba(130, 177, 255, {opacity})',  // Soft blue
            'rgba(41, 121, 255, {opacity})'    // Deep blue
        ]
    };

    /**
     * Read dark mode flag from DOM attribute
     */
    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    /**
     * Cache theme state — called on init and on every themeChanged event.
     * Prevents repeated DOM attribute reads inside the per-frame render loop.
     */
    function updateThemeColors() {
        _dark = isDarkMode();
        _accentColor = _dark ? config.accentColorDark : config.accentColorLight;
    }

    /**
     * Initialize the mouse tracker.
     * Safe to call only once; subsequent calls before destroy() are ignored.
     */
    function init(options = {}) {
        if (isEnabled) return;

        // Skip entirely on touch / no-hover devices — no canvas, no rAF loop
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

        // Honour OS reduced-motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        Object.assign(config, options);

        // Initialise cursor to viewport centre to prevent boot drift toward (0, 0).
        // main.js calls init() from DOMContentLoaded so layout is complete and
        // innerWidth/Height are non-zero by this point.
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
        targetX = mouseX;
        targetY = mouseY;

        updateThemeColors();
        createCanvas();
        addCustomStyles();

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('themeChanged', updateThemeColors);

        initParticles();
        isEnabled = true;
        animate();

        console.log('Mouse tracker initialized');
    }

    /**
     * Create canvas for particle effects
     */
    function createCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'mouse-particle-canvas';
        canvas.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'pointer-events:none',
            `z-index:${config.canvasZIndex}`,
            `opacity:${config.canvasOpacity}`
        ].join(';');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        // Named handler so destroy() can remove it
        _resizeHandler = function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', _resizeHandler);
    }

    /**
     * Initialize particle system
     */
    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(makeAmbientParticle(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight
            ));
        }
    }

    /**
     * Create a single ambient (non-fading) particle at the given position.
     * maxLife is null for ambient particles; life/maxLife is only read when fading === true.
     */
    function makeAmbientParticle(x, y) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * config.initialVelocity,
            vy: (Math.random() - 0.5) * config.initialVelocity,
            size: Math.random() * config.particleSize + config.particleSizeMin,
            color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)],
            fading: false,
            maxLife: null,  // null = infinite lifetime; only meaningful when fading === true
            phase: Math.random() * Math.PI * 2
        };
    }

    /**
     * Handle mouse move — only record raw position; lerp happens in animate()
     */
    function handleMouseMove(e) {
        targetX = e.clientX;
        targetY = e.clientY;
    }

    /**
     * Handle mouse enter
     */
    function handleMouseEnter() {
        if (canvas) canvas.style.opacity = String(config.canvasOpacity);
    }

    /**
     * Handle mouse leave
     */
    function handleMouseLeave() {
        if (canvas) canvas.style.opacity = '0';
    }

    /**
     * Handle mouse down
     */
    function handleMouseDown() {
        createBurstEffect(targetX, targetY);
    }

    /**
     * Handle mouse up
     */
    function handleMouseUp() {
    }

    /**
     * Create burst effect on click.
     * Respects particleCountCap — will not exceed the hard ceiling.
     */
    function createBurstEffect(x, y, count) {
        const c = count !== undefined ? count : config.burstCount;
        const available = Math.min(c, config.particleCountCap - particles.length);
        if (available <= 0) return;

        for (let i = 0; i < available; i++) {
            const angle = (i / available) * Math.PI * 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * config.burstSpeed,
                vy: Math.sin(angle) * config.burstSpeed,
                size: Math.random() * config.burstSizeMax + config.particleSizeMin,
                color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)],
                life: config.burstLife,
                maxLife: config.burstLife,
                fading: true,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Animation loop
     */
    function animate() {
        if (!isEnabled) return;

        // Cache per-frame constants once — avoids DOM reads inside inner loops
        _dark = isDarkMode();
        _accentColor = _dark ? config.accentColorDark : config.accentColorLight;
        _now = Date.now();

        // Step cursor-position lerp once per frame for consistent, frame-rate-independent smoothing
        mouseX += (targetX - mouseX) * config.smoothing;
        mouseY += (targetY - mouseY) * config.smoothing;

        if (ctx) {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            updateParticles(w, h);
            drawCursor();
            drawParticles();

            const connectionsOn = config.connectionsEnabled !== null
                ? config.connectionsEnabled
                : _dark;
            if (connectionsOn) {
                drawParticleConnections();
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    /**
     * Update particle positions, apply physics, expire burst particles,
     * and replenish the ambient pool — all in one pass.
     */
    function updateParticles(w, h) {
        const radius    = config.magneticRadius;
        const radiusSq  = radius * radius;
        const strength  = config.magneticStrength;
        const friction  = config.friction;
        const maxVSq    = config.maxVelocity * config.maxVelocity;
        const attractBurst = config.burstMouseAttractionEnabled;

        let ambientCount = 0;
        const toRemove = []; // collected in descending index order (reverse loop)

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Mouse attraction — optionally skip burst particles
            if (!p.fading || attractBurst) {
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < radiusSq) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / radius) * strength;
                    p.vx += dx * force;
                    p.vy += dy * force;
                }
            }

            // Hard velocity cap
            const spdSq = p.vx * p.vx + p.vy * p.vy;
            if (spdSq > maxVSq) {
                const s = config.maxVelocity / Math.sqrt(spdSq);
                p.vx *= s;
                p.vy *= s;
            }

            p.x += p.vx;
            p.y += p.vy;

            p.vx *= friction;
            p.vy *= friction;

            // Boundary wrap
            if (p.x < 0) p.x = w;
            else if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            else if (p.y > h) p.y = 0;

            // Life management
            if (p.fading) {
                p.life -= 1;
                if (p.life <= 0) toRemove.push(i);
            } else {
                ambientCount++;
            }
        }

        // Remove expired particles in a single O(n) pass rather than repeated splices.
        if (toRemove.length > 0) {
            particles = particles.filter(function(p) {
                return !p.fading || p.life > 0;
            });
        }

        // Replenish ambient pool — once per frame, outside the per-particle loop.
        // Fixes the 33× over-spawn bug caused by rolling the check inside the loop.
        if (ambientCount < config.particleCount && particles.length < config.particleCountCap) {
            if (Math.random() < config.replenishmentChance) {
                particles.push(makeAmbientParticle(
                    mouseX + (Math.random() - 0.5) * config.replenishmentSpread,
                    mouseY + (Math.random() - 0.5) * config.replenishmentSpread
                ));
            }
        }
    }

    /**
     * Convert a #rrggbb hex colour string to rgba() with the given alpha.
     */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Draw the cursor ring (at smoothed position) and filled dot (at raw position).
     * ringSize/dotSize of 0 suppresses that element.
     */
    function drawCursor() {
        if (!ctx) return;
        const color = _accentColor.startsWith('#')
            ? hexToRgba(_accentColor, config.ringOpacity)
            : _accentColor;

        if (config.ringSize > 0) {
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, config.ringSize, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = config.ringBorderWidth;
            ctx.stroke();
        }

        if (config.dotSize > 0) {
            ctx.beginPath();
            ctx.arc(targetX, targetY, config.dotSize, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    /**
     * Draw all particles.
     * Shadow state is set once for the whole batch rather than per particle,
     * eliminating 80 GPU pipeline flushes per frame.
     */
    function drawParticles() {
        if (!ctx) return;

        const pulseOn = config.pulseEnabled !== null ? config.pulseEnabled : _dark;
        const glowOn  = config.glowEnabled  !== null ? config.glowEnabled  : _dark;

        if (glowOn) {
            ctx.shadowColor = _accentColor;
            ctx.shadowBlur  = config.glowBlur;
        }

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Fading particles use life/maxLife so opacity starts at 1.0 (not 0.6).
            // Guard against maxLife=0 to prevent NaN opacity.
            const opacity = p.fading ? (p.maxLife > 0 ? p.life / p.maxLife : 0) : config.staticOpacity;
            const color   = p.color.replace('{opacity}', opacity);

            const pulse = pulseOn
                ? Math.sin(_now * config.pulseSpeed + p.phase) * config.pulseAmplitude + config.pulseBase
                : 1;
            const size = p.size * pulse;

            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        if (glowOn) {
            ctx.shadowBlur = 0;
        }
    }

    /**
     * Draw connection lines between particles.
     * - ctx guard is at the top (not buried inside the distance check).
     * - lineWidth and strokeStyle are set once outside both loops.
     * - Per-pair opacity is applied via globalAlpha, avoiding repeated string allocations.
     * - Squared-distance comparison avoids sqrt for non-qualifying pairs.
     * - connectionIncludesBurstParticles gate skips fading particles when false.
     */
    function drawParticleConnections() {
        if (!ctx) return;

        const threshold   = config.connectionDistance;
        const thresholdSq = threshold * threshold;
        const opacityMax  = config.connectionOpacityMax;
        const includeBurst = config.connectionIncludesBurstParticles;
        // Derive base colour from palette entry by substituting a fully-opaque alpha;
        // per-pair transparency is then controlled via globalAlpha (one state write per pair
        // vs. one string allocation + state write per pair with strokeStyle).
        const baseColor = config.colorPalette[0].replace('{opacity}', '1');

        ctx.lineWidth   = config.connectionLineWidth;
        ctx.strokeStyle = baseColor;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            if (!includeBurst && p1.fading) continue;

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                if (!includeBurst && p2.fading) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < thresholdSq) {
                    const dist    = Math.sqrt(distSq);
                    ctx.globalAlpha = (1 - dist / threshold) * opacityMax;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }

        ctx.globalAlpha = 1;
    }

    /**
     * Update configuration at runtime
     */
    function updateConfig(newConfig) {
        Object.assign(config, newConfig);
        updateThemeColors();
    }

    /**
     * Resume the tracker (e.g. on page visibility restored).
     * No-op if the tracker was never initialised (canvas is null).
     */
    function enable() {
        if (isEnabled || !canvas) return;
        isEnabled = true;
        canvas.style.display = 'block';
        animate();
    }

    /**
     * Pause the tracker (e.g. on page hidden)
     */
    function disable() {
        isEnabled = false;
        if (canvas) canvas.style.display = 'none';
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    /**
     * Fully tear down the tracker — removes all event listeners, cancels the
     * animation loop, and removes the canvas from the DOM.
     * After destroy(), init() may be called again.
     */
    function destroy() {
        disable();
        document.removeEventListener('mousemove',   handleMouseMove);
        document.removeEventListener('mouseenter',  handleMouseEnter);
        document.removeEventListener('mouseleave',  handleMouseLeave);
        document.removeEventListener('mousedown',   handleMouseDown);
        document.removeEventListener('mouseup',     handleMouseUp);
        window.removeEventListener('themeChanged',  updateThemeColors);
        if (_resizeHandler) {
            window.removeEventListener('resize', _resizeHandler);
            _resizeHandler = null;
        }
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        canvas    = null;
        ctx       = null;
        particles = [];
    }

    /**
     * Inject canvas transition style — called inside init() so styles are only
     * added when the tracker is actually initialised, not at script evaluation time.
     * Idempotent: skipped if the style block already exists.
     */
    function addCustomStyles() {
        if (document.getElementById('mouse-tracker-styles')) return;
        const style = document.createElement('style');
        style.id = 'mouse-tracker-styles';
        style.textContent = `
            #mouse-particle-canvas {
                transition: opacity 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // Public API
    return {
        init,
        enable,
        disable,
        destroy,
        updateConfig,
        createBurstEffect
    };
})();