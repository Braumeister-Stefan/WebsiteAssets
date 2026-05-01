/**
 * About Page Module
 * Handles about page specific functionality
 */

const AboutPage = (function() {
    'use strict';

    /**
     * Initialize about page
     */
    function init() {
        initScrollReveal('.timeline-item');
        initScrollReveal('.skill-item');
    }

    /**
     * Reveal elements matching selector as they scroll into view
     * @param {string} selector - CSS selector for elements to animate
     */
    function initScrollReveal(selector) {
        const elements = document.querySelectorAll(selector);

        if (!elements.length) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

            elements.forEach(function(el) { observer.observe(el); });
        } else {
            elements.forEach(function(el) { el.classList.add('visible'); });
        }
    }

    return { init: init };
})();
