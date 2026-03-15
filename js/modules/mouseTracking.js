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
    let cursorDot = null;
    let cursorRing = null;
    let cursorGlow = null;
    
    // Configuration - Enhanced for dark theme
    const config = {
        particleCount: 10,              // Slightly increased for more glow
        particleSize: 4,                // Slightly larger for visibility
        ringSize: 40,                    // Slightly larger ring
        dotSize: 5,                      // Medium dot
        smoothing: 0.06,                  // Very smooth follow
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
     * Get glow intensity based on theme
     */
    function getGlowIntensity() {
        return isDarkMode() ? '0 0 25px' : '0 0 15px';
    }
    
    /**
     * Initialize enhanced mouse tracker
     */
    function init(options = {}) {
        Object.assign(config, options);
        
        createCanvas();
        createCursorElements();
        
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
     * Create cursor elements with glow
     */
    function createCursorElements() {
        const accentColor = getAccentColor();
        const glowIntensity = getGlowIntensity();
        
        // Create cursor glow (outer aura)
        cursorGlow = document.createElement('div');
        cursorGlow.id = 'cursor-glow';
        cursorGlow.style.position = 'fixed';
        cursorGlow.style.width = '80px';
        cursorGlow.style.height = '80px';
        cursorGlow.style.background = `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`;
        cursorGlow.style.borderRadius = '50%';
        cursorGlow.style.pointerEvents = 'none';
        cursorGlow.style.zIndex = '9997';
        cursorGlow.style.transform = 'translate(-50%, -50%)';
        cursorGlow.style.transition = 'width 0.2s ease, height 0.2s ease, opacity 0.3s ease';
        cursorGlow.style.opacity = '0.6';
        cursorGlow.style.filter = 'blur(8px)';
        
        // Create cursor dot
        cursorDot = document.createElement('div');
        cursorDot.id = 'cursor-dot';
        cursorDot.style.position = 'fixed';
        cursorDot.style.width = `${config.dotSize}px`;
        cursorDot.style.height = `${config.dotSize}px`;
        cursorDot.style.backgroundColor = accentColor;
        cursorDot.style.borderRadius = '50%';
        cursorDot.style.pointerEvents = 'none';
        cursorDot.style.zIndex = '10000';
        cursorDot.style.transform = 'translate(-50%, -50%)';
        cursorDot.style.transition = 'transform 0.1s ease, background-color 0.3s ease';
        cursorDot.style.boxShadow = `0 0 20px ${accentColor}`;
        
        // Add inner highlight
        cursorDot.innerHTML = `<div style="
            position: absolute;
            top: 20%;
            left: 20%;
            width: 30%;
            height: 30%;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
        "></div>`;
        
        // Create cursor ring
        cursorRing = document.createElement('div');
        cursorRing.id = 'cursor-ring';
        cursorRing.style.position = 'fixed';
        cursorRing.style.width = `${config.ringSize}px`;
        cursorRing.style.height = `${config.ringSize}px`;
        cursorRing.style.border = `2px solid ${accentColor}`;
        cursorRing.style.borderRadius = '50%';
        cursorRing.style.pointerEvents = 'none';
        cursorRing.style.zIndex = '9999';
        cursorRing.style.transform = 'translate(-50%, -50%)';
        cursorRing.style.transition = 'width 0.2s ease, height 0.2s ease, border-color 0.3s ease';
        cursorRing.style.boxShadow = `0 0 15px ${accentColor}`;
        cursorRing.style.opacity = '0.8';
        
        document.body.appendChild(cursorGlow);
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorRing);
    }
    
    /**
     * Update theme colors
     */
    function updateThemeColors() {
        const accentColor = getAccentColor();
        const glowIntensity = getGlowIntensity();
        
        if (cursorGlow) {
            cursorGlow.style.background = `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`;
        }
        
        if (cursorDot) {
            cursorDot.style.backgroundColor = accentColor;
            cursorDot.style.boxShadow = `${glowIntensity} ${accentColor}`;
        }
        
        if (cursorRing) {
            cursorRing.style.border = `2px solid ${accentColor}`;
            cursorRing.style.boxShadow = `0 0 20px ${accentColor}`;
        }
    }
    
    /**
     * Initialize particle system
     */
    function initParticles() {
        for (let i = 0; i < config.particleCount; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * config.particleSize + 2,
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
        
        // Update cursor positions
        if (cursorDot && cursorRing && cursorGlow) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
            
            cursorRing.style.left = `${mouseX}px`;
            cursorRing.style.top = `${mouseY}px`;
            
            cursorGlow.style.left = `${mouseX}px`;
            cursorGlow.style.top = `${mouseY}px`;
            
            // Hover effect - subtle change
            const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
            if (hoveredElement && isInteractiveElement(hoveredElement)) {
                cursorRing.style.width = `${config.ringSize * 1.2}px`;
                cursorRing.style.height = `${config.ringSize * 1.2}px`;
                cursorRing.style.borderColor = '#f39c12';
                cursorGlow.style.width = '100px';
                cursorGlow.style.height = '100px';
            } else {
                cursorRing.style.width = `${config.ringSize}px`;
                cursorRing.style.height = `${config.ringSize}px`;
                cursorRing.style.borderColor = getAccentColor();
                cursorGlow.style.width = '80px';
                cursorGlow.style.height = '80px';
            }
        }
    }
    
    /**
     * Check if element is interactive
     */
    function isInteractiveElement(element) {
        const interactiveTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];
        const interactiveClasses = ['btn', 'nav-menu', 'social-link', 'card', 'skill-item', 'project-preview'];
        
        if (interactiveTags.includes(element.tagName)) return true;
        
        for (let cls of interactiveClasses) {
            if (element.classList.contains(cls)) return true;
        }
        
        return false;
    }
    
    /**
     * Handle mouse enter
     */
    function handleMouseEnter() {
        [cursorDot, cursorRing, cursorGlow, canvas].forEach(el => {
            if (el) el.style.opacity = '1';
        });
    }
    
    /**
     * Handle mouse leave
     */
    function handleMouseLeave() {
        [cursorDot, cursorRing, cursorGlow, canvas].forEach(el => {
            if (el) el.style.opacity = '0';
        });
    }
    
    /**
     * Handle mouse down
     */
    function handleMouseDown() {
        if (cursorDot) {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(0.7)';
        }
        if (cursorRing) {
            cursorRing.style.transform = 'translate(-50%, -50%) scale(0.9)';
        }
        if (cursorGlow) {
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }
        
        createBurstEffect(targetX, targetY, 8);
    }
    
    /**
     * Handle mouse up
     */
    function handleMouseUp() {
        if (cursorDot) {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        if (cursorRing) {
            cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        if (cursorGlow) {
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    }
    
    /**
     * Create burst effect on click
     */
    function createBurstEffect(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 3;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 2,
                color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)],
                life: 60,
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
            
            if (distance < 200) {
                const force = (1 - distance / 200) * 0.01;
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
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * config.particleSize + 2,
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
            
            const opacity = p.fading ? p.life / 100 : 0.4;
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
        
        if (cursorDot) {
            cursorDot.style.width = `${config.dotSize}px`;
            cursorDot.style.height = `${config.dotSize}px`;
        }
        
        if (cursorRing) {
            cursorRing.style.width = `${config.ringSize}px`;
            cursorRing.style.height = `${config.ringSize}px`;
        }
    }
    
    /**
     * Enable/Disable controls
     */
    function enable() {
        isEnabled = true;
        [cursorDot, cursorRing, cursorGlow, canvas].forEach(el => {
            if (el) el.style.display = 'block';
        });
        
        if (!animationFrame) {
            animate();
        }
    }
    
    function disable() {
        isEnabled = false;
        [cursorDot, cursorRing, cursorGlow, canvas].forEach(el => {
            if (el) el.style.display = 'none';
        });
        
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
            /* Hide default cursor */
            body {
                cursor: none !important;
            }
            
            /* Show custom cursor on all elements */
            a, button, .btn, input, textarea, select {
                cursor: none !important;
            }
            
            /* Custom cursor styles */
            #cursor-dot, #cursor-ring, #cursor-glow {
                will-change: transform, width, height, opacity;
                pointer-events: none;
            }
            
            #cursor-dot {
                transition: opacity 0.3s ease, transform 0.1s ease, background-color 0.3s ease;
            }
            
            #cursor-ring {
                transition: opacity 0.3s ease, width 0.2s ease, height 0.2s ease, 
                            border-color 0.3s ease, transform 0.1s ease;
            }
            
            #cursor-glow {
                transition: opacity 0.3s ease, width 0.2s ease, height 0.2s ease;
                filter: blur(10px);
            }
            
            /* Particle canvas */
            #mouse-particle-canvas {
                transition: opacity 0.3s ease;
            }
            
            /* Mobile optimizations */
            @media (max-width: 768px) {
                #cursor-dot, #cursor-ring, #cursor-glow {
                    opacity: 0.7;
                }
            }
            
            /* Touch device fallback */
            @media (hover: none) and (pointer: coarse) {
                #cursor-dot, #cursor-ring, #cursor-glow, #mouse-particle-canvas {
                    display: none !important;
                }
                
                body {
                    cursor: auto !important;
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