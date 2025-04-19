/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll) library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
    
    // Update current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Image parallax effect on scroll
    const galleryImages = document.querySelectorAll('.gallery-image img');
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        galleryImages.forEach(image => {
            const parentElement = image.parentElement;
            const offsetTop = parentElement.offsetTop;
            const elementHeight = parentElement.offsetHeight;
            
            // Check if element is in viewport
            if (scrollPosition + window.innerHeight > offsetTop && 
                scrollPosition < offsetTop + elementHeight) {
                // Calculate parallax effect (subtle movement)
                const parallaxOffset = (scrollPosition - offsetTop) * 0.1;
                image.style.transform = `translateY(${parallaxOffset}px)`;
            }
        });
    });
    
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Optional: Add fade-in effect for biography paragraphs
    const biographyParagraphs = document.querySelectorAll('.biography-content p');
    
    biographyParagraphs.forEach((paragraph, index) => {
        paragraph.setAttribute('data-aos', 'fade-up');
        paragraph.setAttribute('data-aos-delay', (index * 100).toString());
    });
    
    // Optional: Paper download tracking (if you want to track downloads)
    const downloadButtons = document.querySelectorAll('.download-button');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paperTitle = this.closest('.publication-card').querySelector('h4').textContent;
            
            // If Google Analytics is available, track the download event
            if(typeof gtag === 'function') {
                gtag('event', 'download', {
                    'event_category': 'Papers',
                    'event_label': paperTitle
                });
            }
        });
    });
    

    
    // Initialize new photo slideshow
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
        
        if (Math.abs(distance) > 50) { // Minimum swipe distance
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

// Apple-inspired publications scroller functionality
function initPublicationsScroller() {
    const container = document.querySelector('.publications-container');
    const cards = document.querySelectorAll('.publication-card');
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    const dots = document.querySelectorAll('.scroll-dot');
    
    if (!container || cards.length === 0) return;
    
    let currentIndex = 0;
    let cardWidth;
    const totalCards = cards.length;
    let visibleCards;
    let maxIndex = 0;
    let isAnimating = false;
    
    // Function to calculate visible cards based on screen width
    function calculateVisibleCards() {
        if (window.innerWidth > 1068) {
            visibleCards = 3;
        } else if (window.innerWidth > 734) {
            visibleCards = 2;
        } else {
            visibleCards = 1;
        }
        
        // Calculate the card width including margins
        const firstCard = cards[0];
        const cardStyle = window.getComputedStyle(firstCard);
        const cardMarginLeft = parseInt(cardStyle.marginLeft);
        const cardMarginRight = parseInt(cardStyle.marginRight);
        
        cardWidth = firstCard.offsetWidth + cardMarginLeft + cardMarginRight;
        
        // Calculate max index based on visible cards
        maxIndex = Math.max(0, totalCards - visibleCards);
        
        // Ensure current index is still valid
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
            updateScroller(false);
        }
    }
    
    // Update scroller position with smooth animation
    function updateScroller(animate = true) {
        if (animate) {
            isAnimating = true;
            setTimeout(() => { isAnimating = false; }, 600); // Slightly longer than the CSS transition
        }
        
        const translateX = -currentIndex * cardWidth;
        container.style.transform = `translateX(${translateX}px)`;
        
        // Update active dot with clean, minimal style
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        // Update button states
        if (scrollLeftBtn) scrollLeftBtn.style.opacity = currentIndex === 0 ? '0.4' : '0.8';
        if (scrollRightBtn) scrollRightBtn.style.opacity = currentIndex === maxIndex ? '0.4' : '0.8';
        
        // Add subtle fade-in animation to newly visible cards
        cards.forEach((card, index) => {
            if (index >= currentIndex && index < currentIndex + visibleCards) {
                card.classList.add('animated');
                card.style.animationDelay = `${(index - currentIndex) * 0.08}s`;
                
                setTimeout(() => {
                    card.classList.remove('animated');
                }, 500);
            }
        });
    }
    
    // Scroll left button event with Apple-like restraint
    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener('click', function() {
            if (currentIndex > 0 && !isAnimating) {
                currentIndex--;
                updateScroller();
            }
        });
    }
    
    // Scroll right button event with Apple-like restraint
    if (scrollRightBtn) {
        scrollRightBtn.addEventListener('click', function() {
            if (currentIndex < maxIndex && !isAnimating) {
                currentIndex++;
                updateScroller();
            }
        });
    }
    
    // Dot indicator events
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            if (!isAnimating) {
                const targetIndex = Math.min(index, maxIndex);
                if (targetIndex !== currentIndex) {
                    currentIndex = targetIndex;
                    updateScroller();
                }
            }
        });
    });
    
    // Mouse wheel event for natural scrolling
    container.addEventListener('wheel', function(event) {
        // Prevent default scroll behavior only when we handle the scroll
        if (!isAnimating) {
            if (event.deltaY > 0 && currentIndex < maxIndex) {
                event.preventDefault();
                currentIndex++;
                updateScroller();
            } else if (event.deltaY < 0 && currentIndex > 0) {
                event.preventDefault();
                currentIndex--;
                updateScroller();
            }
        }
    }, { passive: false });
    
    // Refined touch/swipe support for mobile with Apple-like physics
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;
    
    container.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartTime = Date.now();
    }, { passive: true });
    
    container.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        // Calculate swipe velocity for more natural feeling
        const distance = touchStartX - touchEndX;
        const velocity = Math.abs(distance) / touchDuration;
        
        handleSwipe(distance, velocity);
    }, { passive: true });
    
    function handleSwipe(distance, velocity) {
        if (isAnimating) return;
        
        // Adjust threshold based on velocity for more responsive swipes
        const baseThreshold = 30;
        const swipeThreshold = velocity > 0.5 ? baseThreshold : 50;
        
        if (distance > swipeThreshold && currentIndex < maxIndex) {
            // Swipe left -> go right
            currentIndex++;
            updateScroller();
        } else if (distance < -swipeThreshold && currentIndex > 0) {
            // Swipe right -> go left
            currentIndex--;
            updateScroller();
        }
    }
    
    // Show/hide arrows based on hover for a cleaner default state
    const publicationsSection = document.querySelector('.publications');
    
    if (publicationsSection) {
        publicationsSection.addEventListener('mouseenter', function() {
            if (maxIndex > 0) {
                if (scrollLeftBtn) scrollLeftBtn.style.opacity = currentIndex === 0 ? '0.4' : '0.8';
                if (scrollRightBtn) scrollRightBtn.style.opacity = currentIndex === maxIndex ? '0.4' : '0.8';
            }
        });
        
        publicationsSection.addEventListener('mouseleave', function() {
            if (!isTouch()) {
                if (scrollLeftBtn) scrollLeftBtn.style.opacity = '0';
                if (scrollRightBtn) scrollRightBtn.style.opacity = '0';
            }
        });
    }
    
    // Function to detect touch devices
    function isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // Auto-hide arrows after a period of inactivity
    let inactivityTimer;
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (!isTouch()) {
                if (scrollLeftBtn) scrollLeftBtn.style.opacity = '0';
                if (scrollRightBtn) scrollRightBtn.style.opacity = '0';
            }
        }, 2000);
    }
    
    // Reset timer on mouse movement within publications section
    if (publicationsSection) {
        publicationsSection.addEventListener('mousemove', resetInactivityTimer);
    }
    
    // Initial setup
    calculateVisibleCards();
    updateScroller(false);
    
    // Add elegant fade in for initial cards
    setTimeout(() => {
        for (let i = 0; i < Math.min(visibleCards, cards.length); i++) {
            cards[i].classList.add('animated');
            cards[i].style.animationDelay = `${i * 0.08}s`;
            
            setTimeout(() => {
                cards[i].classList.remove('animated');
            }, 500);
        }
    }, 300);
    
    // Handle window resize efficiently with debounce
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            calculateVisibleCards();
            updateScroller(false);
        }, 150);
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!isAnimating && publicationsSection && 
            publicationsSection.getBoundingClientRect().top < window.innerHeight && 
            publicationsSection.getBoundingClientRect().bottom > 0) {
            if (e.key === 'ArrowRight' && currentIndex < maxIndex) {
                currentIndex++;
                updateScroller();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                updateScroller();
            }
        }
    });
}

// Add CSS for the publication card animations
document.addEventListener('DOMContentLoaded', function() {
    // Create style element for animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .publication-card {
            transition: transform 0.3s cubic-bezier(0.28, 0.11, 0.32, 1), 
                        box-shadow 0.3s cubic-bezier(0.28, 0.11, 0.32, 1);
        }
        
        .publication-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
        
        .publications-container {
            transition: transform 0.5s cubic-bezier(0.28, 0.11, 0.32, 1);
        }
        
        @keyframes cardReveal {
            0% { 
                opacity: 0.6;
                transform: translateY(10px);
            }
            100% { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .publication-card.animated {
            animation: cardReveal 0.5s cubic-bezier(0.28, 0.11, 0.32, 1) forwards;
        }
        
        .scroll-arrow {
            appearance: none;
            background: none;
            border: none;
            color: #86868b;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 22px;
            transition: opacity 0.3s ease, color 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 15px;
            opacity: 0;
        }
        
        .scroll-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #d1d1d6;
            margin: 0 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .scroll-dot.active {
            background-color: #1d1d1f;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(styleSheet);
});

// Updated Publications JavaScript - for vertical layout
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS for publication cards
    initPublicationAnimations();
    
    // Optional: Paper download tracking (if you want to track downloads)
    const downloadButtons = document.querySelectorAll('.download-button');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paperTitle = this.closest('.publication-card').querySelector('h4').textContent;
            
            // If Google Analytics is available, track the download event
            if(typeof gtag === 'function') {
                gtag('event', 'download', {
                    'event_category': 'Papers',
                    'event_label': paperTitle
                });
            }
        });
    });
});

// Initialize animations for publication cards
function initPublicationAnimations() {
    const cards = document.querySelectorAll('.publication-card');
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Add animation class when card comes into view
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });
        
        // Observe each publication card
        cards.forEach(card => {
            observer.observe(card);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        cards.forEach(card => {
            card.classList.add('visible');
        });
    }
}

// Publications Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('publication-search');
    const filterSelect = document.getElementById('publication-filter');
    const loadMoreButton = document.getElementById('load-more');
    const shownCountElement = document.getElementById('shown-count');
    const totalCountElement = document.getElementById('total-count');
    const publicationCards = document.querySelectorAll('.publication-card');
    
    // Initial state
    let visibleCards = 3;
    const cardsPerLoad = 5;
    const totalCards = publicationCards.length;
    
    // Initialize counters
    totalCountElement.textContent = totalCards;
    shownCountElement.textContent = Math.min(visibleCards, totalCards);
    
    // Hide extra cards initially
    publicationCards.forEach((card, index) => {
        if (index >= visibleCards) {
            card.style.display = 'none';
        }
    });
    
    // Load more functionality
    loadMoreButton.addEventListener('click', function() {
        const hiddenCards = Array.from(publicationCards).filter(card => card.style.display === 'none' && !card.dataset.filtered);
        
        // Show more cards
        hiddenCards.slice(0, cardsPerLoad).forEach(card => {
            card.style.display = 'block';
            card.classList.add('animate-in');
            setTimeout(() => card.classList.remove('animate-in'), 500);
        });
        
        // Update visible count
        visibleCards = Array.from(publicationCards).filter(card => card.style.display !== 'none').length;
        shownCountElement.textContent = visibleCards;
        
        // Hide button if all cards are shown
        if (visibleCards >= totalCards || hiddenCards.length <= cardsPerLoad) {
            loadMoreButton.style.display = 'none';
        }
    });
    
    // Expand/collapse functionality
    document.querySelectorAll('.expand-button').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.publication-card');
            const expandedContent = card.querySelector('.paper-expanded');
            
            // Toggle expanded content
            if (expandedContent.classList.contains('active')) {
                expandedContent.classList.remove('active');
                this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            } else {
                expandedContent.classList.add('active');
                this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            }
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', debounce(function() {
        filterPublications();
    }, 300));
    
    // Filter by year functionality
    filterSelect.addEventListener('change', function() {
        filterPublications();
    });
    
    // Filter publications based on search and year selection
    function filterPublications() {
        const searchTerm = searchInput.value.toLowerCase();
        const yearFilter = filterSelect.value;
        let visibleCount = 0;
        
        publicationCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const abstract = card.querySelector('.paper-abstract').textContent.toLowerCase();
            const year = parseInt(card.dataset.year);
            
            // Check if card matches search criteria
            const matchesSearch = searchTerm === '' || 
                                 title.includes(searchTerm) || 
                                 abstract.includes(searchTerm);
            
            // Check if card matches year filter
            let matchesYear = true;
            if (yearFilter !== 'all') {
                const filterYear = parseInt(yearFilter);
                if (filterYear === 2020 && year < 2020) matchesYear = false;
                if (filterYear === 2010 && (year < 2010 || year >= 2020)) matchesYear = false;
                if (filterYear === 2000 && (year < 2000 || year >= 2010)) matchesYear = false;
                if (filterYear === 1990 && (year < 1990 || year >= 2000)) matchesYear = false;
            }
            
            // Show or hide card
            if (matchesSearch && matchesYear) {
                if (visibleCount < visibleCards) {
                    card.style.display = 'block';
                    card.dataset.filtered = false;
                } else {
                    card.style.display = 'none';
                    card.dataset.filtered = true;
                }
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.dataset.filtered = true;
            }
        });
        
        // Update counters and button visibility
        shownCountElement.textContent = Math.min(visibleCards, visibleCount);
        totalCountElement.textContent = visibleCount;
        
        if (visibleCount > visibleCards) {
            loadMoreButton.style.display = 'block';
        } else {
            loadMoreButton.style.display = 'none';
        }
    }
    
    // Debounce function for search
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
});

// Back to top button functionality
window.onscroll = () => {
    document.getElementById("backToTop").style.display = 
        window.scrollY > 400 ? "block" : "none";
};

document.getElementById("backToTop").onclick = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });
