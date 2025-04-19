// Main variables for simulation
let w; // Angular frequency - will be calculated based on frequency
let t = []; // Time array
let timeStep = 0.0002; // Time step for higher resolution
let timeMax = 0.04; // Maximum time for simulation (in seconds)
let frequency = 50; // Default frequency in Hz

// Create time array
function createTimeArray() {
    t = []; // Clear the array first
    for (let time = 0; time <= timeMax; time += timeStep) {
        t.push(time);
    }
}

// Variables for waveforms
let va_fund, vb_fund, vc_fund; // Fundamental components
let va_third, vb_third, vc_third; // Third harmonic components
let va_fifth, vb_fifth, vc_fifth; // Fifth harmonic components
let va, vb, vc; // Combined waveforms
let valfa, vbeta, vgamma; // Clarke transform components
let vd, vq, v0; // Park transform components

// Clarke transform matrix
const Clarke = math.matrix([
    [2/3, -1/3, -1/3],
    [0, -1/Math.sqrt(3), 1/Math.sqrt(3)],
    [1/3, 1/3, 1/3]
]);

// Initialize control variables
let fundamentalAmplitude = 1.0;
let thirdHarmonicAmplitude = 0.2;
let fifthHarmonicAmplitude = 0.1;
let showFundamental = true;
let showThirdHarmonic = true;
let showFifthHarmonic = false;

// Chart objects
let abcChart, clarkeChart, parkChart, phaseAChart, phaseBChart, phaseCChart, alphaBetaPlot, dqPlot, harmonicChart;

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Attach event listeners to controls
    document.getElementById('fundamental-amplitude').addEventListener('input', updateSliderValue);
    document.getElementById('third-harmonic-amplitude').addEventListener('input', updateSliderValue);
    document.getElementById('fifth-harmonic-amplitude').addEventListener('input', updateSliderValue);
    document.getElementById('frequency-control').addEventListener('input', updateFrequencyValue);
    
    document.getElementById('show-fundamental').addEventListener('change', updateCheckboxValue);
    document.getElementById('show-third-harmonic').addEventListener('change', updateCheckboxValue);
    document.getElementById('show-fifth-harmonic').addEventListener('change', updateCheckboxValue);
    
    document.getElementById('update-graphs').addEventListener('click', updateGraphs);
    
    // Initialize current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Reset button functionality
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // Reset fundamental
            document.getElementById('fundamental-amplitude').value = 1;
            document.getElementById('fundamental-value').textContent = '1.0';
            document.getElementById('show-fundamental').checked = true;
            
            // Reset 3rd harmonic
            document.getElementById('third-harmonic-amplitude').value = 0.2;
            document.getElementById('third-harmonic-value').textContent = '0.2';
            document.getElementById('show-third-harmonic').checked = true;
            
            // Reset 5th harmonic
            document.getElementById('fifth-harmonic-amplitude').value = 0.1;
            document.getElementById('fifth-harmonic-value').textContent = '0.1';
            document.getElementById('show-fifth-harmonic').checked = false;
            
            // Reset frequency to 50 Hz
            document.getElementById('frequency-control').value = 50;
            document.getElementById('frequency-value').textContent = '50 Hz';
            
            // Update variables
            fundamentalAmplitude = 1.0;
            thirdHarmonicAmplitude = 0.2;
            fifthHarmonicAmplitude = 0.1;
            showFundamental = true;
            showThirdHarmonic = true;
            showFifthHarmonic = false;
            frequency = 50;
            w = 2 * Math.PI * frequency;
            
            // Update graphs
            updateGraphs();
        });
    }
    
    // Initialize charts
    initializeCharts();
    
    // Set initial frequency value
    frequency = parseFloat(document.getElementById('frequency-control').value);
    w = 2 * Math.PI * frequency;
    
    // Generate initial data and update visualizations
    createTimeArray();
    calculateWaveforms();
    updateAllCharts();
    
    // Handle responsive layout
    window.addEventListener('resize', function() {
        if (abcChart) abcChart.resize();
        if (clarkeChart) clarkeChart.resize();
        if (parkChart) parkChart.resize();
        if (phaseAChart) phaseAChart.resize();
        if (phaseBChart) phaseBChart.resize();
        if (phaseCChart) phaseCChart.resize();
        if (alphaBetaPlot) alphaBetaPlot.resize();
        if (dqPlot) dqPlot.resize();
        if (harmonicChart) harmonicChart.resize();
    });
});

// Update slider value displays
function updateSliderValue(e) {
    const id = e.target.id;
    const value = parseFloat(e.target.value);
    
    if (id === 'fundamental-amplitude') {
        fundamentalAmplitude = value;
        document.getElementById('fundamental-value').textContent = value.toFixed(1);
    } else if (id === 'third-harmonic-amplitude') {
        thirdHarmonicAmplitude = value;
        document.getElementById('third-harmonic-value').textContent = value.toFixed(2);
    } else if (id === 'fifth-harmonic-amplitude') {
        fifthHarmonicAmplitude = value;
        document.getElementById('fifth-harmonic-value').textContent = value.toFixed(2);
    }
}

// Update frequency value
function updateFrequencyValue(e) {
    frequency = parseFloat(e.target.value);
    document.getElementById('frequency-value').textContent = `${frequency} Hz`;
    // Update angular frequency
    w = 2 * Math.PI * frequency;
}

// Update checkbox values
function updateCheckboxValue(e) {
    const id = e.target.id;
    const checked = e.target.checked;
    
    if (id === 'show-fundamental') {
        showFundamental = checked;
    } else if (id === 'show-third-harmonic') {
        showThirdHarmonic = checked;
    } else if (id === 'show-fifth-harmonic') {
        showFifthHarmonic = checked;
    }
}

// Calculate waveforms based on current parameters
function calculateWaveforms() {
    // Arrays to store the waveforms
    va_fund = []; vb_fund = []; vc_fund = [];
    va_third = []; vb_third = []; vc_third = [];
    va_fifth = []; vb_fifth = []; vc_fifth = [];
    va = []; vb = []; vc = [];
    
    // Calculate waveforms for each time point
    for (let i = 0; i < t.length; i++) {
        // Fundamental components
        const va_f = fundamentalAmplitude * Math.sin(w * t[i]);
        const vb_f = fundamentalAmplitude * Math.sin(w * t[i] - 2 * Math.PI / 3);
        const vc_f = fundamentalAmplitude * Math.sin(w * t[i] + 2 * Math.PI / 3);
        
        va_fund.push(va_f);
        vb_fund.push(vb_f);
        vc_fund.push(vc_f);
        
        // Third harmonic components (in phase with each other)
        const va_3 = thirdHarmonicAmplitude * Math.sin(3 * w * t[i]);
        const vb_3 = thirdHarmonicAmplitude * Math.sin(3 * w * t[i]);
        const vc_3 = thirdHarmonicAmplitude * Math.sin(3 * w * t[i]);
        
        va_third.push(va_3);
        vb_third.push(vb_3);
        vc_third.push(vc_3);
        
        // Fifth harmonic components (negative sequence)
        const va_5 = fifthHarmonicAmplitude * Math.sin(5 * w * t[i]);
        const vb_5 = fifthHarmonicAmplitude * Math.sin(5 * w * t[i] + 2 * Math.PI / 3); // Note + for negative sequence
        const vc_5 = fifthHarmonicAmplitude * Math.sin(5 * w * t[i] - 2 * Math.PI / 3); // Note - for negative sequence
        
        va_fifth.push(va_5);
        vb_fifth.push(vb_5);
        vc_fifth.push(vc_5);
        
        // Combine components based on checkboxes
        let va_combined = 0;
        let vb_combined = 0;
        let vc_combined = 0;
        
        if (showFundamental) {
            va_combined += va_f;
            vb_combined += vb_f;
            vc_combined += vc_f;
        }
        
        if (showThirdHarmonic) {
            va_combined += va_3;
            vb_combined += vb_3;
            vc_combined += vc_3;
        }
        
        if (showFifthHarmonic) {
            va_combined += va_5;
            vb_combined += vb_5;
            vc_combined += vc_5;
        }
        
        va.push(va_combined);
        vb.push(vb_combined);
        vc.push(vc_combined);
    }
    
    // Calculate Clarke transform and Park transform
    calculateTransforms();
}

// Calculate Clarke and Park transforms
function calculateTransforms() {
    valfa = [];
    vbeta = [];
    vgamma = [];
    
    vd = [];
    vq = [];
    v0 = [];
    
    for (let i = 0; i < t.length; i++) {
        // Create input vector for Clarke transform
        const input = math.matrix([[va[i]], [vb[i]], [vc[i]]]);
        
        // Apply Clarke transform
        const clarkeOutput = math.multiply(Clarke, input);
        
        // Extract Clarke components
        const alpha = clarkeOutput.get([0, 0]);
        const beta = clarkeOutput.get([1, 0]);
        const gamma = clarkeOutput.get([2, 0]);
        
        valfa.push(alpha);
        vbeta.push(beta);
        vgamma.push(gamma);
        
        // Calculate Park transform (dq0 transform)
        // Theta is the angle of the rotating reference frame (synchronized with electrical angle)
        const theta = Math.atan2(beta, alpha); // Phase shift for Park transform;
        
        // Park transformation matrix (rotation matrix)
        // This part was incorrect. The proper way is to use the angle to rotate coordinates
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        
        // Direct component (d-axis) - this was backwards
        // For a standard Park transform, we want:
        const d = alpha * Math.cos(theta) + beta * Math.sin(theta);
        const q = -alpha * Math.sin(theta) + beta * Math.cos(theta);
        
        // Zero component (same as Clarke's gamma)
        const zero = gamma;
        
        vd.push(d);
        vq.push(q);
        v0.push(zero);
    }
}

// Initialize all charts
function initializeCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        elements: {
            point: {
                radius: 0
            },
            line: {
                tension: 0.4
            }
        },
        scales: {
            x: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Time (s)'
                }
            },
            y: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Amplitude'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'center'
            }
        }
    };
    
    // Three-phase waveforms chart
    const abcCtx = document.getElementById('abc-waveforms').getContext('2d');
    abcChart = new Chart(abcCtx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Phase A',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 2
                },
                {
                    label: 'Phase B',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderWidth: 2
                },
                {
                    label: 'Phase C',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderWidth: 2
                }
            ]
        },
        options: commonOptions
    });
    
    // Clarke components chart
    const clarkeCtx = document.getElementById('clarke-waveforms').getContext('2d');
    clarkeChart = new Chart(clarkeCtx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Alpha',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderWidth: 2
                },
                {
                    label: 'Beta',
                    data: [],
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderWidth: 2
                },
                {
                    label: 'Gamma (Zero)',
                    data: [],
                    borderColor: 'rgb(201, 203, 207)',
                    backgroundColor: 'rgba(201, 203, 207, 0.5)',
                    borderWidth: 2
                }
            ]
        },
        options: commonOptions
    });
    
    // Park components chart (new)
    const parkCtx = document.getElementById('park-waveforms').getContext('2d');
    parkChart = new Chart(parkCtx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'D-axis',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderWidth: 2
                },
                {
                    label: 'Q-axis',
                    data: [],
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderWidth: 2
                },
                {
                    label: 'Zero',
                    data: [],
                    borderColor: 'rgb(201, 203, 207)',
                    backgroundColor: 'rgba(201, 203, 207, 0.5)',
                    borderWidth: 2
                }
            ]
        },
        options: commonOptions
    });
    
    // Phase A components chart
    const phaseACtx = document.getElementById('phase-a-components').getContext('2d');
    phaseAChart = new Chart(phaseACtx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Fundamental',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 2,
                    borderDash: []
                },
                {
                    label: '3rd Harmonic',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: '5th Harmonic',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderWidth: 2,
                    borderDash: [2, 2]
                },
                {
                    label: 'Combined',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderWidth: 3
                }
            ]
        },
        options: commonOptions
    });
    
    // Phase B components chart
    const phaseBCtx = document.getElementById('phase-b-components').getContext('2d');
    phaseBChart = new Chart(phaseBCtx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Fundamental',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 2,
                    borderDash: []
                },
                {
                    label: '3rd Harmonic',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: '5th Harmonic',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderWidth: 2,
                    borderDash: [2, 2]
                },
                {
                    label: 'Combined',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderWidth: 3
                }
            ]
        },
        options: commonOptions
    });
    
    // Phase C components chart
    const phaseCCtx = document.getElementById('phase-c-components').getContext('2d');
    phaseCChart = new Chart(phaseCCtx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Fundamental',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 2,
                    borderDash: []
                },
                {
                    label: '3rd Harmonic',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: '5th Harmonic',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderWidth: 2,
                    borderDash: [2, 2]
                },
                {
                    label: 'Combined',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderWidth: 3
                }
            ]
        },
        options: commonOptions
    });
    
    // Alpha-Beta trajectory plot
    const alphaBetaCtx = document.getElementById('alpha-beta-plot').getContext('2d');
    alphaBetaPlot = new Chart(alphaBetaCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'αβ Trajectory',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    pointRadius: 2,
                    showLine: true,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            animation: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'α Component'
                    },
                    min: -2,
                    max: 2
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'β Component'
                    },
                    min: -2,
                    max: 2
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // D-Q trajectory plot (new)
    const dqCtx = document.getElementById('dq-plot').getContext('2d');
    dqPlot = new Chart(dqCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'dq Trajectory',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    pointRadius: 2,
                    showLine: true,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            animation: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'd Component'
                    },
                    min: -2,
                    max: 2
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'q Component'
                    },
                    min: -2,
                    max: 2
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Harmonic spectrum chart
    const harmonicCtx = document.getElementById('harmonic-spectrum').getContext('2d');
    harmonicChart = new Chart(harmonicCtx, {
        type: 'bar',
        data: {
            labels: ['1st (Fundamental)', '3rd Harmonic', '5th Harmonic'],
            datasets: [
                {
                    label: 'Amplitude',
                    data: [fundamentalAmplitude, thirdHarmonicAmplitude, fifthHarmonicAmplitude],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(75, 192, 192)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amplitude'
                    },
                    max: 1.2
                }
            }
        }
    });
}

// Update all chart data
function updateAllCharts() {
    // Update ABC waveforms chart
    updateABCChart();
    
    // Update Clarke components chart
    updateClarkeChart();
    
    // Update Park components chart
    updateParkChart();
    
    // Update phase components charts
    updatePhaseComponentsCharts();
    
    // Update alpha-beta trajectory plot
    updateAlphaBetaPlot();
    
    // Update d-q trajectory plot
    updateDQPlot();
    
    // Update harmonic spectrum chart
    updateHarmonicSpectrum();
}

// Update the ABC waveforms chart
function updateABCChart() {
    // Create datasets for each phase
    let phaseAData = [];
    let phaseBData = [];
    let phaseCData = [];
    
    for (let i = 0; i < t.length; i++) {
        phaseAData.push({x: t[i], y: va[i]});
        phaseBData.push({x: t[i], y: vb[i]});
        phaseCData.push({x: t[i], y: vc[i]});
    }
    
    // Update chart data
    abcChart.data.datasets[0].data = phaseAData;
    abcChart.data.datasets[1].data = phaseBData;
    abcChart.data.datasets[2].data = phaseCData;
    
    // Update the chart
    abcChart.update();
}

// Update the Clarke components chart
function updateClarkeChart() {
    // Create datasets for each component
    let alphaData = [];
    let betaData = [];
    let gammaData = [];
    
    for (let i = 0; i < t.length; i++) {
        alphaData.push({x: t[i], y: valfa[i]});
        betaData.push({x: t[i], y: vbeta[i]});
        gammaData.push({x: t[i], y: vgamma[i]});
    }
    
    // Update chart data
    clarkeChart.data.datasets[0].data = alphaData;
    clarkeChart.data.datasets[1].data = betaData;
    clarkeChart.data.datasets[2].data = gammaData;
    
    // Update the chart
    clarkeChart.update();
}

// Update the Park components chart
function updateParkChart() {
    // Create datasets for each component
    let dData = [];
    let qData = [];
    let zeroData = [];
    
    for (let i = 0; i < t.length; i++) {
        dData.push({x: t[i], y: vd[i]});
        qData.push({x: t[i], y: vq[i]});
        zeroData.push({x: t[i], y: v0[i]});
    }
    
    // Update chart data
    parkChart.data.datasets[0].data = dData;
    parkChart.data.datasets[1].data = qData;
    parkChart.data.datasets[2].data = zeroData;
    
    // Update the chart
    parkChart.update();
}

// Update phase components charts (A, B, and C)
function updatePhaseComponentsCharts() {
    // Phase A components
    let phaseAFundData = [];
    let phaseA3rdData = [];
    let phaseA5thData = [];
    let phaseACombinedData = [];
    
    // Phase B components
    let phaseBFundData = [];
    let phaseB3rdData = [];
    let phaseB5thData = [];
    let phaseBCombinedData = [];
    
    // Phase C components
    let phaseCFundData = [];
    let phaseC3rdData = [];
    let phaseC5thData = [];
    let phaseCCombinedData = [];
    
    for (let i = 0; i < t.length; i++) {
        // Phase A
        phaseAFundData.push({x: t[i], y: va_fund[i]});
        phaseA3rdData.push({x: t[i], y: va_third[i]});
        phaseA5thData.push({x: t[i], y: va_fifth[i]});
        phaseACombinedData.push({x: t[i], y: va[i]});
        
        // Phase B
        phaseBFundData.push({x: t[i], y: vb_fund[i]});
        phaseB3rdData.push({x: t[i], y: vb_third[i]});
        phaseB5thData.push({x: t[i], y: vb_fifth[i]});
        phaseBCombinedData.push({x: t[i], y: vb[i]});
        
        // Phase C
        phaseCFundData.push({x: t[i], y: vc_fund[i]});
        phaseC3rdData.push({x: t[i], y: vc_third[i]});
        phaseC5thData.push({x: t[i], y: vc_fifth[i]});
        phaseCCombinedData.push({x: t[i], y: vc[i]});
    }
    
    // Update Phase A chart
    phaseAChart.data.datasets[0].data = phaseAFundData;
    phaseAChart.data.datasets[1].data = phaseA3rdData;
    phaseAChart.data.datasets[2].data = phaseA5thData;
    phaseAChart.data.datasets[3].data = phaseACombinedData;
    
    // Update visibility based on checkbox state
    // Update visibility based on checkbox state
    phaseAChart.data.datasets[0].hidden = !showFundamental;
    phaseAChart.data.datasets[1].hidden = !showThirdHarmonic;
    phaseAChart.data.datasets[2].hidden = !showFifthHarmonic;
    phaseAChart.update();
    
    // Update Phase B chart
    phaseBChart.data.datasets[0].data = phaseBFundData;
    phaseBChart.data.datasets[1].data = phaseB3rdData;
    phaseBChart.data.datasets[2].data = phaseB5thData;
    phaseBChart.data.datasets[3].data = phaseBCombinedData;
    
    // Update visibility based on checkbox state
    phaseBChart.data.datasets[0].hidden = !showFundamental;
    phaseBChart.data.datasets[1].hidden = !showThirdHarmonic;
    phaseBChart.data.datasets[2].hidden = !showFifthHarmonic;
    phaseBChart.update();
    
    // Update Phase C chart
    phaseCChart.data.datasets[0].data = phaseCFundData;
    phaseCChart.data.datasets[1].data = phaseC3rdData;
    phaseCChart.data.datasets[2].data = phaseC5thData;
    phaseCChart.data.datasets[3].data = phaseCCombinedData;
    
    // Update visibility based on checkbox state
    phaseCChart.data.datasets[0].hidden = !showFundamental;
    phaseCChart.data.datasets[1].hidden = !showThirdHarmonic;
    phaseCChart.data.datasets[2].hidden = !showFifthHarmonic;
    phaseCChart.update();
}

// Update alpha-beta trajectory plot
function updateAlphaBetaPlot() {
    // Create dataset for alpha-beta trajectory
    let alphaBetaData = [];
    
    for (let i = 0; i < t.length; i++) {
        alphaBetaData.push({x: valfa[i], y: vbeta[i]});
    }
    
    // Update chart data
    alphaBetaPlot.data.datasets[0].data = alphaBetaData;
    
    // Adjust scales based on data range
    const maxAlpha = Math.max(...valfa.map(Math.abs)) * 1.2;
    const maxBeta = Math.max(...vbeta.map(Math.abs)) * 1.2;
    const maxAB = Math.max(maxAlpha, maxBeta, 1.5);
    
    alphaBetaPlot.options.scales.x.min = -maxAB;
    alphaBetaPlot.options.scales.x.max = maxAB;
    alphaBetaPlot.options.scales.y.min = -maxAB;
    alphaBetaPlot.options.scales.y.max = maxAB;
    
    // Update the chart
    alphaBetaPlot.update();
}

// Update d-q trajectory plot
function updateDQPlot() {
    // Create dataset for d-q trajectory
    let dqData = [];
    
    for (let i = 0; i < t.length; i++) {
        dqData.push({x: vd[i], y: vq[i]});
    }
    
    // Update chart data
    dqPlot.data.datasets[0].data = dqData;
    
    // Adjust scales based on data range
    const maxD = Math.max(...vd.map(Math.abs)) * 1.2;
    const maxQ = Math.max(...vq.map(Math.abs)) * 1.2;
    const maxDQ = Math.max(maxD, maxQ, 1.5);
    
    dqPlot.options.scales.x.min = -maxDQ;
    dqPlot.options.scales.x.max = maxDQ;
    dqPlot.options.scales.y.min = -maxDQ;
    dqPlot.options.scales.y.max = maxDQ;
    
    // Update the chart
    dqPlot.update();
}

// Update harmonic spectrum chart
function updateHarmonicSpectrum() {
    // Update chart data based on current amplitudes and visibility
    let harmonicData = [
        showFundamental ? fundamentalAmplitude : 0,
        showThirdHarmonic ? thirdHarmonicAmplitude : 0,
        showFifthHarmonic ? fifthHarmonicAmplitude : 0
    ];
    
    harmonicChart.data.datasets[0].data = harmonicData;
    
    // Update the chart
    harmonicChart.update();
}

// Update the graphs when the "Update" button is clicked
function updateGraphs() {
    // Recalculate angular frequency based on current frequency value
    w = 2 * Math.PI * frequency;
    
    // Create new time array (if frequency changed, sampling might need adjustment)
    createTimeArray();
    
    // Calculate waveforms and transforms
    calculateWaveforms();
    
    // Update all charts
    updateAllCharts();
}

// Add explanation helper functions
function addExplanationToggle(containerId, buttonId, contentId) {
    const button = document.getElementById(buttonId);
    const content = document.getElementById(contentId);

    if (button && content) {
        // Initial state - hidden
        content.style.display = 'none';
        
        // Toggle functionality
        button.addEventListener('click', function() {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                button.textContent = 'Hide Explanation';
            } else {
                content.style.display = 'none';
                button.textContent = 'Show Explanation';
            }
        });
    }
}

// Function to generate Fourier series explanation with LaTeX
function updateFourierExplanation() {
    // Get the explanation container
    const fourierContainer = document.getElementById('fourier-explanation');
    
    if (fourierContainer) {
        // Create explanation content with LaTeX
        const fundamental = fundamentalAmplitude.toFixed(2);
        const third = thirdHarmonicAmplitude.toFixed(2);
        const fifth = fifthHarmonicAmplitude.toFixed(2);
        
        // Build the Fourier series expression based on which components are shown
        let fourierExpression = '';
        let terms = [];
        
        if (showFundamental) {
            terms.push(`${fundamental}\\sin(\\omega t)`);
        }
        
        if (showThirdHarmonic) {
            terms.push(`${third}\\sin(3\\omega t)`);
        }
        
        if (showFifthHarmonic) {
            terms.push(`${fifth}\\sin(5\\omega t)`);
        }
        
        if (terms.length > 0) {
            fourierExpression = `v_a(t) = ${terms.join(' + ')}`;
        } else {
            fourierExpression = `v_a(t) = 0`;
        }
        
        // Update the container
        fourierContainer.innerHTML = `
            <p>The current Fourier series for phase A:</p>
            <div class="latex-container">
                \\[ ${fourierExpression} \\]
            </div>
            <p>Where \\(\\omega = 2\\pi \\cdot ${frequency}\\) rad/s</p>
        `;
        
        // Render LaTeX if MathJax is available
        if (window.MathJax) {
            MathJax.typeset([fourierContainer]);
        }
    }
}

// Initialize explanation toggles when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup explanation toggles
    addExplanationToggle(
        'clarke-explanation-container', 
        'clarke-explanation-toggle', 
        'clarke-explanation-content'
    );
    
    addExplanationToggle(
        'park-explanation-container', 
        'park-explanation-toggle', 
        'park-explanation-content'
    );
    
    addExplanationToggle(
        'harmonics-explanation-container', 
        'harmonics-explanation-toggle', 
        'harmonics-explanation-content'
    );
    
    // Update Fourier explanation
    updateFourierExplanation();
    
    // Add listener to update explanation when parameters change
    document.getElementById('update-graphs').addEventListener('click', updateFourierExplanation);
});

// Add helper function to save charts as images
function setupChartExport() {
    const exportButtons = document.querySelectorAll('.export-chart-btn');
    
    exportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const chartId = this.getAttribute('data-chart');
            const chartCanvas = document.getElementById(chartId);
            
            if (chartCanvas) {
                // Create a temporary link
                const link = document.createElement('a');
                link.download = chartId + '.png';
                link.href = chartCanvas.toDataURL('image/png');
                link.click();
            }
        });
    });
}

// Initialize chart export functionality
document.addEventListener('DOMContentLoaded', function() {
    setupChartExport();
});

// Add educational components initialization
function initializeEducationalContent() {
    // Clarke Transform Matrix explanation
    const clarkeMatrixContainer = document.getElementById('clarke-matrix');
    if (clarkeMatrixContainer) {
        clarkeMatrixContainer.innerHTML = `
            <div class="matrix-container">
                <p>Clarke Transform Matrix:</p>
                <div class="latex-container">
                    \\[ \\begin{bmatrix} v_\\alpha \\\\ v_\\beta \\\\ v_0 \\end{bmatrix} = 
                    \\begin{bmatrix} 
                    \\frac{2}{3} & -\\frac{1}{3} & -\\frac{1}{3} \\\\
                    0 & -\\frac{1}{\\sqrt{3}} & \\frac{1}{\\sqrt{3}} \\\\
                    \\frac{1}{3} & \\frac{1}{3} & \\frac{1}{3}
                    \\end{bmatrix}
                    \\begin{bmatrix} v_a \\\\ v_b \\\\ v_c \\end{bmatrix} \\]
                </div>
            </div>
        `;
    }
    
    // Park Transform explanation
    const parkTransformContainer = document.getElementById('park-transform');
    if (parkTransformContainer) {
        parkTransformContainer.innerHTML = `
            <div class="matrix-container">
                <p>Park Transform (rotating reference frame):</p>
                <div class="latex-container">
                    \\[ \\begin{bmatrix} v_d \\\\ v_q \\\\ v_0 \\end{bmatrix} = 
                    \\begin{bmatrix} 
                    \\cos(\\theta) & \\sin(\\theta) & 0 \\\\
                    -\\sin(\\theta) & \\cos(\\theta) & 0 \\\\
                    0 & 0 & 1
                    \\end{bmatrix}
                    \\begin{bmatrix} v_\\alpha \\\\ v_\\beta \\\\ v_0 \\end{bmatrix} \\]
                </div>
                <p>Where \\(\\theta = \\omega t\\) is the electrical angle</p>
            </div>
        `;
    }
    
    // Render LaTeX if MathJax is available
    if (window.MathJax) {
        MathJax.typeset();
    }
}

// Initialize educational content when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEducationalContent();
});

// Add export functionality for all data
function exportSimulationData() {
    // Create an object with all the simulation data
    const simulationData = {
        parameters: {
            frequency: frequency,
            fundamentalAmplitude: fundamentalAmplitude,
            thirdHarmonicAmplitude: thirdHarmonicAmplitude,
            fifthHarmonicAmplitude: fifthHarmonicAmplitude,
            showFundamental: showFundamental,
            showThirdHarmonic: showThirdHarmonic,
            showFifthHarmonic: showFifthHarmonic
        },
        timeData: t,
        waveforms: {
            phaseA: va,
            phaseB: vb,
            phaseC: vc
        },
        clarkeComponents: {
            alpha: valfa,
            beta: vbeta,
            zero: vgamma
        },
        parkComponents: {
            d: vd,
            q: vq,
            zero: v0
        }
    };
    
    // Convert to JSON
    const dataStr = JSON.stringify(simulationData, null, 2);
    
    // Create download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'park_transform_simulation.json';
    link.href = url;
    link.click();
}

// Initialize export data functionality
document.addEventListener('DOMContentLoaded', function() {
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportSimulationData);
    }
});