/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Inverter Selection Functionality
document.addEventListener("DOMContentLoaded", function() {
    // Get DOM elements
    const manufacturerButtons = document.querySelectorAll('.manufacturer-btn[data-manufacturer]');
    const inverterModelsContainer = document.getElementById('inverter-models-container');
    const inverterModelsList = document.getElementById('inverter-models-list');
    const selectedManufacturerTitle = document.getElementById('selected-inverter-manufacturer-title');
    const inverterDetailContainer = document.getElementById('inverter-detail-container');
    const inverterDetailTitle = document.getElementById('inverter-detail-title');
    const backToInvertersBtn = document.getElementById('back-to-inverters');
    const inverterSpecsTable = document.getElementById('inverter-specs-table');
    
    // Global variables
    let selectedInverter = null; // Will store the currently selected inverter
    let inverterDataStored = false; // Flag to track if inverter data has been stored
    
    // Inverter data by manufacturer
    const inverterData = {
        "sma": [
            {
                id: "sma-sunny-boy-5.0",
                name: "Sunny Boy 5.0",
                image: "/images/Inverter/sunnyboy5.jpg",
                power: 5,
                mppt: 2,
                efficiency: 97.0,
                warranty: 10,
                dimensions: "535mm × 730mm × 198mm",
                price: 881,
                weight: 26,
                specs: {
                    "Rated AC Power": "5 kW",
                    "Max AC Power": "5.5 kW",
                    "Max DC Power": "7.5 kWp",
                    "Max Efficiency": "97.0%",
                    "CEC Efficiency": "96.5%",
                    "MPPT Range": "175-500V",
                    "Max Input Voltage": "600V",
                    "Number of MPP Trackers": "2",
                    "Max Input Current per MPPT": "15A",
                    "Max Short Circuit Current per MPPT": "20A",
                    "Nighttime Power Consumption": "< 5W",
                    "Cooling": "Convection",
                    "Enclosure Rating": "NEMA 3R",
                    "Operating Temperature Range": "-25°C to 60°C",
                    "Dimensions": "535mm × 730mm × 198mm",
                    "Weight": "26 kg",
                    "Warranty": "10 years (extendable to 20 years)",
                    "Communication": "Ethernet, Wi-Fi, Modbus",
                    "Display": "LCD",
                    "Battery Compatible": "No",
                    "Price": "881"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [86, 91.5, 94.8, 96.1, 97.0, 96.8, 96.5]
                }
            },
            {
                id: "sma-sunny-tripower-10",
                name: "Sunny Tripower 10",
                image: "/images/Inverter/sunnytripower.png",
                power: 10,
                mppt: 2,
                efficiency: 98.0,
                warranty: 10,
                dimensions: "661mm × 682mm × 264mm",
                price: 912,
                weight: 61,
                specs: {
                    "Rated AC Power": "10 kW",
                    "Max AC Power": "10.5 kW",
                    "Max DC Power": "15 kWp",
                    "Max Efficiency": "98.0%",
                    "CEC Efficiency": "97.5%",
                    "MPPT Range": "240-800V",
                    "Max Input Voltage": "1000V",
                    "Number of MPP Trackers": "2",
                    "Max Input Current per MPPT": "20A",
                    "Max Short Circuit Current per MPPT": "30A",
                    "Nighttime Power Consumption": "< 3W",
                    "Cooling": "OptiCool (active)",
                    "Enclosure Rating": "IP65",
                    "Operating Temperature Range": "-25°C to 60°C",
                    "Dimensions": "661mm × 682mm × 264mm",
                    "Weight": "61 kg",
                    "Warranty": "10 years (extendable to 20 years)",
                    "Communication": "Ethernet, Wi-Fi, Modbus, SunSpec",
                    "Display": "Web interface",
                    "Battery Compatible": "No",
                    "Price": "912"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [87.5, 93.0, 96.2, 97.3, 98.0, 97.8, 97.5]
                }
            }
        ],
        "fronius": [
            {
                id: "fronius-primo-5.0",
                name: "Primo 5.0-1",
                image: "/images/Inverter/primo5.PNG",
                power: 5,
                mppt: 2,
                efficiency: 98.1,
                warranty: 10,
                dimensions: "645mm × 431mm × 204mm",
                price: 1200,
                weight: 21.5,
                specs: {
                    "Rated AC Power": "5 kW",
                    "Max AC Power": "5 kW",
                    "Max DC Power": "7.5 kWp",
                    "Max Efficiency": "98.1%",
                    "CEC Efficiency": "96.0%",
                    "MPPT Range": "240-800V",
                    "Max Input Voltage": "1000V",
                    "Number of MPP Trackers": "2",
                    "Max Input Current per MPPT": "18A",
                    "Max Short Circuit Current per MPPT": "27A",
                    "Nighttime Power Consumption": "< 1W",
                    "Cooling": "Variable speed fan",
                    "Enclosure Rating": "NEMA 4X",
                    "Operating Temperature Range": "-40°C to 60°C",
                    "Dimensions": "645mm × 431mm × 204mm",
                    "Weight": "21.5 kg",
                    "Warranty": "10 years (extendable to 15/20 years)",
                    "Communication": "Wi-Fi, Ethernet, Modbus, Fronius Solar API",
                    "Display": "Graphical display",
                    "Battery Compatible": "No",
                    "Price": "1200"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [88, 93.5, 96.5, 97.7, 98.1, 97.9, 97.5]
                }
            },
            {
                id: "fronius-symo-hybrid-5.0",
                name: "Symo Hybrid 5.0-3-S",
                image: "/images/Inverter/symohybrid.jpg",
                power: 5,
                mppt: 2,
                efficiency: 97.9,
                warranty: 10,
                dimensions: "645mm × 431mm × 204mm",
                price: 1111,
                weight: 19.9,
                specs: {
                    "Rated AC Power": "5 kW",
                    "Max AC Power": "5 kW",
                    "Max DC Power": "8 kWp",
                    "Max Efficiency": "97.9%",
                    "CEC Efficiency": "97.0%",
                    "MPPT Range": "150-800V",
                    "Max Input Voltage": "1000V",
                    "Number of MPP Trackers": "2",
                    "Max Input Current per MPPT": "16A",
                    "Max Short Circuit Current per MPPT": "24A",
                    "Nighttime Power Consumption": "< 1W",
                    "Cooling": "Variable speed fan",
                    "Enclosure Rating": "IP65",
                    "Operating Temperature Range": "-25°C to 60°C",
                    "Dimensions": "645mm × 431mm × 204mm",
                    "Weight": "19.9 kg",
                    "Warranty": "10 years (extendable to 15/20 years)",
                    "Communication": "Wi-Fi, Ethernet, Modbus, Fronius Solar API",
                    "Display": "Graphical display",
                    "Battery Compatible": "Yes, with Fronius Solar Battery",
                    "Price": "1111"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [87.5, 92.5, 95.9, 97.0, 97.9, 97.7, 97.3]
                }
            }
        ],
        "solaredge": [
            {
                id: "solaredge-se5000h",
                name: "SE5000H HD-Wave",
                image: "/images/Inverter/SE5000H.PNG",
                power: 5,
                mppt: 1,
                efficiency: 99.0,
                warranty: 12,
                dimensions: "450mm × 370mm × 174mm",
                price: 1352,
                weight: 10,
                specs: {
                    "Rated AC Power": "5 kW",
                    "Max AC Power": "5 kW",
                    "Max DC Power": "7.75 kWp",
                    "Max Efficiency": "99.0%",
                    "CEC Efficiency": "98.0%",
                    "MPPT Range": "Operation with power optimizers",
                    "Max Input Voltage": "480V",
                    "Number of MPP Trackers": "1 (multiple with optimizers)",
                    "Max Input Current": "13.5A",
                    "Max Short Circuit Current": "19A",
                    "Nighttime Power Consumption": "< 2.5W",
                    "Cooling": "Natural convection",
                    "Enclosure Rating": "IP65",
                    "Operating Temperature Range": "-40°C to 60°C",
                    "Dimensions": "450mm × 370mm × 174mm",
                    "Weight": "10 kg",
                    "Warranty": "12 years (extendable to 20/25 years)",
                    "Communication": "Ethernet, Wi-Fi, RS485, Modbus",
                    "Display": "LED indicators, mobile app",
                    "Battery Compatible": "With StorEdge Interface",
                    "Required Components": "Power Optimizers (P401/P505)",
                    "Price": "1352"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [90, 95.2, 97.9, 98.5, 99.0, 98.8, 98.2]
                }
            },
            {
                id: "solaredge-se10k",
                name: "SE10K Three Phase",
                image: "/images/Inverter/SE10K.jpg",
                power: 10,
                mppt: 1,
                efficiency: 98.3,
                warranty: 12,
                dimensions: "540mm × 315mm × 260mm",
                price: 1242,
                weight: 33.2,
                specs: {
                    "Rated AC Power": "10 kW",
                    "Max AC Power": "10 kW",
                    "Max DC Power": "13.5 kWp",
                    "Max Efficiency": "98.3%",
                    "CEC Efficiency": "97.5%",
                    "MPPT Range": "Operation with power optimizers",
                    "Max Input Voltage": "900V",
                    "Number of MPP Trackers": "1 (multiple with optimizers)",
                    "Max Input Current": "26.5A",
                    "Max Short Circuit Current": "45A",
                    "Nighttime Power Consumption": "< 4W",
                    "Cooling": "Fan (temperature controlled)",
                    "Enclosure Rating": "IP65",
                    "Operating Temperature Range": "-40°C to 60°C",
                    "Dimensions": "540mm × 315mm × 260mm",
                    "Weight": "33.2 kg",
                    "Warranty": "12 years (extendable to 20/25 years)",
                    "Communication": "Ethernet, Wi-Fi, RS485, Modbus",
                    "Display": "LED indicators, mobile app",
                    "Battery Compatible": "With StorEdge Interface",
                    "Required Components": "Power Optimizers (P401/P505)",
                    "Price": "1242"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [88, 93.7, 96.8, 97.5, 98.3, 98.0, 97.6]
                }
            }
        ],
        "enphase-inv": [
            {
                id: "enphase-iq7-plus",
                name: "IQ7+ Microinverter",
                image: "/images/Inverter/IQ7.jpg",
                power: 0.29,
                mppt: 1,
                efficiency: 97.5,
                warranty: 25,
                dimensions: "212mm × 175mm × 30mm",
                price: 1452,
                weight: 1.08,
                specs: {
                    "Rated AC Power": "290W",
                    "Max AC Power": "295W",
                    "Max DC Power": "440W",
                    "Max Efficiency": "97.5%",
                    "CEC Efficiency": "97.0%",
                    "MPPT Range": "27-45V",
                    "Max Input Voltage": "60V",
                    "Number of MPP Trackers": "1 per microinverter",
                    "Max Input Current": "15A",
                    "Max Short Circuit Current": "20A",
                    "Nighttime Power Consumption": "50mW",
                    "Cooling": "Natural convection",
                    "Enclosure Rating": "IP67",
                    "Operating Temperature Range": "-40°C to 65°C",
                    "Dimensions": "212mm × 175mm × 30mm",
                    "Weight": "1.08 kg",
                    "Warranty": "25 years",
                    "Communication": "Powerline (PLC), Zigbee (with Envoy)",
                    "Display": "Via Enlighten monitoring platform",
                    "Battery Compatible": "With Enphase Ensemble",
                    "Installation Type": "One per PV module, typically 300-370W modules",
                    "Price": "1452"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [85, 92, 95.5, 96.7, 97.5, 97.2, 96.8]
                }
            },
            {
                id: "enphase-iq8a",
                name: "IQ8A Microinverter",
                image: "/images/Inverter/iq8a.PNG",
                power: 0.384,
                mppt: 1,
                efficiency: 97.7,
                warranty: 25,
                dimensions: "212mm × 175mm × 30.2mm",
                price: 1542,
                weight: 1.13,
                specs: {
                    "Rated AC Power": "384W",
                    "Max AC Power": "390W",
                    "Max DC Power": "500W",
                    "Max Efficiency": "97.7%",
                    "CEC Efficiency": "97.2%",
                    "MPPT Range": "32-53V",
                    "Max Input Voltage": "60V",
                    "Number of MPP Trackers": "1 per microinverter",
                    "Max Input Current": "14A",
                    "Max Short Circuit Current": "20A",
                    "Nighttime Power Consumption": "35mW",
                    "Cooling": "Natural convection",
                    "Enclosure Rating": "IP67",
                    "Operating Temperature Range": "-40°C to 65°C",
                    "Dimensions": "212mm × 175mm × 30.2mm",
                    "Weight": "1.13 kg",
                    "Warranty": "25 years",
                    "Communication": "Powerline (PLC), Zigbee (with Envoy)",
                    "Display": "Via Enlighten monitoring platform",
                    "Battery Compatible": "With Enphase Ensemble",
                    "Installation Type": "One per PV module, typically 380-460W modules",
                    "Price": "1542"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [86, 92.5, 96.0, 97.0, 97.7, 97.5, 97.0]
                }
            }
        ],
        "huawei": [
            {
                id: "huawei-sun2000-5ktl",
                name: "SUN2000-5KTL-M0",
                image: "/images/Inverter/sun2000.jpg",
                power: 5,
                mppt: 2,
                efficiency: 98.4,
                warranty: 10,
                dimensions: "525mm × 470mm × 166mm",
                price: 1256,
                weight: 17,
                specs: {
                    "Rated AC Power": "5 kW",
                    "Max AC Power": "5.5 kW",
                    "Max DC Power": "7.5 kWp",
                    "Max Efficiency": "98.4%",
                    "CEC Efficiency": "97.5%",
                    "MPPT Range": "140-850V",
                    "Max Input Voltage": "1080V",
                    "Number of MPP Trackers": "2",
                    "Max Input Current per MPPT": "11A",
                    "Max Short Circuit Current per MPPT": "15A",
                    "Nighttime Power Consumption": "< 1W",
                    "Cooling": "Natural convection",
                    "Enclosure Rating": "IP65",
                    "Operating Temperature Range": "-25°C to 60°C",
                    "Dimensions": "525mm × 470mm × 166mm",
                    "Weight": "17 kg",
                    "Warranty": "10 years (extendable to 15/20 years)",
                    "Communication": "Wi-Fi, Ethernet, 4G, RS485",
                    "Display": "LED indicators, app monitoring",
                    "Battery Compatible": "Yes, with LUNA2000 battery",
                    "Smart Features": "AFCI, IV curve diagnosis, Smart I-V Curve Diagnosis",
                    "Price": "1256"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [89, 94.2, 97.0, 97.8, 98.4, 98.2, 97.9]
                }
            },
            {
                id: "huawei-sun2000-10ktl",
                name: "SUN2000-10KTL-M1",
                image: "/images/Inverter/10ktl.jpg",
                power: 10,
                mppt: 2,
                efficiency: 98.6,
                warranty: 10,
                dimensions: "525mm × 470mm × 166mm",
                price: 987,
                weight: 23,
                specs: {
                    "Rated AC Power": "10 kW",
                    "Max AC Power": "11 kW",
                    "Max DC Power": "15 kWp",
                    "Max Efficiency": "98.6%",
                    "CEC Efficiency": "98.0%",
                    "MPPT Range": "140-850V",
                    "Max Input Voltage": "1080V",
                    "Number of MPP Trackers": "2",
                    "Max Input Current per MPPT": "22A",
                    "Max Short Circuit Current per MPPT": "30A",
                    "Nighttime Power Consumption": "< 1W",
                    "Cooling": "Natural convection",
                    "Enclosure Rating": "IP65",
                    "Operating Temperature Range": "-25°C to 60°C",
                    "Dimensions": "525mm × 470mm × 166mm",
                    "Weight": "23 kg",
                    "Warranty": "10 years (extendable to 15/20 years)",
                    "Communication": "Wi-Fi, Ethernet, 4G, RS485",
                    "Display": "LED indicators, app monitoring",
                    "Battery Compatible": "Yes, with LUNA2000 battery",
                    "Smart Features": "AFCI, IV curve diagnosis, Smart I-V Curve Diagnosis",
                    "Price": "987"
                },
                efficiencyCurve: {
                    powerLevels: [5, 10, 20, 30, 50, 75, 100],
                    efficiency: [90, 94.8, 97.5, 98.2, 98.6, 98.4, 98.1]
                }
            }
        ]
    };
    
    // Create efficiency chart
    let efficiencyChart;
    
    // Function to create or update efficiency chart
    function createEfficiencyChart(inverter) {
        const ctx = document.getElementById('inverter-efficiency-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (efficiencyChart) {
            efficiencyChart.destroy();
        }
        
        // Create new chart
        efficiencyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: inverter.efficiencyCurve.powerLevels.map(level => level + '%'),
                datasets: [{
                    label: 'Efficiency (%)',
                    data: inverter.efficiencyCurve.efficiency,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Inverter Efficiency vs. Load',
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
                            text: 'Load (% of Rated Power)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        },
                        min: Math.max(80, Math.floor(Math.min(...inverter.efficiencyCurve.efficiency) - 5)),
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
    
    // Function to display inverter models for a manufacturer
    function displayInverterModels(manufacturer) {
        // Clear existing models
        inverterModelsList.innerHTML = '';
        
        // Get inverters for selected manufacturer
        const inverters = inverterData[manufacturer] || [];
        
        // Update title
        const manufacturerName = document.querySelector(`.manufacturer-btn[data-manufacturer="${manufacturer}"] span`).textContent;
        selectedManufacturerTitle.textContent = `${manufacturerName} Inverters`;
        
        // Create card for each inverter model
        inverters.forEach(inverter => {
            const inverterCard = document.createElement('div');
            inverterCard.className = 'model-card';
            inverterCard.dataset.inverterId = inverter.id;
            
            inverterCard.innerHTML = `
                <div class="model-card-image">
                    <img src="${inverter.image}" alt="${inverter.name}" onerror="this.src='/images/inverter_placeholder.png'">
                </div>
                <div class="model-card-content">
                    <h4 class="model-card-title">${inverter.name}</h4>
                    <div class="model-card-specs">
                        <div>Power: <span>${inverter.power} kW</span></div>
                        <div>MPP Trackers: <span>${inverter.mppt}</span></div>
                        <div>Efficiency: <span>${inverter.efficiency}%</span></div>
                        <div>Warranty: <span>${inverter.warranty} years</span></div>
                    </div>
                </div>
            `;
            
            // Add click event to show inverter details
            inverterCard.addEventListener('click', () => {
                displayInverterDetails(inverter);
            });
            
            inverterModelsList.appendChild(inverterCard);
        });
        
        // Show the models container
        inverterModelsContainer.style.display = 'block';
        
        // Hide the detail container if it's visible
        inverterDetailContainer.style.display = 'none';
    }
    
    // Function to display inverter details
    function displayInverterDetails(inverter) {
        // Store the selected inverter
        selectedInverter = inverter;
        
        // Update title
        inverterDetailTitle.textContent = inverter.name;
        
        // Populate specifications table
        let specsHTML = '';
        for (const [key, value] of Object.entries(inverter.specs)) {
            specsHTML += `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                </tr>
            `;
        }
        inverterSpecsTable.innerHTML = specsHTML;
        
        // Create efficiency chart
        createEfficiencyChart(inverter);
        
        // Check if proceed button already exists
        let proceedButton = document.querySelector('.inverter-proceed-button');
        
        // Create proceed button if it doesn't exist
        if (!proceedButton) {
            proceedButton = document.createElement('button');
            proceedButton.className = 'button button-secondary inverter-proceed-button';
            proceedButton.style.marginTop = '30px';
            proceedButton.style.display = 'block';
            proceedButton.textContent = 'Select This Inverter and Proceed to Techno-Economical Analysis';
            
            // Add click event to store inverter data and navigate
            proceedButton.addEventListener('click', () => {
                // Store the inverter data
                storeInverterData(inverter);
                // Navigate to the analysis tab
                document.getElementById('economic-btn').click();
            });
            
            // Add button to the inverter detail container
            inverterDetailContainer.appendChild(proceedButton);
        }
        
        // Show the detail container and hide the models container
        inverterDetailContainer.style.display = 'block';
        inverterModelsContainer.style.display = 'none';
    }
    
    // Function to store inverter data
    function storeInverterData(inverter) {
        // Store inverter data in localStorage or global variable
        window.selectedInverterData = {
            id: inverter.id,
            manufacturer: document.querySelector('.manufacturer-btn.active').getAttribute('data-manufacturer'),
            name: inverter.name,
            power: inverter.power,
            mppt: inverter.mppt,
            efficiency: inverter.efficiency,
            dimensions: inverter.dimensions,
            specs: inverter.specs,
            price: inverter.price
        };
        
        inverterDataStored = true;
        
        // Integrate with battery and panel data if available
        const batteryData = typeof getStoredBatteryData === 'function' ? getStoredBatteryData() : null;
        const panelData = typeof getStoredPanelData === 'function' ? getStoredPanelData() : null;
        
        if (panelData && batteryData) {
            // Calculate some system integration metrics
            window.systemIntegrationData = {
                panelPower: panelData.power,
                batteryCapacity: batteryData.capacity,
                inverterPower: inverter.power,
                inverterEfficiency: inverter.efficiency,
                dcAcRatio: (panelData.power / 1000) / inverter.power,
                batteryToInverterRatio: batteryData.capacity / inverter.power,
                estimatedSystemEfficiency: (panelData.efficiency * inverter.efficiency) / 100
            };
        }
    }
    
    // Function to check if inverter data has been stored
    function getStoredInverterData() {
        if (inverterDataStored && window.selectedInverterData) {
            return window.selectedInverterData;
        } else {
            return null;
        }
    }
    
    // Expose the function to global scope so other scripts can access it
    window.getStoredInverterData = getStoredInverterData;
    
    // Add event listeners to manufacturer buttons
    manufacturerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const manufacturer = button.dataset.manufacturer;
            highlightManufacturer(manufacturer);
            displayInverterModels(manufacturer);
        });
    });
    
    // Add event listener to back button
    backToInvertersBtn.addEventListener('click', () => {
        // Show the models container and hide the detail container
        inverterModelsContainer.style.display = 'block';
        inverterDetailContainer.style.display = 'none';
    });
    
    // Add debugging to help identify issues
    console.log("Inverter.js loaded");
    console.log("Found manufacturer buttons:", manufacturerButtons.length);
});