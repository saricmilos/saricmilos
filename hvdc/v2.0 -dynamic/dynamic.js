/**
 * Power Grid Matrix Calculator
 * This script calculates resistance and admittance matrices for electrical grid analysis
 * Based on MATLAB implementation by Milos Saric
 * Modified to allow user selection of number of buses
 */

// Define bus names for reference
const busNames = [
    'Lleida', 'Tarragona', 'Barcelona', 'Girona',
    'Santa Llogaia', 'Baixas', 'Perpignan', 'Montpellier',
    'Toulouse', 'Bordeaux'
];

// Define connections for calculations
const allConnections = [
    { from: 0, to: 3, distanceId: 'd1_4', key: 'b1_4' }, // Lleida - Girona
    { from: 1, to: 2, distanceId: 'd2_3', key: 'b2_3' }, // Tarragona - Barcelona
    { from: 2, to: 3, distanceId: 'd3_4', key: 'b3_4' }, // Barcelona - Girona
    { from: 3, to: 4, distanceId: 'd4_5', key: 'b4_5' }, // Girona - Santa Llogaia
    { from: 4, to: 5, distanceId: 'd5_6', key: 'b5_6' }, // Santa Llogaia - Baixas
    { from: 5, to: 6, distanceId: 'd6_7', key: 'b6_7' }, // Baixas - Perpignan
    { from: 5, to: 7, distanceId: 'd6_8', key: 'b6_8' }, // Baixas - Montpellier
    { from: 5, to: 8, distanceId: 'd6_9', key: 'b6_9' }, // Baixas - Toulouse
    { from: 8, to: 9, distanceId: 'd9_10', key: 'b9_10' }, // Toulouse - Bordeaux
    { from: 7, to: 9, distanceId: 'd8_10', key: 'b8_10' } // Montpellier - Bordeaux
];

// Global variable to store active connections based on number of buses
let activeConnections = [];
// Global variable to store the number of buses
let numberOfBuses = 10;
// Global variables to store calculation results for graph display
let currentResistances = {};
let currentAdmittanceMatrix = [];

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    // Update the current year in the footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Add bus selector at the beginning
    addBusSelector();
    
    // Add event listener to calculate button
    document.getElementById('calculate-btn').addEventListener('click', performCalculations);
    
    // Add tab functionality
    setupTabs();
    
    // Add mobile menu toggle functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Initialize with default number of buses
    updateBusConnections(10);
});

/**
 * Adds bus selector to the top of the form
 */
function addBusSelector() {
    // Create the bus selector section
    const selectorHtml = `
        <div class="form-section bus-selector-section">
            <h3>Number of Buses</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="bus-count">Select Number of Buses (2-10):</label>
                    <input type="number" id="bus-count" min="2" max="10" value="10" step="1">
                </div>
                <div class="form-group">
                    <button id="update-buses-btn" class="button">Update Connections</button>
                </div>
            </div>
        </div>
    `;
    
    // Insert at the top of the calculator form
    const calculatorForm = document.querySelector('.calculator-form');
    calculatorForm.insertAdjacentHTML('afterbegin', selectorHtml);
    
    // Add event listener to update button
    document.getElementById('update-buses-btn').addEventListener('click', function() {
        const count = parseInt(document.getElementById('bus-count').value);
        updateBusConnections(count);
    });
    
    // Add graph button to results section
    const resultsTabs = document.querySelector('.results-tabs');
    resultsTabs.insertAdjacentHTML('beforeend', 
        '<button class="tab-btn" data-tab="graph">Network Graph</button>');
    
    // Add graph tab content
    const resultsSection = document.querySelector('.results-section');
    resultsSection.insertAdjacentHTML('beforeend', `
        <div class="tab-content" id="graph-tab">
            <div class="matrix-container">
                <h3 class="matrix-title">Network Graph</h3>
                <div id="graph-container" class="graph-display">
                    <p>Click "Calculate Matrices" to generate a graph</p>
                </div>
            </div>
        </div>
    `);
}

/**
 * Updates the available connections based on number of buses
 * @param {number} count - Number of buses to display
 */
function updateBusConnections(count) {
    // Validate input
    if (count < 2 || count > 10) {
        alert('Please enter a number between 2 and 10');
        return;
    }
    
    // Update global number of buses
    numberOfBuses = count;
    
    // Filter connections based on bus count
    activeConnections = allConnections.filter(conn => 
        conn.from < count && conn.to < count);
    
    // Get the connection entries container
    const container = document.querySelector('.connection-entries');
    
    // Clear current entries
    container.innerHTML = '';
    
    // Add only relevant connections based on bus count
    activeConnections.forEach(conn => {
        const connectionHtml = `
            <div class="form-group">
                <label for="${conn.distanceId}">${busNames[conn.from]} - ${busNames[conn.to]}</label>
                <input type="number" id="${conn.distanceId}" value="${getDefaultDistance(conn.distanceId)}" step="1">
            </div>
        `;
        container.insertAdjacentHTML('beforeend', connectionHtml);
    });
    
    // Update instructions if needed
    const instructionElement = document.querySelector('.calculator-section .container > p');
    if (!instructionElement) {
        const calculatorSection = document.querySelector('.calculator-section .container');
        const sectionTitle = document.querySelector('.section-title');
        calculatorSection.insertBefore(
            createElement('p', {
                className: 'instruction-text',
                textContent: `Currently showing connections for ${count} buses. You can change the number and update.`
            }),
            sectionTitle.nextSibling
        );
    } else {
        instructionElement.textContent = `Currently showing connections for ${count} buses. You can change the number and update.`;
    }
}

/**
 * Helper function to create a DOM element
 * @param {string} tag - Element tag name
 * @param {Object} attributes - Element attributes
 * @returns {HTMLElement} Created element
 */
function createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'textContent') {
            element.textContent = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    return element;
}

/**
 * Returns default distance for a connection ID
 * @param {string} distanceId - ID of the distance input field
 * @returns {number} Default distance value
 */
function getDefaultDistance(distanceId) {
    const defaultDistances = {
        'd1_4': 260,
        'd2_3': 100,
        'd3_4': 115,
        'd4_5': 38.5,
        'd5_6': 64.5,
        'd6_7': 10,
        'd6_8': 153,
        'd6_9': 170,
        'd9_10': 230,
        'd8_10': 145
    };
    
    return defaultDistances[distanceId] || 100;
}

/**
 * Set up tab functionality for result display
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Render graph if the graph tab is selected and we have data
            if (tabId === 'graph' && currentAdmittanceMatrix.length > 0) {
                renderNetworkGraph();
            }
        });
    });
}

/**
 * Main calculation function - processes inputs and displays results
 */
function performCalculations() {
    try {
        // Get material properties
        const resistivity = parseFloat(document.getElementById('resistivity').value);
        const area = parseFloat(document.getElementById('area').value);
        
        // Validate inputs
        if (isNaN(resistivity) || isNaN(area) || resistivity <= 0 || area <= 0) {
            alert('Please enter valid positive values for resistivity and area.');
            return;
        }
        
        // Get distances and convert to meters
        const distances = getDistancesFromInputs();
        
        // Calculate resistances
        const resistances = calculateResistances(resistivity, area, distances);
        currentResistances = resistances;
        
        // Build admittance matrix
        const admittanceMatrix = buildAdmittanceMatrix(resistances);
        currentAdmittanceMatrix = admittanceMatrix;
        
        // Display results
        displayResistanceMatrix(resistances);
        displayAdmittanceMatrix(admittanceMatrix);
        
        // Update graph display if tab is active
        const graphTab = document.querySelector('.tab-btn[data-tab="graph"]');
        if (graphTab.classList.contains('active')) {
            renderNetworkGraph();
        }
        
    } catch (error) {
        console.error('Calculation error:', error);
        alert('An error occurred during calculations. Please check your inputs.');
    }
}

/**
 * Collects distance values from input fields
 * @returns {Object} Object containing distances between buses
 */
function getDistancesFromInputs() {
    const distances = {};
    
    // Get distances only for active connections
    activeConnections.forEach(conn => {
        const inputElement = document.getElementById(conn.distanceId);
        if (inputElement) {
            distances[conn.distanceId] = parseFloat(inputElement.value) * 1000;
            
            // Validate the distance
            if (isNaN(distances[conn.distanceId]) || distances[conn.distanceId] <= 0) {
                throw new Error(`Invalid distance value for ${conn.distanceId}`);
            }
        }
    });
    
    return distances;
}

/**
 * Calculate resistances based on material parameters and distances
 * @param {number} resistivity - Material resistivity (Ω·m)
 * @param {number} area - Cross-section area (m²)
 * @param {Object} distances - Object containing distances between buses
 * @returns {Object} Calculated resistances between buses
 */
function calculateResistances(resistivity, area, distances) {
    const resistances = {};
    
    // Calculate each line resistance using R = ρL/A
    activeConnections.forEach(conn => {
        if (distances[conn.distanceId]) {
            resistances[conn.key] = (resistivity * distances[conn.distanceId]) / area;
        }
    });
    
    return resistances;
}

/**
 * Build admittance matrix from resistances
 * @param {Object} resistances - Object containing resistances between buses
 * @returns {Array} nxn admittance matrix where n is the number of buses
 */
function buildAdmittanceMatrix(resistances) {
    // Initialize admittance matrix with zeros
    const G = Array(numberOfBuses).fill().map(() => Array(numberOfBuses).fill(0));
    
    // Fill in off-diagonal elements (negative conductances)
    activeConnections.forEach(conn => {
        if (resistances[conn.key]) {
            G[conn.from][conn.to] = G[conn.to][conn.from] = -1/resistances[conn.key];
        }
    });
    
    // Fill diagonal elements (sum of all conductances connected to the bus)
    for (let i = 0; i < numberOfBuses; i++) {
        let sum = 0;
        for (let j = 0; j < numberOfBuses; j++) {
            if (i !== j) {
                sum += -G[i][j];  // Sum of absolute values of off-diagonal elements
            }
        }
        G[i][i] = sum;
    }
    
    return G;
}

/**
 * Display resistance values in a table
 * @param {Object} resistances - Object containing resistances between buses
 */
function displayResistanceMatrix(resistances) {
    const container = document.getElementById('resistance-matrix-container');
    
    // Create table to display resistances
    let tableHTML = '<table class="matrix-table">';
    tableHTML += '<tr><th>From</th><th>To</th><th>Distance (km)</th><th>Resistance (Ω)</th></tr>';
    
    // Add active connections with their resistances
    activeConnections.forEach(conn => {
        if (resistances[conn.key]) {
            const resistance = resistances[conn.key];
            const inputElement = document.getElementById(conn.distanceId);
            const distance = inputElement ? inputElement.value : '0';
            tableHTML += `<tr>
                <td>${busNames[conn.from]}</td>
                <td>${busNames[conn.to]}</td>
                <td>${distance}</td>
                <td>${formatNumber(resistance)}</td>
            </tr>`;
        }
    });
    
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
}

/**
 * Display admittance matrix in a table
 * @param {Array} matrix - nxn admittance matrix
 */
function displayAdmittanceMatrix(matrix) {
    const container = document.getElementById('admittance-matrix-container');
    
    // Create table to display the admittance matrix
    let tableHTML = '<table class="matrix-table">';
    
    // Add header row with bus names
    tableHTML += '<tr><th></th>';
    for (let i = 0; i < numberOfBuses; i++) {
        tableHTML += `<th>${busNames[i]}</th>`;
    }
    tableHTML += '</tr>';
    
    // Add data rows
    for (let i = 0; i < numberOfBuses; i++) {
        tableHTML += `<tr><th>${busNames[i]}</th>`;
        
        for (let j = 0; j < numberOfBuses; j++) {
            // Format the cell value
            const value = formatNumber(matrix[i][j]);
            tableHTML += `<td>${value}</td>`;
        }
        
        tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    
    container.innerHTML = tableHTML;
}

/**
 * Render network graph based on current data
 */
function renderNetworkGraph() {
    const container = document.getElementById('graph-container');
    
    // Create SVG for the graph
    const svgWidth = 600;
    const svgHeight = 500;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    
    // Clear previous graph
    container.innerHTML = '';
    
    // Create SVG element
    const svgHtml = `
        <svg width="${svgWidth}" height="${svgHeight}">
            <g transform="translate(${margin.left}, ${margin.top})">
                <g class="links"></g>
                <g class="nodes"></g>
            </g>
        </svg>
    `;
    container.innerHTML = svgHtml;
    
    // Calculate node positions (circular layout)
    const nodes = [];
    const links = [];
    
    // Generate nodes
    for (let i = 0; i < numberOfBuses; i++) {
        const angle = (i / numberOfBuses) * 2 * Math.PI;
        const radius = Math.min(width, height) / 2.5;
        
        nodes.push({
            id: i,
            name: busNames[i],
            x: width / 2 + radius * Math.cos(angle),
            y: height / 2 + radius * Math.sin(angle)
        });
    }
    
    // Generate links
    activeConnections.forEach(conn => {
        if (currentResistances[conn.key]) {
            links.push({
                source: conn.from,
                target: conn.to,
                resistance: currentResistances[conn.key],
                admittance: 1 / currentResistances[conn.key]
            });
        }
    });
    
    // Draw links
    const linksGroup = container.querySelector('.links');
    links.forEach(link => {
        const sourceNode = nodes[link.source];
        const targetNode = nodes[link.target];
        
        // Determine line thickness based on admittance (higher admittance = thicker line)
        const maxThickness = 6;
        const minThickness = 1;
        const maxAdmittance = Math.max(...links.map(l => l.admittance));
        const thickness = minThickness + (link.admittance / maxAdmittance) * (maxThickness - minThickness);
        
        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        line.setAttribute('stroke', '#007bff');
        line.setAttribute('stroke-width', thickness);
        
        // Add title for hover tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${sourceNode.name} - ${targetNode.name}
Resistance: ${formatNumber(link.resistance)} Ω
Admittance: ${formatNumber(link.admittance)} S`;
        line.appendChild(title);
        
        linksGroup.appendChild(line);
    });
    
    // Draw nodes
    const nodesGroup = container.querySelector('.nodes');
    nodes.forEach(node => {
        // Create node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 10);
        circle.setAttribute('fill', '#ff5722');
        
        // Add title for hover tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = node.name;
        circle.appendChild(title);
        
        // Create node label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y - 15);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#333');
        text.textContent = node.name;
        
        nodesGroup.appendChild(circle);
        nodesGroup.appendChild(text);
    });
    
    // Add legend
    const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legend.setAttribute('transform', `translate(${width - 150}, ${height - 80})`);
    
    // Add legend title
    const legendTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    legendTitle.setAttribute('x', 0);
    legendTitle.setAttribute('y', 0);
    legendTitle.setAttribute('font-weight', 'bold');
    legendTitle.textContent = 'Legend';
    
    // Add node legend item
    const nodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    nodeCircle.setAttribute('cx', 10);
    nodeCircle.setAttribute('cy', 20);
    nodeCircle.setAttribute('r', 6);
    nodeCircle.setAttribute('fill', '#ff5722');
    
    const nodeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nodeText.setAttribute('x', 25);
    nodeText.setAttribute('y', 24);
    nodeText.textContent = 'Bus';
    
    // Add link legend item
    const linkLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linkLine.setAttribute('x1', 0);
    linkLine.setAttribute('y1', 40);
    linkLine.setAttribute('x2', 20);
    linkLine.setAttribute('y2', 40);
    linkLine.setAttribute('stroke', '#007bff');
    linkLine.setAttribute('stroke-width', 2);
    
    const linkText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    linkText.setAttribute('x', 25);
    linkText.setAttribute('y', 44);
    linkText.textContent = 'Connection';
    
    // Append legend elements
    legend.appendChild(legendTitle);
    legend.appendChild(nodeCircle);
    legend.appendChild(nodeText);
    legend.appendChild(linkLine);
    legend.appendChild(linkText);
    
    container.querySelector('svg g').appendChild(legend);
}

/**
 * Format numbers for display
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(value) {
    if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) {
        return value.toExponential(4);
    } else {
        return value.toFixed(6);
    }
}

window.onscroll = () => {
    document.getElementById("backToTop").style.display = 
        window.scrollY > 400 ? "block" : "none";
};

document.getElementById("backToTop").onclick = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });