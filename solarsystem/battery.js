/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Battery Selection Functionality
document.addEventListener("DOMContentLoaded", function() {
    // Get DOM elements
    const manufacturerButtons = document.querySelectorAll('.manufacturer-btn[data-manufacturer]');
    const batteryModelsContainer = document.getElementById('battery-models-container');
    const batteryModelsList = document.getElementById('battery-models-list');
    const selectedManufacturerTitle = document.getElementById('selected-battery-manufacturer-title');
    const batteryDetailContainer = document.getElementById('battery-detail-container');
    const batteryDetailTitle = document.getElementById('battery-detail-title');
    const backToBatteriesBtn = document.getElementById('back-to-batteries');
    const batterySpecsTable = document.getElementById('battery-specs-table');
    
    // Global variables
    let selectedBattery = null; // Will store the currently selected battery
    let batteryDataStored = false; // Flag to track if battery data has been stored
    
    // Battery data by manufacturer
    const batteryData = {
        "tesla": [
            {
                id: "tesla-powerwall-2",
                name: "Powerwall 2",
                image: "/images/Battery/powerwall2.PNG",
                capacity: 13.5,
                power: 7,
                voltage: 400,
                chemistry: "Lithium-ion",
                warranty: 10,
                dimensions: "1150mm × 755mm × 155mm",
                price: 7125,
                weight: 114,
                specs: {
                    "Energy Capacity": "13.5 kWh",
                    "Power (Continuous)": "7 kW",
                    "Power (Peak)": "10 kW",
                    "AC Voltage": "230V / 400V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": "90%",
                    "Operating Temperature": "-20°C to 50°C",
                    "Chemistry": "Lithium-ion NMC",
                    "Depth of Discharge": "100%",
                    "Mounting": "Floor or Wall Mount",
                    "Dimensions": "1150mm × 755mm × 155mm",
                    "Weight": "114 kg",
                    "IP Rating": "IP67",
                    "Warranty": "10 years",
                    "Communication": "Wi-Fi, Ethernet, Cellular",
                    "Price": "$7125"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
                    capacity: [100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80]
                }
            },
            {
                id: "tesla-powerwall-plus",
                name: "Powerwall+",
                image: "/images/Battery/powerwallplus.png",
                capacity: 13.5,
                power: 9.6,
                voltage: 400,
                chemistry: "Lithium-ion",
                warranty: 10,
                dimensions: "1150mm × 755mm × 155mm",
                price: 8131,
                weight: 120,
                specs: {
                    "Energy Capacity": "13.5 kWh",
                    "Power (Continuous)": "9.6 kW solar and battery / 7.6 kW battery-only",
                    "Power (Peak)": "12 kW",
                    "AC Voltage": "230V / 400V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": "92%",
                    "Operating Temperature": "-20°C to 50°C",
                    "Chemistry": "Lithium-ion NMC",
                    "Depth of Discharge": "100%",
                    "Mounting": "Floor or Wall Mount",
                    "Dimensions": "1150mm × 755mm × 155mm (battery unit)",
                    "Weight": "120 kg",
                    "IP Rating": "IP67",
                    "Warranty": "10 years",
                    "Communication": "Wi-Fi, Ethernet, Cellular",
                    "Integrated Inverter": "Yes",
                    "Price": "$8131"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
                    capacity: [100, 98.5, 97, 95, 93, 91, 89, 87, 85, 83, 81]
                }
            }
        ],
        "lg-chem": [
            {
                id: "lg-resu16h-prime",
                name: "RESU16H Prime",
                image: "/images/Battery/resu16h.jpg",
                capacity: 16,
                power: 7,
                voltage: 400,
                chemistry: "Lithium-ion",
                warranty: 10,
                dimensions: "744mm × 907mm × 206mm",
                price: 7456,
                weight: 118,
                specs: {
                    "Energy Capacity": "16 kWh",
                    "Power (Continuous)": "7 kW",
                    "Power (Peak)": "11 kW for 3 seconds",
                    "AC Voltage": "400V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": ">90%",
                    "Operating Temperature": "-10°C to 45°C",
                    "Chemistry": "Lithium-ion NMC",
                    "Depth of Discharge": "95%",
                    "Mounting": "Wall Mount",
                    "Dimensions": "744mm × 907mm × 206mm",
                    "Weight": "118 kg",
                    "IP Rating": "IP55",
                    "Warranty": "10 years or 60% capacity retention",
                    "Communication": "CAN, RS485",
                    "Price": "$7456"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000],
                    capacity: [100, 94, 88, 82, 76, 70, 64, 60]
                }
            },
            {
                id: "lg-resu10h",
                name: "RESU10H",
                image: "/images/Battery/resu10h.jpeg",
                capacity: 9.8,
                power: 5,
                voltage: 400,
                chemistry: "Lithium-ion",
                warranty: 10,
                dimensions: "483mm × 452mm × 227mm",
                price: 5423,
                weight: 75,
                specs: {
                    "Energy Capacity": "9.8 kWh",
                    "Power (Continuous)": "5 kW",
                    "Power (Peak)": "7 kW for 3 seconds",
                    "AC Voltage": "400V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": ">95%",
                    "Operating Temperature": "-10°C to 45°C",
                    "Chemistry": "Lithium-ion NMC",
                    "Depth of Discharge": "95%",
                    "Mounting": "Wall Mount",
                    "Dimensions": "483mm × 452mm × 227mm",
                    "Weight": "75 kg",
                    "IP Rating": "IP55",
                    "Warranty": "10 years or 60% capacity retention",
                    "Communication": "CAN, RS485",
                    "Price": "$5423"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000],
                    capacity: [100, 93, 86, 80, 74, 68, 63, 60]
                }
            }
        ],
        "sonnen": [
            {
                id: "sonnen-eco-10",
                name: "Eco 10",
                image: "/images/Battery/eco10.jpg",
                capacity: 10,
                power: 8,
                voltage: 230,
                chemistry: "LFP",
                warranty: 10,
                dimensions: "1400mm × 660mm × 230mm",
                price: 6243,
                weight: 185,
                specs: {
                    "Energy Capacity": "10 kWh (expandable to 20 kWh)",
                    "Power (Continuous)": "8 kW",
                    "Power (Peak)": "8.5 kW",
                    "AC Voltage": "230V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": ">85%",
                    "Operating Temperature": "5°C to 45°C",
                    "Chemistry": "Lithium Iron Phosphate (LFP)",
                    "Depth of Discharge": "100%",
                    "Mounting": "Floor Standing",
                    "Dimensions": "1400mm × 660mm × 230mm",
                    "Weight": "185 kg",
                    "IP Rating": "IP21",
                    "Warranty": "10 years or 10,000 cycles",
                    "Communication": "Ethernet, RS485",
                    "Integrated Inverter": "Yes",
                    "Price": "$6243"
                },
                cycleCurve: {
                    cycles: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000],
                    capacity: [100, 96, 92, 88, 84, 80, 76, 73]
                }
            },
            {
                id: "sonnen-evolution",
                name: "Evolution 15",
                image: "/images/Battery/evolution15.PNG",
                capacity: 15,
                power: 8,
                voltage: 230,
                chemistry: "LFP",
                warranty: 15,
                dimensions: "1300mm × 650mm × 220mm",
                price: 8362,
                weight: 178,
                specs: {
                    "Energy Capacity": "15 kWh",
                    "Power (Continuous)": "8 kW",
                    "Power (Peak)": "8.5 kW",
                    "AC Voltage": "230V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": ">86%",
                    "Operating Temperature": "5°C to 45°C",
                    "Chemistry": "Lithium Iron Phosphate (LFP)",
                    "Depth of Discharge": "100%",
                    "Mounting": "Floor Standing",
                    "Dimensions": "1300mm × 650mm × 220mm",
                    "Weight": "178 kg",
                    "IP Rating": "IP21",
                    "Warranty": "15 years or 15,000 cycles",
                    "Communication": "Ethernet, Wi-Fi",
                    "Integrated Inverter": "Yes",
                    "Price": "$8,362"
                },
                cycleCurve: {
                    cycles: [0, 3000, 6000, 9000, 12000, 15000, 18000],
                    capacity: [100, 95, 90, 85, 80, 75, 70]
                }
            }
        ],
        "enphase": [
            {
                id: "enphase-encharge-10",
                name: "Encharge 10",
                image: "/images/Battery/encharge10.jpg",
                capacity: 10.5,
                power: 3.84,
                voltage: 230,
                chemistry: "LFP",
                warranty: 10,
                dimensions: "1060mm × 876mm × 238mm",
                price: 8290,
                weight: 121,
                specs: {
                    "Energy Capacity": "10.5 kWh",
                    "Power (Continuous)": "3.84 kW",
                    "Power (Peak)": "5.7 kW for 10 seconds",
                    "AC Voltage": "230V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": "96%",
                    "Operating Temperature": "-15°C to 55°C",
                    "Chemistry": "Lithium Iron Phosphate (LFP)",
                    "Depth of Discharge": "100%",
                    "Mounting": "Wall Mount",
                    "Dimensions": "1060mm × 876mm × 238mm",
                    "Weight": "121 kg",
                    "IP Rating": "IP55",
                    "Warranty": "10 years or 4,000 cycles",
                    "Communication": "Wi-Fi, Cellular",
                    "Integrated Microinverters": "Yes, 4 IQ8 microinverters",
                    "Price": "$8,290"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000],
                    capacity: [100, 95, 90, 85, 80, 75, 70]
                }
            },
            {
                id: "enphase-encharge-3",
                name: "Encharge 3",
                image: "/images/Battery/encharge3.jpeg",
                capacity: 3.5,
                power: 1.28,
                voltage: 230,
                chemistry: "LFP",
                warranty: 10,
                dimensions: "660mm × 357mm × 223mm",
                price: 6723,
                weight: 48.5,
                specs: {
                    "Energy Capacity": "3.5 kWh",
                    "Power (Continuous)": "1.28 kW",
                    "Power (Peak)": "1.92 kW for 10 seconds",
                    "AC Voltage": "230V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": "96%",
                    "Operating Temperature": "-15°C to 55°C",
                    "Chemistry": "Lithium Iron Phosphate (LFP)",
                    "Depth of Discharge": "100%",
                    "Mounting": "Wall Mount",
                    "Dimensions": "660mm × 357mm × 223mm",
                    "Weight": "48.5 kg",
                    "IP Rating": "IP55",
                    "Warranty": "10 years or 4,000 cycles",
                    "Communication": "Wi-Fi, Cellular",
                    "Integrated Microinverters": "Yes, 1 IQ8 microinverter",
                    "Price": "$6723"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000],
                    capacity: [100, 95, 90, 85, 80, 75, 70]
                }
            }
        ],
        "generac": [
            {
                id: "generac-pwrcell-9",
                name: "PWRcell 9",
                image: "/images/Battery/pwrcell9.jpg",
                capacity: 9,
                power: 4.5,
                voltage: 400,
                chemistry: "Lithium-ion",
                warranty: 10,
                dimensions: "650mm × 1310mm × 220mm",
                price: 7234,
                weight: 99.8,
                specs: {
                    "Energy Capacity": "9 kWh (expandable to 36 kWh)",
                    "Power (Continuous)": "4.5 kW per battery module",
                    "Power (Peak)": "6.7 kW for 10 seconds",
                    "AC Voltage": "400V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": ">96%",
                    "Operating Temperature": "-10°C to 50°C",
                    "Chemistry": "Lithium-ion NMC",
                    "Depth of Discharge": "84%",
                    "Mounting": "Wall Mount",
                    "Dimensions": "650mm × 1310mm × 220mm",
                    "Weight": "99.8 kg",
                    "IP Rating": "IP65",
                    "Warranty": "10 years",
                    "Communication": "CAN bus, RS485",
                    "Price": "$7234"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000],
                    capacity: [100, 96, 92, 88, 84, 80, 76, 72, 68]
                }
            },
            {
                id: "generac-pwrcell-12",
                name: "PWRcell 12",
                image: "/images/Battery/pwrcell12.jpg",
                capacity: 12,
                power: 4.5,
                voltage: 400,
                chemistry: "Lithium-ion",
                warranty: 10,
                dimensions: "650mm × 1310mm × 220mm",
                price: 8032,
                weight: 109.8,
                specs: {
                    "Energy Capacity": "12 kWh (expandable to 36 kWh)",
                    "Power (Continuous)": "4.5 kW per battery module",
                    "Power (Peak)": "6.7 kW for 10 seconds",
                    "AC Voltage": "400V",
                    "Frequency": "50 Hz",
                    "Round Trip Efficiency": ">96%",
                    "Operating Temperature": "-10°C to 50°C",
                    "Chemistry": "Lithium-ion NMC",
                    "Depth of Discharge": "84%",
                    "Mounting": "Wall Mount",
                    "Dimensions": "650mm × 1310mm × 220mm",
                    "Weight": "109.8 kg",
                    "IP Rating": "IP65",
                    "Warranty": "10 years",
                    "Communication": "CAN bus, RS485",
                    "Price": "$8032"
                },
                cycleCurve: {
                    cycles: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000],
                    capacity: [100, 96, 92, 88, 84, 80, 76, 72, 68]
                }
            }
        ]
    };
    
    // Create cycle life chart
    let cycleLifeChart;
    
    // Function to create or update cycle life chart
    function createCycleLifeChart(battery) {
        const ctx = document.getElementById('cycle-life-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (cycleLifeChart) {
            cycleLifeChart.destroy();
        }
        
        // Create new chart
        cycleLifeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: battery.cycleCurve.cycles,
                datasets: [{
                    label: 'Capacity Retention (%)',
                    data: battery.cycleCurve.capacity,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Battery Capacity vs. Cycle Count',
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
                            text: 'Cycle Count'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Capacity Retention (%)'
                        },
                        min: Math.max(0, Math.floor(Math.min(...battery.cycleCurve.capacity) - 5)),
                        max: 100
                    }
                }
            }
        });
    }
    
    // Function to highlight the active manufacturer button
    function highlightManufacturer(manufacturer) {
        // Remove active class from all buttons
        manufacturerButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        const selectedBtn = document.querySelector(`.manufacturer-btn[data-manufacturer="${manufacturer}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    }
    
    // Function to display battery models for a manufacturer
    function displayBatteryModels(manufacturer) {
        // Clear existing models
        batteryModelsList.innerHTML = '';
        
        // Get batteries for selected manufacturer
        const batteries = batteryData[manufacturer] || [];
        
        // Update title
        const manufacturerName = document.querySelector(`.manufacturer-btn[data-manufacturer="${manufacturer}"] span`).textContent;
        selectedManufacturerTitle.textContent = `${manufacturerName} Battery Storage`;
        
        // Create card for each battery model
        batteries.forEach(battery => {
            const batteryCard = document.createElement('div');
            batteryCard.className = 'model-card';
            batteryCard.dataset.batteryId = battery.id;
            
            batteryCard.innerHTML = `
                <div class="model-card-image">
                    <img src="${battery.image}" alt="${battery.name}" onerror="this.src='/images/battery_placeholder.png'">
                </div>
                <div class="model-card-content">
                    <h4 class="model-card-title">${battery.name}</h4>
                    <div class="model-card-specs">
                        <div>Capacity: <span>${battery.capacity} kWh</span></div>
                        <div>Power: <span>${battery.power} kW</span></div>
                        <div>Chemistry: <span>${battery.chemistry}</span></div>
                        <div>Warranty: <span>${battery.warranty} years</span></div>
                    </div>
                </div>
            `;
            
            // Add click event to show battery details
            batteryCard.addEventListener('click', () => {
                displayBatteryDetails(battery);
            });
            
            batteryModelsList.appendChild(batteryCard);
        });
        
        // Show the models container
        batteryModelsContainer.style.display = 'block';
        
        // Hide the detail container if it's visible
        batteryDetailContainer.style.display = 'none';
    }
    
    // Function to display battery details
    function displayBatteryDetails(battery) {
        // Store the selected battery
        selectedBattery = battery;
        
        // Update title
        batteryDetailTitle.textContent = battery.name;
        
        // Populate specifications table
        let specsHTML = '';
        for (const [key, value] of Object.entries(battery.specs)) {
            specsHTML += `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                </tr>
            `;
        }
        batterySpecsTable.innerHTML = specsHTML;
        
        // Create cycle life chart
        createCycleLifeChart(battery);
        
        // Check if proceed button already exists
        let proceedButton = document.querySelector('.battery-proceed-button');
        
        // Create proceed button if it doesn't exist
        if (!proceedButton) {
            proceedButton = document.createElement('button');
            proceedButton.className = 'button button-secondary battery-proceed-button';
            proceedButton.style.marginTop = '30px';
            proceedButton.style.display = 'block';
            proceedButton.textContent = 'Select This Battery and Proceed to Converter Selection';
            
            // Add click event to store battery data and navigate
            proceedButton.addEventListener('click', () => {
                // Store the battery data
                storeBatteryData(battery);
                // Navigate to the inverter tab
                document.getElementById('inverter-btn').click();
            });
            
            // Add button to the battery detail container
            batteryDetailContainer.appendChild(proceedButton);
        }
        
        // Show the detail container and hide the models container
        batteryDetailContainer.style.display = 'block';
        batteryModelsContainer.style.display = 'none';
    }
    
    // Function to store battery data
    function storeBatteryData(battery) {
        // Store battery data in localStorage or global variable
        window.selectedBatteryData = {
            id: battery.id,
            manufacturer: document.querySelector('.manufacturer-btn.active').getAttribute('data-manufacturer'),
            name: battery.name,
            capacity: battery.capacity,
            power: battery.power,
            chemistry: battery.chemistry,
            dimensions: battery.dimensions,
            specs: battery.specs,
            price: battery.price
        };
        
        batteryDataStored = true;
        
        // You might want to integrate with the panel data if it's available
        const panelData = typeof getStoredPanelData === 'function' ? getStoredPanelData() : null;
        
        if (panelData) {
            // You could calculate some system integration metrics here
            window.systemIntegrationData = {
                panelPower: panelData.power,
                batteryCapacity: battery.capacity,
                storageToPowerRatio: battery.capacity / (panelData.power / 1000),
                estimatedBackupTime: Math.round(battery.capacity * 0.9 / 2) // Very rough estimate assuming 2kW household load
            };
        }
    }
    
    // Function to check if battery data has been stored
    function getStoredBatteryData() {
        if (batteryDataStored && window.selectedBatteryData) {
            return window.selectedBatteryData;
        } else {
            return null;
        }
    }
    
    // Expose the function to global scope so other scripts can access it
    window.getStoredBatteryData = getStoredBatteryData;
    
    // Add event listeners to manufacturer buttons
    manufacturerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const manufacturer = button.dataset.manufacturer;
            highlightManufacturer(manufacturer);
            displayBatteryModels(manufacturer);
        });
    });
    
    // Add event listener to back button
    backToBatteriesBtn.addEventListener('click', () => {
        // Show the models container and hide the detail container
        batteryModelsContainer.style.display = 'block';
        batteryDetailContainer.style.display = 'none';
    });
});