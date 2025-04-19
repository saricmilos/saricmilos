/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Main JavaScript file - Improved for Mobile

// Wrap in IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
(function() {
  // Wait for DOM to be fully loaded before executing
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations if the library is loaded
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease',
        once: true,
        disable: 'phone' // Disable animations on small devices for better performance
      });
    }

    // Enhanced Mobile menu toggle functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    if (mobileMenuToggle && navMenu) {
      // Improved toggle with body scroll lock
      mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Prevent background scrolling when menu is open
        if (navMenu.classList.contains('active')) {
          body.style.overflow = 'hidden';
        } else {
          body.style.overflow = '';
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', function(e) {
        if (
          navMenu.classList.contains('active') && 
          !navMenu.contains(e.target) && 
          !mobileMenuToggle.contains(e.target)
        ) {
          navMenu.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
          body.style.overflow = '';
        }
      });
    }
    
    // Improved Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu && mobileMenuToggle) {
          navMenu.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
          body.style.overflow = '';
          
          // Smooth scroll to section with delay to allow menu to close
          const href = link.getAttribute('href');
          if (href.startsWith('#') && href.length > 1) {
            event.preventDefault();
            const targetId = href;
            setTimeout(() => {
              const targetElement = document.querySelector(targetId);
              if (targetElement) {
                targetElement.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }, 300);
          }
        }
      });
    });
    
    // Highlight current page in navigation
    const currentPage = window.location.pathname;
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (linkPath && currentPage.includes(linkPath) && linkPath !== 'index.html') {
        link.classList.add('active');
      } else if (currentPage.endsWith('/') && linkPath === 'index.html') {
        link.classList.add('active');
      }
    });

    // Improved smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Skip if just "#"
        
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Add offset for fixed header
          const headerOffset = document.querySelector('.site-header').offsetHeight;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    // Create a scroll progress bar if it exists
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
      });
    }

    // Optimized mobile detection
    const isMobile = () => window.innerWidth <= 768;

    // Optimize testimonial slider for touch devices
    const slides = document.querySelectorAll('.testimonial-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    
    if (slides.length) {
      let currentSlide = 0;
      let slideTimer;
      let touchStartX = 0;
      let touchEndX = 0;

      function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
      }

      // Touch swipe support for testimonials
      const testimonialSlider = document.querySelector('.testimonial-slider');
      if (testimonialSlider) {
        testimonialSlider.addEventListener('touchstart', function(e) {
          touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        testimonialSlider.addEventListener('touchend', function(e) {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        }, false);
        
        function handleSwipe() {
          if (touchEndX < touchStartX - 50) {
            // Swipe left - next slide
            let index = currentSlide + 1;
            if (index >= slides.length) index = 0;
            showSlide(index);
          }
          
          if (touchEndX > touchStartX + 50) {
            // Swipe right - previous slide
            let index = currentSlide - 1;
            if (index < 0) index = slides.length - 1;
            showSlide(index);
          }
        }
      }

      if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
          let index = currentSlide - 1;
          if (index < 0) index = slides.length - 1;
          showSlide(index);
        });

        nextButton.addEventListener('click', () => {
          let index = currentSlide + 1;
          if (index >= slides.length) index = 0;
          showSlide(index);
        });

        // Auto-change slides every 5 seconds
        slideTimer = setInterval(() => {
          let index = currentSlide + 1;
          if (index >= slides.length) index = 0;
          showSlide(index);
        }, 5000);
        
        // Stop auto-change when user interacts with slider
        [prevButton, nextButton].concat(Array.from(indicators)).forEach(elem => {
          elem.addEventListener('click', () => {
            clearInterval(slideTimer);
          });
        });
      }

      // Add click functionality to indicators
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
          showSlide(index);
        });
      });
    }

    // Update copyright year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // Interactive Project Cards with Animation Effects - optimized for mobile
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
      // Stagger the animations but only if not mobile
      if (!isMobile()) {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 200 * index);
      } else {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
      
      // Add click ripple effect but disable on mobile to improve touch response
      if (!isMobile()) {
        card.addEventListener('click', function(e) {
          if (e.target.classList.contains('project-link')) return;
          
          // Create ripple element
          const ripple = document.createElement('div');
          ripple.className = 'ripple';
          this.appendChild(ripple);
          
          // Position the ripple
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${e.clientX - rect.left - size/2}px`;
          ripple.style.top = `${e.clientY - rect.top - size/2}px`;
          
          // Remove ripple after animation completes
          setTimeout(() => {
            if (ripple.parentNode) {
              ripple.parentNode.removeChild(ripple);
            }
          }, 600);
        });
      }
    });
    
    // Check if IntersectionObserver is available and only use if not mobile
    if ('IntersectionObserver' in window && !isMobile()) {
      try {
        // Add intersection observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.2
        });
        
        projectCards.forEach(card => {
          observer.observe(card);
        });
      } catch (err) {
        console.error("IntersectionObserver error:", err);
        // Fallback for observer error
        projectCards.forEach(card => {
          card.classList.add('in-view');
        });
      }
    } else {
      // Fallback if IntersectionObserver not available or on mobile
      projectCards.forEach(card => {
        card.classList.add('in-view');
      });
    }
    
    // Check if device is touch enabled
    const isTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    
    // Add touch-specific class to body for CSS targeting
    if (isTouchDevice()) {
      document.body.classList.add('touch-device');
    }
    
    // Add enhanced back to top button for mobile
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
      // Show button only after scrolling down more on mobile
      const scrollThreshold = isMobile() ? 200 : 400;
      
      window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });
      
      // Ensure button works on touch devices
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    // Add viewport height fix for mobile browsers (iOS Safari 100vh issue)
    function setVhProperty() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set the property on initial load and resize
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
  });
})();

// Improved back to top functionality
const backToTopCheck = () => {
  const backToTopElement = document.getElementById("backToTop");
  if (!backToTopElement) return;
  
  backToTopElement.style.display = 
      window.scrollY > 400 ? "block" : "none";
};

// Use passive event listeners for better scrolling performance
window.addEventListener('scroll', backToTopCheck, { passive: true });

// Ensure back to top button works
if (document.getElementById("backToTop")) {
  document.getElementById("backToTop").onclick = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Enhanced back to top functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get the back to top button
  const backToTopBtn = document.getElementById('backToTop');
  
  if (backToTopBtn) {
    // Show or hide the button based on scroll position
    function toggleBackToTopButton() {
      if (window.scrollY > 300) {
        backToTopBtn.style.display = "block";
        setTimeout(() => {
          backToTopBtn.classList.add('visible');
        }, 10);
      } else {
        backToTopBtn.classList.remove('visible');
        setTimeout(() => {
          backToTopBtn.style.display = "none";
        }, 300);
      }
    }
    
    // Initial check on page load
    toggleBackToTopButton();
    
    // Use passive event listeners for better scrolling performance
    window.addEventListener('scroll', toggleBackToTopButton, { passive: true });
    
    // Ensure back to top button works
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});