// Add VSC Simulation to the main simulation flow
function initializeVscSimulation() {
    // Create VSC control panel
    createVscControlPanel();
    
    // Create VSC charts
    createVscCharts();
    
    // Add VSC simulation to the update graphs function
    const updateButton = document.getElementById('update-graphs');
    const originalUpdateFunction = updateButton.onclick;
    
    updateButton.onclick = function() {
        // Run the original update function first
        if (originalUpdateFunction) {
            originalUpdateFunction();
        } else {
            updateGraphs();
        }
        
        // Then run the VSC simulation
        simulateVSC();
        updateVSCCharts();
    };
}

// Simulate VSC operation
function simulateVSC() {
    // Reset simulation arrays
    vscVoltages = [];
    gridVoltages = [];
    inverterCurrents = [];
    gridCurrents = [];
    pwmSignals = [];
    capVoltages = [];
    controlSignals = [];
    idActual = [];
    iqActual = [];
    modulation = [];
    dcLinkCurrent = [];
    carrierWave = [];
    
    // Calculate time-step based on switching frequency
    const pwmTimeStep = 1 / (switchingFrequency * 20); // 20 samples per switching period
    
    // PLL variables
    let pllTheta = 0;
    let pllOmega = 2 * Math.PI * frequency;
    let pllError = 0;
    let pllIntegral = 0;
    
    // Current controller variables
    let idError = 0;
    let iqError = 0;
    let idIntegral = 0;
    let iqIntegral = 0;
    let vdRef = 0;
    let vqRef = 0;
    
    // Power controller variables (if in power control mode)
    let pError = 0;
    let qError = 0;
    let pIntegral = 0;
    let qIntegral = 0;
    
    // LCL filter state variables
    let inverterCurrentA = 0;
    let inverterCurrentB = 0;
    let inverterCurrentC = 0;
    let gridCurrentA = 0;
    let gridCurrentB = 0;
    let gridCurrentC = 0;
    let capVoltageA = 0;
    let capVoltageB = 0;
    let capVoltageC = 0;
    
    // Carrier wave generation for SPWM
    const carrierFreq = switchingFrequency;
    const carrierPeriod = 1 / carrierFreq;
    
    // Current measurements in dq frame
    let id = 0;
    let iq = 0;
    
    // Power measurements
    let activePower = 0;
    let reactivePower = 0;
    
    // DC link voltage (simulated)
    let dcLink = dcLinkVoltage;
    
    // Iterate through each time step
    for (let time = 0; time < timeMax; time += pwmTimeStep) {
        // Generate grid voltages
        const gridVa = 230 * Math.sqrt(2) * Math.sin(2 * Math.PI * frequency * time + pllPhaseOffset);
        const gridVb = 230 * Math.sqrt(2) * Math.sin(2 * Math.PI * frequency * time - 2 * Math.PI / 3 + pllPhaseOffset);
        const gridVc = 230 * Math.sqrt(2) * Math.sin(2 * Math.PI * frequency * time + 2 * Math.PI / 3 + pllPhaseOffset);
        
        // PLL simulation
        // Detect grid angle using alpha-beta transformation of grid voltages
        const gridValpha = (2/3) * gridVa - (1/3) * gridVb - (1/3) * gridVc;
        const gridVbeta = (1/Math.sqrt(3)) * (gridVb - gridVc);
        
        // Phase detection using inverse tangent
        const detectedAngle = Math.atan2(gridVbeta, gridValpha);
        
        // PLL error and PI controller
        pllError = detectedAngle - pllTheta;
        // Normalize error to [-π, π]
        while (pllError > Math.PI) pllError -= 2 * Math.PI;
        while (pllError < -Math.PI) pllError += 2 * Math.PI;
        
        // PI controller for PLL
        pllIntegral += pllError * pwmTimeStep;
        pllOmega = 2 * Math.PI * frequency + pllKp * pllError + pllKi * pllIntegral;
        pllTheta += pllOmega * pwmTimeStep;
        
        // Keep theta in [0, 2π]
        while (pllTheta > 2 * Math.PI) pllTheta -= 2 * Math.PI;
        while (pllTheta < 0) pllTheta += 2 * Math.PI;
        
        // Transform grid currents to dq frame
        const cos_theta = Math.cos(pllTheta);
        const sin_theta = Math.sin(pllTheta);
        
        // Clarke transform for currents
        const iAlpha = (2/3) * gridCurrentA - (1/3) * gridCurrentB - (1/3) * gridCurrentC;
        const iBeta = (1/Math.sqrt(3)) * (gridCurrentB - gridCurrentC);
        
        // Park transform for currents
        id = iAlpha * cos_theta + iBeta * sin_theta;
        iq = -iAlpha * sin_theta + iBeta * cos_theta;
        
        // Calculate power
        activePower = 1.5 * (gridVa * gridCurrentA + gridVb * gridCurrentB + gridVc * gridCurrentC);
        reactivePower = 1.5 * (1/Math.sqrt(3)) * ((gridVb - gridVc) * gridCurrentA + 
                                                  (gridVc - gridVa) * gridCurrentB + 
                                                  (gridVa - gridVb) * gridCurrentC);
        
        // Control logic
        if (controlMode === 0) { // Current control mode
            // Current controller
            idError = idReference - id;
            iqError = iqReference - iq;
            
            // PI controller for d-axis current
            idIntegral += idError * pwmTimeStep;
            vdRef = currentControlKp * idError + currentControlKi * idIntegral;
            
            // PI controller for q-axis current
            iqIntegral += iqError * pwmTimeStep;
            vqRef = currentControlKp * iqError + currentControlKi * iqIntegral;
        } else { // Power control mode
            // Calculate current references from power references
            // P = 1.5 * Vd * Id, Q = -1.5 * Vd * Iq for aligned reference frame
            const gridMagnitude = Math.sqrt(gridValpha * gridValpha + gridVbeta * gridVbeta);
            const idRef = (2/3) * activePowerRef / gridMagnitude;
            const iqRef = -(2/3) * reactivePowerRef / gridMagnitude;
            
            // Current controller
            idError = idRef - id;
            iqError = iqRef - iq;
            
            // PI controller for d-axis current
            idIntegral += idError * pwmTimeStep;
            vdRef = currentControlKp * idError + currentControlKi * idIntegral;
            
            // PI controller for q-axis current
            iqIntegral += iqError * pwmTimeStep;
            vqRef = currentControlKp * iqError + currentControlKi * iqIntegral;
        }
        
        // Limit voltage references to prevent overmodulation
        const vRef_magnitude = Math.sqrt(vdRef * vdRef + vqRef * vqRef);
        const maxVref = dcLinkVoltage / 2 * 0.866; // Maximum voltage without overmodulation
        
        if (vRef_magnitude > maxVref) {
            const scale = maxVref / vRef_magnitude;
            vdRef *= scale;
            vqRef *= scale;
        }
        
        // Transform voltage references back to abc frame
        // Inverse Park transform
        const vAlpha = vdRef * cos_theta - vqRef * sin_theta;
        const vBeta = vdRef * sin_theta + vqRef * cos_theta;
        
        // Inverse Clarke transform
        const vRefA = vAlpha;
        const vRefB = -0.5 * vAlpha + (Math.sqrt(3)/2) * vBeta;
        const vRefC = -0.5 * vAlpha - (Math.sqrt(3)/2) * vBeta;
        
        // Generate PWM carrier signal
        const carrierValue = 2 * (time % carrierPeriod) / carrierPeriod - 1;
        
        // Generate modulation signals
        const modA = modulationIndex * vRefA / (dcLinkVoltage / 2);
        const modB = modulationIndex * vRefB / (dcLinkVoltage / 2);
        const modC = modulationIndex * vRefC / (dcLinkVoltage / 2);
        
        // Compare with carrier to get PWM signals
        const pwmA = modA > carrierValue ? 1 : -1;
        const pwmB = modB > carrierValue ? 1 : -1;
        const pwmC = modC > carrierValue ? 1 : -1;
        
        // VSC output voltages (with respect to DC link midpoint)
        const vscVa = pwmA * dcLinkVoltage / 2;
        const vscVb = pwmB * dcLinkVoltage / 2;
        const vscVc = pwmC * dcLinkVoltage / 2;
        
        // Simulate LCL filter dynamics - Simple Euler integration
        
        // Inverter-side inductor dynamics: L1 * di/dt = vsc - vc
        inverterCurrentA += (vscVa - capVoltageA) / inverterInductance * pwmTimeStep;
        inverterCurrentB += (vscVb - capVoltageB) / inverterInductance * pwmTimeStep;
        inverterCurrentC += (vscVc - capVoltageC) / inverterInductance * pwmTimeStep;
        
        // Capacitor dynamics: C * dvc/dt = i1 - i2
        capVoltageA += (inverterCurrentA - gridCurrentA) / filterCapacitance * pwmTimeStep;
        capVoltageB += (inverterCurrentB - gridCurrentB) / filterCapacitance * pwmTimeStep;
        capVoltageC += (inverterCurrentC - gridCurrentC) / filterCapacitance * pwmTimeStep;
        
        // Grid-side inductor dynamics: L2 * di2/dt = vc - vg - R * i2
        gridCurrentA += (capVoltageA - gridVa - filterDampingResistance * gridCurrentA) / gridInductance * pwmTimeStep;
        gridCurrentB += (capVoltageB - gridVb - filterDampingResistance * gridCurrentB) / gridInductance * pwmTimeStep;
        gridCurrentC += (capVoltageC - gridVc - filterDampingResistance * gridCurrentC) / gridInductance * pwmTimeStep;
        
        // Calculate DC link current
        const dcCurrent = (inverterCurrentA * pwmA + inverterCurrentB * pwmB + inverterCurrentC * pwmC);
        
        // Only store data at lower sampling rate to match display needs
        if (Math.abs((time % timeStep)) < pwmTimeStep / 2) {
            // Store results for visualization
            vscVoltages.push({x: time, va: vscVa, vb: vscVb, vc: vscVc});
            gridVoltages.push({x: time, va: gridVa, vb: gridVb, vc: gridVc});
            inverterCurrents.push({x: time, ia: inverterCurrentA, ib: inverterCurrentB, ic: inverterCurrentC});
            gridCurrents.push({x: time, ia: gridCurrentA, ib: gridCurrentB, ic: gridCurrentC});
            pwmSignals.push({x: time, a: pwmA, b: pwmB, c: pwmC});
            capVoltages.push({x: time, va: capVoltageA, vb: capVoltageB, vc: capVoltageC});
            idActual.push({x: time, id: id, idRef: controlMode === 0 ? idReference : (2/3) * activePowerRef / Math.sqrt(gridValpha * gridValpha + gridVbeta * gridVbeta)});
            iqActual.push({x: time, iq: iq, iqRef: controlMode === 0 ? iqReference : -(2/3) * reactivePowerRef / Math.sqrt(gridValpha * gridValpha + gridVbeta * gridVbeta)});
            modulation.push({x: time, a: modA, b: modB, c: modC});
            carrierWave.push({x: time, carrier: carrierValue});
            controlSignals.push({x: time, vd: vdRef, vq: vqRef, pll: pllTheta});
        }
    }
}

// Update VSC charts with simulation data
function updateVSCCharts() {
    // VSC Output Voltages Chart
    vscOutputChart.data.datasets[0].data = vscVoltages.map(item => ({x: item.x, y: item.va}));
    vscOutputChart.data.datasets[1].data = vscVoltages.map(item => ({x: item.x, y: item.vb}));
    vscOutputChart.data.datasets[2].data = vscVoltages.map(item => ({x: item.x, y: item.vc}));
    vscOutputChart.update();
    
    // Grid Currents Chart
    gridCurrentsChart.data.datasets[0].data = gridCurrents.map(item => ({x: item.x, y: item.ia}));
    gridCurrentsChart.data.datasets[1].data = gridCurrents.map(item => ({x: item.x, y: item.ib}));
    gridCurrentsChart.data.datasets[2].data = gridCurrents.map(item => ({x: item.x, y: item.ic}));
    gridCurrentsChart.update();
    
    // DQ Currents Chart
    dqCurrentsChart.data.datasets[0].data = idActual.map(item => ({x: item.x, y: item.idRef}));
    dqCurrentsChart.data.datasets[1].data = idActual.map(item => ({x: item.x, y: item.id}));
    dqCurrentsChart.data.datasets[2].data = iqActual.map(item => ({x: item.x, y: item.iqRef}));
    dqCurrentsChart.data.datasets[3].data = iqActual.map(item => ({x: item.x, y: item.iq}));
    dqCurrentsChart.update();
    
    // PWM Modulation Chart
    pwmModulationChart.data.datasets[0].data = carrierWave.map(item => ({x: item.x, y: item.carrier}));
    pwmModulationChart.data.datasets[1].data = modulation.map(item => ({x: item.x, y: item.a}));
    pwmModulationChart.data.datasets[2].data = modulation.map(item => ({x: item.x, y: item.b}));
    pwmModulationChart.data.datasets[3].data = modulation.map(item => ({x: item.x, y: item.c}));
    pwmModulationChart.update();
    
    // Power Flow Chart
    // Calculate instantaneous power from dq components
    const activePowerData = idActual.map((item, index) => {
        const gridMag = Math.sqrt(Math.pow(230*Math.sqrt(2), 2));
        return {
            x: item.x, 
            y: 1.5 * gridMag * item.id / 1000 // Convert to kW
        };
    });
    
    const reactivePowerData = iqActual.map((item, index) => {
        const gridMag = Math.sqrt(Math.pow(230*Math.sqrt(2), 2));
        return {
            x: item.x, 
            y: -1.5 * gridMag * item.iq / 1000 // Convert to kVAr
        };
    });
    
    // DC link voltage (constant in this simulation)
    const dcVoltageData = idActual.map(item => ({x: item.x, y: dcLinkVoltage}));
    
    powerFlowChart.data.datasets[0].data = activePowerData;
    powerFlowChart.data.datasets[1].data = reactivePowerData;
    powerFlowChart.data.datasets[2].data = dcVoltageData;
    powerFlowChart.update();
    
    // Filter Currents Chart
    filterCurrentsChart.data.datasets[0].data = inverterCurrents.map(item => ({x: item.x, y: item.ia}));
    filterCurrentsChart.data.datasets[1].data = gridCurrents.map(item => ({x: item.x, y: item.ia}));
    filterCurrentsChart.data.datasets[2].data = capVoltages.map(item => ({x: item.x, y: item.va}));
    filterCurrentsChart.update();
}

// Add VSC explanation content to the mathematical background section
function addVscExplanation() {
    // Get the mathematical section element
    const mathSection = document.querySelector('.mathematical-section .math-explanation');
    
    if (mathSection) {
        // Create new explanation block for VSC
        const vscExplanationBlock = document.createElement('div');
        vscExplanationBlock.className = 'explanation-block';
        vscExplanationBlock.innerHTML = `
            <h3>Voltage Source Converter (VSC)</h3>
            <div id="vsc-explanation-container" class="explanation-container">
                <button id="vsc-explanation-toggle" class="button button-tertiary">Show Explanation</button>
                <div id="vsc-explanation-content" class="explanation-content">
                    <p>A voltage source converter (VSC) is a power electronic device that connects a DC system to an AC system, allowing bidirectional power flow:</p>
                    <ul>
                        <li>Three-phase bridge topology with IGBT switches</li>
                        <li>PWM techniques for voltage synthesis</li>
                        <li>dq-frame current control for decoupled active/reactive power</li>
                        <li>LCL filter for grid connection with improved harmonic attenuation</li>
                    </ul>
                    <div id="vsc-equations"></div>
                    <p>The VSC control works in the synchronous dq-frame, which allows for independent control of active power (through d-axis current) and reactive power (through q-axis current).</p>
                </div>
            </div>
        `;
        
        // Append the new explanation block
        mathSection.appendChild(vscExplanationBlock);
        
        // Add toggle functionality
        addExplanationToggle(
            'vsc-explanation-container', 
            'vsc-explanation-toggle', 
            'vsc-explanation-content'
        );
        
        // Add VSC equations
        const vscEquationsContainer = document.getElementById('vsc-equations');
        if (vscEquationsContainer && window.MathJax) {
            vscEquationsContainer.innerHTML = `
                <div class="latex-container">
                    <p>Current controller equations:</p>
                    \\[ v_d^* = K_p (i_d^* - i_d) + K_i \\int (i_d^* - i_d) dt - \\omega L i_q \\]
                    \\[ v_q^* = K_p (i_q^* - i_q) + K_i \\int (i_q^* - i_q) dt + \\omega L i_d \\]
                    <p>Power relationships in the dq-frame:</p>
                    \\[ P = \\frac{3}{2} v_d i_d \\]
                    \\[ Q = -\\frac{3}{2} v_d i_q \\]
                </div>
            `;
            
            // Render LaTeX
            MathJax.typeset([vscEquationsContainer]);
        }
    }
}

// Initialize VSC model when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize VSC simulation
    initializeVscSimulation();
    
    // Add VSC explanation
    addVscExplanation();
    
    // Run initial VSC simulation
    simulateVSC();
    updateVSCCharts();
});

// Add validation for VSC parameter ranges
function validateVscParameters() {
    // Validate DC link voltage
    const dcVoltage = document.getElementById('dc-link-voltage');
    if (parseInt(dcVoltage.value) < 400) {
        dcVoltage.value = 400;
        dcLinkVoltage = 400;
        document.getElementById('dc-voltage-value').textContent = '400 V';
    } else if (parseInt(dcVoltage.value) > 1200) {
        dcVoltage.value = 1200;
        dcLinkVoltage = 1200;
        document.getElementById('dc-voltage-value').textContent = '1200 V';
    }
    
    // Validate switching frequency
    const switchFreq = document.getElementById('switching-frequency');
    if (parseInt(switchFreq.value) < 2) {
        switchFreq.value = 2;
        switchingFrequency = 2000;
        document.getElementById('switching-freq-value').textContent = '2 kHz';
    } else if (parseInt(switchFreq.value) > 20) {
        switchFreq.value = 20;
        switchingFrequency = 20000;
        document.getElementById('switching-freq-value').textContent = '20 kHz';
    }
    
    // Validate modulation index
    const modIndex = document.getElementById('modulation-index');
    if (parseFloat(modIndex.value) < 0.1) {
        modIndex.value = 0.1;
        modulationIndex = 0.1;
        document.getElementById('modulation-index-value').textContent = '0.1';
    } else if (parseFloat(modIndex.value) > 1) {
        modIndex.value = 1;
        modulationIndex = 1;
        document.getElementById('modulation-index-value').textContent = '1.0';
    }
}

// Add export functionality for VSC data
function exportVscData() {
    // Create an object with VSC simulation data
    const vscData = {
        parameters: {
            dcLinkVoltage: dcLinkVoltage,
            switchingFrequency: switchingFrequency,
            modulationIndex: modulationIndex,
            controlMode: controlMode,
            currentControlKp: currentControlKp,
            currentControlKi: currentControlKi,
            idReference: idReference,
            iqReference: iqReference,
            activePowerRef: activePowerRef,
            reactivePowerRef: reactivePowerRef
        },
        results: {
            vscVoltages: vscVoltages,
            gridCurrents: gridCurrents,
            idActual: idActual,
            iqActual: iqActual,
            modulation: modulation
        }
    };
    
    // Convert to JSON
    const dataStr = JSON.stringify(vscData, null, 2);
    
    // Create download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'vsc_simulation_data.json';
    link.href = url;
    link.click();
}

// Add export button to the export section
document.addEventListener('DOMContentLoaded', function() {
    const exportGroup = document.querySelector('.export-group:last-child');
    if (exportGroup) {
        const vscExportButton = document.createElement('button');
        vscExportButton.id = 'export-vsc-data-btn';
        vscExportButton.className = 'button button-secondary';
        vscExportButton.textContent = 'Export VSC Simulation Data (JSON)';
        vscExportButton.addEventListener('click', exportVscData);
        
        exportGroup.appendChild(vscExportButton);
    }
});