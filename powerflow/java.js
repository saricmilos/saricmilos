
    // Define bus names for the reduced 5-bus system
    const busNames = [
        'Lleida', 'Barcelona', 'Girona', 'Perpignan', 'Toulouse'
    ];

    // Define connections for calculations (using index mapping from the new 5-bus system)
    const connections = [
        { from: 0, to: 1, distanceId: 'd1_2', key: 'b1_2' },  // Lleida - Barcelona
        { from: 1, to: 2, distanceId: 'd2_3', key: 'b2_3' },  // Barcelona - Girona
        { from: 2, to: 3, distanceId: 'd3_4', key: 'b3_4' },  // Girona - Perpignan
        { from: 3, to: 4, distanceId: 'd4_5', key: 'b4_5' },  // Perpignan - Toulouse
        { from: 0, to: 4, distanceId: 'd1_5', key: 'b1_5' },  // Lleida - Toulouse
        { from: 1, to: 4, distanceId: 'd2_5', key: 'b2_5' }   // Barcelona - Toulouse
    ];

    // Initialize on document load
    document.addEventListener('DOMContentLoaded', function() {
        // Update the current year in the footer
        if (document.getElementById('current-year')) {
            document.getElementById('current-year').textContent = new Date().getFullYear();
        }
        
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
            
            // Calculate power flow
            const powerFlow = calculatePowerFlow(admittanceMatrix);
            
            // Display results
            displayResistanceMatrix(resistances);
            displayAdmittanceMatrix(admittanceMatrix);
            displayPowerFlow(powerFlow);
            
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
        
        // Get all distance inputs for the 5-bus system and convert to meters
        distances.d1_2 = parseFloat(document.getElementById('d1_2').value) * 1000;  // Lleida - Barcelona
        distances.d2_3 = parseFloat(document.getElementById('d2_3').value) * 1000;  // Barcelona - Girona
        distances.d3_4 = parseFloat(document.getElementById('d3_4').value) * 1000;  // Girona - Perpignan
        distances.d4_5 = parseFloat(document.getElementById('d4_5').value) * 1000;  // Perpignan - Toulouse
        distances.d1_5 = parseFloat(document.getElementById('d1_5').value) * 1000;  // Lleida - Toulouse
        distances.d2_5 = parseFloat(document.getElementById('d2_5').value) * 1000;  // Barcelona - Toulouse
        
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
        resistances.b1_2 = (resistivity * distances.d1_2) / area;  // Lleida - Barcelona
        resistances.b2_3 = (resistivity * distances.d2_3) / area;  // Barcelona - Girona
        resistances.b3_4 = (resistivity * distances.d3_4) / area;  // Girona - Perpignan
        resistances.b4_5 = (resistivity * distances.d4_5) / area;  // Perpignan - Toulouse
        resistances.b1_5 = (resistivity * distances.d1_5) / area;  // Lleida - Toulouse
        resistances.b2_5 = (resistivity * distances.d2_5) / area;  // Barcelona - Toulouse
        
        return resistances;
    }

    /**
     * Build admittance matrix from resistances
     * @param {Object} resistances - Object containing resistances between buses
     * @returns {Array} 5x5 admittance matrix
     */
    function buildAdmittanceMatrix(resistances) {
        // Initialize 5x5 admittance matrix with zeros
        const G = Array(5).fill().map(() => Array(5).fill(0));
        
        // Fill in off-diagonal elements (negative conductances)
        G[0][1] = G[1][0] = -1/resistances.b1_2;  // Lleida - Barcelona
        G[1][2] = G[2][1] = -1/resistances.b2_3;  // Barcelona - Girona
        G[2][3] = G[3][2] = -1/resistances.b3_4;  // Girona - Perpignan
        G[3][4] = G[4][3] = -1/resistances.b4_5;  // Perpignan - Toulouse
        G[0][4] = G[4][0] = -1/resistances.b1_5;  // Lleida - Toulouse
        G[1][4] = G[4][1] = -1/resistances.b2_5;  // Barcelona - Toulouse
        
        // Fill diagonal elements (sum of all conductances connected to the bus)
        for (let i = 0; i < 5; i++) {
            let sum = 0;
            for (let j = 0; j < 5; j++) {
                if (i !== j) {
                    sum += -G[i][j];  // Sum of absolute values of off-diagonal elements
                }
            }
            G[i][i] = sum;
        }
        
        return G;
    }

    /**
     * Calculate DC power flow using admittance matrix and bus data
     * @param {Array} admittanceMatrix - 5x5 admittance matrix
     * @returns {Object} Power flow results
     */
    function calculatePowerFlow(admittanceMatrix) {
        // Get input power values for each bus
        const busInputs = getBusInputValues();
        
        // Determine which bus is the slack (reference) bus
        const slackBusIndex = parseInt(document.getElementById('slack-bus').value);
        
        // Create power injection vector (excluding slack bus)
        const P = [];
        for (let i = 0; i < 5; i++) {
            if (i !== slackBusIndex) {
                P.push(busInputs[i].powerGeneration - busInputs[i].powerLoad);
            }
        }
        
        // Create reduced admittance matrix (removing slack bus row and column)
        const reducedG = [];
        for (let i = 0; i < 5; i++) {
            if (i !== slackBusIndex) {
                const row = [];
                for (let j = 0; j < 5; j++) {
                    if (j !== slackBusIndex) {
                        row.push(admittanceMatrix[i][j]);
                    }
                }
                reducedG.push(row);
            }
        }
        
        // Solve for bus angles: θ = G^-1 * P
        const angles = solveLinearSystem(reducedG, P);
        
        // Insert slack bus angle (0) back into the solution
        const fullAngles = [];
        let angleIndex = 0;
        for (let i = 0; i < 5; i++) {
            if (i === slackBusIndex) {
                fullAngles.push(0); // Slack bus angle is 0
            } else {
                fullAngles.push(angles[angleIndex++]);
            }
        }
        
        // Calculate power flows on each line
        const lineFlows = {};
        connections.forEach(conn => {
            const from = conn.from;
            const to = conn.to;
            const resistance = 1/(-admittanceMatrix[from][to]); // Convert conductance back to resistance
            const powerFlow = -admittanceMatrix[from][to] * (fullAngles[from] - fullAngles[to]);
            
            lineFlows[conn.key] = {
                from: from,
                to: to,
                power: powerFlow,
                current: Math.sqrt(powerFlow / resistance) // I = sqrt(P/R) for DC flow
            };
        });
        
        return {
            angles: fullAngles,
            lineFlows: lineFlows,
            slackBusPower: calculateSlackBusPower(admittanceMatrix, fullAngles, slackBusIndex)
        };
    }

    /**
     * Get power generation and load values for each bus
     * @returns {Array} Array of bus input data
     */
    function getBusInputValues() {
        const busInputs = [];
        
        for (let i = 0; i < 5; i++) {
            busInputs.push({
                powerGeneration: parseFloat(document.getElementById(`gen-${i}`).value) || 0,
                powerLoad: parseFloat(document.getElementById(`load-${i}`).value) || 0
            });
        }
        
        return busInputs;
    }

    /**
     * Calculate power injection at slack bus to maintain system balance
     * @param {Array} admittanceMatrix - Admittance matrix
     * @param {Array} angles - Bus voltage angles
     * @param {number} slackIndex - Index of slack bus
     * @returns {number} Power injection at slack bus
     */
    function calculateSlackBusPower(admittanceMatrix, angles, slackIndex) {
        let powerInjection = 0;
        
        for (let j = 0; j < 5; j++) {
            if (j !== slackIndex) {
                powerInjection -= admittanceMatrix[slackIndex][j] * (angles[slackIndex] - angles[j]);
            }
        }
        
        return powerInjection;
    }

    /**
     * Solve a system of linear equations Ax = b using Gaussian elimination
     * @param {Array} A - Coefficient matrix
     * @param {Array} b - Right-hand side vector
     * @returns {Array} Solution vector x
     */
    function solveLinearSystem(A, b) {
        const n = A.length;
        
        if (n === 0 || A[0].length !== n || b.length !== n) {
            throw new Error('Invalid matrix dimensions for linear system');
        }
        
        // Create augmented matrix [A|b]
        const augMatrix = A.map((row, i) => [...row, b[i]]);
        
        // Gaussian elimination (forward elimination)
        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(augMatrix[j][i]) > Math.abs(augMatrix[maxRow][i])) {
                    maxRow = j;
                }
            }
            
            // Swap rows if needed
            if (maxRow !== i) {
                [augMatrix[i], augMatrix[maxRow]] = [augMatrix[maxRow], augMatrix[i]];
            }
            
            // Eliminate below
            for (let j = i + 1; j < n; j++) {
                const factor = augMatrix[j][i] / augMatrix[i][i];
                for (let k = i; k <= n; k++) {
                    augMatrix[j][k] -= factor * augMatrix[i][k];
                }
            }
        }
        
        // Back substitution
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = 0;
            for (let j = i + 1; j < n; j++) {
                sum += augMatrix[i][j] * x[j];
            }
            x[i] = (augMatrix[i][n] - sum) / augMatrix[i][i];
        }
        
        return x;
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
     * @param {Array} matrix - 5x5 admittance matrix
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
        for (let i = 0; i < 5; i++) {
            tableHTML += `<tr><th>${busNames[i]}</th>`;
            
            for (let j = 0; j < 5; j++) {
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
     * Display power flow results
     * @param {Object} powerFlow - Power flow calculation results
     */
    function displayPowerFlow(powerFlow) {
        const container = document.getElementById('power-flow-container');
        
        // Display bus voltage angles
        let angleHTML = '<h3>Bus Voltage Angles</h3>';
        angleHTML += '<table class="matrix-table">';
        angleHTML += '<tr><th>Bus</th><th>Angle (rad)</th><th>Angle (°)</th></tr>';
        
        powerFlow.angles.forEach((angle, index) => {
            angleHTML += `<tr>
                <td>${busNames[index]}</td>
                <td>${formatNumber(angle)}</td>
                <td>${formatNumber(angle * 180 / Math.PI)}</td>
            </tr>`;
        });
        
        angleHTML += '</table>';
        
        // Display line power flows
        let flowHTML = '<h3>Line Power Flows</h3>';
        flowHTML += '<table class="matrix-table">';
        flowHTML += '<tr><th>From</th><th>To</th><th>Power Flow (MW)</th><th>Current (kA)</th></tr>';
        
        Object.values(powerFlow.lineFlows).forEach(flow => {
            flowHTML += `<tr>
                <td>${busNames[flow.from]}</td>
                <td>${busNames[flow.to]}</td>
                <td>${formatNumber(flow.power)}</td>
                <td>${formatNumber(flow.current / 1000)}</td>
            </tr>`;
        });
        
        flowHTML += '</table>';
        
        // Display slack bus power
        let slackHTML = '<h3>Slack Bus Power Balance</h3>';
        slackHTML += `<p>Power injection at slack bus (${busNames[parseInt(document.getElementById('slack-bus').value)]}): 
                     ${formatNumber(powerFlow.slackBusPower)} MW</p>`;
        
        container.innerHTML = angleHTML + flowHTML + slackHTML;
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