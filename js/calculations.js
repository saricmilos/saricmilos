// Main visualization script for Three-Phase Harmonics
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const fundamentalAmplitudeSlider = document.getElementById('fundamental-amplitude');
    const fundamentalAmplitudeValue = document.getElementById('fundamental-amplitude-value');
    const thirdHarmonicAmplitudeSlider = document.getElementById('third-harmonic-amplitude');
    const thirdHarmonicAmplitudeValue = document.getElementById('third-harmonic-amplitude-value');
    const fifthHarmonicAmplitudeSlider = document.getElementById('fifth-harmonic-amplitude');
    const fifthHarmonicAmplitudeValue = document.getElementById('fifth-harmonic-amplitude-value');
    const frequencySlider = document.getElementById('frequency');
    const frequencyValue = document.getElementById('frequency-value');
    const updateBtn = document.getElementById('update-btn');
    
    // View buttons
    const view3DBtn = document.getElementById('view-3d');
    const viewABBtn = document.getElementById('view-ab');
    const viewBCBtn = document.getElementById('view-bc');
    const viewACBtn = document.getElementById('view-ac');
    const viewAlphaBetaBtn = document.getElementById('view-alpha-beta');
    
    // Initial parameters
    let fundamentalAmplitude = parseFloat(fundamentalAmplitudeSlider.value);
    let thirdHarmonicAmplitude = parseFloat(thirdHarmonicAmplitudeSlider.value);
    let fifthHarmonicAmplitude = parseFloat(fifthHarmonicAmplitudeSlider.value);
    let frequency = parseFloat(frequencySlider.value);
    
    // Update value displays
    fundamentalAmplitudeSlider.addEventListener('input', function() {
        fundamentalAmplitudeValue.textContent = this.value;
        fundamentalAmplitude = parseFloat(this.value);
    });
    
    thirdHarmonicAmplitudeSlider.addEventListener('input', function() {
        thirdHarmonicAmplitudeValue.textContent = this.value;
        thirdHarmonicAmplitude = parseFloat(this.value);
    });
    
    fifthHarmonicAmplitudeSlider.addEventListener('input', function() {
        fifthHarmonicAmplitudeValue.textContent = this.value;
        fifthHarmonicAmplitude = parseFloat(this.value);
    });
    
    frequencySlider.addEventListener('input', function() {
        frequencyValue.textContent = this.value;
        frequency = parseFloat(this.value);
    });
    
    // Constants
    const numPoints = 200;
    const timeStep = 0.04 / numPoints;
    const timeDuration = 0.04; // One period at 50 Hz
    
    // Generate time array
    function generateTimeArray() {
        let t = [];
        for (let i = 0; i <= numPoints; i++) {
            t.push(i * timeStep);
        }
        return t;
    }
    
    // Clarke transformation matrix
    const clarke = math.matrix([
        [2/3, -1/3, -1/3],
        [0, -1/Math.sqrt(3), 1/Math.sqrt(3)],
        [1/3, 1/3, 1/3]
    ]);
    
    // Calculate waveforms
    function calculateWaveforms(t) {
        const w = 2 * Math.PI * frequency;
        let waveforms = {
            va_fund: [],
            vb_fund: [],
            vc_fund: [],
            va_third: [],
            vb_third: [],
            vc_third: [],
            va_fifth: [],
            vb_fifth: [],
            vc_fifth: [],
            va: [],
            vb: [],
            vc: [],
            valpha: [],
            vbeta: [],
            vzero: [],
            ia: [], // Assuming unity power factor for simplicity
            ib: [],
            ic: [],
            pa: [], // Instantaneous power
            pb: [],
            pc: [],
            ptotal: []
        };
        
        // Generate waveforms
        for (let i = 0; i < t.length; i++) {
            // Fundamental components
            const vaFund = fundamentalAmplitude * Math.sin(w * t[i]);
            const vbFund = fundamentalAmplitude * Math.sin(w * t[i] - 2 * Math.PI / 3);
            const vcFund = fundamentalAmplitude * Math.sin(w * t[i] + 2 * Math.PI / 3);
            
            // Third harmonic components (all in phase)
            const vaThird = thirdHarmonicAmplitude * Math.sin(3 * w * t[i]);
            const vbThird = thirdHarmonicAmplitude * Math.sin(3 * w * t[i]);
            const vcThird = thirdHarmonicAmplitude * Math.sin(3 * w * t[i]);
            
            // Fifth harmonic components (negative sequence)
            const vaFifth = fifthHarmonicAmplitude * Math.sin(5 * w * t[i]);
            const vbFifth = fifthHarmonicAmplitude * Math.sin(5 * w * t[i] + 2 * Math.PI / 3);
            const vcFifth = fifthHarmonicAmplitude * Math.sin(5 * w * t[i] - 2 * Math.PI / 3);
            
            // Combined waveforms
            const va = vaFund + vaThird + vaFifth;
            const vb = vbFund + vbThird + vbFifth;
            const vc = vcFund + vcThird + vcFifth;
            
            // Currents (assuming unity power factor)
            const ia = va;
            const ib = vb;
            const ic = vc;
            
            // Power calculations
            const pa = va * ia;
            const pb = vb * ib;
            const pc = vc * ic;
            const ptotal = pa + pb + pc;
            
            // Clarke transformation
            const v_abc = math.matrix([[va], [vb], [vc]]);
            const v_clarke = math.multiply(clarke, v_abc);
            
            // Store values
            waveforms.va_fund.push(vaFund);
            waveforms.vb_fund.push(vbFund);
            waveforms.vc_fund.push(vcFund);
            waveforms.va_third.push(vaThird);
            waveforms.vb_third.push(vbThird);
            waveforms.vc_third.push(vcThird);
            waveforms.va_fifth.push(vaFifth);
            waveforms.vb_fifth.push(vbFifth);
            waveforms.vc_fifth.push(vcFifth);
            waveforms.va.push(va);
            waveforms.vb.push(vb);
            waveforms.vc.push(vc);
            waveforms.valpha.push(v_clarke.get([0, 0]));
            waveforms.vbeta.push(v_clarke.get([1, 0]));
            waveforms.vzero.push(v_clarke.get([2, 0]));
            waveforms.ia.push(ia);
            waveforms.ib.push(ib);
            waveforms.ic.push(ic);
            waveforms.pa.push(pa);
            waveforms.pb.push(pb);
            waveforms.pc.push(pc);
            waveforms.ptotal.push(ptotal);
        }
        
        return waveforms;
    }
    
    // Create charts
    let abcChart = new Chart(document.getElementById('abc-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'va',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'vb',
                    data: [],
                    borderColor: 'rgba(0, 153, 255, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'vc',
                    data: [],
                    borderColor: 'rgba(153, 153, 255, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    min: -1.5,
                    max: 1.5,
                    title: {
                        display: true,
                        text: 'Voltage (pu)'
                    }
                }
            }
        }
    });
    
    let clarkeChart = new Chart(document.getElementById('clarke-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'vα',
                    data: [],
                    borderColor: 'red',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'vβ',
                    data: [],
                    borderColor: 'rgba(255, 0, 153, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'v0',
                    data: [],
                    borderColor: 'rgba(255, 153, 153, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    min: -1.5,
                    max: 1.5,
                    title: {
                        display: true,
                        text: 'Voltage (pu)'
                    }
                }
            }
        }
    });
    
    let componentsChart = new Chart(document.getElementById('components-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'va fund',
                    data: [],
                    borderColor: 'rgba(0, 0, 0, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'va 3rd',
                    data: [],
                    borderColor: 'rgba(0, 0, 0, 0.5)',
                    borderWidth: 1,
                    borderDash: [2, 2],
                    fill: false
                },
                {
                    label: 'va 5th',
                    data: [],
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                    borderWidth: 1,
                    borderDash: [1, 1],
                    fill: false
                },
                {
                    label: 'va combined',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    min: -1.5,
                    max: 1.5,
                    title: {
                        display: true,
                        text: 'Voltage (pu)'
                    }
                }
            }
        }
    });
    
    // Add power chart
    let powerChart = new Chart(document.getElementById('power-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'PA',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'PB',
                    data: [],
                    borderColor: 'green',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'PC',
                    data: [],
                    borderColor: 'red',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'PTOTAL',
                    data: [],
                    borderColor: 'black',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Power (pu)'
                    }
                }
            }
        }
    });
    
    // 3D visualization using Three.js
    let scene, camera, renderer, controls, spaceVectorLine;
    
    // Initialize 3D scene
    function init3DScene() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, document.getElementById('space-vector-container').clientWidth / 
                                            document.getElementById('space-vector-container').clientHeight, 0.1, 1000);
        camera.position.set(2, 1.5, 2);
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(document.getElementById('space-vector-container').clientWidth, 
                         document.getElementById('space-vector-container').clientHeight);
        
        // Clear existing content and append new renderer
        const container = document.getElementById('space-vector-container');
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        
        // Add controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Create cubic frame
        createCubicFrame();
        
        // Create axes
        createAxes();
        
        // Create Clarke axes
        createClarkeAxes();
        
        // Create zero sequence plane
        createZeroSequencePlane();
    }
    
    // Create cubic frame
    function createCubicFrame() {
        const vertices = [
            new THREE.Vector3(-1, -1, -1),
            new THREE.Vector3(-1, -1, 1),
            new THREE.Vector3(-1, 1, -1),
            new THREE.Vector3(-1, 1, 1),
            new THREE.Vector3(1, -1, -1),
            new THREE.Vector3(1, -1, 1),
            new THREE.Vector3(1, 1, -1),
            new THREE.Vector3(1, 1, 1)
        ];
        
        const edges = [
            [0, 1], [1, 3], [3, 2], [2, 0],
            [4, 5], [5, 7], [7, 6], [6, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];
        
        const material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.3, transparent: true });
        
        edges.forEach(edge => {
            const geometry = new THREE.BufferGeometry().setFromPoints([vertices[edge[0]], vertices[edge[1]]]);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        });
    }
    
    // Create axes
    function createAxes() {
        // a axis (x)
        const aAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1.2, 0, 0)
        ]);
        const aAxisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const aAxis = new THREE.Line(aAxisGeometry, aAxisMaterial);
        scene.add(aAxis);
        
        // b axis (y)
        const bAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 1.2, 0)
        ]);
        const bAxisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const bAxis = new THREE.Line(bAxisGeometry, bAxisMaterial);
        scene.add(bAxis);
        
        // c axis (z)
        const cAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1.2)
        ]);
        const cAxisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const cAxis = new THREE.Line(cAxisGeometry, cAxisMaterial);
        scene.add(cAxis);
        
        // Add text labels (replaced with simple objects as text is complex in THREE.js)
        const aLabelGeometry = new THREE.SphereGeometry(0.05);
        const aLabelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const aLabel = new THREE.Mesh(aLabelGeometry, aLabelMaterial);
        aLabel.position.set(1.3, 0, 0);
        scene.add(aLabel);
        
        const bLabelGeometry = new THREE.SphereGeometry(0.05);
        const bLabelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const bLabel = new THREE.Mesh(bLabelGeometry, bLabelMaterial);
        bLabel.position.set(0, 1.3, 0);
        scene.add(bLabel);
        
        const cLabelGeometry = new THREE.SphereGeometry(0.05);
        const cLabelMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const cLabel = new THREE.Mesh(cLabelGeometry, cLabelMaterial);
        cLabel.position.set(0, 0, 1.3);
        scene.add(cLabel);
    }
    
    // Create Clarke axes
    function createClarkeAxes() {
        // Calculate Clarke axes directions
        const alpha = new THREE.Vector3(1, -0.5, -0.5).normalize().multiplyScalar(1.2);
        const beta = new THREE.Vector3(0, -Math.sqrt(3)/2, Math.sqrt(3)/2).normalize().multiplyScalar(1.2);
        const zero = new THREE.Vector3(1/Math.sqrt(3), 1/Math.sqrt(3), 1/Math.sqrt(3)).normalize().multiplyScalar(1.2);
        
        // Alpha axis
        const alphaAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(alpha.x, alpha.y, alpha.z)
        ]);
        const alphaAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const alphaAxis = new THREE.Line(alphaAxisGeometry, alphaAxisMaterial);
        scene.add(alphaAxis);
        
        // Beta axis
        const betaAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(beta.x, beta.y, beta.z)
        ]);
        const betaAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });
        const betaAxis = new THREE.Line(betaAxisGeometry, betaAxisMaterial);
        scene.add(betaAxis);
        
        // Zero axis
        const zeroAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(zero.x, zero.y, zero.z)
        ]);
        const zeroAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff9999 });
        const zeroAxis = new THREE.Line(zeroAxisGeometry, zeroAxisMaterial);
        scene.add(zeroAxis);
        
        // Add labels (simple sphere markers)
        const alphaLabelGeometry = new THREE.SphereGeometry(0.05);
        const alphaLabelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const alphaLabel = new THREE.Mesh(alphaLabelGeometry, alphaLabelMaterial);
        alphaLabel.position.set(alpha.x, alpha.y, alpha.z);
        scene.add(alphaLabel);
        
        const betaLabelGeometry = new THREE.SphereGeometry(0.05);
        const betaLabelMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const betaLabel = new THREE.Mesh(betaLabelGeometry, betaLabelMaterial);
        betaLabel.position.set(beta.x, beta.y, beta.z);
        scene.add(betaLabel);
        
        const zeroLabelGeometry = new THREE.SphereGeometry(0.05);
        const zeroLabelMaterial = new THREE.MeshBasicMaterial({ color: 0xff9999 });
        const zeroLabel = new THREE.Mesh(zeroLabelGeometry, zeroLabelMaterial);
        zeroLabel.position.set(zero.x, zero.y, zero.z);
        scene.add(zeroLabel);
    }
    
    // Create zero sequence plane
    function createZeroSequencePlane() {
        const vertices = [
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(0, 1, -1),
            new THREE.Vector3(-1, 1, 0),
            new THREE.Vector3(-1, 0, 1),
            new THREE.Vector3(0, -1, 1),
            new THREE.Vector3(1, -1, 0)
        ];
        
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]
        ];
        
        const material = new THREE.LineBasicMaterial({ color: 0x808080, opacity: 0.5, transparent: true });
        
        edges.forEach(edge => {
            const geometry = new THREE.BufferGeometry().setFromPoints([vertices[edge[0]], vertices[edge[1]]]);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        });
    }
    
    // Update 3D space vector
    function updateSpaceVector(waveforms) {
        // Remove previous line if exists
        if (spaceVectorLine) {
            scene.remove(spaceVectorLine);
        }
        
        // Create new line geometry
        const points = [];
        for (let i = 0; i < waveforms.va.length; i++) {
            points.push(new THREE.Vector3(
                waveforms.va[i],
                waveforms.vb[i],
                waveforms.vc[i]
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
        spaceVectorLine = new THREE.Line(geometry, material);
        scene.add(spaceVectorLine);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    // Update chart data
    function updateCharts(t, waveforms) {
        // Format time to milliseconds for display
        const timeLabels = t.map(val => val.toFixed(3));
        
        // Update ABC chart
        abcChart.data.labels = timeLabels;
        abcChart.data.datasets[0].data = waveforms.va;
        abcChart.data.datasets[1].data = waveforms.vb;
        abcChart.data.datasets[2].data = waveforms.vc;
        abcChart.update();
        
        // Update Clarke chart
        clarkeChart.data.labels = timeLabels;
        clarkeChart.data.datasets[0].data = waveforms.valpha;
        clarkeChart.data.datasets[1].data = waveforms.vbeta;
        clarkeChart.data.datasets[2].data = waveforms.vzero;
        clarkeChart.update();
        
        // Update Components chart
        componentsChart.data.labels = timeLabels;
        componentsChart.data.datasets[0].data = waveforms.va_fund;
        componentsChart.data.datasets[1].data = waveforms.va_third;
        componentsChart.data.datasets[2].data = waveforms.va_fifth;
        componentsChart.data.datasets[3].data = waveforms.va;
        componentsChart.update();
        
        // Update Power chart
        powerChart.data.labels = timeLabels;
        powerChart.data.datasets[0].data = waveforms.pa;
        powerChart.data.datasets[1].data = waveforms.pb;
        powerChart.data.datasets[2].data = waveforms.pc;
        powerChart.data.datasets[3].data = waveforms.ptotal;
        powerChart.update();
        
        // Update space vector 3D visualization
        updateSpaceVector(waveforms);
    }
    
    // Calculate power metrics
    function calculatePowerMetrics(waveforms) {
        // Helper function for RMS calculation
        function calculateRMS(array) {
            const sumSquares = array.reduce((sum, val) => sum + val * val, 0);
            return Math.sqrt(sumSquares / array.length);
        }
        
        // Helper function for average calculation
        function calculateAverage(array) {
            return array.reduce((sum, val) => sum + val, 0) / array.length;
        }
        
        // Calculate for each phase and total
        const results = {
            active: {
                a: calculateAverage(waveforms.pa),
                b: calculateAverage(waveforms.pb),
                c: calculateAverage(waveforms.pc),
                total: calculateAverage(waveforms.ptotal)
            },
            apparent: {
                a: calculateRMS(waveforms.va) * calculateRMS(waveforms.ia),
                b: calculateRMS(waveforms.vb) * calculateRMS(waveforms.ib),
                c: calculateRMS(waveforms.vc) * calculateRMS(waveforms.ic)
            }
        };
        
        // Total apparent power
        results.apparent.total = results.apparent.a + results.apparent.b + results.apparent.c;
        
        // Reactive power (derived from active and apparent)
        results.reactive = {
            a: Math.sqrt(Math.max(0, results.apparent.a * results.apparent.a - results.active.a * results.active.a)),
            b: Math.sqrt(Math.max(0, results.apparent.b * results.apparent.b - results.active.b * results.active.b)),
            c: Math.sqrt(Math.max(0, results.apparent.c * results.apparent.c - results.active.c * results.active.c))
        };
        results.reactive.total = Math.sqrt(Math.max(0, results.apparent.total * results.apparent.total - results.active.total * results.active.total));
        
        // Power factor
        results.powerFactor = {
            a: results.apparent.a !== 0 ? results.active.a / results.apparent.a : 0,
            b: results.apparent.b !== 0 ? results.active.b / results.apparent.b : 0,
            c: results.apparent.c !== 0 ? results.active.c / results.apparent.c : 0,
            total: results.apparent.total !== 0 ? results.active.total / results.apparent.total : 0
        };
        
        return results;
    }
    
    // Update power indicators
    function updatePowerIndicators(powerMetrics) {
        // Format to 2 decimal places
        document.getElementById('active-power-total').textContent = powerMetrics.active.total.toFixed(2) + ' W';
        document.getElementById('active-power-a').textContent = powerMetrics.active.a.toFixed(2) + ' W';
        document.getElementById('active-power-b').textContent = powerMetrics.active.b.toFixed(2) + ' W';
        document.getElementById('active-power-c').textContent = powerMetrics.active.c.toFixed(2) + ' W';
        
        document.getElementById('reactive-power-total').textContent = powerMetrics.reactive.total.toFixed(2) + ' VAr';
        document.getElementById('reactive-power-a').textContent = powerMetrics.reactive.a.toFixed(2) + ' VAr';
        document.getElementById('reactive-power-b').textContent = powerMetrics.reactive.b.toFixed(2) + ' VAr';
        document.getElementById('reactive-power-c').textContent = powerMetrics.reactive.c.toFixed(2) + ' VAr';
        
        document.getElementById('apparent-power-total').textContent = powerMetrics.apparent.total.toFixed(2) + ' VA';
        document.getElementById('apparent-power-a').textContent = powerMetrics.apparent.a.toFixed(2) + ' VA';
        document.getElementById('apparent-power-b').textContent = powerMetrics.apparent.b.toFixed(2) + ' VA';
        document.getElementById('apparent-power-c').textContent = powerMetrics.apparent.c.toFixed(2) + ' VA';
        
        document.getElementById('power-factor-total').textContent = powerMetrics.powerFactor.total.toFixed(3);
        document.getElementById('power-factor-a').textContent = powerMetrics.powerFactor.a.toFixed(3);
        document.getElementById('power-factor-b').textContent = powerMetrics.powerFactor.b.toFixed(3);
        document.getElementById('power-factor-c').textContent = powerMetrics.powerFactor.c.toFixed(3);
    }
    
    // Main update function
    function updateVisualization() {
        const t = generateTimeArray();
        const waveforms = calculateWaveforms(t);
        const powerMetrics = calculatePowerMetrics(waveforms);
        
        updateCharts(t, waveforms);
        updatePowerIndicators(powerMetrics);
    }
    
    // Set up view buttons
    view3DBtn.addEventListener('click', function() {
        camera.position.set(2, 1.5, 2);
        controls.update();
    });
    
    viewABBtn.addEventListener('click', function() {
        camera.position.set(0, 0, 2);
        controls.target.set(0, 0, 0);
        controls.update();
    });
    
    viewBCBtn.addEventListener('click', function() {
        camera.position.set(2, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
    });
    
    viewACBtn.addEventListener('click', function() {
        camera.position.set(0, 2, 0);
        controls.target.set(0, 0, 0);
        controls.update();
    });
    
    viewAlphaBetaBtn.addEventListener('click', function() {
        camera.position.set(1.5, 1.5, 1.5);
        controls.target.set(0, 0, 0);
        controls.update();
    });
    
    // Update button event
    updateBtn.addEventListener('click', updateVisualization);
    
    // Initialize and run first visualization
    init3DScene();
    animate();
    updateVisualization();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Resize 3D renderer
        if (renderer) {
            const container = document.getElementById('space-vector-container');
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        // Charts will resize automatically with Chart.js responsive option
    });
    
    // Add harmonic analysis function
    function analyzeHarmonics(waveforms) {
        // This would implement FFT or another spectral analysis
        // For simplicity, we'll just return the known harmonic content
        return {
            fundamental: fundamentalAmplitude,
            thirdHarmonic: thirdHarmonicAmplitude,
            fifthHarmonic: fifthHarmonicAmplitude,
            thd: calculateTHD(fundamentalAmplitude, thirdHarmonicAmplitude, fifthHarmonicAmplitude)
        };
    }
    
    // Calculate Total Harmonic Distortion (THD)
    function calculateTHD(fundamental, third, fifth) {
        if (fundamental === 0) return 0;
        const harmonicsSquareSum = Math.pow(third, 2) + Math.pow(fifth, 2);
        return Math.sqrt(harmonicsSquareSum) / fundamental * 100; // as percentage
    }
    
    // Calculate harmonic losses
    function calculateHarmonicLosses(waveforms) {
        // In a real system, losses would depend on resistance, but for simplicity,
        // we'll calculate harmonic content power compared to fundamental
        const fundamentalRMS = Math.sqrt(Math.pow(fundamentalAmplitude, 2) / 2);
        const thirdHarmonicRMS = Math.sqrt(Math.pow(thirdHarmonicAmplitude, 2) / 2);
        const fifthHarmonicRMS = Math.sqrt(Math.pow(fifthHarmonicAmplitude, 2) / 2);
        
        // Assume R = 1 ohm for demonstration
        const fundamentalPower = 3 * Math.pow(fundamentalRMS, 2); // 3-phase system
        const thirdHarmonicPower = 3 * Math.pow(thirdHarmonicRMS, 2);
        const fifthHarmonicPower = 3 * Math.pow(fifthHarmonicRMS, 2);
        
        return {
            fundamental: fundamentalPower,
            thirdHarmonic: thirdHarmonicPower,
            fifthHarmonic: fifthHarmonicPower,
            totalHarmonicLoss: thirdHarmonicPower + fifthHarmonicPower,
            percentageLoss: (thirdHarmonicPower + fifthHarmonicPower) / fundamentalPower * 100
        };
    }
    
    // Add additional functionality to analyze waveforms and provide detailed power analysis
    updateBtn.addEventListener('dblclick', function() {
        const t = generateTimeArray();
        const waveforms = calculateWaveforms(t);
        const harmonicAnalysis = analyzeHarmonics(waveforms);
        const harmonicLosses = calculateHarmonicLosses(waveforms);
        
        console.log('Harmonic Analysis:', harmonicAnalysis);
        console.log('Harmonic Losses:', harmonicLosses);
        
        // Could display this in a modal or another panel in a more complete implementation
        alert(`Harmonic Analysis:
THD: ${harmonicAnalysis.thd.toFixed(2)}%
Additional Losses due to Harmonics: ${harmonicLosses.totalHarmonicLoss.toFixed(3)} W
Percentage Loss: ${harmonicLosses.percentageLoss.toFixed(2)}% of fundamental power`);
    });
});