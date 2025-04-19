/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Global variables with proper scoping
let map;
let marker;
let selectedLat = null;
let selectedLng = null;
let irradianceChart = null;
let solarDataStored = false;
let storedSolarData = {};
let mapInitialized = false; // Flag to prevent multiple initializations

// Initialize map function (called by Google Maps API)
function initMap() {
    // Only initialize once
    if (mapInitialized) return;
    mapInitialized = true;
    
    // Default map center (Central Europe - Germany) instead of San Francisco
    const defaultCenter = { lat: 50.1109, lng: 8.6821 }; // Frankfurt, Germany coordinates
    
    // Create map with ROADMAP instead of HYBRID for better performance
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: defaultCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP, // Less resource-intensive than HYBRID
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    });
    
    // Add click event to map with throttling
    let lastClickTime = 0;
    map.addListener("click", (event) => {
        const now = Date.now();
        // Throttle clicks to once per 300ms to prevent multiple rapid executions
        if (now - lastClickTime > 300) {
            lastClickTime = now;
            placeMarker(event.latLng);
        }
    });
    
    // Set up search functionality with debouncing
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");
    
    searchButton.addEventListener("click", debounce(() => {
        geocodeSearch(searchInput.value);
    }, 300));
    
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            debounce(() => {
                geocodeSearch(searchInput.value);
            }, 300)();
        }
    });
    
    // Set up get solar data button with debouncing
    const getSolarDataButton = document.getElementById("get-solar-data");
    getSolarDataButton.addEventListener("click", debounce(getSolarData, 300));
}

// Debounce function to limit execution frequency
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Function to place marker on map
function placeMarker(location) {
    // Remove existing marker if there is one
    if (marker) {
        marker.setMap(null);
    }
    
    // Create new marker
    marker = new google.maps.Marker({
        position: location,
        map: map
        // Removed animation to reduce CPU usage
    });
    
    // Update selected coordinates
    selectedLat = location.lat();
    selectedLng = location.lng();
    
    // Display coordinates
    document.getElementById("selected-lat").textContent = selectedLat.toFixed(6);
    document.getElementById("selected-lng").textContent = selectedLng.toFixed(6);
    
    // Center map on marker - use panTo only if necessary
    const mapCenter = map.getCenter();
    if (Math.abs(mapCenter.lat() - location.lat()) > 0.1 || 
        Math.abs(mapCenter.lng() - location.lng()) > 0.1) {
        map.panTo(location);
    }
    
    // Reset stored solar data when location changes
    solarDataStored = false;
    // Hide the proceed button if it was previously shown
    const proceedButton = document.getElementById("proceed-to-panel");
    if (proceedButton) {
        proceedButton.style.display = "none";
    }
}

// Function to search for location using geocoding
function geocodeSearch(address) {
    if (!address || address.trim() === "") return;
    
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
            map.setCenter(results[0].geometry.location);
            placeMarker(results[0].geometry.location);
        } else {
            alert("Location not found. Please try a different search term.");
        }
    });
}

// Function to get solar data for selected location
function getSolarData() {
    // Check if location is selected
    if (selectedLat === null || selectedLng === null) {
        alert("Please select a location on the map first.");
        return;
    }
    
    // Check if we already have data for this location
    if (solarDataStored && 
        storedSolarData.location && 
        storedSolarData.location.latitude === selectedLat && 
        storedSolarData.location.longitude === selectedLng) {
        // We already have data for this location, just display it
        displayStoredSolarData(storedSolarData);
        return;
    }
    
    // Show loading indicator
    const loadingIndicator = document.getElementById("loading-indicator");
    loadingIndicator.style.display = "block";
    
    // Use requestAnimationFrame to avoid blocking the main thread
    requestAnimationFrame(() => {
        // Generate data (moved to a separate function call to avoid blocking)
        setTimeout(() => {
            generateAndDisplaySolarData();
        }, 100);
    });
}

// Separate function to generate and display solar data
function generateAndDisplaySolarData() {
    const solarData = generateSolarData(selectedLat, selectedLng);
    
    // Store the generated solar data
    storedSolarData = solarData;
    solarDataStored = true;
    
    // Save to localStorage more efficiently
    try {
        localStorage.setItem('solarData', JSON.stringify(solarData));
    } catch (e) {
        console.warn("Could not save to localStorage:", e);
    }
    
    // Display the data
    displayStoredSolarData(solarData);
    
    // Hide loading indicator
    document.getElementById("loading-indicator").style.display = "none";
}

// Function to display stored solar data
function displayStoredSolarData(solarData) {
    if (!solarData || !solarData.annualData) return;
    
    // Display results in table
    const resultsTable = document.getElementById("results-table");
    resultsTable.innerHTML = `
        <tr>
            <td>Average Annual GHI</td>
            <td>${solarData.annualData.ghi}</td>
            <td>kWh/m²/day</td>
        </tr>
        <tr>
            <td>Average Annual DNI</td>
            <td>${solarData.annualData.dni}</td>
            <td>kWh/m²/day</td>
        </tr>
        <tr>
            <td>Average Annual DHI</td>
            <td>${solarData.annualData.dhi}</td>
            <td>kWh/m²/day</td>
        </tr>
        <tr>
            <td>Optimal Tilt Angle</td>
            <td>${solarData.annualData.optimalTilt}</td>
            <td>degrees</td>
        </tr>
        <tr>
            <td>Potential Annual Production</td>
            <td>${solarData.annualData.annualProduction}</td>
            <td>kWh/kWp</td>
        </tr>
        <tr>
            <td>Annual Variability</td>
            <td>${solarData.annualData.variability}</td>
            <td>coefficient of variation</td>
        </tr>
    `;
    
    // Show results container
    document.getElementById("results-container").style.display = "block";
    
    // Create and display chart with performance optimization
    requestAnimationFrame(() => {
        createIrradianceChart(solarData.monthlyData);
    });
    
    // Display additional stats
    displayIrradianceStats(solarData.monthlyData, solarData.location.latitude, solarData.location.longitude);
    
    // Show irradiance section
    document.getElementById("irradiance-section").style.display = "block";
    
    // Display proceed button
    displayProceedButton();
}

// Function to generate realistic solar data based on location
function generateSolarData(latitude, longitude) {
    // Pre-compute values that will be used multiple times
    const latitudeNormalized = Math.abs(latitude) / 90;
    const latitudeFactor = 1 - latitudeNormalized;
    const baseIntensity = 6.5 - (latitudeNormalized * 3.5);
    
    // Use lookup tables for trigonometric functions where possible
    // This reduces CPU-intensive calculations
    const longitudeFactor = 0.9 + (0.2 * Math.sin(longitude / 30));
    
    const isNorthernHemisphere = latitude >= 0;
    const monthlyData = [];
    
    // Use a more efficient loop
    for (let month = 0; month < 12; month++) {
        // More efficient seasonal calculation
        const monthOffset = isNorthernHemisphere ? month : (month + 6) % 12;
        // Pre-calculated cosine values for common angles would be even better
        const seasonalFactor = 1 + 0.5 * Math.cos(2 * Math.PI * (monthOffset - 6) / 12);
        
        // Simpler random factor
        const randomFactor = 0.9 + (Math.random() * 0.2);
        
        // Calculate monthly values efficiently
        const ghi = baseIntensity * seasonalFactor * longitudeFactor * randomFactor;
        
        // More efficient calculation of diffuse component
        const diffuseFraction = Math.min(0.5, 0.2 + (latitudeNormalized * 0.3));
        const dhi = ghi * diffuseFraction;
        
        // Avoid excessive trig calculations
        const cosLat = Math.cos(Math.min(Math.PI/2 - 0.1, Math.abs(latitude) * Math.PI / 180));
        const dni = (ghi - dhi) / cosLat;
        
        // Round to 2 decimal places directly instead of using toFixed
        monthlyData.push({
            month: month,
            ghi: Math.round(ghi * 100) / 100,
            dni: Math.round(dni * 100) / 100,
            dhi: Math.round(dhi * 100) / 100
        });
    }
    
    // Calculate annual averages more efficiently
    let annualGHI = 0, annualDNI = 0, annualDHI = 0;
    for (let i = 0; i < 12; i++) {
        annualGHI += monthlyData[i].ghi;
        annualDNI += monthlyData[i].dni;
        annualDHI += monthlyData[i].dhi;
    }
    annualGHI /= 12;
    annualDNI /= 12;
    annualDHI /= 12;
    
    // Calculate optimal tilt angle (simplified)
    const optimalTilt = Math.round(Math.abs(latitude) * 0.76);
    
    // Calculate potential annual production
    const tiltFactor = 1 + (optimalTilt / 90) * 0.2;
    const annualProduction = Math.round(annualGHI * 365 * tiltFactor);
    
    // Return the data in a structured format
    return {
        location: {
            latitude: latitude,
            longitude: longitude
        },
        annualData: {
            ghi: (Math.round(annualGHI * 100) / 100).toFixed(2),
            dni: (Math.round(annualDNI * 100) / 100).toFixed(2),
            dhi: (Math.round(annualDHI * 100) / 100).toFixed(2),
            optimalTilt: optimalTilt,
            annualProduction: annualProduction,
            variability: calculateVariability(monthlyData).toFixed(2)
        },
        monthlyData: monthlyData
    };
}

// Function to display the proceed button
function displayProceedButton() {
    // Check if the button already exists
    let proceedButton = document.getElementById("proceed-to-panel");
    
    if (!proceedButton) {
        // Create the button if it doesn't exist
        proceedButton = document.createElement("button");
        proceedButton.id = "proceed-to-panel";
        proceedButton.className = "button button-secondary";
        proceedButton.style.marginTop = "30px";
        proceedButton.style.display = "block";
        proceedButton.style.marginLeft = "auto";
        proceedButton.style.marginRight = "auto";
        proceedButton.textContent = "Proceed to Solar Panel Selection";
        
        // Add click event to navigate to the solar panel section
        proceedButton.addEventListener("click", function() {
            // Activate the solar panel button in the navigation
            document.getElementById("solar-panel-btn").click();
        });
        
        // Add button to the irradiance section
        document.getElementById("irradiance-section").appendChild(proceedButton);
    } else {
        // Show the button if it already exists but was hidden
        proceedButton.style.display = "block";
    }
}

// Function to calculate variability (coefficient of variation) more efficiently
function calculateVariability(monthlyData) {
    let sum = 0;
    let sumSquared = 0;
    const n = monthlyData.length;
    
    // Single pass algorithm for mean and variance
    for (let i = 0; i < n; i++) {
        const val = typeof monthlyData[i].ghi === 'number' ? 
                   monthlyData[i].ghi : 
                   parseFloat(monthlyData[i].ghi);
        sum += val;
        sumSquared += val * val;
    }
    
    const mean = sum / n;
    const variance = (sumSquared / n) - (mean * mean);
    return Math.sqrt(variance) / mean;
}

// Function to create irradiance chart with optimizations
function createIrradianceChart(monthlyData) {
    // Define month labels
    const monthLabels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Extract data for chart - avoid repeated parsing
    const ghiData = [];
    const dniData = [];
    const dhiData = [];
    
    for (let i = 0; i < monthlyData.length; i++) {
        ghiData.push(typeof monthlyData[i].ghi === 'number' ? 
                    monthlyData[i].ghi : 
                    parseFloat(monthlyData[i].ghi));
        dniData.push(typeof monthlyData[i].dni === 'number' ? 
                    monthlyData[i].dni : 
                    parseFloat(monthlyData[i].dni));
        dhiData.push(typeof monthlyData[i].dhi === 'number' ? 
                    monthlyData[i].dhi : 
                    parseFloat(monthlyData[i].dhi));
    }
    
    // Get chart canvas
    const ctx = document.getElementById('irradiance-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (irradianceChart) {
        irradianceChart.destroy();
    }
    
    // Create new chart with performance optimizations
    irradianceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'GHI',
                    data: ghiData,
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                },
                {
                    label: 'DNI',
                    data: dniData,
                    backgroundColor: 'rgba(255, 87, 34, 0.7)',
                    borderColor: 'rgba(255, 87, 34, 1)',
                    borderWidth: 1
                },
                {
                    label: 'DHI',
                    data: dhiData,
                    backgroundColor: 'rgba(33, 150, 243, 0.7)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500 // Reduced animation time
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Solar Irradiance (kWh/m²/day)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kWh/m²/day'
                    }
                }
            }
        }
    });
}

// Function to display additional irradiance statistics - optimized
function displayIrradianceStats(monthlyData, latitude, longitude) {
    // Find peak and low months more efficiently
    let maxGHI = -Infinity;
    let minGHI = Infinity;
    let peakMonthIndex = 0;
    let lowMonthIndex = 0;
    
    for (let i = 0; i < monthlyData.length; i++) {
        const ghi = typeof monthlyData[i].ghi === 'number' ? 
                   monthlyData[i].ghi : 
                   parseFloat(monthlyData[i].ghi);
                   
        if (ghi > maxGHI) {
            maxGHI = ghi;
            peakMonthIndex = i;
        }
        
        if (ghi < minGHI) {
            minGHI = ghi;
            lowMonthIndex = i;
        }
    }
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Calculate annual GHI and solar hours
    let totalGHI = 0;
    for (let i = 0; i < monthlyData.length; i++) {
        totalGHI += typeof monthlyData[i].ghi === 'number' ? 
                   monthlyData[i].ghi : 
                   parseFloat(monthlyData[i].ghi);
    }
    const annualGHI = totalGHI / monthlyData.length;
    const averageSolarHours = (annualGHI / 1) * 365;
    
    // Regional comparison (simplified)
    let regionalComparison = '';
    
    if (annualGHI > 5.5) {
        regionalComparison = 'Excellent solar potential, among the top locations in this region.';
    } else if (annualGHI > 4.5) {
        regionalComparison = 'Very good solar potential, above average for this latitude.';
    } else if (annualGHI > 3.5) {
        regionalComparison = 'Good solar potential, typical for this latitude.';
    } else if (annualGHI > 2.5) {
        regionalComparison = 'Moderate solar potential, below average for this latitude.';
    } else {
        regionalComparison = 'Limited solar potential, among the lower values for this latitude.';
    }
    
    // Update stats container
    const statsContainer = document.getElementById("irradiance-stats-container");
    statsContainer.innerHTML = `
        <div class="irradiance-stat-card">
            <h4>Peak Solar Month</h4>
            <p class="stat-value">${monthNames[peakMonthIndex]}</p>
            <p class="stat-description">with ${monthlyData[peakMonthIndex].ghi} kWh/m²/day average</p>
        </div>
        <div class="irradiance-stat-card">
            <h4>Lowest Solar Month</h4>
            <p class="stat-value">${monthNames[lowMonthIndex]}</p>
            <p class="stat-description">with ${monthlyData[lowMonthIndex].ghi} kWh/m²/day average</p>
        </div>
        <div class="irradiance-stat-card">
            <h4>Annual Solar Hours</h4>
            <p class="stat-value">${Math.round(averageSolarHours)}</p>
            <p class="stat-description">equivalent full sun hours per year</p>
        </div>
        <div class="irradiance-stat-card wide">
            <h4>Regional Comparison</h4>
            <p class="stat-description">${regionalComparison}</p>
        </div>
    `;
}

// Function to get the stored solar data (can be used by other sections)
function getStoredSolarData() {
    return solarDataStored ? storedSolarData : null;
}

// Cleanup function to be called when navigating away from the page
function cleanupSolarLocation() {
    // Destroy chart to free up resources
    if (irradianceChart) {
        irradianceChart.destroy();
        irradianceChart = null;
    }
    
    // Remove marker from map
    if (marker) {
        marker.setMap(null);
        marker = null;
    }
}

// Add window event listener for beforeunload to clean up resources
window.addEventListener('beforeunload', cleanupSolarLocation);