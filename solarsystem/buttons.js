/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Navigation button functionality
document.addEventListener("DOMContentLoaded", function() {
    // Get all navigation buttons
    const locationBtn = document.getElementById("location-btn");
    const solarPanelBtn = document.getElementById("solar-panel-btn");
    const batteryBtn = document.getElementById("battery-btn");
    const inverterBtn = document.getElementById("inverter-btn");
    const economicBtn = document.getElementById("economic-btn");
    
    // Get all content sections
    const locationContent = document.getElementById("location-content");
    const solarPanelContent = document.getElementById("solar-panel-content");
    const batteryContent = document.getElementById("battery-content");
    const inverterContent = document.getElementById("inverter-content");
    const economicContent = document.getElementById("economic-content");
    
    // Function to deactivate all buttons and hide all content
    function resetAll() {
        // Remove active class from all buttons
        locationBtn.classList.remove("active");
        solarPanelBtn.classList.remove("active");
        batteryBtn.classList.remove("active");
        inverterBtn.classList.remove("active");
        economicBtn.classList.remove("active");
        
        // Hide all content sections
        locationContent.style.display = "none";
        solarPanelContent.style.display = "none";
        batteryContent.style.display = "none";
        inverterContent.style.display = "none";
        economicContent.style.display = "none";
    }
    
    // Function to check if solar data has been retrieved before allowing navigation
    function checkSolarDataBeforePanelSection() {
        // If the getStoredSolarData function exists and returns data, we can proceed
        if (typeof getStoredSolarData === 'function' && getStoredSolarData()) {
            return true;
        }
        return false;
    }
    
    // Location button click event
    locationBtn.addEventListener("click", function() {
        resetAll();
        locationBtn.classList.add("active");
        locationContent.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Solar Panel button click event
    solarPanelBtn.addEventListener("click", function() {
        // Check if location data has been set before allowing navigation
        if (!checkSolarDataBeforePanelSection()) {
            alert("Please select a location and get solar data first!");
            return;
        }
        
        resetAll();
        solarPanelBtn.classList.add("active");
        solarPanelContent.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Battery button click event
    batteryBtn.addEventListener("click", function() {
        // Check if solar panel has been selected
        if (!checkSolarDataBeforePanelSection()) {
            alert("Please complete the location section first!");
            return;
        }
        
        resetAll();
        batteryBtn.classList.add("active");
        batteryContent.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Inverter button click event
    inverterBtn.addEventListener("click", function() {
        // Check if battery has been selected
        if (!checkSolarDataBeforePanelSection()) {
            alert("Please complete the location section first!");
            return;
        }
        
        resetAll();
        inverterBtn.classList.add("active");
        inverterContent.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Economic button click event
    economicBtn.addEventListener("click", function() {
        // Check if inverter has been selected
        if (!checkSolarDataBeforePanelSection()) {
            alert("Please complete the location section first!");
            return;
        }
        
        resetAll();
        economicBtn.classList.add("active");
        economicContent.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Additional functionality for back-to-top button
    const backToTopBtn = document.getElementById("backToTop");
    
    // Show button when user scrolls down 300px from the top
    window.addEventListener("scroll", function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    });
    
    // Scroll to top when button is clicked
    backToTopBtn.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Initialize page with location section active
    locationBtn.click();
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

