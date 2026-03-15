/**
 * Theme Manager Module - Always Dark Mode
 * No toggle button required - permanently dark
 */

const ThemeManager = (function() {
    'use strict';
    
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';
    
    let currentTheme = DARK_THEME;
    
    /**
     * Initialize theme manager - always dark mode
     */
    function init() {
        // Always set to dark mode immediately
        setTheme(DARK_THEME);
        
        console.log('Theme manager initialized - Always dark mode');
    }
    
    /**
     * Set theme
     * @param {string} theme - 'dark' or 'light'
     */
    function setTheme(theme) {
        if (theme === DARK_THEME) {
            document.documentElement.setAttribute('data-theme', DARK_THEME);
            currentTheme = DARK_THEME;
        } else {
            document.documentElement.removeAttribute('data-theme');
            currentTheme = LIGHT_THEME;
        }
        
        // Dispatch custom event for other modules (mouse tracking, etc.)
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: currentTheme }
        }));
    }
    
    /**
     * Get current theme
     * @returns {string} Current theme
     */
    function getCurrentTheme() {
        return currentTheme;
    }
    
    /**
     * Check if dark mode is active
     * @returns {boolean}
     */
    function isDarkMode() {
        return currentTheme === DARK_THEME;
    }
    
    // Public API
    return {
        init,
        setTheme,
        getCurrentTheme,
        isDarkMode
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
    });
} else {
    ThemeManager.init();
}