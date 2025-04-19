// Economic Analysis JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize economic analysis section
    initEconomicAnalysis();
});

// Function to initialize the economic analysis section
function initEconomicAnalysis() {
    const economicContent = document.getElementById('economic-content');
    if (!economicContent) return;
    
    // Get the container for the economic analysis
    const container = economicContent.querySelector('.container');
    if (!container) return;
    
    // Replace placeholder content with actual economic analysis UI
    container.innerHTML = `
        <h2>Techno-Economical Analysis</h2>
        <p>Enter project parameters and explore the economic viability of your wind power plant.</p>
        
        <div class="economic-content-wrapper">
            <div class="economic-inputs-container">
                <h3>Project Parameters</h3>
                <div class="input-group">
                    <label for="project-lifetime">Project Lifetime (years)</label>
                    <input type="number" id="project-lifetime" value="25" min="1" max="40">
                </div>
                <div class="input-group">
                    <label for="discount-rate">Discount Rate (%)</label>
                    <input type="number" id="discount-rate" value="7" min="0" max="20" step="0.1">
                </div>
                <div class="input-group">
                    <label for="electricity-price">Electricity Price ($/MWh)</label>
                    <input type="number" id="electricity-price" value="70" min="0" max="500">
                </div>
                <div class="input-group">
                    <label for="number-turbines">Number of Turbines</label>
                    <input type="number" id="number-turbines" value="10" min="1" max="200">
                </div>
                <div class="input-group">
                    <label for="capacity-factor">Capacity Factor Override (%)</label>
                    <input type="number" id="capacity-factor" value="" min="0" max="100" placeholder="Calculated automatically">
                </div>
                <div class="input-group">
                    <label for="opex-percent">Annual OPEX (% of CAPEX)</label>
                    <input type="number" id="opex-percent" value="2" min="0" max="10" step="0.1">
                </div>
                <div class="input-group">
                    <label for="installation-cost">Installation Cost Multiplier</label>
                    <input type="number" id="installation-cost" value="1.5" min="1" max="3" step="0.1">
                </div>
                
                <button id="calculate-economics" class="button button-primary">Calculate Economics</button>
            </div>
            
            <div class="economic-results-container" id="economic-results">
                <div class="selected-inputs-summary">
                    <h3>Project Summary</h3>
                    <div id="project-summary" class="summary-grid">
                        <!-- Project summary will be added here -->
                    </div>
                </div>
                
                <div class="key-results">
                    <h3>Key Economic Indicators</h3>
                    <div class="results-cards" id="key-results-cards">
                        <!-- Results cards will be added here -->
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>Cash Flow Analysis</h3>
                    <div class="chart-container">
                        <canvas id="cashflow-chart"></canvas>
                    </div>
                </div>
                
                <div class="sensitivity-section">
                    <h3>Sensitivity Analysis</h3>
                    <div class="sensitivity-controls">
                        <label for="sensitivity-param">Parameter:</label>
                        <select id="sensitivity-param">
                            <option value="electricity-price">Electricity Price</option>
                            <option value="discount-rate">Discount Rate</option>
                            <option value="capacity-factor">Capacity Factor</option>
                            <option value="opex-percent">OPEX</option>
                        </select>
                        <button id="run-sensitivity" class="button button-secondary">Run Analysis</button>
                    </div>
                    <div class="chart-container">
                        <canvas id="sensitivity-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add CSS for economic analysis
    addEconomicStyles();
    
    // Initially hide results container
    document.getElementById('economic-results').style.display = 'none';
    
    // Add event listener for calculate button
    document.getElementById('calculate-economics').addEventListener('click', calculateEconomics);
    
    // Add event listener for sensitivity analysis
    document.getElementById('run-sensitivity').addEventListener('click', runSensitivityAnalysis);
}

// Function to add economic analysis styles
function addEconomicStyles() {
    if (document.getElementById('economic-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'economic-styles';
    styles.innerHTML = `
        .economic-content-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            margin-top: 20px;
        }
        
        .economic-inputs-container {
            flex: 1;
            min-width: 300px;
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .economic-results-container {
            flex: 2;
            min-width: 500px;
        }
        
        .input-group {
            margin-bottom: 15px;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .input-group input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .selected-inputs-summary {
            background-color: #f0f7ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }
        
        .summary-item {
            padding: 8px;
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .summary-item .label {
            font-size: 12px;
            color: #666;
        }
        
        .summary-item .value {
            font-size: 16px;
            font-weight: 500;
            color: #333;
        }
        
        .results-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .result-card {
            background-color: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .result-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        .result-card .value {
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0;
        }
        
        .result-card .label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .result-card .description {
            font-size: 12px;
            color: #888;
        }
        
        .chart-section, .sensitivity-section {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 25px;
        }
        
        .chart-container {
            height: 300px;
            margin-top: 15px;
        }
        
        .sensitivity-controls {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .sensitivity-controls select {
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .positive-value {
            color: #34C759;
        }
        
        .negative-value {
            color: #FF3B30;
        }
    `;
    
    document.head.appendChild(styles);
}

// Function to calculate economic metrics
function calculateEconomics() {
    // Get input values
    const projectLifetime = parseInt(document.getElementById('project-lifetime').value);
    const discountRate = parseFloat(document.getElementById('discount-rate').value) / 100;
    const electricityPrice = parseFloat(document.getElementById('electricity-price').value);
    const numberOfTurbines = parseInt(document.getElementById('number-turbines').value);
    const capacityFactorOverride = document.getElementById('capacity-factor').value 
        ? parseFloat(document.getElementById('capacity-factor').value) / 100 
        : null;
    const opexPercent = parseFloat(document.getElementById('opex-percent').value) / 100;
    const installationMultiplier = parseFloat(document.getElementById('installation-cost').value);
    
    // Get selected turbine data
    const selectedTurbine = JSON.parse(localStorage.getItem('selectedTurbine'));
    if (!selectedTurbine) {
        alert('Please select a wind turbine first in the turbine selection tab.');
        return;
    }
    
    // Get wind data
    const windData = window.globalWindData;
    if (!windData && !capacityFactorOverride) {
        alert('Please select a location and get wind data first in the location tab, or provide a capacity factor override.');
        return;
    }
    
    // Calculate capacity factor based on wind data and power curve
    let capacityFactor = capacityFactorOverride;
    let annualEnergyProduction = 0;
    
    if (!capacityFactorOverride && windData) {
        const { aep, cf } = calculateAEP(windData, selectedTurbine.powerCurve);
        capacityFactor = cf;
        annualEnergyProduction = aep;
    } else {
        // Use provided capacity factor
        const ratedPower = parseFloat(selectedTurbine.specs["Rated Power"].split(' ')[0]); // in MW
        annualEnergyProduction = capacityFactor * ratedPower * 8760; // MWh per year
    }
    
    // Total project AEP
    const totalAEP = annualEnergyProduction * numberOfTurbines; // MWh per year
    
    // Calculate capital expenditure (CAPEX)
    const turbinePrice = parseInt(selectedTurbine.specs.Price);
    const totalTurbineCost = turbinePrice * numberOfTurbines;
    const installationCost = totalTurbineCost * (installationMultiplier - 1);
    const totalCapex = totalTurbineCost + installationCost;
    
    // Calculate annual operational expenditure (OPEX)
    const annualOpex = totalCapex * opexPercent;
    
    // Calculate annual revenue
    const annualRevenue = totalAEP * electricityPrice;
    
    // Calculate cash flow for each year
    const cashFlows = [];
    let cumulativeCashFlow = -totalCapex;
    cashFlows.push(cumulativeCashFlow); // Initial investment (year 0)
    
    for (let year = 1; year <= projectLifetime; year++) {
        const yearlyOperatingCashFlow = annualRevenue - annualOpex;
        cumulativeCashFlow += yearlyOperatingCashFlow;
        cashFlows.push(yearlyOperatingCashFlow);
    }
    
    // Calculate Net Present Value (NPV)
    const npv = calculateNPV(cashFlows, discountRate);
    
    // Calculate Internal Rate of Return (IRR)
    const irr = calculateIRR(cashFlows);
    
    // Calculate Levelized Cost of Energy (LCOE)
    const lcoe = calculateLCOE(totalCapex, annualOpex, totalAEP, projectLifetime, discountRate);
    
    // Calculate simple payback period
    const yearlyOperatingCashFlow = annualRevenue - annualOpex;
    const simplePayback = totalCapex / yearlyOperatingCashFlow;
    
    // Calculate discounted payback period
    const discountedPayback = calculateDiscountedPayback(totalCapex, yearlyOperatingCashFlow, discountRate);
    
    // Update project summary
    updateProjectSummary({
        turbineName: selectedTurbine.model,
        manufacturer: selectedTurbine.manufacturer,
        ratedPower: selectedTurbine.specs["Rated Power"],
        numberOfTurbines: numberOfTurbines,
        totalCapacity: (parseFloat(selectedTurbine.specs["Rated Power"].split(' ')[0]) * numberOfTurbines).toFixed(1) + ' MW',
        capacityFactor: (capacityFactor * 100).toFixed(1) + '%',
        annualEnergy: Math.round(totalAEP).toLocaleString() + ' MWh/year',
        projectLifetime: projectLifetime + ' years',
        discountRate: (discountRate * 100).toFixed(1) + '%',
        electricityPrice: '$' + electricityPrice.toFixed(2) + '/MWh'
    });
    
    // Update key results
    updateKeyResults({
        capex: totalCapex,
        opexAnnual: annualOpex,
        revenueAnnual: annualRevenue,
        npv: npv,
        irr: irr * 100, // convert to percentage
        lcoe: lcoe,
        simplePayback: simplePayback,
        discountedPayback: discountedPayback
    });
    
    // Create cash flow chart
    createCashFlowChart(cashFlows, projectLifetime);
    
    // Show results
    document.getElementById('economic-results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('economic-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Function to calculate Annual Energy Production (AEP) and Capacity Factor (CF)
function calculateAEP(windData, powerCurve) {
    // Get Weibull parameters
    const a = parseFloat(windData.weibullA); // Scale parameter (m/s)
    const k = parseFloat(windData.weibullK); // Shape parameter
    
    // Generate wind speed range (0-30 m/s with 0.5 m/s increments)
    const windSpeeds = Array.from({length: 61}, (_, i) => i * 0.5);
    
    // Calculate hours per year at each wind speed
    const hoursPerYear = windSpeeds.map(v => weibullPdf(v, a, k) * 8760);
    
    // Get rated power in kW
    const ratedPower = Math.max(...powerCurve.map(point => point.power));
    
    // Interpolate power curve to match our wind speed array
    const interpolatedPowerCurve = interpolatePowerCurve(powerCurve, windSpeeds);
    
    // Calculate energy production for each wind speed bin
    let totalEnergyProduction = 0;
    for (let i = 0; i < windSpeeds.length; i++) {
        const power = interpolatedPowerCurve[i]; // power in kW
        const hours = hoursPerYear[i];
        const energy = power * hours / 1000; // Convert to MWh
        totalEnergyProduction += energy;
    }
    
    // Calculate capacity factor
    const capacityFactor = totalEnergyProduction / (ratedPower * 8760 / 1000);
    
    return {
        aep: totalEnergyProduction,
        cf: capacityFactor
    };
}

// Weibull probability density function
function weibullPdf(v, a, k) {
    if (v < 0) return 0;
    return (k / a) * Math.pow(v / a, k - 1) * Math.exp(-Math.pow(v / a, k));
}

// Function to interpolate power curve
function interpolatePowerCurve(powerCurve, windSpeeds) {
    const result = [];
    
    for (const windSpeed of windSpeeds) {
        // Find the power output for this wind speed
        // First, check if we have an exact match
        const exactMatch = powerCurve.find(point => point.windSpeed === windSpeed);
        if (exactMatch) {
            result.push(exactMatch.power);
            continue;
        }
        
        // If not, interpolate
        // Find the two closest points
        let lowerPoint = null;
        let upperPoint = null;
        
        for (const point of powerCurve) {
            if (point.windSpeed <= windSpeed && (!lowerPoint || point.windSpeed > lowerPoint.windSpeed)) {
                lowerPoint = point;
            }
            if (point.windSpeed >= windSpeed && (!upperPoint || point.windSpeed < upperPoint.windSpeed)) {
                upperPoint = point;
            }
        }
        
        // If we're below or above the defined range, use boundary values
        if (!lowerPoint) {
            result.push(0); // Below cut-in speed
            continue;
        }
        if (!upperPoint) {
            result.push(0); // Above cut-out speed
            continue;
        }
        
        // Interpolate linearly between the two points
        const t = (windSpeed - lowerPoint.windSpeed) / (upperPoint.windSpeed - lowerPoint.windSpeed);
        const interpolatedPower = lowerPoint.power + t * (upperPoint.power - lowerPoint.power);
        result.push(interpolatedPower);
    }
    
    return result;
}

// Function to calculate Net Present Value (NPV)
function calculateNPV(cashFlows, discountRate) {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + discountRate, i);
    }
    return npv;
}

// Function to calculate Internal Rate of Return (IRR)
function calculateIRR(cashFlows) {
    // Simple IRR approximation using trial and error
    let irr = 0.1; // Start with 10%
    const step = 0.001; // 0.1% steps
    const tolerance = 1; // $1 tolerance
    
    // Try different rates until NPV is close to zero
    for (let i = 0; i < 1000; i++) { // Limit iterations
        const npv = calculateNPV(cashFlows, irr);
        
        if (Math.abs(npv) < tolerance) {
            break;
        }
        
        if (npv > 0) {
            irr += step;
        } else {
            irr -= step;
            break;
        }
    }
    
    return irr;
}

// Function to calculate Levelized Cost of Energy (LCOE)
function calculateLCOE(capex, annualOpex, annualEnergy, years, discountRate) {
    let presentValueCosts = capex;
    let presentValueEnergy = 0;
    
    for (let year = 1; year <= years; year++) {
        presentValueCosts += annualOpex / Math.pow(1 + discountRate, year);
        presentValueEnergy += annualEnergy / Math.pow(1 + discountRate, year);
    }
    
    return presentValueCosts / presentValueEnergy;
}

// Function to calculate discounted payback period
function calculateDiscountedPayback(initialInvestment, annualCashFlow, discountRate) {
    let cumulativePV = -initialInvestment;
    let year = 0;
    
    while (cumulativePV < 0 && year < 100) { // 100 year limit
        year++;
        const pv = annualCashFlow / Math.pow(1 + discountRate, year);
        cumulativePV += pv;
    }
    
    if (cumulativePV < 0) {
        return Infinity; // Never pays back
    }
    
    // Calculate fractional year for more accuracy
    const previousYearCumulativePV = cumulativePV - (annualCashFlow / Math.pow(1 + discountRate, year));
    const fraction = -previousYearCumulativePV / (cumulativePV - previousYearCumulativePV);
    
    return year - 1 + fraction;
}

// Function to update project summary
function updateProjectSummary(data) {
    const container = document.getElementById('project-summary');
    container.innerHTML = '';
    
    for (const [key, value] of Object.entries(data)) {
        const item = document.createElement('div');
        item.className = 'summary-item';
        
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = formatLabel(key);
        
        const valueEl = document.createElement('div');
        valueEl.className = 'value';
        valueEl.textContent = value;
        
        item.appendChild(label);
        item.appendChild(valueEl);
        container.appendChild(item);
    }
}

// Function to update key results
function updateKeyResults(data) {
    const container = document.getElementById('key-results-cards');
    container.innerHTML = '';
    
    // Format and display each key result
    addResultCard(container, 'Total CAPEX', formatCurrency(data.capex), 'Total capital expenditure');
    addResultCard(container, 'Annual OPEX', formatCurrency(data.opexAnnual), 'Annual operating expenses');
    addResultCard(container, 'Annual Revenue', formatCurrency(data.revenueAnnual), 'Yearly revenue from electricity sales');
    
    addResultCard(container, 'Net Present Value', formatCurrency(data.npv), 
                 'Present value of future cash flows minus initial investment', 
                 data.npv >= 0 ? 'positive-value' : 'negative-value');
    
    addResultCard(container, 'Internal Rate of Return', data.irr.toFixed(1) + '%', 
                 'Discount rate that makes NPV zero', 
                 data.irr >= 0 ? 'positive-value' : 'negative-value');
    
    addResultCard(container, 'Levelized Cost of Energy', '$' + data.lcoe.toFixed(2) + '/MWh', 
                 'Average cost per MWh over project lifetime');
    
    addResultCard(container, 'Simple Payback', data.simplePayback.toFixed(1) + ' years', 
                 'Years to recover initial investment without discounting');
    
    addResultCard(container, 'Discounted Payback', data.discountedPayback.toFixed(1) + ' years', 
                 'Years to recover initial investment with discounting');
}

// Helper function to add a result card
function addResultCard(container, label, value, description, valueClass = '') {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = label;
    
    const valueEl = document.createElement('div');
    valueEl.className = 'value ' + valueClass;
    valueEl.textContent = value;
    
    const descEl = document.createElement('div');
    descEl.className = 'description';
    descEl.textContent = description;
    
    card.appendChild(labelEl);
    card.appendChild(valueEl);
    card.appendChild(descEl);
    
    container.appendChild(card);
}

// Function to create cash flow chart
function createCashFlowChart(cashFlows, projectLifetime) {
    const ctx = document.getElementById('cashflow-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.cashFlowChart) {
        window.cashFlowChart.destroy();
    }
    
    // Calculate cumulative cash flow
    const cumulativeCashFlow = [];
    let runningTotal = 0;
    for (const cf of cashFlows) {
        runningTotal += cf;
        cumulativeCashFlow.push(runningTotal);
    }
    
    // Create year labels
    const years = Array.from({length: cashFlows.length}, (_, i) => 'Year ' + i);
    
    // Create the chart
    window.cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Cash Flow',
                    data: cashFlows,
                    backgroundColor: function(context) {
                        const index = context.dataIndex;
                        return index === 0 || cashFlows[index] < 0 ? 'rgba(255, 59, 48, 0.7)' : 'rgba(52, 199, 89, 0.7)';
                    },
                    borderColor: function(context) {
                        const index = context.dataIndex;
                        return index === 0 || cashFlows[index] < 0 ? 'rgba(255, 59, 48, 1)' : 'rgba(52, 199, 89, 1)';
                    },
                    borderWidth: 1
                },
                {
                    label: 'Cumulative Cash Flow',
                    data: cumulativeCashFlow,
                    type: 'line',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Annual Cash Flow ($)',
                        font: {
                            family: 'SF Pro Display'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'SF Pro Display'
                        },
                        callback: function(value) {
                            return formatCurrencyAxis(value);
                        }
                    }
                },
                y1: {
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cumulative Cash Flow ($)',
                        font: {
                            family: 'SF Pro Display'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'SF Pro Display'
                        },
                        callback: function(value) {
                            return formatCurrencyAxis(value);
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Project Year',
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
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Function to run sensitivity analysis
function runSensitivityAnalysis() {
    const parameter = document.getElementById('sensitivity-param').value;
    const ctx = document.getElementById('sensitivity-chart').getContext('2d');
    
    // Get base values from form
    const baseDiscountRate = parseFloat(document.getElementById('discount-rate').value) / 100;
    const baseElectricityPrice = parseFloat(document.getElementById('electricity-price').value);
    const baseCapacityFactor = document.getElementById('capacity-factor').value 
        ? parseFloat(document.getElementById('capacity-factor').value) / 100 
        : 0.35; // Default if not specified
    const baseOpexPercent = parseFloat(document.getElementById('opex-percent').value) / 100;
    
    // Define variation range (-50% to +50% in 10% increments)
    const variations = [-0.5, -0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5];
    
    // Initialize result arrays
    const npvResults = [];
    const irrResults = [];
    const lcoeResults = [];
    const xLabels = [];
    
    // Store original form values
    const originalValues = {
        discountRate: document.getElementById('discount-rate').value,
        electricityPrice: document.getElementById('electricity-price').value,
        capacityFactor: document.getElementById('capacity-factor').value,
        opexPercent: document.getElementById('opex-percent').value,
    };
    
// Calculate for each variation
for (const variation of variations) {
    let paramValue;
    let paramLabel;
    
    // Set the parameter value based on selected parameter
    if (parameter === 'discount-rate') {
        paramValue = baseDiscountRate * (1 + variation);
        document.getElementById('discount-rate').value = (paramValue * 100).toFixed(1);
        paramLabel = (paramValue * 100).toFixed(1) + '%';
    } else if (parameter === 'electricity-price') {
        paramValue = baseElectricityPrice * (1 + variation);
        document.getElementById('electricity-price').value = paramValue.toFixed(2);
        paramLabel = '$' + paramValue.toFixed(0) + '/MWh';
    } else if (parameter === 'capacity-factor') {
        paramValue = baseCapacityFactor * (1 + variation);
        document.getElementById('capacity-factor').value = (paramValue * 100).toFixed(1);
        paramLabel = (paramValue * 100).toFixed(1) + '%';
    } else if (parameter === 'opex-percent') {
        paramValue = baseOpexPercent * (1 + variation);
        document.getElementById('opex-percent').value = (paramValue * 100).toFixed(1);
        paramLabel = (paramValue * 100).toFixed(1) + '%';
    }
    
    // Run the calculation
    calculateEconomics();
    
    // Get the results
    const resultCards = document.querySelectorAll('.result-card');
    
    // Extract NPV, IRR, and LCOE values
    let npv, irr, lcoe;
    
    resultCards.forEach(card => {
        const label = card.querySelector('.label').textContent;
        const value = card.querySelector('.value').textContent;
        
        if (label === 'Net Present Value') {
            // Extract numeric value from currency format
            npv = parseFloat(value.replace(/[^0-9.-]+/g, ''));
            npvResults.push(npv);
        } else if (label === 'Internal Rate of Return') {
            // Extract numeric value from percentage format
            irr = parseFloat(value.replace('%', ''));
            irrResults.push(irr);
        } else if (label === 'Levelized Cost of Energy') {
            // Extract numeric value from $/MWh format
            lcoe = parseFloat(value.replace(/[^0-9.-]+/g, ''));
            lcoeResults.push(lcoe);
        }
    });
    
    // Add label to x-axis
    xLabels.push(paramLabel);
}

// Restore original form values
document.getElementById('discount-rate').value = originalValues.discountRate;
document.getElementById('electricity-price').value = originalValues.electricityPrice;
document.getElementById('capacity-factor').value = originalValues.capacityFactor;
document.getElementById('opex-percent').value = originalValues.opexPercent;

// Create sensitivity chart
createSensitivityChart(ctx, parameter, xLabels, npvResults, irrResults, lcoeResults);
}

// Function to create sensitivity analysis chart
function createSensitivityChart(ctx, parameter, xLabels, npvValues, irrValues, lcoeValues) {
    // Destroy previous chart if it exists
    if (window.sensitivityChart) {
        window.sensitivityChart.destroy();
    }
    
    // Normalize values for better visualization
    const normalizeValues = (values) => {
        const baseIndex = Math.floor(values.length / 2); // Middle value is the base case
        const baseValue = values[baseIndex];
        return values.map(value => ((value - baseValue) / Math.abs(baseValue)) * 100);
    };
    
    const normalizedNpv = normalizeValues(npvValues);
    const normalizedIrr = normalizeValues(irrValues);
    const normalizedLcoe = normalizeValues(lcoeValues);
    
    // Get parameter name for display
    let parameterName;
    switch (parameter) {
        case 'discount-rate':
            parameterName = 'Discount Rate';
            break;
        case 'electricity-price':
            parameterName = 'Electricity Price';
            break;
        case 'capacity-factor':
            parameterName = 'Capacity Factor';
            break;
        case 'opex-percent':
            parameterName = 'OPEX';
            break;
        default:
            parameterName = 'Parameter';
    }
    
    // Create chart
    window.sensitivityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [
                {
                    label: 'NPV',
                    data: normalizedNpv,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.1,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)'
                },
                {
                    label: 'IRR',
                    data: normalizedIrr,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.1,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(46, 204, 113, 1)'
                },
                {
                    label: 'LCOE',
                    data: normalizedLcoe,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.1,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(231, 76, 60, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Percent Change from Base Case (%)',
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
                x: {
                    title: {
                        display: true,
                        text: parameterName,
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
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(1) + '% change';
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    labels: {
                        font: {
                            family: 'SF Pro Display'
                        }
                    }
                }
            }
        }
    });
}

// Helper function to format currency
function formatCurrency(value) {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(2) + 'k';
    } else {
        return '$' + value.toFixed(2);
    }
}

// Helper function to format currency for chart axes
function formatCurrencyAxis(value) {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'k';
    } else {
        return '$' + value.toFixed(0);
    }
}

// Helper function to format labels
function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
        .replace(/-/g, ' ') // Replace hyphens with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim();
}