/**
 * Main Application Entry Point
 * Updated to use enhanced mouse tracker
 */

(function() {
    'use strict';
    
    /**
     * Initialize the application
     */
    function initApp() {
        console.log('Application initializing...');
        
        // Initialize global modules
        initGlobalModules();
        
        // Initialize page-specific modules
        initPageModules();
        
        // Register service worker for future PWA support
        registerServiceWorker();
        
        console.log('Application initialized successfully');
    }
    
    /**
     * Initialize global modules with enhanced mouse tracker
     */
    function initGlobalModules() {
        // Initialize enhanced mouse tracking
        if (typeof MouseTracker !== 'undefined') {
            // Configure the mouse tracker
            MouseTracker.init({
                particleCount: 40,              // More particles for richer effect
                particleSize: 5,                 // Slightly larger particles
                ringSize: 50,                     // Larger ring
                dotSize: 8,                       // Larger dot
                magneticRadius: 200,               // Wider magnetic influence
                magneticStrength: 0.7,             // Stronger magnetic effect
                smoothing: 0.1,                     // Smoother tracking
                colorPalette: [                     // Custom color palette
                    'rgba(99, 102, 241, {opacity})', // Indigo
                    'rgba(79, 70, 229, {opacity})',  // Darker indigo
                    'rgba(129, 140, 248, {opacity})', // Lighter indigo
                    'rgba(165, 180, 252, {opacity})', // Very light indigo
                    'rgba(139, 92, 246, {opacity})'   // Purple
                ]
            });
        }
        
        // Initialize scroll animations
        if (typeof Animations !== 'undefined') {
            Animations.initScrollAnimations();
        }
    }
    
    /**
     * Initialize page-specific modules based on current page
     */
    function initPageModules() {
        const path = window.location.pathname;
        
        // Determine current page
        if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
            initHomePage();
        } else if (path.includes('contact')) {
            initContactPage();
        } else if (path.includes('project')) {
            initProjectPage();
        }
    }
    
    /**
     * Initialize home page
     */
    function initHomePage() {
        if (typeof HomePage !== 'undefined') {
            HomePage.init();
            
            // Load featured content (can be from API later)
            HomePage.loadFeaturedContent({
                title: 'Particle Simulator',
                description: 'Interactive physics-based particle simulation'
            });
        }
    }
    
    /**
     * Initialize contact page
     */
    function initContactPage() {
        if (typeof ContactPage !== 'undefined') {
            ContactPage.init();
        }
    }
    
    /**
     * Initialize project page
     */
    function initProjectPage() {
        if (typeof ProjectPage !== 'undefined') {
            ProjectPage.init();
        }
    }
    
    /**
     * Register service worker for PWA support
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
            });
        }
    }
    
    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
    
    // Handle page transitions/visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden - pause mouse tracker if needed
            if (typeof MouseTracker !== 'undefined') {
                MouseTracker.disable();
            }
        } else {
            // Page is visible again - resume mouse tracker
            if (typeof MouseTracker !== 'undefined') {
                MouseTracker.enable();
            }
        }
    });
    
})();