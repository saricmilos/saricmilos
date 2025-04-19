/**
 * Power Grid Matrix Calculator
 * This script calculates resistance and admittance matrices for electrical grid analysis
 * Based on MATLAB implementation by Milos Saric
 */

// Define bus names for reference
const busNames = [
    'Lleida', 'Tarragona', 'Barcelona', 'Girona',
    'Santa Llogaia', 'Baixas', 'Perpignan', 'Montpellier',
    'Toulouse', 'Bordeaux'
];

// Define connections for calculations
const connections = [
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

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    // Update the current year in the footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
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
});

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
        
        // Build admittance matrix
        const admittanceMatrix = buildAdmittanceMatrix(resistances);
        
        // Display results
        displayResistanceMatrix(resistances);
        displayAdmittanceMatrix(admittanceMatrix);
        
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
    
    // Get all distance inputs and convert to meters
    distances.d1_4 = parseFloat(document.getElementById('d1_4').value) * 1000;
    distances.d2_3 = parseFloat(document.getElementById('d2_3').value) * 1000;
    distances.d3_4 = parseFloat(document.getElementById('d3_4').value) * 1000;
    distances.d4_5 = parseFloat(document.getElementById('d4_5').value) * 1000;
    distances.d5_6 = parseFloat(document.getElementById('d5_6').value) * 1000;
    distances.d6_7 = parseFloat(document.getElementById('d6_7').value) * 1000;
    distances.d6_8 = parseFloat(document.getElementById('d6_8').value) * 1000;
    distances.d6_9 = parseFloat(document.getElementById('d6_9').value) * 1000;
    distances.d9_10 = parseFloat(document.getElementById('d9_10').value) * 1000;
    distances.d8_10 = parseFloat(document.getElementById('d8_10').value) * 1000;
    
    // Validate all distances
    Object.entries(distances).forEach(([key, value]) => {
        if (isNaN(value) || value <= 0) {
            throw new Error(`Invalid distance value for ${key}`);
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
    resistances.b1_4 = (resistivity * distances.d1_4) / area;
    resistances.b2_3 = (resistivity * distances.d2_3) / area;
    resistances.b3_4 = (resistivity * distances.d3_4) / area;
    resistances.b4_5 = (resistivity * distances.d4_5) / area;
    resistances.b5_6 = (resistivity * distances.d5_6) / area;
    resistances.b6_7 = (resistivity * distances.d6_7) / area;
    resistances.b6_8 = (resistivity * distances.d6_8) / area;
    resistances.b6_9 = (resistivity * distances.d6_9) / area;
    resistances.b9_10 = (resistivity * distances.d9_10) / area;
    resistances.b8_10 = (resistivity * distances.d8_10) / area;
    
    return resistances;
}

/**
 * Build admittance matrix from resistances
 * @param {Object} resistances - Object containing resistances between buses
 * @returns {Array} 10x10 admittance matrix
 */
function buildAdmittanceMatrix(resistances) {
    // Initialize 10x10 admittance matrix with zeros
    const G = Array(10).fill().map(() => Array(10).fill(0));
    
    // Fill in off-diagonal elements (negative conductances)
    G[0][3] = G[3][0] = -1/resistances.b1_4;  // Lleida - Girona
    G[1][2] = G[2][1] = -1/resistances.b2_3;  // Tarragona - Barcelona
    G[2][3] = G[3][2] = -1/resistances.b3_4;  // Barcelona - Girona
    G[3][4] = G[4][3] = -1/resistances.b4_5;  // Girona - Santa Llogaia
    G[4][5] = G[5][4] = -1/resistances.b5_6;  // Santa Llogaia - Baixas
    G[5][6] = G[6][5] = -1/resistances.b6_7;  // Baixas - Perpignan
    G[5][7] = G[7][5] = -1/resistances.b6_8;  // Baixas - Montpellier
    G[5][8] = G[8][5] = -1/resistances.b6_9;  // Baixas - Toulouse
    G[8][9] = G[9][8] = -1/resistances.b9_10; // Toulouse - Bordeaux
    G[7][9] = G[9][7] = -1/resistances.b8_10; // Montpellier - Bordeaux
    
    // Fill diagonal elements (sum of all conductances connected to the bus)
    for (let i = 0; i < 10; i++) {
        let sum = 0;
        for (let j = 0; j < 10; j++) {
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
    
    // Add all connections with their resistances
    connections.forEach(conn => {
        const resistance = resistances[conn.key];
        const distance = document.getElementById(conn.distanceId).value;
        tableHTML += `<tr>
            <td>${busNames[conn.from]}</td>
            <td>${busNames[conn.to]}</td>
            <td>${distance}</td>
            <td>${formatNumber(resistance)}</td>
        </tr>`;
    });
    
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
}

/**
 * Display admittance matrix in a table
 * @param {Array} matrix - 10x10 admittance matrix
 */
function displayAdmittanceMatrix(matrix) {
    const container = document.getElementById('admittance-matrix-container');
    
    // Create table to display the admittance matrix
    let tableHTML = '<table class="matrix-table">';
    
    // Add header row with bus names
    tableHTML += '<tr><th></th>';
    busNames.forEach(name => {
        tableHTML += `<th>${name}</th>`;
    });
    tableHTML += '</tr>';
    
    // Add data rows
    for (let i = 0; i < 10; i++) {
        tableHTML += `<tr><th>${busNames[i]}</th>`;
        
        for (let j = 0; j < 10; j++) {
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

/**
 * Export calculated matrices to CSV
 * Used for sharing results with other tools
 */
function exportResults() {
    // Implementation for exporting results as CSV
    // This can be connected to a button in the UI
    alert('Export functionality to be implemented');
}

    window.onscroll = () => {
        document.getElementById("backToTop").style.display = 
            window.scrollY > 400 ? "block" : "none";
    };

    document.getElementById("backToTop").onclick = () =>
        window.scrollTo({ top: 0, behavior: 'smooth' });
