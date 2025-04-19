/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

document.addEventListener("DOMContentLoaded", function() {
    // Get DOM elements
    const manufacturerButtons = document.querySelectorAll('.manufacturer-btn[data-manufacturer]');
    const panelModelsContainer = document.getElementById('panel-models-container');
    const panelModelsList = document.getElementById('panel-models-list');
    const selectedManufacturerTitle = document.getElementById('selected-manufacturer-title');
    const panelDetailContainer = document.getElementById('panel-detail-container');
    const panelDetailTitle = document.getElementById('panel-detail-title');
    const backToPanelsBtn = document.getElementById('back-to-panels');
    const panelSpecsTable = document.getElementById('panel-specs-table');
    
    // Global variables
    let selectedPanel = null; // Will store the currently selected panel
    let panelDataStored = false; // Flag to track if panel data has been stored
    
    // Solar panel data by manufacturer
    const solarPanelData = {
        "sunpower": [
            {
                id: "sp-maxeon-6-440",
                name: "Maxeon 6 - 440W",
                image: "/images/Solarpanels/maxeon6.jpg",
                power: 440,
                efficiency: 22.8,
                type: "Monocrystalline",
                warranty: 40,
                dimensions: "1835mm × 1017mm × 40mm",
                weight: 19.6,
                price: 497,
                temperatureCoefficient: -0.29,
                specs: {
                    "Maximum Power (Pmax)": "440W",
                    "Power Tolerance": "+5/-0%",
                    "Panel Efficiency": "22.8%",
                    "Rated Voltage (Vmpp)": "41.0V",
                    "Rated Current (Impp)": "10.73A",
                    "Open Circuit Voltage (Voc)": "48.9V",
                    "Short Circuit Current (Isc)": "11.45A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.29%/°C",
                    "Cell Type": "Maxeon Gen 6 Monocrystalline",
                    "Number of Cells": "66 cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1835mm × 1017mm × 40mm",
                    "Weight": "19.6 kg",
                    "Warranty": "40 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$497"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [21.4, 22.1, 22.5, 22.7, 22.8]
                }
            },
            {
                id: "sp-maxeon-5-415",
                name: "Maxeon 5 - 415W",
                image: "/images/Solarpanels/maxeon5.PNG",
                power: 415,
                efficiency: 22.2,
                type: "Monocrystalline",
                warranty: 25,
                dimensions: "1835mm × 1017mm × 40mm",
                weight: 19.4,
                price: 453,
                temperatureCoefficient: -0.29,
                specs: {
                    "Maximum Power (Pmax)": "415W",
                    "Power Tolerance": "+5/-0%",
                    "Panel Efficiency": "22.2%",
                    "Rated Voltage (Vmpp)": "40.5V",
                    "Rated Current (Impp)": "10.25A",
                    "Open Circuit Voltage (Voc)": "48.2V",
                    "Short Circuit Current (Isc)": "10.9A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.29%/°C",
                    "Cell Type": "Maxeon Gen 5 Monocrystalline",
                    "Number of Cells": "66 cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1835mm × 1017mm × 40mm",
                    "Weight": "19.4 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$453"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [20.8, 21.5, 21.9, 22.1, 22.2]
                }
            },
            {
                id: "sp-performance-390",
                name: "Performance 5 - 390W",
                image: "/images/Solarpanels/performance5.PNG",
                power: 390,
                efficiency: 20.1,
                type: "Mono PERC",
                warranty: 25,
                dimensions: "1690mm × 1160mm × 35mm",
                weight: 18.0,
                price: 352,
                temperatureCoefficient: -0.34,
                specs: {
                    "Maximum Power (Pmax)": "390W",
                    "Power Tolerance": "+5/-0%",
                    "Panel Efficiency": "20.1%",
                    "Rated Voltage (Vmpp)": "36.7V",
                    "Rated Current (Impp)": "10.63A",
                    "Open Circuit Voltage (Voc)": "44.0V",
                    "Short Circuit Current (Isc)": "11.25A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.34%/°C",
                    "Cell Type": "Mono PERC",
                    "Number of Cells": "120 half-cut cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1690mm × 1160mm × 35mm",
                    "Weight": "18.0 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$352"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [18.7, 19.2, 19.6, 20.0, 20.1]
                }
            }
        ],
        "lg": [
            {
                id: "lg-neon-r-400",
                name: "NeON R - 400W",
                image: "/images/Solarpanels/neonr.PNG",
                power: 400,
                efficiency: 21.8,
                type: "Monocrystalline",
                warranty: 25,
                dimensions: "1719mm × 1016mm × 40mm",
                weight: 17.5,
                price: 412,
                temperatureCoefficient: -0.30,
                specs: {
                    "Maximum Power (Pmax)": "400W",
                    "Power Tolerance": "+3/-0%",
                    "Panel Efficiency": "21.8%",
                    "Rated Voltage (Vmpp)": "37.2V",
                    "Rated Current (Impp)": "10.75A",
                    "Open Circuit Voltage (Voc)": "43.9V",
                    "Short Circuit Current (Isc)": "11.5A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.30%/°C",
                    "Cell Type": "N-type Monocrystalline",
                    "Number of Cells": "60 cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1719mm × 1016mm × 40mm",
                    "Weight": "17.5 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$412"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [20.5, 21.0, 21.4, 21.6, 21.8]
                }
            },
            {
                id: "lg-neon-h-380",
                name: "NeON H - 380W",
                image: "/images/Solarpanels/neonh.PNG",
                power: 380,
                efficiency: 20.7,
                type: "N-type Half-cut",
                warranty: 25,
                dimensions: "1718mm × 1042mm × 40mm",
                weight: 17.1,
                price: 513,
                temperatureCoefficient: -0.33,
                specs: {
                    "Maximum Power (Pmax)": "380W",
                    "Power Tolerance": "+3/-0%",
                    "Panel Efficiency": "20.7%",
                    "Rated Voltage (Vmpp)": "37.0V",
                    "Rated Current (Impp)": "10.27A",
                    "Open Circuit Voltage (Voc)": "43.8V",
                    "Short Circuit Current (Isc)": "10.92A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.33%/°C",
                    "Cell Type": "N-type Half-cut Monocrystalline",
                    "Number of Cells": "120 half-cut cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1718mm × 1042mm × 40mm",
                    "Weight": "17.1 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$513"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [19.4, 19.9, 20.3, 20.5, 20.7]
                }
            }
        ],
        "panasonic": [
            {
                id: "panasonic-evervolt-380",
                name: "EverVolt - 380W",
                image: "/images/Solarpanels/evervolt.PNG",
                power: 380,
                efficiency: 21.2,
                type: "Heterojunction",
                warranty: 25,
                dimensions: "1765mm × 1048mm × 35mm",
                weight: 19.5,
                price: 385,
                temperatureCoefficient: -0.26,
                specs: {
                    "Maximum Power (Pmax)": "380W",
                    "Power Tolerance": "+10/-0%",
                    "Panel Efficiency": "21.2%",
                    "Rated Voltage (Vmpp)": "37.6V",
                    "Rated Current (Impp)": "10.11A",
                    "Open Circuit Voltage (Voc)": "44.7V",
                    "Short Circuit Current (Isc)": "10.78A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.26%/°C",
                    "Cell Type": "Heterojunction Technology",
                    "Number of Cells": "66 cells",
                    "Frame": "Black Anodized Aluminum",
                    "Dimensions": "1765mm × 1048mm × 35mm",
                    "Weight": "19.5 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$385"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [20.0, 20.5, 20.9, 21.1, 21.2]
                }
            },
            {
                id: "panasonic-hit-340",
                name: "HIT - 340W",
                image: "/images/Solarpanels/hit.PNG",
                power: 340,
                efficiency: 20.3,
                type: "Heterojunction",
                warranty: 25,
                dimensions: "1590mm × 1053mm × 35mm",
                weight: 18.5,
                price: 444,
                temperatureCoefficient: -0.26,
                specs: {
                    "Maximum Power (Pmax)": "340W",
                    "Power Tolerance": "+10/-0%",
                    "Panel Efficiency": "20.3%",
                    "Rated Voltage (Vmpp)": "34.9V",
                    "Rated Current (Impp)": "9.74A",
                    "Open Circuit Voltage (Voc)": "42.3V",
                    "Short Circuit Current (Isc)": "10.35A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.26%/°C",
                    "Cell Type": "HIT (Heterojunction with Intrinsic Thin Layer)",
                    "Number of Cells": "96 cells",
                    "Frame": "Black Anodized Aluminum",
                    "Dimensions": "1590mm × 1053mm × 35mm",
                    "Weight": "18.5 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$444"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [19.1, 19.6, 19.9, 20.1, 20.3]
                }
            }
        ],
        "qcells": [
            {
                id: "qcells-qpeak-g10-400",
                name: "Q.PEAK DUO G10+ - 400W",
                image: "/images/Solarpanels/qpeakduo.jpg",
                power: 400,
                efficiency: 20.6,
                type: "Monocrystalline",
                warranty: 25,
                dimensions: "1879mm × 1045mm × 32mm",
                weight: 19.5,
                price: 387,
                temperatureCoefficient: -0.34,
                specs: {
                    "Maximum Power (Pmax)": "400W",
                    "Power Tolerance": "+5/-0%",
                    "Panel Efficiency": "20.6%",
                    "Rated Voltage (Vmpp)": "34.4V",
                    "Rated Current (Impp)": "11.63A",
                    "Open Circuit Voltage (Voc)": "41.3V",
                    "Short Circuit Current (Isc)": "12.52A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.34%/°C",
                    "Cell Type": "Monocrystalline Q.ANTUM DUO Z",
                    "Number of Cells": "132 half-cut cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1879mm × 1045mm × 32mm",
                    "Weight": "19.5 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$387"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [19.3, 19.8, 20.2, 20.4, 20.6]
                }
            },
            {
                id: "qcells-qpeak-duo-bfr-g9-370",
                name: "Q.PEAK DUO BFR-G9 - 370W",
                image: "/images/Solarpanels/qpeakbfr.jpg",
                power: 370,
                efficiency: 20.1,
                type: "Monocrystalline Bifacial",
                warranty: 25,
                dimensions: "1840mm × 1030mm × 32mm",
                weight: 19.0,
                price: 467,
                temperatureCoefficient: -0.35,
                specs: {
                    "Maximum Power (Pmax)": "370W",
                    "Power Tolerance": "+5/-0%",
                    "Panel Efficiency": "20.1%",
                    "Rated Voltage (Vmpp)": "34.1V",
                    "Rated Current (Impp)": "10.85A",
                    "Open Circuit Voltage (Voc)": "40.8V",
                    "Short Circuit Current (Isc)": "11.43A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.35%/°C",
                    "Cell Type": "Monocrystalline Q.ANTUM DUO Bifacial",
                    "Number of Cells": "120 half-cut cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1840mm × 1030mm × 32mm",
                    "Weight": "19.0 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$467"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [18.8, 19.3, 19.7, 19.9, 20.1]
                }
            }
        ],
        "rec": [
            {
                id: "rec-alpha-pure-410",
                name: "Alpha Pure - 410W",
                image: "/images/Solarpanels/alphapure.PNG",
                power: 410,
                efficiency: 21.6,
                type: "Monocrystalline",
                warranty: 25,
                dimensions: "1821mm × 1016mm × 30mm",
                weight: 19.5,
                price: 435,
                temperatureCoefficient: -0.26,
                specs: {
                    "Maximum Power (Pmax)": "410W",
                    "Power Tolerance": "+5/-0%",
                    "Panel Efficiency": "21.6%",
                    "Rated Voltage (Vmpp)": "37.9V",
                    "Rated Current (Impp)": "10.82A",
                    "Open Circuit Voltage (Voc)": "44.9V",
                    "Short Circuit Current (Isc)": "11.55A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.26%/°C",
                    "Cell Type": "N-type Monocrystalline, lead-free",
                    "Number of Cells": "132 half-cut cells",
                    "Frame": "Black Anodized Aluminum",
                    "Dimensions": "1821mm × 1016mm × 30mm",
                    "Weight": "19.5 kg",
                    "Warranty": "25 years product and power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$435"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [20.3, 20.8, 21.2, 21.4, 21.6]
                }
            },
            {
                id: "rec-twinpeak-4-370",
                name: "TwinPeak 4 - 370W",
                image: "/images/Solarpanels/twinpeak.jpg",
                power: 370,
                efficiency: 19.8,
                type: "Monocrystalline",
                warranty: 20,
                dimensions: "1755mm × 1040mm × 30mm",
                weight: 19.0,
                price: 555,
                temperatureCoefficient: -0.34,
                specs: {
                    "Maximum Power (Pmax)": "370W",
                    "Power Tolerance": "+5/-0%",
                    "Panel Efficiency": "19.8%",
                    "Rated Voltage (Vmpp)": "34.5V",
                    "Rated Current (Impp)": "10.73A",
                    "Open Circuit Voltage (Voc)": "41.1V",
                    "Short Circuit Current (Isc)": "11.47A",
                    "Maximum System Voltage": "1000V",
                    "Temperature Coefficient (Pmax)": "-0.34%/°C",
                    "Cell Type": "Monocrystalline PERC",
                    "Number of Cells": "120 half-cut cells",
                    "Frame": "Anodized Aluminum",
                    "Dimensions": "1755mm × 1040mm × 30mm",
                    "Weight": "19.0 kg",
                    "Warranty": "20 years product and 25 years power",
                    "Certifications": "IEC 61215, IEC 61730, UL 1703",
                    "Price": "$555"
                },
                efficiencyCurve: {
                    irradiance: [200, 400, 600, 800, 1000],
                    efficiency: [18.5, 19.0, 19.4, 19.6, 19.8]
                }
            }
        ]
    };
    
    // Create efficiency curve chart
    let efficiencyCurveChart;
    
    // Function to create or update efficiency curve chart
    function createEfficiencyCurveChart(panel) {
        const ctx = document.getElementById('efficiency-curve-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (efficiencyCurveChart) {
            efficiencyCurveChart.destroy();
        }
        
        // Create new chart
        efficiencyCurveChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: panel.efficiencyCurve.irradiance.map(val => val + ' W/m²'),
                datasets: [{
                    label: 'Efficiency (%)',
                    data: panel.efficiencyCurve.efficiency,
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(255, 193, 7, 1)',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Panel Efficiency vs. Irradiance',
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
                            text: 'Irradiance (W/m²)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        },
                        min: Math.floor(Math.min(...panel.efficiencyCurve.efficiency) - 1),
                        max: Math.ceil(Math.max(...panel.efficiencyCurve.efficiency) + 1)
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
    
    // Function to display panel models for a manufacturer
    function displayPanelModels(manufacturer) {
        // Clear existing models
        panelModelsList.innerHTML = '';
        
        // Get panels for selected manufacturer
        const panels = solarPanelData[manufacturer] || [];
        
        // Update title
        const manufacturerName = document.querySelector(`.manufacturer-btn[data-manufacturer="${manufacturer}"] span`).textContent;
        selectedManufacturerTitle.textContent = `${manufacturerName} Solar Panels`;
        
        // Create card for each panel model
        panels.forEach(panel => {
            const panelCard = document.createElement('div');
            panelCard.className = 'model-card';
            panelCard.dataset.panelId = panel.id;
            
            panelCard.innerHTML = `
                <div class="model-card-image">
                    <img src="${panel.image}" alt="${panel.name}" onerror="this.src='/images/panel_placeholder.png'">
                </div>
                <div class="model-card-content">
                    <h4 class="model-card-title">${panel.name}</h4>
                    <div class="model-card-specs">
                        <div>Power: <span>${panel.power}W</span></div>
                        <div>Efficiency: <span>${panel.efficiency}%</span></div>
                        <div>Type: <span>${panel.type}</span></div>
                        <div>Warranty: <span>${panel.warranty} years</span></div>
                    </div>
                </div>
            `;
            
            // Add click event to show panel details
            panelCard.addEventListener('click', () => {
                displayPanelDetails(panel);
            });
            
            panelModelsList.appendChild(panelCard);
        });
        
        // Show the models container
        panelModelsContainer.style.display = 'block';
        
        // Hide the detail container if it's visible
        panelDetailContainer.style.display = 'none';
    }
    
    // Function to display panel details
    function displayPanelDetails(panel) {
        // Store the selected panel
        selectedPanel = panel;
        
        // Update title
        panelDetailTitle.textContent = panel.name;
        
        // Populate specifications table
        let specsHTML = '';
        for (const [key, value] of Object.entries(panel.specs)) {
            specsHTML += `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                </tr>
            `;
        }
        panelSpecsTable.innerHTML = specsHTML;
        
        // Create efficiency curve chart
        createEfficiencyCurveChart(panel);
        
        // Check if proceed button already exists
        let proceedButton = document.querySelector('.panel-proceed-button');
        
        // Create proceed button if it doesn't exist
        if (!proceedButton) {
            proceedButton = document.createElement('button');
            proceedButton.className = 'button button-secondary panel-proceed-button';
            proceedButton.style.marginTop = '30px';
            proceedButton.style.display = 'block';
            proceedButton.textContent = 'Select This Panel and Proceed to Energy Storage';
            
            // Add click event to store panel data and navigate
            proceedButton.addEventListener('click', () => {
                // Store the panel data
                storePanelData(panel);
                // Navigate to the battery tab
                document.getElementById('battery-btn').click();
            });
            
            // Add button to the panel detail container
            panelDetailContainer.appendChild(proceedButton);
        }
        
        // Show the detail container and hide the models container
        panelDetailContainer.style.display = 'block';
        panelModelsContainer.style.display = 'none';
    }
    
    // Function to store panel data
    function storePanelData(panel) {
        // Store panel data in localStorage or global variable
        window.selectedPanelData = {
            id: panel.id,
            manufacturer: document.querySelector('.manufacturer-btn.active').getAttribute('data-manufacturer'),
            name: panel.name,
            power: panel.power,
            efficiency: panel.efficiency,
            type: panel.type,
            dimensions: panel.dimensions,
            specs: panel.specs,
            price: panel.price
        };
        
        panelDataStored = true;
        
        // You might want to check with the main system if Solar Data is available
        const solarData = typeof getStoredSolarData === 'function' ? getStoredSolarData() : null;
        
        // If solar data is available, you could calculate potential energy production
        if (solarData) {
            const annualProduction = solarData.annualData.annualProduction;
            const panelPower = panel.power / 1000; // Convert W to kW
            
            // Store calculated system production data
            window.systemProductionData = {
                annualProduction: annualProduction,
                panelPower: panelPower,
                estimatedOutput: Math.round(annualProduction * panelPower)
            };
        }
    }
    
    // Function to check if panel data has been stored
    function getStoredPanelData() {
        if (panelDataStored && window.selectedPanelData) {
            return window.selectedPanelData;
        } else {
            return null;
        }
    }
    
    // Expose the function to global scope so other scripts can access it
    window.getStoredPanelData = getStoredPanelData;
    
    // Add event listeners to manufacturer buttons
    manufacturerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const manufacturer = button.dataset.manufacturer;
            highlightManufacturer(manufacturer);
            displayPanelModels(manufacturer);
        });
    });
    
    // Add event listener to back button
    backToPanelsBtn.addEventListener('click', () => {
        // Show the models container and hide the detail container
        panelModelsContainer.style.display = 'block';
        panelDetailContainer.style.display = 'none';
    });
});