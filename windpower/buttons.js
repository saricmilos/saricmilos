/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Enhanced Button Effects
document.addEventListener('DOMContentLoaded', function() {
    // Apply ripple effect to all buttons
    const buttons = document.querySelectorAll('.button, .nav-button, .manufacturer-btn, .view-details-btn, .back-button, .select-turbine-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Don't add ripple effect to disabled buttons
            if (this.classList.contains('disabled')) return;
            
            // Remove any existing ripple
            const existingRipple = this.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }
            
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            // Position the ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size/2}px`;
            ripple.style.top = `${e.clientY - rect.top - size/2}px`;
            
            // Add ripple to button
            this.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add hover animation to result cards
    const resultCards = document.querySelectorAll('.result-card');
    resultCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
        });
    });
});

// Function to place a marker on the map
function placeMarker(location) {
    // Remove any existing marker
    if (marker) {
        marker.setMap(null);
    }
    
    // Remove any existing pulse effects
    const existingPulse = document.querySelector('.pulse-container');
    if (existingPulse) {
        existingPulse.remove();
    }
    
    // Create custom marker icon using SVG for better styling control
    const customMarker = {
        path: 'M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0',
        fillColor: '#0071e3',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 2,
    };
    
    // Create a new marker
    marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: customMarker,
        animation: google.maps.Animation.DROP
    });
    
    // Add the pulse effect overlay to the map
    addPulseEffect(location);
    
    // Add highlighted area around selected location (with updated styling)
    addSelectionHighlight(location);
    
    // Store the selected coordinates
    selectedLat = location.lat();
    selectedLng = location.lng();
    
    // Update the displayed coordinates with animation
    animateNumberUpdate('selected-lat', selectedLat.toFixed(6));
    animateNumberUpdate('selected-lng', selectedLng.toFixed(6));
}

// Function to add highlighted area around selected location
function addSelectionHighlight(location) {
    // Create a highlighted region around the selected point
    const highlightCircle = new google.maps.Circle({
        strokeColor: '#0071e3',
        strokeOpacity: 0.4,
        strokeWeight: 1.5,
        fillColor: '#0071e3',
        fillOpacity: 0.1,
        map: map,
        center: location,
        radius: 100000,  // 100km radius
        clickable: false
    });
    
    // Store the highlight circle to remove it later if needed
    if (window.currentHighlight) {
        window.currentHighlight.setMap(null);
    }
    window.currentHighlight = highlightCircle;
}

// Function to add pulse effect around marker
function addPulseEffect(location) {
    // Create a custom overlay for the pulse effect
    class PulseOverlay extends google.maps.OverlayView {
        constructor(position) {
            super();
            this.position = position;
            this.div = null;
        }
        
        onAdd() {
            this.div = document.createElement('div');
            this.div.className = 'pulse-container';
            
            // Create pulse rings
            for (let i = 1; i <= 3; i++) {
                const ring = document.createElement('div');
                ring.className = `pulse-ring pulse-ring-${i}`;
                this.div.appendChild(ring);
            }
            
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(this.div);
        }
        
        draw() {
            const overlayProjection = this.getProjection();
            const position = overlayProjection.fromLatLngToDivPixel(this.position);
            
            this.div.style.left = position.x + 'px';
            this.div.style.top = position.y + 'px';
        }
        
        onRemove() {
            if (this.div) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
            }
        }
    }
    
    // Remove existing pulse overlay
    if (window.pulseOverlay) {
        window.pulseOverlay.setMap(null);
    }
    
    // Create and display the new pulse overlay
    window.pulseOverlay = new PulseOverlay(location);
    window.pulseOverlay.setMap(map);
}

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