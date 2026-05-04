/**
 * Enhanced Mouse Tracking Module - Dark Theme with Glow Effects
 */

const MouseTracker = (function() {
    'use strict';
    
    // Private variables
    let canvas = null;
    let ctx = null;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isEnabled = false;
    let animationFrame = null;
    let particles = [];
    
    // Configuration - Enhanced for dark theme
    const config = {
        particleCount: 5,               // Reduced by 40%
        particleSize: 2,                // Slightly larger for visibility
        ringSize: 40,                    // Slightly larger ring
        dotSize: 5,                      // Medium dot
        smoothing: 0.03,                  // Very smooth follow
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
     * Check if dark mode is active
     */
    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    
    /**
     * Get current accent color based on theme
     */
    function getAccentColor() {
        return isDarkMode() ? '#64b5f6' : '#3498db';
    }
    
    /**
     * Initialize enhanced mouse tracker
     */
    function init(options = {}) {
        Object.assign(config, options);
        
        createCanvas();
        
        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Listen for theme changes
        window.addEventListener('themeChanged', updateThemeColors);
        
        // Initialize particles
        initParticles();
        
        // Start animation
        isEnabled = true;
        animate();
        
        console.log('Mouse tracker initialized - Enhanced glow effects');
    }
    
    /**
     * Create canvas for particle effects
     */
    function createCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'mouse-particle-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9998';
        canvas.style.opacity = '0.8';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    /**
     * Update theme colors
     */
    function updateThemeColors() {
    }
    
    /**
     * Initialize particle system
     */
    function initParticles() {
        for (let i = 0; i < config.particleCount; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.267,  // 0.8 / 3 — 200% slower
                vy: (Math.random() - 0.5) * 0.267,
                size: Math.random() * config.particleSize + 1,
                color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)],
                life: Math.random() * 100,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * Handle mouse move
     */
    function handleMouseMove(e) {
        targetX = e.clientX;
        targetY = e.clientY;
        
        // Smooth interpolation
        mouseX += (targetX - mouseX) * config.smoothing;
        mouseY += (targetY - mouseY) * config.smoothing;
    }
    
    /**
     * Handle mouse enter
     */
    function handleMouseEnter() {
        if (canvas) canvas.style.opacity = '0.8';
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
        createBurstEffect(targetX, targetY, 2);
    }
    
    /**
     * Handle mouse up
     */
    function handleMouseUp() {
    }
    
    /**
     * Create burst effect on click
     */
    function createBurstEffect(x, y, count = 2) {
        const baseAngle = Math.random() * Math.PI * 2;
        const speed = 3;
        for (let i = 0; i < count; i++) {
            // Particles are evenly spaced around baseAngle; with count=2 they are exactly opposite
            const angle = baseAngle + (i / count) * Math.PI * 2;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 2.5 + 1,
                color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)],
                life: 540,
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
        
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            updateParticles();
            drawParticles();
            
            // Draw connections only in dark mode for extra glow
            if (isDarkMode()) {
                drawParticleConnections();
            }
        }
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Update particle positions
     */
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Gentle attraction to mouse
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (1 - distance / 100) * 0.001;
                p.vx += dx * force;
                p.vy += dy * force;
            }
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Friction
            p.vx *= 0.99;
            p.vy *= 0.99;
            
            // Boundary wrap (particles reappear on other side)
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            // Life management
            if (p.fading) {
                p.life -= 1;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }
            
            // Maintain particle count
            if (!p.fading && particles.length < config.particleCount) {
                if (Math.random() < 0.01) {
                    createNewParticle();
                }
            }
        }
    }
    
    /**
     * Create new particle
     */
    function createNewParticle() {
        particles.push({
            x: mouseX + (Math.random() - 0.5) * 250,
            y: mouseY + (Math.random() - 0.5) * 250,
            vx: (Math.random() - 0.5) * 0.167,  // 0.5 / 3 — 200% slower
            vy: (Math.random() - 0.5) * 0.167,
            size: Math.random() * config.particleSize + 1,
            color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)],
            life: 100,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    /**
     * Draw particles with glow
     */
    function drawParticles() {
        particles.forEach(p => {
            if (!ctx) return;
            
            const opacity = p.fading ? p.life / 100 : 0.56;
            const color = p.color.replace('{opacity}', opacity);
            
            // Pulsing effect
            const pulse = isDarkMode() ? Math.sin(Date.now() * 0.002 + p.phase) * 0.2 + 0.8 : 1;
            const size = p.size * pulse;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Enhanced glow for dark mode
            if (isDarkMode()) {
                ctx.shadowColor = getAccentColor();
                ctx.shadowBlur = 20;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }
    
    /**
     * Draw connections between particles (dark mode only)
     */
    function drawParticleConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                
                if (distance < 120) {
                    if (!ctx) return;
                    
                    const opacity = (1 - distance / 120) * 0.15;
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(100, 181, 246, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }
    
    /**
     * Update configuration
     */
    function updateConfig(newConfig) {
        Object.assign(config, newConfig);
    }
    
    /**
     * Enable/Disable controls
     */
    function enable() {
        isEnabled = true;
        if (canvas) canvas.style.display = 'block';
        
        if (!animationFrame) {
            animate();
        }
    }
    
    function disable() {
        isEnabled = false;
        if (canvas) canvas.style.display = 'none';
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }
    
    /**
     * Add custom CSS styles
     */
    function addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Particle canvas */
            #mouse-particle-canvas {
                transition: opacity 0.3s ease;
            }
            
            /* Touch device fallback */
            @media (hover: none) and (pointer: coarse) {
                #mouse-particle-canvas {
                    display: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Add styles
    addCustomStyles();
    
    // Public API
    return {
        init,
        enable,
        disable,
        updateConfig,
        createBurstEffect
    };
})();