/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

// Update year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// PLL Simulation
document.addEventListener('DOMContentLoaded', function() {
    // Canvas and context setup
    const voltageCanvas = document.getElementById('voltageCanvas');
    const voltageCtx = voltageCanvas.getContext('2d');
    
    const alphaCanvas = document.getElementById('alphaCanvas');
    const alphaCtx = alphaCanvas.getContext('2d');
    
    const angleCanvas = document.getElementById('angleCanvas');
    const angleCtx = angleCanvas.getContext('2d');
    
    // UI elements
    const frequencySlider = document.getElementById('frequencySlider');
    const frequencyValue = document.getElementById('frequencyValue');
    const phaseShiftSlider = document.getElementById('phaseShiftSlider');
    const phaseShiftValue = document.getElementById('phaseShiftValue');
    const kpSlider = document.getElementById('kpSlider');
    const kpValue = document.getElementById('kpValue');
    const kiSlider = document.getElementById('kiSlider');
    const kiValue = document.getElementById('kiValue');
    
    const resetBtn = document.getElementById('resetBtn');
    const phaseShiftBtn = document.getElementById('phaseShiftBtn');
    const pauseResumeBtn = document.getElementById('pauseResumeBtn');
    
    const actualAngleEl = document.getElementById('actualAngle');
    const pllAngleEl = document.getElementById('pllAngle');
    const angleErrorEl = document.getElementById('angleError');
    const settlingTimeEl = document.getElementById('settlingTime');
    const steadyStateErrorEl = document.getElementById('steadyStateError');
    
    // Graph toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-graph');
    
    // Simulation parameters
    let frequency = 50; // Hz
    let phaseShift = 0; // degrees
    let kp = 50; // Proportional gain
    let ki = 900; // Integral gain
    
    // PLL state variables
    let theta = 0; // PLL estimated angle in radians
    let omega = 2 * Math.PI * frequency; // PLL estimated angular frequency
    let integral = 0; // Integrator state
    
    // Time variables
    let t = 0; // Current time in seconds
    let dt = 0.0001; // Time step in seconds
    let timeScale = 0.5; // Time scale for visualization
    let simTime = 0; // Simulation time
    
    // History arrays for plotting
    const historyLength = 500;
    let timeHistory = Array(historyLength).fill(0);
    let vaHistory = Array(historyLength).fill(0);
    let vbHistory = Array(historyLength).fill(0);
    let vcHistory = Array(historyLength).fill(0);
    let vAlphaHistory = Array(historyLength).fill(0);
    let vBetaHistory = Array(historyLength).fill(0);
    let actualAngleHistory = Array(historyLength).fill(0);
    let estimatedAngleHistory = Array(historyLength).fill(0);
    
    // Animation variables
    let phaseShiftAnimationActive = false;
    let phaseShiftAnimationTime = 0;
    let phaseShiftAnimationDuration = 0.5; // seconds
    
    // Phase shift event tracking
    let phaseShiftTime = -1;
    let settlingTime = 0;
    let isSteadyState = true;
    let steadyStateError = 0;
    
    // Animation control
    let animationId;
    let isPaused = false;
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Start the simulation
    animate();
    
    // Main animation loop
    function animate() {
        if (!isPaused) {
            // Update simulation
            updateSimulation();
            
            // Clear canvases
            clearCanvases();
            
            // Draw waveforms
            drawVoltageWaveforms();
            drawAlphaBetaWaveforms();
            drawAngleWaveforms();
            
            // Update info displays
            updateInfoDisplays();
            
            // Update phase shift animation
            updatePhaseShiftAnimation();
        }
        
        // Request next frame
        animationId = requestAnimationFrame(animate);
    }
    
    function updateSimulation() {
        // Increment time
        t += dt;
        simTime += dt;
        
        // Calculate actual voltages with phase shift
        const phaseShiftRad = phaseShift * Math.PI / 180;
        const actualAngle = 2 * Math.PI * frequency * t + phaseShiftRad;
        
        const va = Math.sin(actualAngle);
        const vb = Math.sin(actualAngle - 2 * Math.PI / 3);
        const vc = Math.sin(actualAngle + 2 * Math.PI / 3);
        
        // Clarke transformation (3-phase to alpha-beta)
        const vAlpha = (2/3) * (va - 0.5 * vb - 0.5 * vc);
        const vBeta = (2/3) * (0.866 * vb - 0.866 * vc);
        
        // Park transformation (alpha-beta to d-q) using estimated angle
        const vd = vAlpha * Math.cos(theta - Math.PI/2) + vBeta * Math.sin(theta - Math.PI/2);
        const vq = -vAlpha * Math.sin(theta - Math.PI/2) + vBeta * Math.cos(theta - Math.PI/2);
        
        // PI controller (using vq as phase error)
        const error = vq;
        integral += error * dt;
        const piOutput = kp * error + ki * integral;
        
        // Update PLL frequency and angle
        omega = 2 * Math.PI * frequency + piOutput;
        theta += omega * dt;
        
        // Normalize theta to 0-2π range
        theta = theta % (2 * Math.PI);
        if (theta < 0) theta += 2 * Math.PI;
        
        // Update history arrays (shift and add new value)
        timeHistory.shift();
        timeHistory.push(simTime);
        
        vaHistory.shift();
        vaHistory.push(va);
        
        vbHistory.shift();
        vbHistory.push(vb);
        
        vcHistory.shift();
        vcHistory.push(vc);
        
        vAlphaHistory.shift();
        vAlphaHistory.push(vAlpha);
        
        vBetaHistory.shift();
        vBetaHistory.push(vBeta);
        
        actualAngleHistory.shift();
        actualAngleHistory.push(normalizeAngle(actualAngle));
        
        estimatedAngleHistory.shift();
        estimatedAngleHistory.push(theta);
        
        // Track settling time after phase shift
        if (phaseShiftTime >= 0) {
            const angleError = Math.abs(normalizeAngleDifference(theta, normalizeAngle(actualAngle)));
            
            if (angleError < 0.05 && !isSteadyState) {
                settlingTime = (simTime - phaseShiftTime) * 1000; // in ms
                isSteadyState = true;
                steadyStateError = angleError * 180 / Math.PI; // in degrees
            } else if (angleError >= 0.05 && isSteadyState) {
                isSteadyState = false;
            }
        }
    }
    
    function updatePhaseShiftAnimation() {
        if (phaseShiftAnimationActive) {
            phaseShiftAnimationTime += dt;
            
            // End animation after duration
            if (phaseShiftAnimationTime >= phaseShiftAnimationDuration) {
                phaseShiftAnimationActive = false;
                phaseShiftAnimationTime = 0;
            }
        }
    }
    
    function clearCanvases() {
        voltageCtx.clearRect(0, 0, voltageCanvas.width, voltageCanvas.height);
        alphaCtx.clearRect(0, 0, alphaCanvas.width, alphaCanvas.height);
        angleCtx.clearRect(0, 0, angleCanvas.width, angleCanvas.height);
    }
    
    function drawVoltageWaveforms() {
        // Set background
        voltageCtx.fillStyle = 'rgba(250, 250, 252, 1)';
        voltageCtx.fillRect(0, 0, voltageCanvas.width, voltageCanvas.height);
        
        // Draw grid
        drawGrid(voltageCtx, voltageCanvas.width, voltageCanvas.height);
        
        // Calculate animation effect for phase shift
        let animationEffect = 1;
        if (phaseShiftAnimationActive) {
            // Flash effect - starts bright then fades
            animationEffect = 1 + 0.5 * Math.cos(Math.PI * phaseShiftAnimationTime / phaseShiftAnimationDuration);
        }
        
        // Draw three-phase voltages
        voltageCtx.lineWidth = 2.5;
        
        // Va (Red)
        voltageCtx.strokeStyle = `rgba(231, 76, 60, ${animationEffect})`;
        voltageCtx.shadowColor = 'rgba(231, 76, 60, 0.5)';
        voltageCtx.shadowBlur = phaseShiftAnimationActive ? 10 : 3;
        drawWaveform(voltageCtx, timeHistory, vaHistory, voltageCanvas.width, voltageCanvas.height);
        
        // Vb (Green)
        voltageCtx.strokeStyle = `rgba(46, 204, 113, ${animationEffect})`;
        voltageCtx.shadowColor = 'rgba(46, 204, 113, 0.5)';
        drawWaveform(voltageCtx, timeHistory, vbHistory, voltageCanvas.width, voltageCanvas.height);
        
        // Vc (Blue)
        voltageCtx.strokeStyle = `rgba(52, 152, 219, ${animationEffect})`;
        voltageCtx.shadowColor = 'rgba(52, 152, 219, 0.5)';
        drawWaveform(voltageCtx, timeHistory, vcHistory, voltageCanvas.width, voltageCanvas.height);
        
        // Reset shadow
        voltageCtx.shadowBlur = 0;
        
        // Draw legend
        drawLegend(voltageCtx, [
            { label: 'Va', color: '#e74c3c' },
            { label: 'Vb', color: '#2ecc71' },
            { label: 'Vc', color: '#3498db' }
        ], 20, 20);
    }
    
    function drawAlphaBetaWaveforms() {
        // Set background
        alphaCtx.fillStyle = 'rgba(250, 250, 252, 1)';
        alphaCtx.fillRect(0, 0, alphaCanvas.width, alphaCanvas.height);
        
        // Draw grid
        drawGrid(alphaCtx, alphaCanvas.width, alphaCanvas.height);
        
        // Calculate animation effect for phase shift
        let animationEffect = 1;
        if (phaseShiftAnimationActive) {
            animationEffect = 1 + 0.5 * Math.cos(Math.PI * phaseShiftAnimationTime / phaseShiftAnimationDuration);
        }
        
        // Draw alpha-beta components
        alphaCtx.lineWidth = 2.5;
        
        // Alpha (Purple)
        alphaCtx.strokeStyle = `rgba(155, 89, 182, ${animationEffect})`;
        alphaCtx.shadowColor = 'rgba(155, 89, 182, 0.5)';
        alphaCtx.shadowBlur = phaseShiftAnimationActive ? 10 : 3;
        drawWaveform(alphaCtx, timeHistory, vAlphaHistory, alphaCanvas.width, alphaCanvas.height);
        
        // Beta (Orange)
        alphaCtx.strokeStyle = `rgba(230, 126, 34, ${animationEffect})`;
        alphaCtx.shadowColor = 'rgba(230, 126, 34, 0.5)';
        drawWaveform(alphaCtx, timeHistory, vBetaHistory, alphaCanvas.width, alphaCanvas.height);
        
        // Reset shadow
        alphaCtx.shadowBlur = 0;
        
        // Draw legend
        drawLegend(alphaCtx, [
            { label: 'Alpha', color: '#9b59b6' },
            { label: 'Beta', color: '#e67e22' }
        ], 20, 20);
    }
    
    function drawAngleWaveforms() {
        // Set background
        angleCtx.fillStyle = 'rgba(250, 250, 252, 1)';
        angleCtx.fillRect(0, 0, angleCanvas.width, angleCanvas.height);
        
        // Draw grid
        drawGrid(angleCtx, angleCanvas.width, angleCanvas.height, true);
        
        // Calculate animation effect for phase shift
        let animationEffect = 1;
        if (phaseShiftAnimationActive) {
            animationEffect = 1 + 0.5 * Math.cos(Math.PI * phaseShiftAnimationTime / phaseShiftAnimationDuration);
        }
        
        // Draw angles
        angleCtx.lineWidth = 2.5;
        
        // Actual angle (Red)
        angleCtx.strokeStyle = `rgba(231, 76, 60, ${animationEffect})`;
        angleCtx.shadowColor = 'rgba(231, 76, 60, 0.5)';
        angleCtx.shadowBlur = phaseShiftAnimationActive ? 10 : 3;
        drawAngleWaveform(angleCtx, timeHistory, actualAngleHistory, angleCanvas.width, angleCanvas.height);
        
        // Estimated angle (Blue)
        angleCtx.strokeStyle = `rgba(52, 152, 219, ${animationEffect})`;
        angleCtx.shadowColor = 'rgba(52, 152, 219, 0.5)';
        drawAngleWaveform(angleCtx, timeHistory, estimatedAngleHistory, angleCanvas.width, angleCanvas.height);
        
        // Reset shadow
        angleCtx.shadowBlur = 0;
        
        // Draw highlight area where phase shift occurred
        if (phaseShiftTime >= 0) {
            const phaseShiftX = (phaseShiftTime - timeHistory[0]) * (angleCanvas.width / (timeHistory[timeHistory.length - 1] - timeHistory[0]));
            
            // Draw vertical line at phase shift point
            angleCtx.strokeStyle = 'rgba(243, 156, 18, 0.7)';
            angleCtx.lineWidth = phaseShiftAnimationActive ? 3 : 2;
            angleCtx.setLineDash([5, 3]);
            angleCtx.beginPath();
            angleCtx.moveTo(phaseShiftX, 0);
            angleCtx.lineTo(phaseShiftX, angleCanvas.height);
            angleCtx.stroke();
            angleCtx.setLineDash([]);
            
            // Label the phase shift point
            angleCtx.fillStyle = 'rgba(243, 156, 18, 0.9)';
            angleCtx.font = '12px Arial';
            angleCtx.fillText('Phase Shift', phaseShiftX + 5, 15);
        }
        
        // Draw legend
        drawLegend(angleCtx, [
            { label: 'Actual Angle', color: '#e74c3c' },
            { label: 'PLL Angle', color: '#3498db' }
        ], 20, 20);
    }
    
    function drawWaveform(ctx, xData, yData, width, height) {
        const xScale = width / (xData[xData.length - 1] - xData[0]);
        const yScale = height / 2.5;
        const yOffset = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(0, yOffset - yData[0] * yScale);
        
        for (let i = 1; i < xData.length; i++) {
            const x = (xData[i] - xData[0]) * xScale;
            const y = yOffset - yData[i] * yScale;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    function drawAngleWaveform(ctx, xData, yData, width, height) {
        const xScale = width / (xData[xData.length - 1] - xData[0]);
        const yScale = height / (2 * Math.PI);
        
        ctx.beginPath();
        ctx.moveTo(0, height - yData[0] * yScale);
        
        for (let i = 1; i < xData.length; i++) {
            const x = (xData[i] - xData[0]) * xScale;
            const y = height - yData[i] * yScale;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    function drawGrid(ctx, width, height, angleGrid = false) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        // Vertical grid lines (time)
        const timeStep = width / 10;
        for (let x = 0; x <= width; x += timeStep) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        if (angleGrid) {
            // Horizontal grid lines for angle (0, π, 2π)
            const steps = [0, Math.PI, 2 * Math.PI];
            const yScale = height / (2 * Math.PI);
            
            steps.forEach(step => {
                const y = height - step * yScale;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
                
                // Labels
                ctx.fillStyle = '#888';
                ctx.font = '12px Arial';
                ctx.fillText(step === 0 ? '0' : step === Math.PI ? 'π' : '2π', 5, y - 5);
            });
        } else {
            // Horizontal grid lines
            const centerLine = height / 2;
            const amplitude = height / 2.5;
            
            // Center line (y = 0)
            ctx.beginPath();
            ctx.moveTo(0, centerLine);
            ctx.lineTo(width, centerLine);
            ctx.stroke();
            
            // Positive peak (y = 1)
            ctx.beginPath();
            ctx.moveTo(0, centerLine - amplitude);
            ctx.lineTo(width, centerLine - amplitude);
            ctx.stroke();
            
            // Negative peak (y = -1)
            ctx.beginPath();
            ctx.moveTo(0, centerLine + amplitude);
            ctx.lineTo(width, centerLine + amplitude);
            ctx.stroke();
            
            // Labels
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.fillText('+1', 5, centerLine - amplitude - 5);
            ctx.fillText('0', 5, centerLine - 5);
            ctx.fillText('-1', 5, centerLine + amplitude - 5);
        }
    }
    
    function drawLegend(ctx, items, x, y) {
        // Draw legend background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const legendWidth = 120;
        const legendHeight = items.length * 25 + 10;
        ctx.fillRect(x - 5, y - 5, legendWidth, legendHeight);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 5, y - 5, legendWidth, legendHeight);
        
        const lineLength = 20;
        const spacing = 25;
        
        items.forEach((item, index) => {
            const yPos = y + index * spacing;
            
            // Draw line sample
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, yPos);
            ctx.lineTo(x + lineLength, yPos);
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = 'bold 13px Arial';
            ctx.fillText(item.label, x + lineLength + 5, yPos + 4);
        });
    }
    
    function updateInfoDisplays() {
        // Convert angles to degrees for display
        const actualAngleDeg = (normalizeAngle(actualAngleHistory[actualAngleHistory.length - 1]) * 180 / Math.PI).toFixed(1);
        const pllAngleDeg = (theta * 180 / Math.PI).toFixed(1);
        
        // Calculate angle error
        const angleError = normalizeAngleDifference(theta, normalizeAngle(actualAngleHistory[actualAngleHistory.length - 1])) * 180 / Math.PI;
        
        // Update displays
        actualAngleEl.textContent = actualAngleDeg + '°';
        pllAngleEl.textContent = pllAngleDeg + '°';
        angleErrorEl.textContent = angleError.toFixed(2) + '°';
        settlingTimeEl.textContent = settlingTime.toFixed(1) + ' ms';
        steadyStateErrorEl.textContent = steadyStateError.toFixed(3) + '°';
        
        // Highlight values during phase shift
        if (phaseShiftAnimationActive) {
            angleErrorEl.classList.add('highlight');
        } else {
            angleErrorEl.classList.remove('highlight');
        }
    }
    
    function normalizeAngle(angle) {
        let result = angle % (2 * Math.PI);
        if (result < 0) result += 2 * Math.PI;
        return result;
    }
    
    function normalizeAngleDifference(angle1, angle2) {
        let diff = angle1 - angle2;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        return diff;
    }
    
    function initializeEventListeners() {
        // Frequency slider
        frequencySlider.addEventListener('input', function() {
            frequency = parseFloat(this.value);
            frequencyValue.textContent = frequency;
        });
        
        // Phase shift slider
        phaseShiftSlider.addEventListener('input', function() {
            const oldPhaseShift = phaseShift;
            phaseShift = parseFloat(this.value);
            phaseShiftValue.textContent = phaseShift;
            
            // Only trigger animation and record time if there's a significant change
            if (Math.abs(phaseShift - oldPhaseShift) > 2) {
                // Activate phase shift animation
                phaseShiftAnimationActive = true;
                phaseShiftAnimationTime = 0;
                
                // Record phase shift time for settling time calculation
                phaseShiftTime = simTime;
                isSteadyState = false;
            }
        });
        
        // Kp slider
        kpSlider.addEventListener('input', function() {
            kp = parseFloat(this.value);
            kpValue.textContent = kp;
        });
        
        // Ki slider
        kiSlider.addEventListener('input', function() {
            ki = parseFloat(this.value);
            kiValue.textContent = ki;
        });
        
        // Reset button
        resetBtn.addEventListener('click', function() {
            // Reset simulation parameters
            t = 0;
            simTime = 0;
            theta = 0;
            omega = 2 * Math.PI * frequency;
            integral = 0;
            
            // Reset phase shift
            phaseShift = 0;
            phaseShiftSlider.value = 0;
            phaseShiftValue.textContent = 0;
            
            // Reset performance metrics
            phaseShiftTime = -1;
            settlingTime = 0;
            isSteadyState = true;
            steadyStateError = 0;
            
            // Reset animation flags
            phaseShiftAnimationActive = false;
            phaseShiftAnimationTime = 0;
            
            // Clear history arrays
            timeHistory.fill(0);
            vaHistory.fill(0);
            vbHistory.fill(0);
            vcHistory.fill(0);
            vAlphaHistory.fill(0);
            vBetaHistory.fill(0);
            actualAngleHistory.fill(0);
            estimatedAngleHistory.fill(0);
            
            // Add animation class to reset button
            resetBtn.classList.add('button-animated');
            setTimeout(() => resetBtn.classList.remove('button-animated'), 500);
        });
        
        // Phase shift button
        phaseShiftBtn.addEventListener('click', function() {
            // Apply random phase shift between -90 and 90 degrees
            const randomShift = Math.floor(Math.random() * 181) - 90;
            phaseShift = randomShift;
            phaseShiftSlider.value = randomShift;
            phaseShiftValue.textContent = randomShift;
            
            // Activate phase shift animation
            phaseShiftAnimationActive = true;
            phaseShiftAnimationTime = 0;
            
            // Record phase shift time for settling time calculation
            phaseShiftTime = simTime;
            isSteadyState = false;
            
            // Add animation class to phase shift button
            phaseShiftBtn.classList.add('button-animated');
            setTimeout(() => phaseShiftBtn.classList.remove('button-animated'), 500);
        });
        
        // Pause/Resume button
        pauseResumeBtn.addEventListener('click', function() {
            isPaused = !isPaused;
            pauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause';
            pauseResumeBtn.classList.toggle('button-paused', isPaused);
        });
        
        // Graph toggle buttons
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetContainer = document.getElementById(targetId);
                const canvas = targetContainer.querySelector('canvas');
                const caption = targetContainer.querySelector('p');
                
                if (targetContainer.classList.contains('collapsed')) {
                    // Expand
                    targetContainer.classList.remove('collapsed');
                    this.innerHTML = '<i class="fas fa-chevron-up"></i>';
                    canvas.style.display = 'block';
                    caption.style.display = 'block';
                } else {
                    // Collapse
                    targetContainer.classList.add('collapsed');
                    this.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    canvas.style.display = 'none';
                    caption.style.display = 'none';
                }
            });
        });
    }
});

// Add this to the existing initializeEventListeners function in pll.js

// Function to update slider background based on its value
// This code should be added to your pll.js file
// Replace the existing updateSliderBackground function with this one

// Modern slider background update function
function updateSliderBackgroundModern(slider) {
    const min = slider.min ? parseFloat(slider.min) : 0;
    const max = slider.max ? parseFloat(slider.max) : 100;
    const val = slider.value;
    const percentage = ((val - min) / (max - min)) * 100;
    
    // Create a more visually appealing gradient based on the slider's context
    let primaryColor, secondaryColor;
    
    // Determine colors based on slider ID
    if (slider.id === 'frequencySlider') {
        // Blue theme for frequency
        primaryColor = '#3a86ff';
        secondaryColor = '#63a4ff';
    } else if (slider.id === 'phaseShiftSlider') {
        // Purple theme for phase shift
        primaryColor = '#7e57c2';
        secondaryColor = '#9575cd';
    } else if (slider.id === 'kpSlider') {
        // Green theme for proportional gain
        primaryColor = '#4caf50';
        secondaryColor = '#81c784';
    } else if (slider.id === 'kiSlider') {
        // Orange theme for integral gain
        primaryColor = '#ff9800';
        secondaryColor = '#ffb74d';
    } else {
        // Default blue theme
        primaryColor = '#3a86ff';
        secondaryColor = '#63a4ff';
    }
    
    // Set the gradient background
    slider.style.background = `linear-gradient(to right, 
        ${primaryColor} 0%, 
        ${secondaryColor} ${percentage/2}%, 
        ${primaryColor} ${percentage}%, 
        #e0e6ee ${percentage}%, 
        #f0f4f8 100%)`;
    
    // Add box shadow for depth
    slider.style.boxShadow = 'inset 0 2px 5px rgba(0, 0, 40, 0.1)';
}

// Function to add tick marks to sliders
function addSliderTickMarks() {
    // Get all slider containers
    const sliderContainers = document.querySelectorAll('.slider-container');
    
    sliderContainers.forEach(container => {
        const slider = container.querySelector('.slider');
        
        if (!slider) return;
        
        // Create tick marks only if they don't already exist
        if (!container.querySelector('.slider-ticks')) {
            const ticksDiv = document.createElement('div');
            ticksDiv.className = 'slider-ticks';
            
            // Get min and max values
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            
            // For frequency slider, create 5 ticks
            if (slider.id === 'frequencySlider') {
                const step = (max - min) / 4;
                for (let i = 0; i <= 4; i++) {
                    const span = document.createElement('span');
                    span.textContent = (min + step * i).toFixed(1);
                    ticksDiv.appendChild(span);
                }
            } 
            // For phase shift slider, create ticks at -180, -90, 0, 90, 180
            else if (slider.id === 'phaseShiftSlider') {
                const values = [-180, -90, 0, 90, 180];
                values.forEach(value => {
                    const span = document.createElement('span');
                    span.textContent = value;
                    ticksDiv.appendChild(span);
                });
            }
            // For kp slider, create 5 ticks
            else if (slider.id === 'kpSlider') {
                const step = (max - min) / 4;
                for (let i = 0; i <= 4; i++) {
                    const span = document.createElement('span');
                    span.textContent = (min + step * i).toFixed(0);
                    ticksDiv.appendChild(span);
                }
            }
            // For ki slider, create 5 ticks
            else if (slider.id === 'kiSlider') {
                const step = (max - min) / 4;
                for (let i = 0; i <= 4; i++) {
                    const span = document.createElement('span');
                    span.textContent = (min + step * i).toFixed(0);
                    ticksDiv.appendChild(span);
                }
            }
            
            // Add ticks to container after the slider
            container.appendChild(ticksDiv);
        }
    });
}

// Update existing slider event listeners to use the new function

// Apply modern backgrounds to all sliders
const allSliders = document.querySelectorAll('.slider');
allSliders.forEach(slider => {
    // Initial background update
    updateSliderBackgroundModern(slider);
    
    // Update background when slider value changes
    slider.addEventListener('input', function() {
        updateSliderBackgroundModern(this);
    });
});

// Update existing slider event listeners to use the new function
// Replace the existing event listeners with these

// Frequency slider
frequencySlider.addEventListener('input', function() {
    frequency = parseFloat(this.value);
    frequencyValue.textContent = frequency;
    updateSliderBackgroundModern(this);
});

// Phase shift slider
phaseShiftSlider.addEventListener('input', function() {
    const oldPhaseShift = phaseShift;
    phaseShift = parseFloat(this.value);
    phaseShiftValue.textContent = phaseShift;
    updateSliderBackgroundModern(this);
    
    // Only trigger animation and record time if there's a significant change
    if (Math.abs(phaseShift - oldPhaseShift) > 2) {
        // Activate phase shift animation
        phaseShiftAnimationActive = true;
        phaseShiftAnimationTime = 0;
        
        // Record phase shift time for settling time calculation
        phaseShiftTime = simTime;
        isSteadyState = false;
    }
});

// Kp slider
kpSlider.addEventListener('input', function() {
    kp = parseFloat(this.value);
    kpValue.textContent = kp;
    updateSliderBackgroundModern(this);
});

// Ki slider
kiSlider.addEventListener('input', function() {
    ki = parseFloat(this.value);
    kiValue.textContent = ki;
    updateSliderBackgroundModern(this);
});

// Call the function to add tick marks when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize other parts of the application...
    
    // Add tick marks to sliders
    addSliderTickMarks();
});


// Update existing slider event listeners

// Frequency slider
frequencySlider.addEventListener('input', function() {
    frequency = parseFloat(this.value);
    frequencyValue.textContent = frequency;
    updateSliderBackground(this);
});

// Phase shift slider
phaseShiftSlider.addEventListener('input', function() {
    const oldPhaseShift = phaseShift;
    phaseShift = parseFloat(this.value);
    phaseShiftValue.textContent = phaseShift;
    updateSliderBackground(this);
    
    // Only trigger animation and record time if there's a significant change
    if (Math.abs(phaseShift - oldPhaseShift) > 2) {
        // Activate phase shift animation
        phaseShiftAnimationActive = true;
        phaseShiftAnimationTime = 0;
        
        // Record phase shift time for settling time calculation
        phaseShiftTime = simTime;
        isSteadyState = false;
    }
});

// Add this to the end of your pll.js file
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the back to top button
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        // Scroll to top when button is clicked
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            console.log('Back to top button clicked'); // For debugging
        });
    } else {
        console.error('Back to top button not found in the DOM');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    // Toggle mobile menu on hamburger click
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle active class on menu button
            this.classList.toggle('active');
            // Toggle active class on nav menu
            navMenu.classList.toggle('active');
            // Toggle no-scroll class on body to prevent scrolling when menu is open
            body.classList.toggle('no-scroll');
        });
    }
    
    // Close menu when clicking on a menu item
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only perform this action on mobile
            if (window.innerWidth <= 768) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        // Only perform this action on mobile and when menu is open
        if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
            // Check if click is outside the nav menu and not on the toggle button
            if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // If window is resized above mobile breakpoint, reset mobile menu
        if (window.innerWidth > 768) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            body.classList.remove('no-scroll');
        }
    });
});