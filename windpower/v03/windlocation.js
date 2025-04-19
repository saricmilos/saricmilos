// Add this to the top of your wind.js file

// Handle navigation button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get navigation buttons
    const locationBtn = document.getElementById('location-btn');
    const turbineBtn = document.getElementById('turbine-btn');
    const economicBtn = document.getElementById('economic-btn');
    
    // Get content sections
    const locationContent = document.getElementById('location-content');
    const turbineContent = document.getElementById('turbine-content');
    const economicContent = document.getElementById('economic-content');
    
    // Function to show selected content with smooth transitions
    function showContent(contentElement) {
        // First fade out all visible sections
        const visibleContent = document.querySelector('.content-section[style*="display: block"]');
        
        if (visibleContent) {
            // Fade out currently visible content
            visibleContent.style.opacity = '0';
            visibleContent.style.transform = 'translateY(10px)';
            
            // After fade out animation completes
            setTimeout(() => {
                // Hide all content sections
                locationContent.style.display = 'none';
                turbineContent.style.display = 'none';
                economicContent.style.display = 'none';
                
                // Prepare new content for fade in
                contentElement.style.display = 'block';
                contentElement.style.opacity = '0';
                contentElement.style.transform = 'translateY(20px)';
                
                // Trigger browser reflow
                void contentElement.offsetWidth;
                
                // Fade in the new content
                setTimeout(() => {
                    contentElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    contentElement.style.opacity = '1';
                    contentElement.style.transform = 'translateY(0)';
                }, 50);
            }, 300);
        } else {
            // No visible content yet, just show the new content with animation
            locationContent.style.display = 'none';
            turbineContent.style.display = 'none';
            economicContent.style.display = 'none';
            
            contentElement.style.display = 'block';
            contentElement.style.opacity = '0';
            contentElement.style.transform = 'translateY(20px)';
            
            // Trigger fade in
            setTimeout(() => {
                contentElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                contentElement.style.opacity = '1';
                contentElement.style.transform = 'translateY(0)';
            }, 50);
        }
    }
    
    // Function to update active button state
    function setActiveButton(button) {
        // Remove active class from all buttons
        locationBtn.classList.remove('active');
        turbineBtn.classList.remove('active');
        economicBtn.classList.remove('active');
        
        // Add active class to selected button
        button.classList.add('active');
    }
    
    // Add click event listeners to buttons
    locationBtn.addEventListener('click', function() {
        setActiveButton(this);
        showContent(locationContent);
    });
    
    turbineBtn.addEventListener('click', function() {
        setActiveButton(this);
        showContent(turbineContent);
    });
    
    economicBtn.addEventListener('click', function() {
        setActiveButton(this);
        showContent(economicContent);
    });
    
    // Add button click animation
    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('button-ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple style
    if (!document.querySelector('style#button-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'button-ripple-style';
        style.innerHTML = `
            .nav-button {
                position: relative;
                overflow: hidden;
            }
            .button-ripple {
                position: absolute;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 50%;
                width: 100px;
                height: 100px;
                margin-top: -50px;
                margin-left: -50px;
                transform: scale(0);
                animation: button-ripple 0.6s linear;
                pointer-events: none;
            }
            @keyframes button-ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Default state on page load - show first section by default
    locationContent.style.display = 'block';
    turbineContent.style.display = 'none';
    economicContent.style.display = 'none';
});

// Rest of your existing wind.js code below...
// Variables to store map and selected coordinates
let map;
let marker;
let selectedLat;
let selectedLng;

// Initialize the map when the page loads
function initMap() {
    // Custom map style for a colorful, visually appealing look
    const mapStyles = [
        {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#444444"}]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#e8f4f8"}]  // Light blue for landscape
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{"visibility": "on"}, {"color": "#d4e9c8"}]  // Light green for points of interest
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{"saturation": 100}, {"lightness": 45}, {"color": "#ffffff"}]  // White roads
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{"visibility": "simplified"}, {"color": "#f7d663"}]  // Yellow highways
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"visibility": "on"}, {"color": "#d5d5d5"}]  // Transit visible in light gray
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#61dafb"}, {"visibility": "on"}]  // Bright blue water
        }
    ];

    // Create a new map centered on a default location (world center)
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    });
    
    // Create custom marker icon
    const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#FF3B30',  // Bright red marker
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 12  // Slightly bigger
    };
    
    // Add click event to the map
    map.addListener('click', function(event) {
        placeMarker(event.latLng);
        
        // Add smooth animation to center on clicked location
        smoothPan(event.latLng);
    });
    
    // Initialize the search box
    const input = document.getElementById('search-input');
    const searchBox = new google.maps.places.SearchBox(input);
    
    // Listen for the search event
    searchBox.addListener('places_changed', function() {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;
        
        // Get the first place result
        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;
        
        // Center the map on the found place with smooth animation
        smoothPan(place.geometry.location);
        map.setZoom(10);
        
        // Place a marker at the found place
        placeMarker(place.geometry.location);
    });
    
    // Handle search button click
    document.getElementById('search-button').addEventListener('click', function() {
        const input = document.getElementById('search-input').value;
        if (input.trim() === '') return;
        
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: input }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                smoothPan(results[0].geometry.location);
                map.setZoom(10);
                placeMarker(results[0].geometry.location);
            }
        });
    });
    
    // Handle get wind data button click with a nice ripple effect
    const windDataBtn = document.getElementById('get-wind-data');
    windDataBtn.addEventListener('click', function(e) {
        // Add ripple effect
        createRipple(e, this);
        getWindData();
    });
    
    // Create ripple effect for search button too
    const searchBtn = document.getElementById('search-button');
    searchBtn.addEventListener('click', function(e) {
        createRipple(e, this);
    });
    
    // Listen for enter key in search input
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('search-button').click();
        }
    });
    
    // Update copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Function for smooth pan animation
    function smoothPan(location) {
        map.panTo(location);
    }
    
    // Function to create ripple effect on buttons
    function createRipple(event, button) {
        const ripple = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
        ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
        ripple.classList.add('ripple');
        
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        button.appendChild(ripple);
        
        // Remove the ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add ripple style to document if not present
    if (!document.querySelector('style#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.innerHTML = `
            .button {
                position: relative;
                overflow: hidden;
            }
            .ripple {
                position: absolute;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Function to place a marker on the map
function placeMarker(location) {
    // Remove any existing marker
    if (marker) {
        marker.setMap(null);
    }
    
    // Custom marker icon
    const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#FF3B30',  // Bright red marker
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 12  // Slightly bigger
    };
    
    // Create a new marker
    marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: markerIcon,
        animation: google.maps.Animation.DROP
    });
    
    // Add pulse effect around marker
    addPulseEffect(location);
    
    // Add highlighted area around selected location
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
        strokeColor: '#FF9500',  // Orange border
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#FFD60A',  // Yellow fill
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
    // Create the pulse circle
    const pulseCircle = new google.maps.Circle({
        strokeColor: '#FF3B30',  // Match marker color
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF3B30',
        fillOpacity: 0.3,
        map: map,
        center: location,
        radius: 50000,
        clickable: false
    });
    
    // Animate the pulse
    let opacity = 0.3;  // Start more visible
    let radius = 30000;  // Start smaller
    const pulseAnimation = setInterval(() => {
        opacity -= 0.01;
        radius += 8000;  // Grow faster
        
        if (opacity <= 0) {
            clearInterval(pulseAnimation);
            pulseCircle.setMap(null);
            return;
        }
        
        pulseCircle.setOptions({
            fillOpacity: opacity,
            radius: radius
        });
    }, 40);  // Slightly faster animation
}

// Function to animate number updates
function animateNumberUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    const oldValue = parseFloat(element.textContent) || 0;
    const duration = 500; // ms
    const steps = 20;
    const stepValue = (newValue - oldValue) / steps;
    let currentStep = 0;
    
    const updateInterval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
            clearInterval(updateInterval);
            element.textContent = newValue;
        } else {
            const intermediateValue = oldValue + (stepValue * currentStep);
            element.textContent = intermediateValue.toFixed(6);
        }
    }, duration / steps);
}

// Function to get wind data from Global Wind Atlas API
function getWindData() {
    if (!selectedLat || !selectedLng) {
        // Create a more elegant notification
        showNotification('Please select a location on the map first.', 'warning');
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('results-container').style.display = 'none';
    
    // In a real implementation, you would make an API call to the Global Wind Atlas API
    // Since direct API access to Global Wind Atlas might require an API key or have restrictions,
    // this example uses a simulated API response for demonstration purposes
    
    // Simulating an API call with setTimeout
    setTimeout(function() {
        // This is where you would make the actual API call to Global Wind Atlas
        // For example:
        // fetch(`https://globalwindatlas.info/api/gwa/custom/point?lat=${selectedLat}&lng=${selectedLng}`)
        //     .then(response => response.json())
        //     .then(data => displayWindData(data))
        //     .catch(error => {
        //         console.error('Error fetching wind data:', error);
        //         showNotification('Failed to fetch wind data. Please try again.', 'error');
        //         document.getElementById('loading-indicator').style.display = 'none';
        //     });
        
        // For demonstration, generate some simulated wind data based on location
        const simulatedData = simulateWindData(selectedLat, selectedLng);
        displayWindData(simulatedData);
        
    }, 1500); // Simulate a delay for the API call
}

// Function to display notification
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add notification to the page
    document.body.appendChild(notification);
    
    // Add notification style if not present
    if (!document.querySelector('style#notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.innerHTML = `
            .notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                font-family: 'SF Pro Display', sans-serif;
                font-size: 15px;
                font-weight: 400;
                animation: notificationSlideIn 0.3s forwards, notificationFadeOut 0.3s 2.7s forwards;
                max-width: 90%;
            }
            .notification-info {
                background-color: #007AFF;
                color: white;
            }
            .notification-warning {
                background-color: #FF9500;
                color: white;
            }
            .notification-error {
                background-color: #FF3B30;
                color: white;
            }
            @keyframes notificationSlideIn {
                from { transform: translate(-50%, -20px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes notificationFadeOut {
                from { opacity: 1; }
                to { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to simulate wind data (for demonstration purposes)
function simulateWindData(lat, lng) {
    // Generate realistic-looking wind data based on latitude and longitude
    // This is just for demonstration - real data would come from the Global Wind Atlas API
    
    // Use latitude to influence wind speed (generally higher winds at higher latitudes)
    const latFactor = Math.abs(lat) / 90;
    
    // Calculate base wind speed (between 2 and 15 m/s)
    const baseWindSpeed = 2 + (latFactor * 13);
    
    // Add some randomness
    const windSpeed = baseWindSpeed * (0.8 + Math.random() * 0.4);
    
    // Calculate power density using a simplified formula P = 0.5 * ρ * v³
    // where ρ is air density (approx 1.225 kg/m³) and v is wind speed
    const powerDensity = 0.5 * 1.225 * Math.pow(windSpeed, 3);
    
    // Generate direction based on longitude (just for simulation)
    const direction = (((lng + 180) / 360) * 360) % 360;
    
    return {
        meanWindSpeed: windSpeed.toFixed(2),
        powerDensity: powerDensity.toFixed(2),
        windDirection: direction.toFixed(1),
        weibullA: (windSpeed / 1.1).toFixed(2),
        weibullK: (1.8 + Math.random() * 0.6).toFixed(2),
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        elevation: Math.floor(100 + Math.random() * 900),
        roughnessLength: (0.03 + Math.random() * 0.5).toFixed(3),
        meanAirDensity: (1.225 - (lat / 180) * 0.2).toFixed(3)
    };
}

// Function to display wind data in the results table
function displayWindData(data) {
    // Hide loading indicator
    document.getElementById('loading-indicator').style.display = 'none';
    
    // Clear the previous results
    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = '';
    
    // Add rows for each parameter
    addResultRow('Mean Wind Speed', data.meanWindSpeed, 'm/s');
    addResultRow('Power Density', data.powerDensity, 'W/m²');
    addResultRow('Wind Direction', data.windDirection, 'degrees');
    addResultRow('Weibull A parameter', data.weibullA, 'm/s');
    addResultRow('Weibull k parameter', data.weibullK, '');
    addResultRow('Elevation', data.elevation, 'm');
    addResultRow('Roughness Length', data.roughnessLength, 'm');
    addResultRow('Mean Air Density', data.meanAirDensity, 'kg/m³');
    
    // Show the results container with subtle animation
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.style.display = 'block';
    resultsContainer.style.opacity = '0';
    resultsContainer.style.transform = 'translateY(20px)';
    
    // Trigger animation
    setTimeout(() => {
        resultsContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        resultsContainer.style.opacity = '1';
        resultsContainer.style.transform = 'translateY(0)';
    }, 10);
    
    // Scroll to results container smoothly
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
}

// Helper function to add a row to the results table
function addResultRow(parameter, value, unit) {
    const resultsTable = document.getElementById('results-table');
    const row = document.createElement('tr');
    
    const paramCell = document.createElement('td');
    paramCell.textContent = parameter;
    
    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    valueCell.style.fontWeight = '500';
    
    const unitCell = document.createElement('td');
    unitCell.textContent = unit;
    unitCell.style.color = '#666';
    
    row.appendChild(paramCell);
    row.appendChild(valueCell);
    row.appendChild(unitCell);
    
    // Add animation delay for staggered appearance
    const rowIndex = resultsTable.children.length;
    row.style.opacity = '0';
    row.style.transform = 'translateY(10px)';
    row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    row.style.transitionDelay = `${rowIndex * 0.05}s`;
    
    resultsTable.appendChild(row);
    
    // Trigger animation
    setTimeout(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    }, 10);
}

// Handle mobile menu toggle (from main site)
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
});

// Global variable to store wind data
let globalWindData = null;

// Function to display wind data in the results table
function displayWindData(data) {
    // Store data globally
    globalWindData = data;
    
    // Hide loading indicator
    document.getElementById('loading-indicator').style.display = 'none';
    
    // Clear the previous results
    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = '';
    
    // Add rows for each parameter
    addResultRow('Mean Wind Speed', data.meanWindSpeed, 'm/s');
    addResultRow('Power Density', data.powerDensity, 'W/m²');
    addResultRow('Wind Direction', data.windDirection, 'degrees');
    addResultRow('Weibull A parameter', data.weibullA, 'm/s');
    addResultRow('Weibull k parameter', data.weibullK, '');
    addResultRow('Elevation', data.elevation, 'm');
    addResultRow('Roughness Length', data.roughnessLength, 'm');
    addResultRow('Mean Air Density', data.meanAirDensity, 'kg/m³');
    
    // Show the results container with subtle animation
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.style.display = 'block';
    resultsContainer.style.opacity = '0';
    resultsContainer.style.transform = 'translateY(20px)';
    
    // Trigger animation
    setTimeout(() => {
        resultsContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        resultsContainer.style.opacity = '1';
        resultsContainer.style.transform = 'translateY(0)';
    }, 10);
    
    // Generate and display Weibull distribution
    generateWeibullDistribution(data);
    
    // Add the "proceed to turbine selection" button
    addProceedButton();
    
    // Scroll to results container smoothly
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
}


// Function to generate and display Weibull distribution
function generateWeibullDistribution(data) {
    // Show the Weibull section
    const weibullSection = document.getElementById('weibull-section');
    weibullSection.style.display = 'block';
    
    // Extract Weibull parameters
    const a = parseFloat(data.weibullA); // Scale parameter (m/s)
    const k = parseFloat(data.weibullK); // Shape parameter
    
    // Generate wind speed range (0-30 m/s with 0.5 m/s increments)
    const windSpeeds = Array.from({length: 61}, (_, i) => i * 0.5);
    
    // Calculate Weibull PDF values
    const weibullPdfValues = windSpeeds.map(v => weibullPdf(v, a, k));
    
    // Calculate frequency (hours per year)
    const hoursPerYear = windSpeeds.map(v => weibullPdf(v, a, k) * 8760);
    
    // Generate datasets for chart
    const chartData = {
        labels: windSpeeds,
        datasets: [
            {
                label: 'Probability Density',
                data: weibullPdfValues,
                borderColor: '#007AFF',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                yAxisID: 'y',
            },
            {
                label: 'Hours per Year',
                data: hoursPerYear,
                borderColor: '#FF9500',
                backgroundColor: 'rgba(255, 149, 0, 0.0)',
                borderWidth: 2,
                pointRadius: 0,
                yAxisID: 'y1',
            }
        ]
    };
    
    // Create chart
    const ctx = document.getElementById('weibull-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.weibullChart) {
        window.weibullChart.destroy();
    }
    
    // Create new chart
    window.weibullChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += context.parsed.y.toFixed(4);
                            } else {
                                label += Math.round(context.parsed.y) + ' hours';
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'SF Pro Display'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Wind Speed Distribution',
                    font: {
                        family: 'SF Pro Display',
                        size: 16,
                        weight: '500'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Wind Speed (m/s)',
                        font: {
                            family: 'SF Pro Display'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'SF Pro Display'
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Probability Density',
                        font: {
                            family: 'SF Pro Display'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'SF Pro Display'
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Hours per Year',
                        font: {
                            family: 'SF Pro Display'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'SF Pro Display'
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
    
    // Generate Weibull statistics
    generateWeibullStatistics(data, windSpeeds, weibullPdfValues, hoursPerYear);
}

// Weibull probability density function
function weibullPdf(v, a, k) {
    // v: wind speed
    // a: scale parameter
    // k: shape parameter
    if (v < 0) return 0;
    return (k / a) * Math.pow(v / a, k - 1) * Math.exp(-Math.pow(v / a, k));
}

// Weibull cumulative distribution function
function weibullCdf(v, a, k) {
    if (v < 0) return 0;
    return 1 - Math.exp(-Math.pow(v / a, k));
}

// Function to generate Weibull statistics
function generateWeibullStatistics(data, windSpeeds, pdfValues, hoursPerYear) {
    const a = parseFloat(data.weibullA);
    const k = parseFloat(data.weibullK);
    const statsContainer = document.getElementById('weibull-stats-container');
    
    // Calculate some key statistics
    const mostProbableSpeed = a * Math.pow((k - 1) / k, 1 / k).toFixed(2);
    
    // Find the most frequent wind speed (highest PDF)
    const maxPdfIndex = pdfValues.indexOf(Math.max(...pdfValues));
    const mostFrequentSpeed = windSpeeds[maxPdfIndex];
    
    // Calculate percentage of time wind speed is between certain ranges
    const belowCutIn = weibullCdf(3.5, a, k) * 100; // Below typical cut-in speed
    const operatingRange = (weibullCdf(25, a, k) - weibullCdf(3.5, a, k)) * 100; // Between cut-in and cut-out
    const aboveCutOut = (1 - weibullCdf(25, a, k)) * 100; // Above typical cut-out speed
    
    // Annual energy production estimation (simplified, just for demonstration)
    // Assuming a 2MW turbine with a simple power curve
    const aepEstimate = calculateSimpleAEP(windSpeeds, hoursPerYear);
    
    // Create summary cards
    statsContainer.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <h3>Most Probable Wind Speed</h3>
                <div class="value">${mostProbableSpeed.toFixed(1)} m/s</div>
                <p>The most commonly occurring wind speed at this location</p>
            </div>
            <div class="summary-card">
                <h3>Wind Speed Range Distribution</h3>
                <div class="value">${operatingRange.toFixed(1)}%</div>
                <p>Percentage of time wind speed is in turbine operating range (3.5-25 m/s)</p>
            </div>
            <div class="summary-card">
                <h3>Estimated Annual Production</h3>
                <div class="value">${(aepEstimate / 1000).toFixed(1)} GWh</div>
                <p>Estimated annual energy production for a 2MW turbine</p>
            </div>
        </div>
        <h3 style="margin-top: 20px; margin-bottom: 15px; font-weight: 500; color: #333;">Detailed Statistics</h3>
        <table class="weibull-stats-table">
            <tr>
                <th>Wind Speed (m/s)</th>
                <th>Probability (%)</th>
                <th>Hours per Year</th>
                <th>Days per Year</th>
            </tr>
            ${generateDetailedStatsRows(windSpeeds, pdfValues, hoursPerYear)}
        </table>
    `;
    
    // Add animation to cards
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 10);
    });
}

// Function to calculate a simple AEP estimate
function calculateSimpleAEP(windSpeeds, hoursPerYear) {
    // A very simplified power curve for a generic 2MW turbine
    // This is just for demonstration - real calculations would use actual power curves
    const calculatePower = (speed) => {
        if (speed < 3.5) return 0; // Below cut-in
        if (speed > 25) return 0;  // Above cut-out
        if (speed >= 13) return 2000; // Rated power
        // Ramp up between cut-in and rated speed (simplified cubic relationship)
        return 2000 * Math.pow((speed - 3.5) / (13 - 3.5), 3);
    };
    
    // Calculate energy for each wind speed bin
    let totalEnergy = 0;
    for (let i = 0; i < windSpeeds.length; i++) {
        const power = calculatePower(windSpeeds[i]); // in kW
        const energy = power * hoursPerYear[i]; // in kWh
        totalEnergy += energy;
    }
    
    return totalEnergy;
}

// Function to generate detailed statistics rows
function generateDetailedStatsRows(windSpeeds, pdfValues, hoursPerYear) {
    // Generate rows for selected wind speeds
    const selectedSpeeds = [0, 3, 5, 7, 10, 12, 15, 20, 25];
    
    return selectedSpeeds.map(targetSpeed => {
        // Find the closest index
        const index = windSpeeds.findIndex(speed => speed >= targetSpeed);
        if (index === -1) return '';
        
        const probability = pdfValues[index] * 100;
        const hours = hoursPerYear[index];
        const days = hours / 24;
        
        return `
            <tr>
                <td>${windSpeeds[index]} m/s</td>
                <td>${probability.toFixed(2)}%</td>
                <td>${Math.round(hours)}</td>
                <td>${Math.round(days)}</td>
            </tr>
        `;
    }).join('');
}

// Function to add the "proceed to turbine selection" button
function addProceedButton() {
    // Check if button already exists and remove it
    const existingButton = document.getElementById('proceed-to-turbine-btn');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Create the button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'proceed-button-container';
    buttonContainer.style.marginTop = '30px';
    buttonContainer.style.textAlign = 'center';
    
    // Create the button
    const proceedButton = document.createElement('button');
    proceedButton.id = 'proceed-to-turbine-btn';
    proceedButton.className = 'button button-primary';
    proceedButton.innerHTML = '<span class="button-icon">→</span> Select Location and Proceed to Wind Turbine Selection';
    proceedButton.style.fontSize = '16px';
    proceedButton.style.padding = '12px 24px';
    proceedButton.style.backgroundColor = '#007AFF';
    proceedButton.style.color = 'white';
    proceedButton.style.border = 'none';
    proceedButton.style.borderRadius = '8px';
    proceedButton.style.cursor = 'pointer';
    proceedButton.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.2)';
    proceedButton.style.transition = 'all 0.3s ease';
    proceedButton.style.display = 'inline-flex';
    proceedButton.style.alignItems = 'center';
    proceedButton.style.justifyContent = 'center';
    proceedButton.style.fontWeight = '500';
    
    // Add hover effect
    proceedButton.onmouseover = function() {
        this.style.backgroundColor = '#0062CC';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(0, 122, 255, 0.3)';
    };
    
    proceedButton.onmouseout = function() {
        this.style.backgroundColor = '#007AFF';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.2)';
    };
    
    // Add click event to proceed to turbine section
    proceedButton.addEventListener('click', function(e) {
        // Add ripple effect
        createRipple(e, this);
        
        // Switch to turbine selection tab
        proceedToTurbineSelection();
    });
    
    // Append button to container
    buttonContainer.appendChild(proceedButton);
    
    // Add button to the weibull section
    const weibullSection = document.getElementById('weibull-section');
    weibullSection.appendChild(buttonContainer);
    
    // Animate button appearance
    proceedButton.style.opacity = '0';
    proceedButton.style.transform = 'translateY(20px)';
    proceedButton.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        proceedButton.style.opacity = '1';
        proceedButton.style.transform = 'translateY(0)';
    }, 800); // Delayed appearance for better UX
}

// Function to create ripple effect (reusing your existing function)
function createRipple(event, button) {
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
    ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
    ripple.classList.add('ripple');
    
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }
    
    button.appendChild(ripple);
    
    // Remove the ripple after animation completes
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Function to proceed to turbine selection
function proceedToTurbineSelection() {
    // Show notification
    showNotification('Wind data saved! Proceeding to turbine selection...', 'info');
    
    // Get turbine selection button and click it programmatically
    const turbineBtn = document.getElementById('turbine-btn');
    turbineBtn.click();
    
    // You can now add code to use the globalWindData in the turbine selection section
    console.log('Wind data stored:', globalWindData);
    
    // Optional: Add code to transfer wind data parameters to the turbine section
    // This will depend on how you want to use the data in the turbine selection
    // For example, you might want to highlight turbines that are optimal for the wind speed
}
