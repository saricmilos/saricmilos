/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

document.addEventListener("DOMContentLoaded", function() {
    // Get DOM elements
    const economicContent = document.getElementById('economic-content');
    const systemConfigurationDiv = document.getElementById('system-configuration');
    const economicMetricsTable = document.getElementById('economic-metrics-table').querySelector('tbody');
    const incentivesContainer = document.getElementById('incentives-container');
    const environmentalMetricsDiv = document.getElementById('environmental-metrics');
    
    // Global variables
    let residenceType = null;
    let customConsumption = null;
    let recommendedSystem = null;
    let economicAnalysis = null;
    
    // Function to check if all required data is available
    function checkRequiredData() {
        const solarData = typeof getStoredSolarData === 'function' ? getStoredSolarData() : null;
        const panelData = typeof getStoredPanelData === 'function' ? getStoredPanelData() : null;
        const batteryData = typeof getStoredBatteryData === 'function' ? getStoredBatteryData() : null;
        const inverterData = typeof getStoredInverterData === 'function' ? getStoredInverterData() : null;
        
        if (!solarData || !panelData || !batteryData || !inverterData) {
            const missingComponents = [];
            if (!solarData) missingComponents.push('location');
            if (!panelData) missingComponents.push('solar panel');
            if (!batteryData) missingComponents.push('battery');
            if (!inverterData) missingComponents.push('inverter');
            
            alert(`Please complete the following sections first: ${missingComponents.join(', ')}`);
            return false;
        }
        
        return true;
    }
    
    // Create residence type selection UI
    function createResidenceTypeSelection() {
        // Create residence type selection container
        const residenceSelectionContainer = document.createElement('div');
        residenceSelectionContainer.className = 'residence-selection-container';
        residenceSelectionContainer.innerHTML = `
            <h3>Select Your Residence Type</h3>
            <p>Choose your residence type or enter your custom annual consumption to get personalized system recommendations.</p>
            
            <div class="residence-type-options">
                <div class="residence-type-card" data-type="house">
                    <img src="/images/house.jpg" alt="House" onerror="this.src='/images/placeholder.png'">
                    <h4>House</h4>
                    <p>Single-family home (4 people)</p>
                    <p>Avg: 4,500 kWh/year</p>
                </div>
                <div class="residence-type-card" data-type="apartment-building">
                    <img src="/images/building.PNG" alt="Apartment Building" onerror="this.src='/images/placeholder.png'">
                    <h4>Apartment Building</h4>
                    <p>Multi-family residence</p>
                    <p>Avg: 40,000 kWh/year</p>
                </div>
                <div class="residence-type-card" data-type="neighborhood">
                    <img src="/images/hood.jpg" alt="Small Neighborhood" onerror="this.src='/images/placeholder.png'">
                    <h4>Small Neighborhood</h4>
                    <p>Smart grid community</p>
                    <p>Avg: 120,000 kWh/year</p>
                </div>
            </div>
            
            <div class="custom-consumption">
                <h4>Or Enter Custom Annual Consumption</h4>
                <div class="custom-consumption-input">
                    <input type="number" id="annual-consumption" placeholder="Annual consumption in kWh">
                    <button id="calculate-custom" class="button button-secondary">Calculate</button>
                </div>
            </div>
        `;
        
        economicContent.querySelector('.container').insertBefore(residenceSelectionContainer, document.querySelector('.system-summary'));
        
        // Add event listeners to residence type cards
        const residenceCards = document.querySelectorAll('.residence-type-card');
        residenceCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                residenceCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to selected card
                card.classList.add('active');
                
                // Set residence type
                residenceType = card.dataset.type;
                
                // Reset custom consumption
                customConsumption = null;
                document.getElementById('annual-consumption').value = '';
                
                // Calculate system recommendations
                calculateSystemRecommendations();
            });
        });
        
        // Add event listener to custom consumption button
        document.getElementById('calculate-custom').addEventListener('click', () => {
            const consumptionInput = document.getElementById('annual-consumption');
            const consumption = parseFloat(consumptionInput.value);
            
            if (isNaN(consumption) || consumption <= 0) {
                alert('Please enter a valid annual consumption value.');
                return;
            }
            
            // Remove active class from all cards
            residenceCards.forEach(c => c.classList.remove('active'));
            
            // Set custom consumption
            customConsumption = consumption;
            residenceType = 'custom';
            
            // Calculate system recommendations
            calculateSystemRecommendations();
        });
        
        // Add event listener for Enter key on consumption input
        document.getElementById('annual-consumption').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                document.getElementById('calculate-custom').click();
            }
        });
    }
    
    // Function to calculate system recommendations based on residence type or custom consumption
    function calculateSystemRecommendations() {
        // Get stored data
        const solarData = getStoredSolarData();
        const panelData = getStoredPanelData();
        const batteryData = getStoredBatteryData();
        const inverterData = getStoredInverterData();
        
        // Annual production per kWp from solar data
        const annualProductionPerKWp = parseFloat(solarData.annualData.annualProduction);
        
        // Get annual consumption based on residence type or custom input
        let annualConsumption;
        
        if (residenceType === 'custom') {
            annualConsumption = customConsumption;
        } else {
            // Predefined consumption values based on residence type
            const consumptionValues = {
                'house': 4500, // kWh/year for a 4-person household
                'apartment-building': 40000, // kWh/year for an apartment building
                'neighborhood': 120000 // kWh/year for a small neighborhood (smart grid)
            };
            
            annualConsumption = consumptionValues[residenceType];
        }
        
        // Calculate recommended number of panels
        const panelPowerKW = panelData.power / 1000; // Convert W to kW
        const singlePanelAnnualProduction = panelPowerKW * annualProductionPerKWp; // kWh/year per panel
        
        // Target to cover 110% of consumption to account for system losses and future expansion
        const targetProduction = annualConsumption * 1.1;
        
        // Calculate recommended number of panels
        let recommendedPanels = Math.ceil(targetProduction / singlePanelAnnualProduction);
        
        // Calculate total system power
        const totalSystemPowerKW = recommendedPanels * panelPowerKW;
        
        // Calculate recommended battery capacity
        // Typical household daily consumption
        const dailyConsumption = annualConsumption / 365;
        
        // For a house, aim to cover 1 day of autonomy
        // For apartment buildings and neighborhoods, aim for different ratios
        let autonomyDays;
        if (residenceType === 'house') {
            autonomyDays = 1;
        } else if (residenceType === 'apartment-building') {
            autonomyDays = 0.5; // Cover half a day for apartment buildings
        } else if (residenceType === 'neighborhood') {
            autonomyDays = 0.3; // Cover less for neighborhoods (distributed risk)
        } else {
            // For custom, scale based on size
            if (annualConsumption < 10000) {
                autonomyDays = 1;
            } else if (annualConsumption < 50000) {
                autonomyDays = 0.5;
            } else {
                autonomyDays = 0.3;
            }
        }
        
        // Calculate battery capacity needed
        const batteryCapacityNeeded = dailyConsumption * autonomyDays;
        
        // Calculate number of battery units needed
        const batteryUnits = Math.ceil(batteryCapacityNeeded / batteryData.capacity);
        
        // Calculate inverter capacity
        // Inverter should handle the peak power of the solar array
        const totalInverterCapacityNeeded = totalSystemPowerKW;
        
        // Calculate number of inverters needed
        const inverterUnits = Math.ceil(totalInverterCapacityNeeded / inverterData.power);
        
        // Store recommended system configuration
        recommendedSystem = {
            annualConsumption: annualConsumption,
            recommendedPanels: recommendedPanels,
            totalSystemPowerKW: totalSystemPowerKW,
            batteryUnits: batteryUnits,
            totalBatteryCapacity: batteryUnits * batteryData.capacity,
            inverterUnits: inverterUnits,
            totalInverterCapacity: inverterUnits * inverterData.power,
            estimatedAnnualProduction: totalSystemPowerKW * annualProductionPerKWp,
            selfSufficiencyRate: Math.min(95, (totalSystemPowerKW * annualProductionPerKWp / annualConsumption) * 100)
        };
        
        // Display system configuration
        displaySystemConfiguration();
        
        // Calculate economic analysis
        calculateEconomicAnalysis();
        
        // Create and display payback chart
        createPaybackChart();
        
        // Update economic metrics
        displayEconomicMetrics();
        
        // Display incentives
        displayIncentives();
        
        // Display environmental metrics
        displayEnvironmentalMetrics();
    }
    
    // Function to display system configuration
// Function to display system configuration with improved layout
function displaySystemConfiguration() {
    if (!recommendedSystem) return;
    
    const solarData = getStoredSolarData();
    const panelData = getStoredPanelData();
    const batteryData = getStoredBatteryData();
    const inverterData = getStoredInverterData();
    
    // Display residence type
    let residenceTypeDisplay;
    if (residenceType === 'custom') {
        residenceTypeDisplay = 'Custom';
    } else {
        residenceTypeDisplay = {
            'house': 'Single-family House',
            'apartment-building': 'Apartment Building',
            'neighborhood': 'Small Neighborhood (Smart Grid)'
        }[residenceType];
    }
    
    // Create system configuration HTML with improved layout
    systemConfigurationDiv.innerHTML = `
        <div class="system-config-card">
            <div class="system-config-header">
                <div class="system-type">
                    <h4>${residenceTypeDisplay}</h4>
                    <p>Annual Consumption: ${recommendedSystem.annualConsumption.toLocaleString()} kWh</p>
                </div>
                <div class="system-location">
                    <p><strong>Location:</strong> ${solarData.location.latitude.toFixed(4)}, ${solarData.location.longitude.toFixed(4)}</p>
                    <p><strong>Annual Solar Production:</strong> ${solarData.annualData.annualProduction} kWh/kWp</p>
                </div>
            </div>
            
            <div class="system-components">
                <div class="component-row">
                    <div class="component-col">
                        <div class="component-icon">☀️</div>
                        <div class="component-details">
                            <p class="component-title">Solar Panels</p>
                            <p>${panelData.name}</p>
                            <p><strong>${recommendedSystem.recommendedPanels}</strong> × ${panelData.power}W</p>
                            <p>Total: <strong>${recommendedSystem.totalSystemPowerKW.toFixed(2)} kWp</strong></p>
                        </div>
                    </div>
                    
                    <div class="component-col">
                        <div class="component-icon">🔋</div>
                        <div class="component-details">
                            <p class="component-title">Energy Storage</p>
                            <p>${batteryData.name}</p>
                            <p><strong>${recommendedSystem.batteryUnits}</strong> × ${batteryData.capacity} kWh</p>
                            <p>Total: <strong>${recommendedSystem.totalBatteryCapacity.toFixed(1)} kWh</strong></p>
                        </div>
                    </div>
                </div>
                
                <div class="component-row">
                    <div class="component-col">
                        <div class="component-icon">⚡</div>
                        <div class="component-details">
                            <p class="component-title">Inverters</p>
                            <p>${inverterData.name}</p>
                            <p><strong>${recommendedSystem.inverterUnits}</strong> × ${inverterData.power} kW</p>
                            <p>Total: <strong>${recommendedSystem.totalInverterCapacity.toFixed(1)} kW</strong></p>
                        </div>
                    </div>
                    
                    <div class="component-col">
                        <div class="component-icon">📊</div>
                        <div class="component-details">
                            <p class="component-title">System Performance</p>
                            <p>Annual Production: <strong>${Math.round(recommendedSystem.estimatedAnnualProduction).toLocaleString()} kWh</strong></p>
                            <p>Self-Sufficiency: <strong>${recommendedSystem.selfSufficiencyRate.toFixed(1)}%</strong></p>
                            <p>Efficiency: <strong>${(panelData.efficiency * inverterData.efficiency / 100).toFixed(1)}%</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add custom CSS for the improved system configuration display
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
    .system-config-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        background-color: #ffffff;
        overflow: hidden;
        margin-bottom: 20px;
    }
    
    .system-config-header {
        display: flex;
        justify-content: space-between;
        background-color: #f8f9fa;
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .system-type h4 {
        margin: 0 0 5px 0;
        color: #333;
        font-size: 16px;
    }
    
    .system-type p, .system-location p {
        margin: 0 0 4px 0;
        font-size: 14px;
    }
    
    .system-components {
        padding: 15px;
    }
    
    .component-row {
        display: flex;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }
    
    .component-row:last-child {
        margin-bottom: 0;
    }
    
    .component-col {
        flex: 1;
        min-width: 225px;
        display: flex;
        margin: 0 5px 10px 5px;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 6px;
    }
    
    .component-icon {
        font-size: 24px;
        margin-right: 10px;
        display: flex;
        align-items: center;
    }
    
    .component-details {
        flex: 1;
    }
    
    .component-title {
        font-weight: 600;
        margin: 0 0 5px 0;
        color: #333;
    }
    
    .component-details p {
        margin: 0 0 5px 0;
        font-size: 14px;
        line-height: 1.4;
    }
    
    @media (max-width: 768px) {
        .system-config-header {
            flex-direction: column;
        }
        
        .system-location {
            margin-top: 10px;
        }
        
        .component-col {
            min-width: 100%;
            margin: 0 0 10px 0;
        }
    }
`;
document.head.appendChild(additionalStyle);
    
    // Function to calculate economic analysis
    function calculateEconomicAnalysis() {
        if (!recommendedSystem) return;
        
        const panelData = getStoredPanelData();
        const batteryData = getStoredBatteryData();
        const inverterData = getStoredInverterData();
        
        // Calculate total system cost
        const panelCost = recommendedSystem.recommendedPanels * panelData.price;
        const batteryCost = recommendedSystem.batteryUnits * batteryData.price;
        const inverterCost = recommendedSystem.inverterUnits * inverterData.price;
        
        // Installation and balance of system costs (typically 30-40% of hardware costs)
        const hardwareCost = panelCost + batteryCost + inverterCost;
        const installationCost = hardwareCost * 0.35;
        
        // Total initial investment
        const totalInitialInvestment = hardwareCost + installationCost;
        
        // Annual maintenance cost (typically 1-2% of total system cost)
        const annualMaintenanceCost = totalInitialInvestment * 0.01;
        
        // Electricity price assumptions
        const electricityPrice = 0.22; // $/kWh (national average)
        const electricityPriceEscalation = 0.03; // 3% annual increase
        
        // Calculate annual savings
        const annualSavings = recommendedSystem.estimatedAnnualProduction * electricityPrice;
        
        // Calculate ROI values for 25 years
        const analysis = {
            initialInvestment: totalInitialInvestment,
            panelCost: panelCost,
            batteryCost: batteryCost,
            inverterCost: inverterCost,
            installationCost: installationCost,
            annualMaintenanceCost: annualMaintenanceCost,
            electricityPrice: electricityPrice,
            electricityPriceEscalation: electricityPriceEscalation,
            annualSavings: annualSavings,
            yearlyCashFlow: [],
            cumulativeCashFlow: [],
            paybackYear: 0
        };
        
        // Calculate yearly cash flows
        let cumulativeCashFlow = -totalInitialInvestment;
        let currentElectricityPrice = electricityPrice;
        let paybackReached = false;
        
        for (let year = 1; year <= 25; year++) {
            // Calculate degraded production (assume 0.5% degradation per year)
            const degradationFactor = Math.pow(0.995, year); // 0.5% annual degradation
            const yearProduction = recommendedSystem.estimatedAnnualProduction * degradationFactor;
            
            // Calculate yearly savings
            const yearSavings = yearProduction * currentElectricityPrice;
            
            // Cash flow for the year (savings minus maintenance)
            const yearCashFlow = yearSavings - annualMaintenanceCost;
            
            // Update cumulative cash flow
            cumulativeCashFlow += yearCashFlow;
            
            // Store values
            analysis.yearlyCashFlow.push(yearCashFlow);
            analysis.cumulativeCashFlow.push(cumulativeCashFlow);
            
            // Check if payback is reached
            if (!paybackReached && cumulativeCashFlow >= 0) {
                analysis.paybackYear = year;
                paybackReached = true;
            }
            
            // Increase electricity price for next year
            currentElectricityPrice *= (1 + electricityPriceEscalation);
        }
        
        // Calculate net present value (NPV) with 5% discount rate
        const discountRate = 0.05;
        let npv = -totalInitialInvestment;
        
        for (let year = 0; year < analysis.yearlyCashFlow.length; year++) {
            npv += analysis.yearlyCashFlow[year] / Math.pow(1 + discountRate, year + 1);
        }
        
        analysis.npv = npv;
        
        // Calculate internal rate of return (IRR)
        // Using simplified approach for demo purposes
        const totalReturn = analysis.cumulativeCashFlow[24] + totalInitialInvestment; // Total return over 25 years
        const years = 25;
        const irr = Math.pow(totalReturn / totalInitialInvestment, 1/years) - 1;
        
        analysis.irr = irr;
        
        // Calculate levelized cost of energy (LCOE)
        const totalLifetimeEnergy = recommendedSystem.estimatedAnnualProduction * 25 * 0.9; // Assuming 10% lifetime degradation on average
        const totalLifetimeCost = totalInitialInvestment + (annualMaintenanceCost * 25);
        const lcoe = totalLifetimeCost / totalLifetimeEnergy;
        
        analysis.lcoe = lcoe;
        
        // Store economic analysis
        economicAnalysis = analysis;
    }
    
    // Function to create payback chart
    function createPaybackChart() {
        if (!economicAnalysis) return;
        
        const ctx = document.getElementById('payback-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.paybackChart) {
            window.paybackChart.destroy();
        }
        
        // Prepare data for chart
        const years = Array.from({length: 25}, (_, i) => i + 1);
        const cumulativeCashFlow = economicAnalysis.cumulativeCashFlow;
        
        // Create new chart
        window.paybackChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Cumulative Cash Flow ($)',
                        data: cumulativeCashFlow,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        tension: 0.2,
                        pointRadius: 3
                    },
                    {
                        label: 'Break-even Point',
                        data: Array(25).fill(0),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Financial Return Over 25 Years',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                xMin: economicAnalysis.paybackYear,
                                xMax: economicAnalysis.paybackYear,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 2,
                                label: {
                                    content: `Payback Period: ${economicAnalysis.paybackYear} years`,
                                    enabled: true,
                                    position: 'top'
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cumulative Cash Flow ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'USD',
                                    maximumSignificantDigits: 3
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to display economic metrics
    function displayEconomicMetrics() {
        if (!economicAnalysis) return;
        
        // Format currency
        const formatCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        
        // Clear existing metrics
        economicMetricsTable.innerHTML = '';
        
        // Add metrics rows
        const metrics = [
            { name: 'Total Initial Investment', value: formatCurrency.format(economicAnalysis.initialInvestment) },
            { name: 'Estimated Annual Savings', value: formatCurrency.format(economicAnalysis.annualSavings) + '/year' },
            { name: 'Payback Period', value: economicAnalysis.paybackYear + ' years' },
            { name: 'Net Present Value (NPV)', value: formatCurrency.format(economicAnalysis.npv) },
            { name: 'Internal Rate of Return (IRR)', value: (economicAnalysis.irr * 100).toFixed(2) + '%' },
            { name: 'Levelized Cost of Energy (LCOE)', value: formatCurrency.format(economicAnalysis.lcoe) + '/kWh' },
            { name: 'Return on Investment (25 years)', value: formatCurrency.format(economicAnalysis.cumulativeCashFlow[24]) },
            { name: 'System Cost Breakdown', value: `Panels: ${formatCurrency.format(economicAnalysis.panelCost)}, Battery: ${formatCurrency.format(economicAnalysis.batteryCost)}, Inverter: ${formatCurrency.format(economicAnalysis.inverterCost)}, Installation: ${formatCurrency.format(economicAnalysis.installationCost)}` }
        ];
        
        // Add metrics to table
        metrics.forEach(metric => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${metric.name}</td>
                <td>${metric.value}</td>
            `;
            economicMetricsTable.appendChild(row);
        });
    }
    
    // Function to display available incentives
    function displayIncentives() {
        // Get solar data to determine location
        const solarData = getStoredSolarData();
        
        // Simplified incentives (in a real application, you would use an API or database to get accurate incentives)
        incentivesContainer.innerHTML = `
            <div class="incentive-card">
                <h4>Federal Tax Credit</h4>
                <p class="incentive-value">30% of system cost</p>
                <p>The federal solar investment tax credit allows you to deduct 30% of the cost of installing a solar energy system from your federal taxes.</p>
            </div>
            
            <div class="incentive-card">
                <h4>Net Metering</h4>
                <p class="incentive-value">Varies by location</p>
                <p>Net metering allows you to receive credit for excess electricity your system produces and feeds back to the grid.</p>
            </div>
            
            <div class="incentive-card">
                <h4>Local Rebates</h4>
                <p class="incentive-value">Varies by location</p>
                <p>Many states, counties, municipalities and utilities offer rebates or other incentives for solar energy systems.</p>
            </div>
            
            <p class="incentive-disclaimer">Note: Actual incentives depend on your specific location and may change over time. Consult with a local solar installer for the most current information.</p>
        `;
    }
    
    // Function to display environmental metrics
    function displayEnvironmentalMetrics() {
        if (!recommendedSystem) return;
        
        // Calculate environmental impact
        // EPA estimates: 0.4 kg CO2 per kWh for grid electricity in the U.S.
        const co2AvoidedPerYear = recommendedSystem.estimatedAnnualProduction * 0.4; // kg CO2
        const co2AvoidedLifetime = co2AvoidedPerYear * 25; // 25-year lifetime
        
        // Convert to equivalent metrics
        const treesEquivalent = Math.round(co2AvoidedLifetime / 20); // Approximately 20 kg CO2 per tree per year
        const milesNotDriven = Math.round(co2AvoidedLifetime * 2.5); // Approximately 400g CO2 per mile
        
        environmentalMetricsDiv.innerHTML = `
            <div class="environmental-metrics-container">
                <div class="environmental-metric">
                    <div class="metric-icon">🌿</div>
                    <div class="metric-content">
                        <h4>CO₂ Emissions Avoided</h4>
                        <p class="metric-value">${(co2AvoidedPerYear / 1000).toFixed(2)} tonnes/year</p>
                        <p class="metric-total">${(co2AvoidedLifetime / 1000).toFixed(2)} tonnes over system lifetime</p>
                    </div>
                </div>
                
                <div class="environmental-metric">
                    <div class="metric-icon">🌳</div>
                    <div class="metric-content">
                        <h4>Equivalent Trees Planted</h4>
                        <p class="metric-value">${treesEquivalent.toLocaleString()}</p>
                        <p class="metric-description">Number of trees needed to absorb the same amount of CO₂</p>
                    </div>
                </div>
                
                <div class="environmental-metric">
                    <div class="metric-icon">🚗</div>
                    <div class="metric-content">
                        <h4>Miles Not Driven</h4>
                        <p class="metric-value">${milesNotDriven.toLocaleString()}</p>
                        <p class="metric-description">Equivalent car miles in terms of emissions</p>
                    </div>
                </div>
            </div>
            
            <div class="environmental-impact-description">
                <p>By installing this solar energy system, you'll significantly reduce your carbon footprint and contribute to a more sustainable future. The environmental benefits shown above represent the positive impact your system will have over its 25-year lifetime.</p>
            </div>
        `;
    }
    
    // Initialize economic analysis section
    function initEconomicAnalysis() {
        // Check if all required data is available
        if (!checkRequiredData()) {
            return;
        }
        
        // Create residence type selection UI
        createResidenceTypeSelection();
    }
    
    // Function to run when the economic tab is activated
    function activateEconomicTab() {
        // Check if we need to initialize
        if (!document.querySelector('.residence-selection-container')) {
            initEconomicAnalysis();
        }
    }
    
    // Add event listener for tab activation
    document.getElementById('economic-btn').addEventListener('click', activateEconomicTab);
    
    // Add custom CSS for the economic section
    const style = document.createElement('style');
    style.textContent = `
        .residence-selection-container {
            margin-bottom: 30px;
        }
        
        .residence-type-options {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin: 20px 0;
        }
        
        .residence-type-card {
            flex: 1;
            min-width: 200px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .residence-type-card:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transform: translateY(-5px);
        }
        
        .residence-type-card.active {
            border-color: #4CAF50;
            box box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .custom-consumption {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        
        .custom-consumption-input {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .custom-consumption-input input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .system-config-overview {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .config-item {
            flex: 1;
            min-width: 200px;
            background-color: #f5f5f5;
            border-radius: 8px;
            padding: 15px;
        }
        
        .recommended-config {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
        }
        
        .config-component {
            flex: 1;
            min-width: 220px;
            display: flex;
            gap: 15px;
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
        }
        
        .component-icon {
            font-size: 24px;
            align-self: center;
        }
        
        .component-details {
            flex: 1;
        }
        
        .component-details h5 {
            margin-top: 0;
            color: #333;
        }
        
        .economic-metrics {
            margin: 30px 0;
        }
        
        .economic-metrics table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .economic-metrics th, .economic-metrics td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .economic-metrics th {
            background-color: #f5f5f5;
        }
        
        .incentives-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
        }
        
        .incentive-card {
            flex: 1;
            min-width: 250px;
            background-color: #f9f9f9;
            border-left: 4px solid #4CAF50;
            border-radius: 4px;
            padding: 15px;
        }
        
        .incentive-value {
            font-weight: bold;
            color: #4CAF50;
            margin: 5px 0;
        }
        
        .incentive-disclaimer {
            font-size: 0.9em;
            color: #666;
            margin-top: 15px;
            font-style: italic;
        }
        
        .environmental-metrics-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
        }
        
        .environmental-metric {
            flex: 1;
            min-width: 250px;
            display: flex;
            gap: 15px;
            background-color: #f5f5f5;
            border-radius: 8px;
            padding: 15px;
        }
        
        .metric-icon {
            font-size: 28px;
            align-self: center;
        }
        
        .metric-content {
            flex: 1;
        }
        
        .metric-value {
            font-size: 1.2em;
            font-weight: bold;
            color: #4CAF50;
            margin: 5px 0;
        }
        
        .environmental-impact-description {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f5e9;
            border-radius: 8px;
        }
        
        .chart-container {
            height: 400px;
            margin: 20px 0;
        }
        
        @media (max-width: 768px) {
            .residence-type-options {
                flex-direction: column;
            }
            
            .system-config-overview, 
            .recommended-config,
            .incentives-container,
            .environmental-metrics-container {
                flex-direction: column;
            }
            
            .chart-container {
                height: 300px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Check if we should initialize when the page loads (if economic tab is active)
    if (document.getElementById('economic-btn').classList.contains('active')) {
        initEconomicAnalysis();
    }
});

// Utility functions for data storage and retrieval

// Function to retrieve solar data from localStorage
function getStoredSolarData() {
    const solarDataStr = localStorage.getItem('solarData');
    if (!solarDataStr) return null;
    return JSON.parse(solarDataStr);
}

// Function to retrieve solar panel data from localStorage
function getStoredPanelData() {
    const panelDataStr = localStorage.getItem('selectedPanelData');
    if (!panelDataStr) return null;
    return JSON.parse(panelDataStr);
}

// Function to retrieve battery data from localStorage
function getStoredBatteryData() {
    const batteryDataStr = localStorage.getItem('selectedBatteryData');
    if (!batteryDataStr) return null;
    return JSON.parse(batteryDataStr);
}

// Function to retrieve inverter data from localStorage
function getStoredInverterData() {
    const inverterDataStr = localStorage.getItem('selectedInverterData');
    if (!inverterDataStr) return null;
    return JSON.parse(inverterDataStr);
}

// Function to format numbers with commas for thousands
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to export system configuration to PDF
function exportToPDF() {
    // This would require a PDF generation library like jsPDF
    // For now, just show an alert
    alert('PDF export functionality will be implemented in the next version.');
}

// Add export button to the page
document.addEventListener('DOMContentLoaded', function() {
    // Create export button
    const exportButton = document.createElement('button');
    exportButton.id = 'export-pdf';
    exportButton.className = 'button button-primary';
    exportButton.textContent = 'Export Results to PDF';
    exportButton.addEventListener('click', exportToPDF);
    
    // Add button to economic content section
    const economicContent = document.getElementById('economic-content');
    if (economicContent) {
        const container = economicContent.querySelector('.container');
        if (container) {
            container.appendChild(exportButton);
        }
    }
});

// Add event listener for window resize to redraw charts
window.addEventListener('resize', function() {
    if (window.paybackChart) {
        window.paybackChart.resize();
    }
});