/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

document.addEventListener('DOMContentLoaded', function() {
  // Get reference to the back to top button
  const backToTopBtn = document.getElementById('backToTop');
  
  if (backToTopBtn) {
      // Show/hide back to top button based on scroll position
      window.addEventListener('scroll', function() {
          if (window.scrollY > 400) {
              backToTopBtn.style.display = 'block';
          } else {
              backToTopBtn.style.display = 'none';
          }
      });
      
      // Scroll to top when button is clicked
      backToTopBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.scrollTo({
              top: 0,
              behavior: 'smooth'
          });
          console.log('Back to top button clicked'); // For debugging
      });
  } else {
      console.error('Back to top button not found in the DOM');
  }
});

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    // Toggle mobile menu on hamburger click
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle active class on menu button
            this.classList.toggle('active');
            // Toggle active class on nav menu
            navMenu.classList.toggle('active');
            // Toggle no-scroll class on body to prevent scrolling when menu is open
            body.classList.toggle('no-scroll');
        });
    }
    
    // Close menu when clicking on a menu item
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only perform this action on mobile
            if (window.innerWidth <= 768) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        // Only perform this action on mobile and when menu is open
        if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
            // Check if click is outside the nav menu and not on the toggle button
            if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // If window is resized above mobile breakpoint, reset mobile menu
        if (window.innerWidth > 768) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            body.classList.remove('no-scroll');
        }
    });
});