/**
 * Home Page Module
 * Handles home page specific functionality
 */

const HomePage = (function() {
    'use strict';
    
    /**
     * Initialize home page
     */
    function init() {
        console.log('Home page initialized');
        
        // Add interactive effects to preview card
        enhancePreviewCard();
        
        // Initialize any home-specific animations
        initHomeAnimations();
        
        // Initialize typing effect
        initTypingEffect();
        
        // Add scroll animations for sections
        initScrollAnimations();
    }
    
    /**
     * Enhance preview card with interactive effects
     */
    function enhancePreviewCard() {
        const previewCard = document.querySelector('.preview-card');
        
        if (!previewCard) return;
        
        // Add mouse move effect
        previewCard.addEventListener('mousemove', (e) => {
            const rect = previewCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            previewCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        // Reset on mouse leave
        previewCard.addEventListener('mouseleave', () => {
            previewCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(-5px)';
        });
    }
    
    /**
     * Initialize home page animations
     */
    function initHomeAnimations() {
        // Add animation classes to elements
        const heroElements = document.querySelectorAll('.hero h1, .hero p');
        
        heroElements.forEach((el, index) => {
            el.style.animation = `fadeIn 1s ease-out ${index * 0.3}s both`;
        });
    }
    
    /**
     * Initialize typing effect for hero section
     */
    function initTypingEffect() {
        const typedTextElement = document.querySelector('.typed-text');
        if (!typedTextElement) return;
        
        const words = [
            'Quantitative Risk Manager', 
            'Financial Engineer', 
            'FRM Certified', 
            'Python Developer',
            'Risk Model Validator'
        ];
        
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isWaiting = false;
        let timeoutId = null;
        
        function type() {
            // Clear any existing timeout
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typedTextElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typedTextElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            // If word is complete
            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                isWaiting = true;
                timeoutId = setTimeout(() => {
                    isWaiting = false;
                    type();
                }, 2000); // Wait 2 seconds before deleting
                return;
            }
            
            // If word is fully deleted
            if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
            
            // Continue typing/deleting
            if (!isWaiting) {
                const speed = isDeleting ? 50 : 100;
                timeoutId = setTimeout(type, speed);
            }
        }
        
        // Start typing after initial animations
        timeoutId = setTimeout(type, 2000);
        
        // Clean up timeout on page unload
        window.addEventListener('beforeunload', () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        });
    }
    
    /**
     * Initialize scroll animations for sections
     */
    function initScrollAnimations() {
        const sections = document.querySelectorAll('.experience-section, .education-section, .skills-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px'
        });
        
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }
    
    /**
     * Load featured content dynamically
     * @param {Object} config - Configuration for featured content
     */
    function loadFeaturedContent(config = {}) {
        // This function can be extended to load content from an API
        const defaultContent = {
            title: 'Particle Simulator',
            description: 'Interactive physics-based particle simulation with real-time interactions'
        };
        
        const content = { ...defaultContent, ...config };
        
        // Update DOM with content
        const titleElement = document.querySelector('.preview-card h3');
        const descElement = document.querySelector('.preview-card p');
        
        if (titleElement) titleElement.textContent = content.title;
        if (descElement) descElement.textContent = content.description;
    }
    
    /**
     * Public API
     */
    return {
        init,
        loadFeaturedContent,
        // Expose for external use if needed
        initTypingEffect,
        enhancePreviewCard
    };
    
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if we're on the home page
        if (document.querySelector('.home-page')) {
            HomePage.init();
        }
    });
} else {
    // DOM is already loaded
    if (document.querySelector('.home-page')) {
        HomePage.init();
    }
}