/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle Functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Prevent body scrolling when menu is open
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !e.target.closest('.nav-menu') && 
                !e.target.closest('.mobile-menu-toggle')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu when clicking on a navigation link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
    
    // Existing code from java.js
    // Initialize AOS (Animate On Scroll) library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
    
    // Update current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                e.preventDefault();
                
                // Account for fixed header height
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize photo slideshow
    initPhotoSlideshow();
});

// Photo Slideshow functionality
function initPhotoSlideshow() {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const counter = document.querySelector('.slide-counter');
    const dotsContainer = document.querySelector('.slideshow-dots');
    const prevButton = document.querySelector('.slideshow-prev');
    const nextButton = document.querySelector('.slideshow-next');
    
    // Set up initial state
    let currentSlide = 0;
    
    // Initialize slides
    slides.forEach((slide, index) => {
        // Position all slides initially
        slide.style.transform = `translateX(${(index - currentSlide) * 100}%)`;
        // Set active class for current slide
        if (index === currentSlide) {
            slide.classList.add('active');
        }
    });
    
    // Update counter
    if (counter) {
        counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }
    
    // Create navigation dots
    if (dotsContainer) {
        dotsContainer.innerHTML = ''; // Clear existing dots
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('slideshow-dot');
            if (i === currentSlide) {
                dot.classList.add('active');
            }
            
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
            
            dotsContainer.appendChild(dot);
        }
    }
    
    // Add event listeners for navigation buttons
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            navigateSlide(-1);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            navigateSlide(1);
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isElementInViewport(slideshowContainer)) {
            if (e.key === 'ArrowLeft') {
                navigateSlide(-1);
            } else if (e.key === 'ArrowRight') {
                navigateSlide(1);
            }
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    slideshowContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slideshowContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const distance = touchStartX - touchEndX;
        
        if (Math.abs(distance) > 30) { // Lower threshold for better mobile response
            if (distance > 0) {
                // Swipe left -> next slide
                navigateSlide(1);
            } else {
                // Swipe right -> previous slide
                navigateSlide(-1);
            }
        }
    }, { passive: true });
    
    // Navigation functions
    function navigateSlide(direction) {
        currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
        updateSlides();
    }
    
    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
    }
    
    function updateSlides() {
        // Update all slides positions
        slides.forEach((slide, index) => {
            // Calculate position (centered = 0%, left = -100%, right = 100%)
            const offset = (index - currentSlide) * 100;
            slide.style.transform = `translateX(${offset}%)`;
            
            // Update active state
            slide.classList.toggle('active', index === currentSlide);
        });
        
        // Update counter
        if (counter) {
            counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
        }
        
        // Update dots
        const dots = document.querySelectorAll('.slideshow-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Auto-play functionality
    let autoplayTimer;
    
    function startAutoplay() {
        autoplayTimer = setInterval(() => {
            navigateSlide(1);
        }, 5000); // Change slide every 5 seconds
    }
    
    // Start autoplay
    startAutoplay();
    
    // Pause autoplay on hover or focus
    slideshowContainer.addEventListener('mouseenter', () => {
        clearInterval(autoplayTimer);
    });
    
    slideshowContainer.addEventListener('mouseleave', () => {
        startAutoplay();
    });
    
    // Helper function to check if element is visible in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0 &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right >= 0
        );
    }
}

// Back to top button functionality
window.onscroll = function() {
    const backToTopButton = document.getElementById("backToTop");
    if (backToTopButton) {
        backToTopButton.style.display = window.scrollY > 400 ? "block" : "none";
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.getElementById("backToTop");
    if (backToTopButton) {
        backToTopButton.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});