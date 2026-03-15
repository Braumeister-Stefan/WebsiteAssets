/**
 * Animations Module
 * Handles page animations and transitions
 */

const Animations = (function() {
    'use strict';
    
    /**
     * Initialize scroll animations
     */
    function initScrollAnimations() {
        const elements = document.querySelectorAll('[data-animate]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Optional: unobserve after animation
                    if (entry.target.dataset.animateOnce === 'true') {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(el => observer.observe(el));
    }
    
    /**
     * Fade in element
     * @param {HTMLElement} element - Element to fade in
     * @param {number} duration - Animation duration in ms
     */
    function fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        }
        
        window.requestAnimationFrame(step);
    }
    
    /**
     * Fade out element
     * @param {HTMLElement} element - Element to fade out
     * @param {number} duration - Animation duration in ms
     */
    function fadeOut(element, duration = 500) {
        let start = null;
        const initialOpacity = parseFloat(element.style.opacity) || 1;
        
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(initialOpacity - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                element.style.display = 'none';
            }
        }
        
        window.requestAnimationFrame(step);
    }
    
    /**
     * Slide toggle element
     * @param {HTMLElement} element - Element to slide toggle
     */
    function slideToggle(element) {
        if (element.style.display === 'none') {
            slideDown(element);
        } else {
            slideUp(element);
        }
    }
    
    /**
     * Slide down element
     * @param {HTMLElement} element - Element to slide down
     * @param {number} duration - Animation duration in ms
     */
    function slideDown(element, duration = 300) {
        element.style.display = 'block';
        element.style.overflow = 'hidden';
        element.style.height = '0';
        
        const targetHeight = element.scrollHeight;
        
        let start = null;
        
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            element.style.height = `${targetHeight * percentage}px`;
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        window.requestAnimationFrame(step);
    }
    
    /**
     * Slide up element
     * @param {HTMLElement} element - Element to slide up
     * @param {number} duration - Animation duration in ms
     */
    function slideUp(element, duration = 300) {
        const targetHeight = element.scrollHeight;
        element.style.height = `${targetHeight}px`;
        element.style.overflow = 'hidden';
        
        let start = null;
        
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = 1 - Math.min(progress / duration, 1);
            
            element.style.height = `${targetHeight * percentage}px`;
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        window.requestAnimationFrame(step);
    }
    
    // Public API
    return {
        initScrollAnimations,
        fadeIn,
        fadeOut,
        slideToggle,
        slideDown,
        slideUp
    };
})();