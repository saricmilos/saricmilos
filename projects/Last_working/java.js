// Projects page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Update the current year in the footer
    updateCopyrightYear();
    
    // Initialize smooth scrolling for anchor links
    initializeSmoothScroll();
    
    // Add hover effect to project images
    initializeProjectImageEffects();
    
    // Initialize animation on scroll if AOS library is loaded
    initializeAOS();
});

/**
 * Updates the copyright year in the footer to the current year
 */
function updateCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


/**
 * Initializes smooth scrolling for anchor links
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Initializes hover effects for project images
 */
function initializeProjectImageEffects() {
    const projectImages = document.querySelectorAll('.project-image');
    
    projectImages.forEach(image => {
        // Add subtle scale effect on hover
        image.addEventListener('mouseenter', function() {
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1.03)';
                img.style.transition = 'transform 0.4s ease';
            }
        });
        
        image.addEventListener('mouseleave', function() {
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1)';
            }
        });
    });
}

/**
 * Initializes AOS (Animate On Scroll) library if available
 */
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
}

/**
 * Lazy loads images to improve page performance
 */
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}


    window.onscroll = () => {
        document.getElementById("backToTop").style.display = 
            window.scrollY > 400 ? "block" : "none";
    };

    document.getElementById("backToTop").onclick = () =>
        window.scrollTo({ top: 0, behavior: 'smooth' });
