document.addEventListener('DOMContentLoaded', () => {

    // --- Throttle Function ---
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            const context = this;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    }


    // --- Parallax/Gliding Effect ---
    // Select the IMG tags directly that have the data attribute
    const parallaxElements = document.querySelectorAll('img[data-parallax-speed]');
    const mobileBreakpoint = 768; // Keep generic breakpoint, adjust if needed

    function handleParallaxScroll() {
        const isMobile = window.innerWidth < mobileBreakpoint;
        const scrollY = window.scrollY;

        parallaxElements.forEach(el => {
            // No need to check selector again, querySelectorAll already did it
            if (!isMobile) {
                const speed = parseFloat(el.dataset.parallaxSpeed) || 0.1;
                const offset = scrollY * speed;
                el.style.setProperty('--parallax-offset', `${offset}px`);
                // Apply transform using variables
                el.style.transform = `translateY(var(--parallax-offset)) scale(var(--hover-scale, 1.0))`;
                el.style.willChange = 'transform';
            } else {
                // Reset on mobile
                el.style.removeProperty('--parallax-offset');
                el.style.transform = 'translateY(0px) scale(1.0)';
                el.style.willChange = 'auto';
            }
        });
    }

    // Create throttled version
    const throttledParallaxScroll = throttle(handleParallaxScroll, 16); // ~60fps

    // Add resize listener
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleParallaxScroll, 100);
    }, { passive: true });


    // Add throttled scroll listener if elements exist
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', throttledParallaxScroll, { passive: true });
        handleParallaxScroll(); // Initial call

        // Add scale variable support for hover
        parallaxElements.forEach(el => {
            el.style.setProperty('--hover-scale', '1.0');
            el.addEventListener('mouseenter', () => {
                 // Apply correct hover scale based on viewport
                 // Match the scales defined in the CSS hover rules
                 const scaleValue = (window.innerWidth >= mobileBreakpoint) ? '1.04' : '1.02'; // Updated scale
                 el.style.setProperty('--hover-scale', scaleValue);
            });
            el.addEventListener('mouseleave', () => {
                el.style.setProperty('--hover-scale', '1.0');
            });
        });
    }


    // --- Intersection Observer for Scroll Animations ---
    // Select sections, paragraphs, lists, and image wrappers
    const animatedSections = document.querySelectorAll('.animated-section, .article-content p, .article-content ul, .article-content ol, .parallax-image-wrapper, .article-footer');

    // Add initial class to hide/prepare elements
    animatedSections.forEach(section => {
         // Check if it already has the class to avoid redundant addition if needed elsewhere
         if (!section.classList.contains('animated-section')) {
             section.classList.add('animated-section');
         }
    });


    if (animatedSections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1 // Trigger earlier if needed: 0.01
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        };

        const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

        animatedSections.forEach(section => {
            intersectionObserver.observe(section);
        });
    }

}); // End DOMContentLoaded

