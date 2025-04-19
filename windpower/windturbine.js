/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const manufacturerButtons = document.querySelectorAll('.manufacturer-btn');
    const turbineModelsContainer = document.getElementById('turbine-models-container');
    const turbineModelsList = document.getElementById('turbine-models-list');
    const selectedManufacturerTitle = document.getElementById('selected-manufacturer-title');
    const turbineDetailContainer = document.getElementById('turbine-detail-container');
    const turbineDetailTitle = document.getElementById('turbine-detail-title');
    const turbineSpecsTable = document.getElementById('turbine-specs-table');
    const backToModelsBtn = document.getElementById('back-to-models');
    
    // Define wind turbine data
    const turbineData = {
        "vestas": {
            name: "Vestas",
            models: [
                {
                    id: "v150-4.2",
                    name: "V150-4.2 MW",
                    power: "4.2 MW",
                    description: "One of Vestas' most efficient and versatile platforms with low cost of energy for medium to high wind speed conditions.",
                    specs: {
                        "Rated Power": "4.2 MW",
                        "Price": "4800000",
                        "Rotor Diameter": "150 m",
                        "Swept Area": "17,671 m²",
                        "Cut-in Wind Speed": "3 m/s",
                        "Rated Wind Speed": "12 m/s",
                        "Cut-out Wind Speed": "22.5 m/s",
                        "Design Lifetime": "25 years",
                        "Hub Height Options": "105/125/155 m",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Permanent magnet"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 3, power: 0},
                        {windSpeed: 3.5, power: 80},
                        {windSpeed: 4, power: 175},
                        {windSpeed: 5, power: 400},
                        {windSpeed: 6, power: 740},
                        {windSpeed: 7, power: 1200},
                        {windSpeed: 8, power: 1800},
                        {windSpeed: 9, power: 2500},
                        {windSpeed: 10, power: 3200},
                        {windSpeed: 11, power: 3800},
                        {windSpeed: 12, power: 4150},
                        {windSpeed: 13, power: 4200},
                        {windSpeed: 14, power: 4200},
                        {windSpeed: 15, power: 4200},
                        {windSpeed: 16, power: 4200},
                        {windSpeed: 17, power: 4200},
                        {windSpeed: 18, power: 4200},
                        {windSpeed: 19, power: 4200},
                        {windSpeed: 20, power: 4200},
                        {windSpeed: 21, power: 4200},
                        {windSpeed: 22, power: 4200},
                        {windSpeed: 22.5, power: 4200},
                        {windSpeed: 23, power: 0}
                    ]
                },
                {
                    id: "v136-4.5",
                    name: "V136-4.5 MW",
                    power: "4.5 MW",
                    description: "High performance turbine for low to medium wind conditions with outstanding efficiency and reliability.",
                    specs: {
                        "Rated Power": "4.5 MW",
                        "Price": "5100000",
                        "Rotor Diameter": "136 m",
                        "Swept Area": "14,527 m²",
                        "Cut-in Wind Speed": "3 m/s",
                        "Rated Wind Speed": "13 m/s",
                        "Cut-out Wind Speed": "25 m/s",
                        "Design Lifetime": "25 years",
                        "Hub Height Options": "82/112/132 m",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Doubly-fed induction generator (DFIG)"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 3, power: 0},
                        {windSpeed: 3.5, power: 100},
                        {windSpeed: 4, power: 220},
                        {windSpeed: 5, power: 450},
                        {windSpeed: 6, power: 800},
                        {windSpeed: 7, power: 1300},
                        {windSpeed: 8, power: 1900},
                        {windSpeed: 9, power: 2600},
                        {windSpeed: 10, power: 3400},
                        {windSpeed: 11, power: 4000},
                        {windSpeed: 12, power: 4400},
                        {windSpeed: 13, power: 4500},
                        {windSpeed: 14, power: 4500},
                        {windSpeed: 15, power: 4500},
                        {windSpeed: 16, power: 4500},
                        {windSpeed: 17, power: 4500},
                        {windSpeed: 18, power: 4500},
                        {windSpeed: 19, power: 4500},
                        {windSpeed: 20, power: 4500},
                        {windSpeed: 21, power: 4500},
                        {windSpeed: 22, power: 4500},
                        {windSpeed: 23, power: 4500},
                        {windSpeed: 24, power: 4500},
                        {windSpeed: 25, power: 4500},
                        {windSpeed: 25.1, power: 0}
                    ]
                },
                {
                    id: "v162-6.2",
                    name: "V162-6.2 MW",
                    power: "6.2 MW",
                    description: "Part of the EnVentus platform, provides industry-leading energy production for low to medium wind speeds.",
                    specs: {
                        "Rated Power": "6.2 MW",
                        "Price": "7300000",
                        "Rotor Diameter": "162 m",
                        "Swept Area": "20,611 m²",
                        "Cut-in Wind Speed": "3 m/s",
                        "Rated Wind Speed": "12 m/s",
                        "Cut-out Wind Speed": "25 m/s",
                        "Design Lifetime": "30 years",
                        "Hub Height Options": "119/149/166 m",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Permanent magnet"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 3, power: 0},
                        {windSpeed: 3.5, power: 150},
                        {windSpeed: 4, power: 350},
                        {windSpeed: 5, power: 750},
                        {windSpeed: 6, power: 1400},
                        {windSpeed: 7, power: 2200},
                        {windSpeed: 8, power: 3200},
                        {windSpeed: 9, power: 4300},
                        {windSpeed: 10, power: 5300},
                        {windSpeed: 11, power: 5900},
                        {windSpeed: 12, power: 6200},
                        {windSpeed: 13, power: 6200},
                        {windSpeed: 14, power: 6200},
                        {windSpeed: 15, power: 6200},
                        {windSpeed: 16, power: 6200},
                        {windSpeed: 17, power: 6200},
                        {windSpeed: 18, power: 6200},
                        {windSpeed: 19, power: 6200},
                        {windSpeed: 20, power: 6200},
                        {windSpeed: 21, power: 6200},
                        {windSpeed: 22, power: 6200},
                        {windSpeed: 23, power: 6200},
                        {windSpeed: 24, power: 6200},
                        {windSpeed: 25, power: 6200},
                        {windSpeed: 25.1, power: 0}
                    ]
                }
            ]
        },
        "siemens-gamesa": {
            name: "Siemens Gamesa",
            models: [
                {
                    id: "sg-5.8-155",
                    name: "SG 5.8-155",
                    power: "5.8 MW",
                    description: "Flexible turbine designed to maximize energy production across a wide range of wind conditions.",
                    specs: {
                        "Rated Power": "5.8 MW",
                        "Price": "6200000",
                        "Rotor Diameter": "155 m",
                        "Swept Area": "18,869 m²",
                        "Cut-in Wind Speed": "3 m/s",
                        "Rated Wind Speed": "12 m/s",
                        "Cut-out Wind Speed": "25 m/s",
                        "Design Lifetime": "25 years",
                        "Hub Height Options": "102.5/127.5/165 m",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Permanent magnet"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 3, power: 0},
                        {windSpeed: 3.5, power: 120},
                        {windSpeed: 4, power: 280},
                        {windSpeed: 5, power: 650},
                        {windSpeed: 6, power: 1200},
                        {windSpeed: 7, power: 1900},
                        {windSpeed: 8, power: 2800},
                        {windSpeed: 9, power: 3800},
                        {windSpeed: 10, power: 4700},
                        {windSpeed: 11, power: 5400},
                        {windSpeed: 12, power: 5800},
                        {windSpeed: 13, power: 5800},
                        {windSpeed: 14, power: 5800},
                        {windSpeed: 15, power: 5800},
                        {windSpeed: 16, power: 5800},
                        {windSpeed: 17, power: 5800},
                        {windSpeed: 18, power: 5800},
                        {windSpeed: 19, power: 5800},
                        {windSpeed: 20, power: 5800},
                        {windSpeed: 21, power: 5800},
                        {windSpeed: 22, power: 5800},
                        {windSpeed: 23, power: 5800},
                        {windSpeed: 24, power: 5800},
                        {windSpeed: 25, power: 5800},
                        {windSpeed: 25.1, power: 0}
                    ]
                },
                {
                    id: "sg-6.6-170",
                    name: "SG 6.6-170",
                    power: "6.6 MW",
                    description: "Offshore turbine with high annual energy production and reduced levelized cost of energy.",
                    specs: {
                        "Rated Power": "6.6 MW",
                        "Price": "7900000",
                        "Rotor Diameter": "170 m",
                        "Swept Area": "22,698 m²",
                        "Cut-in Wind Speed": "3 m/s",
                        "Rated Wind Speed": "11 m/s",
                        "Cut-out Wind Speed": "25 m/s",
                        "Design Lifetime": "30 years",
                        "Hub Height Options": "115/135/165 m",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Permanent magnet"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 3, power: 0},
                        {windSpeed: 3.5, power: 200},
                        {windSpeed: 4, power: 400},
                        {windSpeed: 5, power: 900},
                        {windSpeed: 6, power: 1600},
                        {windSpeed: 7, power: 2600},
                        {windSpeed: 8, power: 3800},
                        {windSpeed: 9, power: 5000},
                        {windSpeed: 10, power: 6000},
                        {windSpeed: 11, power: 6600},
                        {windSpeed: 12, power: 6600},
                        {windSpeed: 13, power: 6600},
                        {windSpeed: 14, power: 6600},
                        {windSpeed: 15, power: 6600},
                        {windSpeed: 16, power: 6600},
                        {windSpeed: 17, power: 6600},
                        {windSpeed: 18, power: 6600},
                        {windSpeed: 19, power: 6600},
                        {windSpeed: 20, power: 6600},
                        {windSpeed: 21, power: 6600},
                        {windSpeed: 22, power: 6600},
                        {windSpeed: 23, power: 6600},
                        {windSpeed: 24, power: 6600},
                        {windSpeed: 25, power: 6600},
                        {windSpeed: 25.1, power: 0}
                    ]
                }
            ]
        },
        "ge": {
            name: "GE Renewable Energy",
            models: [
                {
                    id: "haliade-x-14",
                    name: "Haliade-X 14 MW",
                    power: "14.0 MW",
                    description: "The world's most powerful offshore wind turbine with groundbreaking technology for offshore environments.",
                    specs: {
                        "Rated Power": "14.0 MW",
                        "Price": "16000000",
                        "Rotor Diameter": "220 m",
                        "Swept Area": "38,013 m²",
                        "Cut-in Wind Speed": "3 m/s",
                        "Rated Wind Speed": "12 m/s",
                        "Cut-out Wind Speed": "25 m/s",
                        "Design Lifetime": "25 years",
                        "Hub Height": "138 m (offshore)",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Direct drive permanent magnet generator"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 3, power: 0},
                        {windSpeed: 3.5, power: 400},
                        {windSpeed: 4, power: 900},
                        {windSpeed: 5, power: 2100},
                        {windSpeed: 6, power: 3800},
                        {windSpeed: 7, power: 5800},
                        {windSpeed: 8, power: 8000},
                        {windSpeed: 9, power: 10400},
                        {windSpeed: 10, power: 12200},
                        {windSpeed: 11, power: 13600},
                        {windSpeed: 12, power: 14000},
                        {windSpeed: 13, power: 14000},
                        {windSpeed: 14, power: 14000},
                        {windSpeed: 15, power: 14000},
                        {windSpeed: 16, power: 14000},
                        {windSpeed: 17, power: 14000},
                        {windSpeed: 18, power: 14000},
                        {windSpeed: 19, power: 14000},
                        {windSpeed: 20, power: 14000},
                        {windSpeed: 21, power: 14000},
                        {windSpeed: 22, power: 14000},
                        {windSpeed: 23, power: 14000},
                        {windSpeed: 24, power: 14000},
                        {windSpeed: 25, power: 14000},
                        {windSpeed: 25.1, power: 0}
                    ]
                },
                {
                    id: "ge-5.5-158",
                    name: "GE 5.5-158 Cypress",
                    power: "5.5 MW",
                    description: "Part of the Cypress platform, offering high efficiency and flexibility for a variety of wind conditions.",
                    specs: {
                        "Rated Power": "5.5 MW",
                        "Price": "4500000",
                        "Rotor Diameter": "158 m",
                        "Swept Area": "19,607 m²",
                        "Cut-in Wind Speed": "3 m/s",
                        "Rated Wind Speed": "12 m/s",
                        "Cut-out Wind Speed": "25 m/s",
                        "Design Lifetime": "25 years",
                        "Hub Height Options": "101/120.9/140 m",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Doubly-fed induction generator (DFIG)"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 3, power: 0},
                        {windSpeed: 3.5, power: 110},
                        {windSpeed: 4, power: 250},
                        {windSpeed: 5, power: 600},
                        {windSpeed: 6, power: 1100},
                        {windSpeed: 7, power: 1800},
                        {windSpeed: 8, power: 2700},
                        {windSpeed: 9, power: 3700},
                        {windSpeed: 10, power: 4500},
                        {windSpeed: 11, power: 5200},
                        {windSpeed: 12, power: 5500},
                        {windSpeed: 13, power: 5500},
                        {windSpeed: 14, power: 5500},
                        {windSpeed: 15, power: 5500},
                        {windSpeed: 16, power: 5500},
                        {windSpeed: 17, power: 5500},
                        {windSpeed: 18, power: 5500},
                        {windSpeed: 19, power: 5500},
                        {windSpeed: 20, power: 5500},
                        {windSpeed: 21, power: 5500},
                        {windSpeed: 22, power: 5500},
                        {windSpeed: 23, power: 5500},
                        {windSpeed: 24, power: 5500},
                        {windSpeed: 25, power: 5500},
                        {windSpeed: 25.1, power: 0}
                    ]
                }
            ]
        },
        "goldwind": {
            name: "Goldwind",
            models: [
                {
                    id: "gw4s",
                    name: "GW 4.5-155",
                    power: "4.5 MW",
                    description: "Permanent magnet direct-drive turbine with excellent performance in low wind areas.",
                    specs: {
                        "Rated Power": "4.5 MW",
                        "Price": "4700000",
                        "Rotor Diameter": "155 m",
                        "Swept Area": "18,869 m²",
                        "Cut-in Wind Speed": "2.5 m/s",
                        "Rated Wind Speed": "10.5 m/s",
                        "Cut-out Wind Speed": "22 m/s",
                        "Design Lifetime": "25 years",
                        "Hub Height Options": "110/140/160 m",
                        "Power Regulation": "Pitch regulated with variable speed",
                        "Generator Type": "Permanent magnet direct drive"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 2.5, power: 0},
                        {windSpeed: 3, power: 75},
                        {windSpeed: 3.5, power: 170},
                        {windSpeed: 4, power: 310},
                        {windSpeed: 5, power: 650},
                        {windSpeed: 6, power: 1200},
                        {windSpeed: 7, power: 1950},
                        {windSpeed: 8, power: 2800},
                        {windSpeed: 9, power: 3600},
                        {windSpeed: 10, power: 4200},
                        {windSpeed: 10.5, power: 4500},
                        {windSpeed: 11, power: 4500},
                        {windSpeed: 12, power: 4500},
                        {windSpeed: 13, power: 4500},
                        {windSpeed: 14, power: 4500},
                        {windSpeed: 15, power: 4500},
                        {windSpeed: 16, power: 4500},
                        {windSpeed: 17, power: 4500},
                        {windSpeed: 18, power: 4500},
                        {windSpeed: 19, power: 4500},
                        {windSpeed: 20, power: 4500},
                        {windSpeed: 21, power: 4500},
                        {windSpeed: 22, power: 4500},
                        {windSpeed: 22.1, power: 0}
                    ]
                }
            ]
        },
        "enercon": {
            name: "Enercon",
            models: [
                {
                    id: "e-160-ep5",
                    name: "E-160 EP5",
                    power: "5.56 MW",
                    description: "Direct-drive turbine with innovative technology for high efficiency and low maintenance.",
                    specs: {
                        "Rated Power": "5.56 MW",
                        "Price": "6400000",
                        "Rotor Diameter": "160 m",
                        "Swept Area": "20,106 m²",
                        "Cut-in Wind Speed": "2 m/s",
                        "Rated Wind Speed": "12 m/s",
                        "Cut-out Wind Speed": "28 m/s (storm control)",
                        "Design Lifetime": "25 years",
                        "Hub Height Options": "120/166 m",
                        "Power Regulation": "Variable pitch with storm control",
                        "Generator Type": "Annular generator (direct drive)"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 2, power: 0},
                        {windSpeed: 2.5, power: 70},
                        {windSpeed: 3, power: 150},
                        {windSpeed: 3.5, power: 250},
                        {windSpeed: 4, power: 370},
                        {windSpeed: 5, power: 760},
                        {windSpeed: 6, power: 1300},
                        {windSpeed: 7, power: 2000},
                        {windSpeed: 8, power: 2900},
                        {windSpeed: 9, power: 3900},
                        {windSpeed: 10, power: 4700},
                        {windSpeed: 11, power: 5300},
                        {windSpeed: 12, power: 5560},
                        {windSpeed: 13, power: 5560},
                        {windSpeed: 14, power: 5560},
                        {windSpeed: 15, power: 5560},
                        {windSpeed: 16, power: 5560},
                        {windSpeed: 17, power: 5560},
                        {windSpeed: 18, power: 5560},
                        {windSpeed: 19, power: 5560},
                        {windSpeed: 20, power: 5560},
                        {windSpeed: 21, power: 5560},
                        {windSpeed: 22, power: 5560},
                        {windSpeed: 23, power: 5560},
                        {windSpeed: 24, power: 5560},
                        {windSpeed: 25, power: 5450},
                        {windSpeed: 26, power: 5200},
                        {windSpeed: 27, power: 4950},
                        {windSpeed: 28, power: 4700},
                        {windSpeed: 29, power: 4200},
                        {windSpeed: 30, power: 3800},
                        {windSpeed: 31, power: 3400},
                        {windSpeed: 32, power: 3000},
                        {windSpeed: 34, power: 0}
                    ]
                },
                {
                    id: "e-138-ep3",
                    name: "E-138 EP3",
                    power: "4.2 MW",
                    description: "Compact yet powerful turbine designed for low and medium wind sites with high efficiency.",
                    specs: {
                        "Rated Power": "4.2 MW",
                        "Price": "4900000",
                        "Rotor Diameter": "138 m",
                        "Swept Area": "14,957 m²",
                        "Cut-in Wind Speed": "2 m/s",
                        "Rated Wind Speed": "11 m/s",
                        "Cut-out Wind Speed": "28 m/s (storm control)",
                        "Design Lifetime": "25 years",
                        "Hub Height Options": "81/111/131/160 m",
                        "Power Regulation": "Variable pitch with storm control",
                        "Generator Type": "Annular generator (direct drive)"
                    },
                    powerCurve: [
                        {windSpeed: 0, power: 0},
                        {windSpeed: 2, power: 0},
                        {windSpeed: 2.5, power: 60},
                        {windSpeed: 3, power: 130},
                        {windSpeed: 3.5, power: 210},
                        {windSpeed: 4, power: 320},
                        {windSpeed: 5, power: 650},
                        {windSpeed: 6, power: 1100},
                        {windSpeed: 7, power: 1700},
                        {windSpeed: 8, power: 2400},
                        {windSpeed: 9, power: 3200},
                        {windSpeed: 10, power: 3800},
                        {windSpeed: 11, power: 4200},
                        {windSpeed: 12, power: 4200},
                        {windSpeed: 13, power: 4200},
                        {windSpeed: 14, power: 4200},
                        {windSpeed: 15, power: 4200},
                        {windSpeed: 16, power: 4200},
                        {windSpeed: 17, power: 4200},
                        {windSpeed: 18, power: 4200},
                        {windSpeed: 19, power: 4200},
                        {windSpeed: 20, power: 4200},
                        {windSpeed: 21, power: 4200},
                        {windSpeed: 22, power: 4200},
                        {windSpeed: 23, power: 4200},
                        {windSpeed: 24, power: 4200},
                        {windSpeed: 25, power: 4050},
                        {windSpeed: 26, power: 3900},
                        {windSpeed: 27, power: 3750},
                        {windSpeed: 28, power: 3600},
                        {windSpeed: 29, power: 3200},
                        {windSpeed: 30, power: 2800},
                        {windSpeed: 31, power: 2400},
                        {windSpeed: 32, power: 2000},
                        {windSpeed: 34, power: 0}
                    ]
                }
            ]
        }
    };
    
    let currentManufacturer = null;
    let currentTurbine = null;
    let powerCurveChart = null;
    
    // Navigation buttons
    const locationBtn = document.getElementById('location-btn');
    const turbineBtn = document.getElementById('turbine-btn');
    const economicBtn = document.getElementById('economic-btn');
    
    // Content sections
    const locationContent = document.getElementById('location-content');
    const turbineContent = document.getElementById('turbine-content');
    const economicContent = document.getElementById('economic-content');

    // Handle manufacturer button clicks
    manufacturerButtons.forEach(button => {
        button.addEventListener('click', function() {
            const manufacturerId = this.getAttribute('data-manufacturer');
            selectManufacturer(manufacturerId);
            
            // Add active class to clicked button and remove from others
            manufacturerButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Handle back button click
    backToModelsBtn.addEventListener('click', function() {
        showTurbineModels();
    });
    
    // Handle navigation tabs
    locationBtn.addEventListener('click', function() {
        showContentSection('location');
    });
    
    turbineBtn.addEventListener('click', function() {
        showContentSection('turbine');
    });
    
    economicBtn.addEventListener('click', function() {
        showContentSection('economic');
    });
    
    // Function to show specific content section
    function showContentSection(section) {
        // Hide all content sections
        locationContent.style.display = 'none';
        turbineContent.style.display = 'none';
        economicContent.style.display = 'none';
        
        // Remove active class from all nav buttons
        locationBtn.classList.remove('active');
        turbineBtn.classList.remove('active');
        economicBtn.classList.remove('active');
        
        // Show selected section and activate button
        if (section === 'location') {
            locationContent.style.display = 'block';
            locationBtn.classList.add('active');
        } else if (section === 'turbine') {
            turbineContent.style.display = 'block';
            turbineBtn.classList.add('active');
        } else if (section === 'economic') {
            economicContent.style.display = 'block';
            economicBtn.classList.add('active');
        }
    }
    
    // Function to select a manufacturer
    function selectManufacturer(manufacturerId) {
        currentManufacturer = manufacturerId;
        const manufacturer = turbineData[manufacturerId];
        
        // Update manufacturer title
        selectedManufacturerTitle.textContent = `${manufacturer.name} Wind Turbine Models`;
        
        // Generate turbine model cards
        turbineModelsList.innerHTML = '';
        manufacturer.models.forEach(model => {
            const modelCard = createTurbineModelCard(model);
            turbineModelsList.appendChild(modelCard);
        });
        
        // Show turbine models container and hide detail container
        turbineModelsContainer.style.display = 'block';
        turbineDetailContainer.style.display = 'none';
        
        // Animate content appearance
        animateContent(turbineModelsContainer);
    }
    
    // Function to create a turbine model card
    function createTurbineModelCard(model) {
        const card = document.createElement('div');
        card.className = 'turbine-model-card';
        card.innerHTML = `
            <div class="turbine-model-info">
                <h4 class="turbine-model-name">${model.name}</h4>
                <div class="turbine-model-power">${model.power}</div>
                <p class="turbine-model-description">${model.description}</p>
                <div class="view-details-btn">View Details</div>
            </div>
        `;
        
        // Add click event to show turbine details
        card.addEventListener('click', function() {
            showTurbineDetails(model);
        });
        
        return card;
    }
    
    // Function to show turbine details
    function showTurbineDetails(turbine) {
        currentTurbine = turbine;
        
        // Update detail view content
        turbineDetailTitle.textContent = turbine.name;
        
        // Update specifications table
        turbineSpecsTable.innerHTML = '';
        Object.entries(turbine.specs).forEach(([key, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key}</td>
                <td>${value}</td>
            `;
            turbineSpecsTable.appendChild(row);
        });
        
        // Add "Select windturbine and proceed" button
        let selectButtonContainer = document.getElementById('select-turbine-button-container');
        if (!selectButtonContainer) {
            selectButtonContainer = document.createElement('div');
            selectButtonContainer.id = 'select-turbine-button-container';
            selectButtonContainer.className = 'select-turbine-button-container';
            
            const turbineDetailContent = document.querySelector('.turbine-detail-content');
            turbineDetailContent.appendChild(selectButtonContainer);
        }
        
        selectButtonContainer.innerHTML = `
            <button id="select-turbine-button" class="select-turbine-button">
                Select windturbine and proceed to economic analysis
            </button>
        `;
        
        // Add event listener for the select button
        document.getElementById('select-turbine-button').addEventListener('click', function() {
            // Store selected turbine data in localStorage
            localStorage.setItem('selectedTurbine', JSON.stringify({
                manufacturer: turbineData[currentManufacturer].name,
                model: currentTurbine.name,
                power: currentTurbine.power,
                specs: currentTurbine.specs,
                powerCurve: currentTurbine.powerCurve
            }));
            
            // Navigate to economic analysis tab
            showContentSection('economic');
            
            // Update economic section with selected turbine info
            updateEconomicSection();
        });
        
        // Show detail container and hide models container
        turbineModelsContainer.style.display = 'none';
        turbineDetailContainer.style.display = 'block';
        
        // Animate content appearance
        animateContent(turbineDetailContainer);
        
        // Draw power curve chart
        drawPowerCurve(turbine.powerCurve);
    }
    
    // Function to update economic section with selected turbine info
    function updateEconomicSection() {
        const selectedTurbineData = JSON.parse(localStorage.getItem('selectedTurbine'));
        
        if (selectedTurbineData) {
            const economicContentDiv = document.querySelector('#economic-content .placeholder-content');
            
            economicContentDiv.innerHTML = `
                <div class="selected-turbine-summary">
                    <h3>Selected Turbine</h3>
                    <p><strong>Manufacturer:</strong> ${selectedTurbineData.manufacturer}</p>
                    <p><strong>Model:</strong> ${selectedTurbineData.model}</p>
                    <p><strong>Rated Power:</strong> ${selectedTurbineData.power}</p>
                    <p><strong>Price:</strong> $${parseInt(selectedTurbineData.specs.Price).toLocaleString()}</p>
                </div>
                <div class="economic-analysis-placeholder">
                    <h3>Economic Analysis</h3>
                    <p>Detailed economic analysis for the selected turbine will be implemented in the next phase.</p>
                </div>
            `;
        }
    }
    
    // Function to show turbine models list
    function showTurbineModels() {
        turbineDetailContainer.style.display = 'none';
        turbineModelsContainer.style.display = 'block';
        
        // Animate content appearance
        animateContent(turbineModelsContainer);
        
        // Destroy power curve chart if it exists
        if (powerCurveChart) {
            powerCurveChart.destroy();
            powerCurveChart = null;
        }
    }
    
    // Function to draw power curve chart
    function drawPowerCurve(powerCurveData) {
        // Get canvas context
        const ctx = document.getElementById('power-curve-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (powerCurveChart) {
            powerCurveChart.destroy();
        }
        
        // Extract data for the chart
        const windSpeeds = powerCurveData.map(point => point.windSpeed);
        const powerOutput = powerCurveData.map(point => point.power);
        
        // Create the chart
        powerCurveChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: windSpeeds,
                datasets: [{
                    label: 'Power Output (kW)',
                    data: powerOutput,
                    borderColor: '#007AFF',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#007AFF',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Power Curve',
                        font: {
                            family: 'SF Pro Display',
                            size: 16,
                            weight: '500'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Power: ${context.parsed.y} kW at ${context.parsed.x} m/s`;
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
                        title: {
                            display: true,
                            text: 'Power (kW)',
                            font: {
                                family: 'SF Pro Display'
                            }
                        },
                        ticks: {
                            font: {
                                family: 'SF Pro Display'
                            }
                        }
                    }
                }
            }
        });
        
        // Highlight key points on the curve (cut-in, rated, cut-out)
        highlightKeyPoints(powerCurveData);
    }
    
    // Function to highlight key points on the power curve
    function highlightKeyPoints(powerCurveData) {
        // Identify key points
        let cutInIndex = 0;
        let ratedIndex = 0;
        let cutOutIndex = powerCurveData.length - 1;
        
        // Find cut-in speed (first non-zero power output)
        for (let i = 0; i < powerCurveData.length; i++) {
            if (powerCurveData[i].power > 0) {
                cutInIndex = i;
                break;
            }
        }
        
        // Find rated speed (first occurrence of max power)
        const maxPower = Math.max(...powerCurveData.map(point => point.power));
        for (let i = 0; i < powerCurveData.length; i++) {
            if (powerCurveData[i].power === maxPower) {
                ratedIndex = i;
                break;
            }
        }
        
        // Find cut-out speed (last non-zero power output)
        for (let i = powerCurveData.length - 1; i >= 0; i--) {
            if (powerCurveData[i].power > 0) {
                cutOutIndex = i;
                break;
            }
        }
        
        // Add annotations to the chart
        powerCurveChart.options.plugins.annotation = {
            annotations: {
                cutInLine: {
                    type: 'line',
                    xMin: powerCurveData[cutInIndex].windSpeed,
                    xMax: powerCurveData[cutInIndex].windSpeed,
                    borderColor: 'rgba(75, 192, 192, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        enabled: true,
                        content: 'Cut-in Speed',
                        position: 'top'
                    }
                },
                ratedLine: {
                    type: 'line',
                    xMin: powerCurveData[ratedIndex].windSpeed,
                    xMax: powerCurveData[ratedIndex].windSpeed,
                    borderColor: 'rgba(255, 99, 132, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        enabled: true,
                        content: 'Rated Speed',
                        position: 'top'
                    }
                },
                cutOutLine: {
                    type: 'line',
                    xMin: powerCurveData[cutOutIndex].windSpeed,
                    xMax: powerCurveData[cutOutIndex].windSpeed,
                    borderColor: 'rgba(255, 159, 64, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        enabled: true,
                        content: 'Cut-out Speed',
                        position: 'top'
                    }
                }
            }
        };
        
        // Update chart with annotations
        powerCurveChart.update();
    }
    
    // Function to animate content appearance
    function animateContent(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Check if there's already a selected turbine in localStorage
    window.addEventListener('load', function() {
        if (localStorage.getItem('selectedTurbine')) {
            updateEconomicSection();
        }
    });
});