/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Wrap in IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
(function() {
  // Wait for DOM to be fully loaded before executing
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations if the library is loaded
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease',
        once: true
      });
    }
    
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

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Skip if just "#"
        
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
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

    // Video handling code has been removed to prevent errors

    // Testimonial slider
    const slides = document.querySelectorAll('.testimonial-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    
    if (slides.length) {
      let currentSlide = 0;
      let slideTimer;

      function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
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

    // Skills Carousel Functionality
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (track && items.length && prevBtn && nextBtn) {
      let itemWidth = items[0].offsetWidth + 30; // Width + gap
      let position = 0;
      let itemsPerView = Math.floor(track.offsetWidth / itemWidth);
      let maxPosition = items.length - itemsPerView;
      
      // Create dots if container exists
      if (dotsContainer) {
        // Clear existing dots
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < Math.ceil(items.length / itemsPerView); i++) {
          const dot = document.createElement('div');
          dot.classList.add('carousel-dot');
          if (i === 0) dot.classList.add('active');
          dot.addEventListener('click', () => {
            position = i * itemsPerView;
            if (position > items.length - itemsPerView) {
              position = items.length - itemsPerView;
            }
            updateCarousel();
          });
          dotsContainer.appendChild(dot);
        }
      }
      
      const dots = document.querySelectorAll('.carousel-dot');
      
      // Previous button
      prevBtn.addEventListener('click', () => {
        position -= itemsPerView;
        if (position < 0) position = 0;
        updateCarousel();
      });
      
      // Next button
      nextBtn.addEventListener('click', () => {
        position += itemsPerView;
        if (position > items.length - itemsPerView) {
          position = items.length - itemsPerView;
        }
        updateCarousel();
      });
      
      // Update the carousel position
      function updateCarousel() {
        track.style.transform = `translateX(-${position * itemWidth}px)`;
        
        // Update dots
        if (dots.length) {
          dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (Math.floor(position / itemsPerView) === index) {
              dot.classList.add('active');
            }
          });
        }
        
        // Update button states
        prevBtn.disabled = position === 0;
        nextBtn.disabled = position >= items.length - itemsPerView;
      }
      
      // Handle window resize
      window.addEventListener('resize', () => {
        itemWidth = items[0].offsetWidth + 30;
        itemsPerView = Math.floor(track.offsetWidth / itemWidth);
        maxPosition = items.length - itemsPerView;
        
        // Reset position if needed
        if (position > maxPosition) {
          position = maxPosition;
          updateCarousel();
        }
      });
    }

    // Form handling for contact form
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const formDataObj = {};
        formData.forEach((value, key) => {
          formDataObj[key] = value;
        });
        
        // Convert to CSV string
        const csvHeader = Object.keys(formDataObj).join(',');
        const csvValues = Object.values(formDataObj).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',');
        const csvString = `${csvHeader}\n${csvValues}`;
        
        // For demo purposes - log the CSV data
        console.log('CSV Data:', csvString);
        
        // Simulate sending the data
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.classList.add('submitting');
        }
        
        // Simulate sending the data
        setTimeout(() => {
          // Show success message with animation
          if (formSuccess) formSuccess.classList.add('active');
          
          // Reset form
          contactForm.reset();
          
          // After showing success message for a few seconds, hide it
          setTimeout(() => {
            if (formSuccess) formSuccess.classList.remove('active');
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.classList.remove('submitting');
            }
          }, 3000);
        }, 1500);
      });
    }
    
    // Add subtle animation to form fields
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    formInputs.forEach(input => {
      input.addEventListener('focus', function() {
        if (this.parentElement) this.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', function() {
        if (this.parentElement) this.parentElement.classList.remove('focused');
      });
    });

    // Update copyright year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // Interactive Project Cards with Animation Effects
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
      // Stagger the animations
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 200 * index);
      
      // Add click ripple effect
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
    });
    
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
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
      // Fallback if IntersectionObserver not available
      projectCards.forEach(card => {
        card.classList.add('in-view');
      });
    }
  });
})();

// Show/hide back to top button based on scroll position
window.onscroll = () => {
  document.getElementById("backToTop").style.display = 
      window.scrollY > 400 ? "block" : "none";
};

// Scroll to top when button is clicked
document.getElementById("backToTop").onclick = () =>
  window.scrollTo({ top: 0, behavior: 'smooth' });