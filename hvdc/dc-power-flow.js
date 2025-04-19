/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Global variables for power flow calculations
let powerInjections = [];
let slackBusIndex = 0;
let busVoltages = [];
let lineFlows = [];

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    // Add power flow section to the form
    addPowerFlowInputs();
    
    // Add power flow tab to results
    addPowerFlowTab();
    
    // Modified bus selector to enforce 5 bus maximum for power flow
    const busCountInput = document.getElementById('bus-count');
    if (busCountInput) {
        busCountInput.max = "5";  // Limit to 5 buses maximum
        
        // If current value is more than 5, update it
        if (parseInt(busCountInput.value) > 5) {
            busCountInput.value = "5";
            updateBusConnections(5);
        }
    }
    
    // Update calculate button to include power flow calculations
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.removeEventListener('click', performCalculations);
        calculateBtn.addEventListener('click', function () {
            performCalculations();
        
            if (numberOfBuses <= 5) {
                performDCPowerFlow();
            } else {
                alert('Power flow calculations are limited to 5 buses. Please reduce the number of buses.');
            }
        });        
    }
});

/**
 * Add power flow inputs to the calculator form
 */
function addPowerFlowInputs() {
    // Create the power flow input section
    const powerFlowHtml = `
        <div class="form-section power-flow-section">
            <h3>DC Power Flow Parameters</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="slack-bus">Which bus will be the slack/reference?</label>
                    <select id="slack-bus">
                        <!-- Options will be populated based on number of buses -->
                    </select>
                </div>
            </div>
            <h4>Power Injections (MW)</h4>
            <div id="power-injections-container" class="power-injections">
                <!-- Power injection inputs will be populated based on number of buses -->
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="base-voltage">Base Voltage (kV):</label>
                    <input type="number" id="base-voltage" value="345" min="1">
                </div>
                <div class="form-group">
                    <label for="base-power">Base Power (MVA):</label>
                    <input type="number" id="base-power" value="100" min="1">
                </div>
            </div>
        </div>
    `;
    
    // Insert after the connection distances section
    const connectionSection = document.querySelector('.form-section:nth-of-type(3)');
    connectionSection.insertAdjacentHTML('afterend', powerFlowHtml);
    
    // Initial population of power injection inputs
    updatePowerFlowInputs(numberOfBuses);
}

/**
 * Add power flow results tab to the results section
 */
function addPowerFlowTab() {
    // Add power flow tab button
    const resultsTabs = document.querySelector('.results-tabs');
    if (resultsTabs && !document.querySelector('[data-tab="power-flow"]')) {
        resultsTabs.insertAdjacentHTML('beforeend', 
            '<button class="tab-btn" data-tab="power-flow">DC Power Flow</button>');
    }
    
    // Add power flow tab content
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection && !document.getElementById('power-flow-tab')) {
        resultsSection.insertAdjacentHTML('beforeend', `
            <div class="tab-content" id="power-flow-tab">
                <div class="matrix-container">
                    <h3 class="matrix-title">DC Power Flow Results</h3>
                    <div class="results-container">
                        <div class="result-block">
                            <h4>Bus Voltages</h4>
                            <div id="bus-voltages-container">
                                <p>Click "Calculate Matrices" to generate results</p>
                            </div>
                        </div>
                        <div class="result-block">
                            <h4>Line Flows</h4>
                            <div id="line-flows-container">
                                <p>Click "Calculate Matrices" to generate results</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Initialize tab functionality for the new tab
        setupTabs();
    }
}

/**
 * Update power flow inputs when the number of buses changes
 * @param {number} count - Number of buses
 */
function updatePowerFlowInputs(count) {
    // Validate max 5 buses for power flow
    if (count > 5) {
        count = 5;
        const busCountInput = document.getElementById('bus-count');
        if (busCountInput) {
            busCountInput.value = "5";
        }
    }
    
    // Update slack bus selector
    const slackBusSelect = document.getElementById('slack-bus');
    if (slackBusSelect) {
        slackBusSelect.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = busNames[i];
            slackBusSelect.appendChild(option);
        }
    }
    
    // Update power injection inputs
    const container = document.getElementById('power-injections-container');
    if (container) {
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const injectionHtml = `
                <div class="form-group">
                    <label for="power-injection-${i}">${busNames[i]}:</label>
                    <input type="number" id="power-injection-${i}" 
                    value="${i === 0 ? '' : (i % 2 === 0 ? '100' : '-100')}" 
                    step="1" 
                    ${i === parseInt(document.getElementById('slack-bus')?.value || 0) ? 'disabled' : ''}>
<span class="note">${i === parseInt(document.getElementById('slack-bus')?.value || 0) ? '(Slack Bus)' : ''}</span>

                </div>
            `;
            container.insertAdjacentHTML('beforeend', injectionHtml);
        }
        
        // Add event listener to slack bus select to update notes
        slackBusSelect.addEventListener('change', function () {
            const selectedIndex = parseInt(this.value);
        
            for (let i = 0; i < count; i++) {
                const input = document.getElementById(`power-injection-${i}`);
                const noteSpan = document.querySelector(`#power-injection-${i} + .note`);
        
                if (input) {
                    input.disabled = i === selectedIndex;
                }
        
                if (noteSpan) {
                    noteSpan.textContent = i === selectedIndex ? '(Slack Bus)' : '';
                }
            }
        });
        
    }
}

/**
 * Modified updateBusConnections function to include power flow input updates
 * @param {number} count - Number of buses
 */
const originalUpdateBusConnections = updateBusConnections;
updateBusConnections = function(count) {
    // Validate max 5 buses for power flow
    if (count > 5) {
        count = 5;
        alert('Power flow calculations are limited to a maximum of 5 buses.');
    }
    
    // Call the original function with validated count
    originalUpdateBusConnections(count);
    
    // Update power flow inputs
    updatePowerFlowInputs(count);
};

/**
 * Perform DC power flow calculations
 */
function performDCPowerFlow() {
    try {
        // Check if we have valid admittance matrix
        if (!currentAdmittanceMatrix || currentAdmittanceMatrix.length === 0) {
            throw new Error('Please calculate the admittance matrix first.');
        }
        
        // Check if number of buses is within limit
        if (numberOfBuses > 5) {
            throw new Error('Oops! DC power flow only supports up to 5 buses for now :(. Please reduce the number.');
        }
        
        // Get base values
        const baseVoltage = parseFloat(document.getElementById('base-voltage').value);
        const basePower = parseFloat(document.getElementById('base-power').value);
        
        if (isNaN(baseVoltage) || isNaN(basePower) || baseVoltage <= 0 || basePower <= 0) {
            throw new Error('Please enter valid positive values for base voltage and power.');
        }
        
        // Get slack bus index
        slackBusIndex = parseInt(document.getElementById('slack-bus').value);
        
        // Get power injections (in MW)
        powerInjections = [];
        for (let i = 0; i < numberOfBuses; i++) {
            if (i === slackBusIndex) {
                // Slack bus injection will be calculated later
                powerInjections.push(null);
            } else {
                const injectionElement = document.getElementById(`power-injection-${i}`);
                let injection = injectionElement ? parseFloat(injectionElement.value) : 0;
                
                // Convert from MW to per unit
                injection = injection / basePower;
                
                if (isNaN(injection)) {
                    injection = 0;
                }
                
                powerInjections.push(injection);
            }
        }
        
        // Calculate bus voltages (DC power flow uses phase angles)
        busVoltages = calculateDCVoltages(currentAdmittanceMatrix, powerInjections, slackBusIndex);
        
        // Calculate line flows
        lineFlows = calculateLineFlows(currentAdmittanceMatrix, busVoltages);
        
        // Calculate slack bus power injection
        let slackBusPower = 0;
        for (let i = 0; i < lineFlows.length; i++) {
            const flow = lineFlows[i];
            if (flow.from === slackBusIndex) {
                slackBusPower -= flow.power;
            } else if (flow.to === slackBusIndex) {
                slackBusPower += flow.power;
            }
        }
        
        // Update slack bus power injection
        powerInjections[slackBusIndex] = slackBusPower;
        
        // Display results
        displayBusVoltages(busVoltages, baseVoltage, basePower);
        displayLineFlows(lineFlows, basePower);
        
    } catch (error) {
        console.error('DC power flow error:', error);
        alert('An error occurred during DC power flow calculations: ' + error.message);
    }
}

/**
 * Calculate bus voltages (phase angles) using DC power flow method
 * @param {Array} admittanceMatrix - Full admittance matrix
 * @param {Array} powerInjections - Active power injections at buses
 * @param {number} slackBusIndex - Index of the slack bus
 * @returns {Array} Phase angles for each bus
 */
function calculateDCVoltages(admittanceMatrix, powerInjections, slackBusIndex) {
    // Create reduced matrices by removing slack bus row and column
    const numBuses = admittanceMatrix.length;
    const reducedB = [];
    const reducedP = [];
    
    // Create reduced admittance matrix and power vector
    for (let i = 0; i < numBuses; i++) {
        if (i !== slackBusIndex) {
            const row = [];
            for (let j = 0; j < numBuses; j++) {
                if (j !== slackBusIndex) {
                    row.push(admittanceMatrix[i][j]);
                }
            }
            reducedB.push(row);
            reducedP.push(powerInjections[i]);
        }
    }
    
    // Solve reduced system Bθ = P
    const reducedTheta = solveLinearSystem(reducedB, reducedP);
    
    // Reconstruct full voltage angles vector with slack bus = 0
    const theta = Array(numBuses).fill(0);
    let idx = 0;
    for (let i = 0; i < numBuses; i++) {
        if (i !== slackBusIndex) {
            theta[i] = reducedTheta[idx++];
        }
    }
    
    return theta;
}

/**
 * Solve a system of linear equations using Gaussian elimination with partial pivoting
 * @param {Array} A - Coefficient matrix
 * @param {Array} b - Right-hand side vector
 * @returns {Array} Solution vector
 */
function solveLinearSystem(A, b) {
    const n = A.length;
    
    // Create augmented matrix [A|b]
    const augmented = [];
    for (let i = 0; i < n; i++) {
        augmented.push([...A[i], b[i]]);
    }
    
    // Forward elimination with partial pivoting
    for (let k = 0; k < n - 1; k++) {
        // Find pivot
        let maxRow = k;
        let maxVal = Math.abs(augmented[k][k]);
        
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(augmented[i][k]) > maxVal) {
                maxVal = Math.abs(augmented[i][k]);
                maxRow = i;
            }
        }
        
        // Swap rows if needed
        if (maxRow !== k) {
            [augmented[k], augmented[maxRow]] = [augmented[maxRow], augmented[k]];
        }
        
        // Eliminate
        for (let i = k + 1; i < n; i++) {
            const factor = augmented[i][k] / augmented[k][k];
            for (let j = k; j <= n; j++) {
                augmented[i][j] -= factor * augmented[k][j];
            }
        }
    }
    
    // Back substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
            x[i] -= augmented[i][j] * x[j];
        }
        x[i] /= augmented[i][i];
    }
    
    return x;
}

/**
 * Calculate power flows on lines
 * @param {Array} admittanceMatrix - Admittance matrix
 * @param {Array} voltages - Bus voltages (phase angles)
 * @returns {Array} Line flows
 */
function calculateLineFlows(admittanceMatrix, voltages) {
    const flows = [];
    
    // Calculate flow on each active connection
    activeConnections.forEach(conn => {
        const from = conn.from;
        const to = conn.to;
        
        // Get susceptance (negative of off-diagonal element in admittance matrix)
        const susceptance = -admittanceMatrix[from][to];
        
        // Calculate power flow from bus i to bus j: Pij = (θi - θj) * Bij
        const angleFrom = voltages[from];
        const angleTo = voltages[to];
        const powerFlow = (angleFrom - angleTo) * susceptance;
        
        flows.push({
            from: from,
            to: to,
            fromName: busNames[from],
            toName: busNames[to],
            power: powerFlow
        });
    });
    
    return flows;
}

/**
 * Display bus voltages in a table
 * @param {Array} voltages - Bus voltage angles
 * @param {number} baseVoltage - Base voltage in kV
 * @param {number} basePower - Base power in MVA
 */
function displayBusVoltages(voltages, baseVoltage, basePower) {
    const container = document.getElementById('bus-voltages-container');
    
    // Create table to display voltages
    let tableHTML = '<table class="matrix-table">';
    tableHTML += '<tr><th>Bus</th><th>Angle (rad)</th><th>Angle (deg)</th><th>Power Injection (MW)</th></tr>';
    
    // Add each bus with its voltage
    for (let i = 0; i < voltages.length; i++) {
        const angle = voltages[i];
        const angleDeg = angle * (180 / Math.PI);
        const powerMW = powerInjections[i] * basePower;
        
        tableHTML += `<tr>
            <td>${busNames[i]}${i === slackBusIndex ? ' (Slack)' : ''}</td>
            <td>${formatNumber(angle)}</td>
            <td>${formatNumber(angleDeg)}</td>
            <td>${formatNumber(powerMW)}</td>
        </tr>`;
    }
    
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
}

/**
 * Display line flows in a table
 * @param {Array} flows - Line flows
 * @param {number} basePower - Base power in MVA
 */
function displayLineFlows(flows, basePower) {
    const container = document.getElementById('line-flows-container');
    
    // Create table to display line flows
    let tableHTML = '<table class="matrix-table">';
    tableHTML += '<tr><th>From</th><th>To</th><th>Power Flow (MW)</th></tr>';
    
    // Add each line with its flow
    flows.forEach(flow => {
        const powerMW = flow.power * basePower;
        
        tableHTML += `<tr>
            <td>${flow.fromName}</td>
            <td>${flow.toName}</td>
            <td>${formatNumber(powerMW)}</td>
        </tr>`;
    });
    
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
}

/**
 * Add power flow visualization to the network graph
 */
function renderNetworkGraph() {
    // Call the original function first
    const originalRenderNetworkGraph = window.originalRenderNetworkGraph || renderNetworkGraph;
    
    // Store original function if not already stored
    if (!window.originalRenderNetworkGraph) {
        window.originalRenderNetworkGraph = renderNetworkGraph;
    }
    
    // Call original implementation
    originalRenderNetworkGraph();
    
    // Check if we have power flow results to display
    if (!lineFlows || lineFlows.length === 0) {
        return;
    }
    
    const container = document.getElementById('graph-container');
    const svg = container.querySelector('svg');
    
    // Add power flow arrows and labels to existing links
    const linksGroup = container.querySelector('.links');
    lineFlows.forEach(flow => {
        // Find nodes
        const nodes = [];
        container.querySelectorAll('.nodes circle').forEach((circle, index) => {
            nodes.push({
                id: index,
                x: parseFloat(circle.getAttribute('cx')),
                y: parseFloat(circle.getAttribute('cy'))
            });
        });
        
        // Get node positions
        const sourceNode = nodes[flow.from];
        const targetNode = nodes[flow.to];
        
        // Calculate midpoint for label
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        // Calculate direction vector
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;
        
        // Calculate arrow start/end points (offset slightly from nodes)
        const nodeRadius = 10; // Same as in the original function
        const startX = sourceNode.x + unitX * nodeRadius;
        const startY = sourceNode.y + unitY * nodeRadius;
        const endX = targetNode.x - unitX * nodeRadius;
        const endY = targetNode.y - unitY * nodeRadius;
        
        // Determine arrow direction and color based on power flow
        const powerMW = flow.power * parseFloat(document.getElementById('base-power').value);
        const isPositive = powerMW >= 0;
        const absFlow = Math.abs(powerMW);
        
        // Calculate arrow size based on flow magnitude
        const maxFlow = Math.max(...lineFlows.map(f => 
            Math.abs(f.power) * parseFloat(document.getElementById('base-power').value)));
        const minArrowSize = 5;
        const maxArrowSize = 15;
        const arrowSize = minArrowSize + (absFlow / maxFlow) * (maxArrowSize - minArrowSize);
        
        // Use existing line to get coordinates
        const existingLine = Array.from(linksGroup.querySelectorAll('line')).find(line => {
            return (parseFloat(line.getAttribute('x1')) === sourceNode.x && 
                   parseFloat(line.getAttribute('y1')) === sourceNode.y &&
                   parseFloat(line.getAttribute('x2')) === targetNode.x &&
                   parseFloat(line.getAttribute('y2')) === targetNode.y) ||
                  (parseFloat(line.getAttribute('x2')) === sourceNode.x && 
                   parseFloat(line.getAttribute('y2')) === sourceNode.y &&
                   parseFloat(line.getAttribute('x1')) === targetNode.x &&
                   parseFloat(line.getAttribute('y1')) === targetNode.y);
        });
        
        if (existingLine) {
            // Create arrow marker definition if not already created
            let marker = svg.querySelector(`#arrow-${isPositive ? 'pos' : 'neg'}`);
            if (!marker) {
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', `arrow-${isPositive ? 'pos' : 'neg'}`);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '10');
                marker.setAttribute('refX', '9');
                marker.setAttribute('refY', '3');
                marker.setAttribute('orient', 'auto');
                marker.setAttribute('markerUnits', 'strokeWidth');
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
                path.setAttribute('fill', isPositive ? '#28a745' : '#dc3545');
                
                marker.appendChild(path);
                defs.appendChild(marker);
                svg.insertBefore(defs, svg.firstChild);
            }
            
            // Create flow line with arrow
            const flowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            flowLine.setAttribute('x1', isPositive ? startX : endX);
            flowLine.setAttribute('y1', isPositive ? startY : endY);
            flowLine.setAttribute('x2', isPositive ? endX : startX);
            flowLine.setAttribute('y2', isPositive ? endY : startY);
            flowLine.setAttribute('stroke', isPositive ? '#28a745' : '#dc3545');
            flowLine.setAttribute('stroke-width', arrowSize);
            flowLine.setAttribute('stroke-dasharray', '5,5');
            flowLine.setAttribute('marker-end', `url(#arrow-${isPositive ? 'pos' : 'neg'})`);
            flowLine.setAttribute('opacity', '0.7');
            
            // Create flow label
            const flowText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            flowText.setAttribute('x', midX);
            flowText.setAttribute('y', midY - 10);
            flowText.setAttribute('text-anchor', 'middle');
            flowText.setAttribute('fill', isPositive ? '#28a745' : '#dc3545');
            flowText.setAttribute('font-weight', 'bold');
            flowText.textContent = `${formatNumber(absFlow)} MW`;
            
            // Add directional indication
            const dirText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            dirText.setAttribute('x', midX);
            dirText.setAttribute('y', midY + 10);
            dirText.setAttribute('text-anchor', 'middle');
            dirText.setAttribute('fill', isPositive ? '#28a745' : '#dc3545');
            dirText.textContent = isPositive ? 
                `${flow.fromName} → ${flow.toName}` : 
                `${flow.toName} → ${flow.fromName}`;
            
            linksGroup.appendChild(flowLine);
            svg.querySelector('g').appendChild(flowText);
            svg.querySelector('g').appendChild(dirText);
        }
    });
    
    // Add to legend
    const legend = svg.querySelector('g > g:last-child');
    if (legend) {
        // Add power flow legend items
        const posFlowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        posFlowLine.setAttribute('x1', 0);
        posFlowLine.setAttribute('y1', 60);
        posFlowLine.setAttribute('x2', 20);
        posFlowLine.setAttribute('y2', 60);
        posFlowLine.setAttribute('stroke', '#28a745');
        posFlowLine.setAttribute('stroke-width', 2);
        posFlowLine.setAttribute('stroke-dasharray', '5,5');
        
        const posFlowText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        posFlowText.setAttribute('x', 25);
        posFlowText.setAttribute('y', 64);
        posFlowText.textContent = 'Positive Flow';
        
        const negFlowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        negFlowLine.setAttribute('x1', 0);
        negFlowLine.setAttribute('y1', 80);
        negFlowLine.setAttribute('x2', 20);
        negFlowLine.setAttribute('y2', 80);
        negFlowLine.setAttribute('stroke', '#dc3545');
        negFlowLine.setAttribute('stroke-width', 2);
        negFlowLine.setAttribute('stroke-dasharray', '5,5');
        
        const negFlowText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        negFlowText.setAttribute('x', 25);
        negFlowText.setAttribute('y', 84);
        negFlowText.textContent = 'Negative Flow';
        
        legend.appendChild(posFlowLine);
        legend.appendChild(posFlowText);
        legend.appendChild(negFlowLine);
        legend.appendChild(negFlowText);
    }
}

// Add styles for the power flow section
const styleElement = document.createElement('style');
styleElement.textContent = `
.power-flow-section .power-injections {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
}

.power-flow-section .note {
    font-size: 0.8em;
    color: #666;
    margin-left: 5px;
}

.results-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

@media (max-width: 768px) {
    .results-container {
        grid-template-columns: 1fr;
    }
}

/* Colors for power flows */
.positive-flow {
    color: #28a745;
}

.negative-flow {
    color: #dc3545;
}
`;
document.head.appendChild(styleElement);