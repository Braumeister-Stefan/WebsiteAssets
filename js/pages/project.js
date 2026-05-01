/**
 * Project Page Module
 * Handles lazy-loading of GIFs and click-to-load for heavy assets.
 */

const ProjectPage = (function () {
    'use strict';

    function init() {
        setupLazyGifs();
        setupClickToLoad();
    }

    /**
     * Lazy-load all img.lazy-gif[data-src] via IntersectionObserver.
     * Showcase "Load Animations" buttons force immediate load for their card.
     */
    function setupLazyGifs() {
        const lazyImages = Array.from(document.querySelectorAll('img.lazy-gif[data-src]'));

        function loadImage(img) {
            img.src = img.dataset.src;
            delete img.dataset.src;
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            loadImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '200px' }
            );

            lazyImages.forEach(function (img) {
                observer.observe(img);
            });
        } else {
            lazyImages.forEach(loadImage);
        }

        // "Load Animations" buttons force-load all lazy GIFs in their card
        document.querySelectorAll('.showcase-activate-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const card = btn.closest('.showcase-card');
                if (!card) return;
                card.querySelectorAll('img.lazy-gif[data-src]').forEach(loadImage);
                btn.disabled = true;
                btn.textContent = 'Loaded';
            });
        });
    }

    /**
     * Click-to-load for heavy assets (Barnes-Hut quadtree GIF).
     * Replaces button with an <img> on click.
     */
    function setupClickToLoad() {
        document.querySelectorAll('.click-to-load-btn[data-src]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const img = document.createElement('img');
                img.src = btn.dataset.src;
                img.alt = btn.dataset.alt || '';
                btn.parentElement.appendChild(img);
                btn.disabled = true;
                btn.style.display = 'none';
            });
        });
    }

    return { init: init };
})();
