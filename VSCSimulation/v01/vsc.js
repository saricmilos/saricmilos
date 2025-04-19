// VSC Modeler - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Main state for the application
    const state = {
        components: [],
        connections: [],
        selectedComponent: null,
        history: [],
        historyIndex: -1,
        isDrawingConnection: false,
        connectionStart: null,
        connectionStartPoint: null
    };
    
    // DOM Elements
    const modelingCanvas = document.getElementById('modeling-canvas');
    const propertiesContent = document.getElementById('properties-content');
    const componentItems = document.querySelectorAll('.component-item');
    const clearCanvasBtn = document.getElementById('clear-canvas');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    const simulateBtn = document.getElementById('simulate');
    const saveBtn = document.getElementById('save');
    const loadBtn = document.getElementById('load');
    const tabButtons = document.querySelectorAll('.tab-button');
    const simulationResults = document.getElementById('simulation_results');
    
    // Initialize the canvas grid
    function initializeGrid() {
        const gridBackground = modelingCanvas.querySelector('.grid-background');
        // Grid already created in HTML
    }
    
    // Component Templates
    const componentTemplates = {
        'voltage-source': {
            label: 'Voltage Source',
            image: '../VSCimages/DCVS.PNG',
            properties: {
                name: 'VS1',
                voltage: '230',
                frequency: '50',
                phase: '0'
            },
            connectionPoints: [
                { x: 30, y: 0, type: 'output' },  // Top
                { x: 30, y: 60, type: 'output' }   // Bottom
            ]
        },
        'converter': {
            label: 'Converter',
            image: '../images/components/converter.svg',
            properties: {
                name: 'CONV1',
                type: 'VSC',
                switchingFreq: '5000',
                dcVoltage: '800'
            },
            connectionPoints: [
                { x: 0, y: 30, type: 'input' },   // Left
                { x: 60, y: 30, type: 'output' }   // Right
            ]
        },
        'transformer': {
            label: 'Transformer',
            image: '../images/components/transformer.svg',
            properties: {
                name: 'TX1',
                ratingMVA: '10',
                primaryVoltage: '33000',
                secondaryVoltage: '400',
                impedance: '5'
            },
            connectionPoints: [
                { x: 0, y: 30, type: 'input' },   // Left
                { x: 60, y: 30, type: 'output' }   // Right
            ]
        },
        'inductor': {
            label: 'Inductor',
            image: '../VSCimages/inductor.PNG',
            properties: {
                name: 'L1',
                inductance: '0.01',
                resistance: '0.001'
            },
            connectionPoints: [
                { x: 0, y: 30, type: 'input' },   // Left
                { x: 60, y: 30, type: 'output' }   // Right
            ]
        },
        'capacitor': {
            label: 'Capacitor',
            image: '../images/components/capacitor.svg',
            properties: {
                name: 'C1',
                capacitance: '0.0001'
            },
            connectionPoints: [
                { x: 30, y: 0, type: 'input' },   // Top
                { x: 30, y: 60, type: 'output' }   // Bottom
            ]
        },
        'resistor': {
            label: 'Resistor',
            image: '../VSCimages/resistance.PNG',
            properties: {
                name: 'R1',
                resistance: '10'
            },
            connectionPoints: [
                { x: 0, y: 30, type: 'input' },   // Left
                { x: 60, y: 30, type: 'output' }   // Right
            ]
        },
        'load': {
            label: 'Load',
            image: '../images/components/load.svg',
            properties: {
                name: 'LOAD1',
                activePower: '1000',
                reactivePower: '200',
                voltageRated: '400'
            },
            connectionPoints: [
                { x: 30, y: 0, type: 'input' },   // Top
                { x: 30, y: 60, type: 'output' }   // Bottom
            ]
        },
        'ground': {
            label: 'Ground',
            image: '../VSCimages/ground.PNG',
            properties: {
                name: 'GND1'
            },
            connectionPoints: [
                { x: 30, y: 0, type: 'input' }    // Top
            ]
        },
        'connection': {
            label: 'Connection',
            image: '../images/components/connection.svg',
            properties: {
                name: 'CONN1'
            },
            connectionPoints: [
                { x: 0, y: 30, type: 'input' },   // Left
                { x: 60, y: 30, type: 'output' },  // Right
                { x: 30, y: 0, type: 'input' },   // Top
                { x: 30, y: 60, type: 'output' }   // Bottom
            ]
        },
        'control-block': {
            label: 'Control Block',
            image: '../images/components/control-block.svg',
            properties: {
                name: 'CTRL1',
                type: 'PI',
                kp: '0.5',
                ki: '0.1',
                saturationMax: '1',
                saturationMin: '-1'
            },
            connectionPoints: [
                { x: 0, y: 30, type: 'input' },   // Left
                { x: 60, y: 30, type: 'output' }   // Right
            ]
        }
    };
    
    // Component creation and management functions
    function createComponent(type, x, y) {
        const id = generateId();
        const template = componentTemplates[type];
        
        if (!template) {
            console.error(`Component type '${type}' not found`);
            return;
        }
        
        const component = {
            id,
            type,
            x,
            y,
            label: template.label,
            imageUrl: template.image,
            properties: JSON.parse(JSON.stringify(template.properties)),
            connectionPoints: JSON.parse(JSON.stringify(template.connectionPoints))
        };
        
        state.components.push(component);
        renderComponent(component);
        saveHistoryState();
        return component;
    }
    
    function renderComponent(component) {
        const componentElem = document.createElement('div');
        componentElem.className = 'canvas-component';
        componentElem.id = `component-${component.id}`;
        componentElem.style.left = `${component.x}px`;
        componentElem.style.top = `${component.y}px`;
        
        const img = document.createElement('img');
        img.src = component.imageUrl;
        img.alt = component.label;
        
        const label = document.createElement('div');
        label.className = 'component-label';
        label.textContent = component.properties.name || component.label;
        
        componentElem.appendChild(img);
        componentElem.appendChild(label);
        
        // Add connection points
        component.connectionPoints.forEach((point, index) => {
            const connectionPoint = document.createElement('div');
            connectionPoint.className = 'connection-point';
            connectionPoint.dataset.componentId = component.id;
            connectionPoint.dataset.pointIndex = index;
            connectionPoint.style.left = `${point.x}px`;
            connectionPoint.style.top = `${point.y}px`;
            
            // Event listeners for connection points
            connectionPoint.addEventListener('mousedown', startConnection);
            
            componentElem.appendChild(connectionPoint);
        });
        
        // Event listeners for component
        componentElem.addEventListener('mousedown', function(e) {
            // Prevent if clicking on connection point
            if (e.target.classList.contains('connection-point')) return;
            
            selectComponent(component);
            startDragging(e, componentElem, component);
        });
        
        modelingCanvas.appendChild(componentElem);
    }
    
    function updateComponentPosition(component) {
        const componentElem = document.getElementById(`component-${component.id}`);
        if (componentElem) {
            componentElem.style.left = `${component.x}px`;
            componentElem.style.top = `${component.y}px`;
            
            // Update connections related to this component
            updateConnections(component);
        }
    }
    
    function selectComponent(component) {
        // Clear previous selection
        if (state.selectedComponent) {
            const prevElem = document.getElementById(`component-${state.selectedComponent.id}`);
            if (prevElem) prevElem.classList.remove('selected');
        }
        
        state.selectedComponent = component;
        
        if (component) {
            const componentElem = document.getElementById(`component-${component.id}`);
            if (componentElem) componentElem.classList.add('selected');
            showComponentProperties(component);
        } else {
            showNoSelection();
        }
    }
    
    function deleteComponent(componentId) {
        const index = state.components.findIndex(c => c.id === componentId);
        if (index !== -1) {
            // Remove the component from DOM
            const componentElem = document.getElementById(`component-${componentId}`);
            if (componentElem) componentElem.remove();
            
            // Remove all connections related to this component
            state.connections = state.connections.filter(conn => {
                if (conn.sourceComponent === componentId || conn.targetComponent === componentId) {
                    const connElem = document.getElementById(`connection-${conn.id}`);
                    if (connElem) connElem.remove();
                    return false;
                }
                return true;
            });
            
            // Remove from state
            state.components.splice(index, 1);
            
            // Update selection if needed
            if (state.selectedComponent && state.selectedComponent.id === componentId) {
                selectComponent(null);
            }
            
            saveHistoryState();
        }
    }
    
    // Connection functions
    function startConnection(e) {
        e.stopPropagation();
        
        const componentId = e.target.dataset.componentId;
        const pointIndex = parseInt(e.target.dataset.pointIndex);
        const component = state.components.find(c => c.id === componentId);
        
        if (component) {
            state.isDrawingConnection = true;
            state.connectionStart = {
                componentId,
                pointIndex
            };
            
            const rect = e.target.getBoundingClientRect();
            const canvasRect = modelingCanvas.getBoundingClientRect();
            
            state.connectionStartPoint = {
                x: rect.left + rect.width / 2 - canvasRect.left + modelingCanvas.scrollLeft,
                y: rect.top + rect.height / 2 - canvasRect.top + modelingCanvas.scrollTop
            };
            
            // Create temporary connection line
            const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            tempLine.id = 'temp-connection';
            tempLine.style.position = 'absolute';
            tempLine.style.top = '0';
            tempLine.style.left = '0';
            tempLine.style.width = '100%';
            tempLine.style.height = '100%';
            tempLine.style.pointerEvents = 'none';
            tempLine.style.zIndex = '5';
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke', '#007bff');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-dasharray', '5,5');
            tempLine.appendChild(path);
            
            modelingCanvas.appendChild(tempLine);
            
            // Add mousemove listener to canvas
            modelingCanvas.addEventListener('mousemove', moveConnection);
            // Add mouseup listener to document
            document.addEventListener('mouseup', endConnection);
        }
    }
    
    function moveConnection(e) {
        if (!state.isDrawingConnection) return;
        
        const canvasRect = modelingCanvas.getBoundingClientRect();
        const endPoint = {
            x: e.clientX - canvasRect.left + modelingCanvas.scrollLeft,
            y: e.clientY - canvasRect.top + modelingCanvas.scrollTop
        };
        
        // Update the temporary line
        const tempLine = document.getElementById('temp-connection');
        if (tempLine) {
            const path = tempLine.querySelector('path');
            path.setAttribute('d', `M ${state.connectionStartPoint.x} ${state.connectionStartPoint.y} L ${endPoint.x} ${endPoint.y}`);
        }
    }
    
    function endConnection(e) {
        if (!state.isDrawingConnection) return;
        
        // Check if ending on a connection point
        let targetComponentId = null;
        let targetPointIndex = null;
        
        if (e.target.classList.contains('connection-point')) {
            targetComponentId = e.target.dataset.componentId;
            targetPointIndex = parseInt(e.target.dataset.pointIndex);
            
            // Don't connect to the same point
            if (targetComponentId === state.connectionStart.componentId && 
                targetPointIndex === state.connectionStart.pointIndex) {
                cleanupConnectionDrawing();
                return;
            }
            
            // Create the connection
            createConnection(
                state.connectionStart.componentId, 
                state.connectionStart.pointIndex, 
                targetComponentId, 
                targetPointIndex
            );
        }
        
        cleanupConnectionDrawing();
    }
    
    function cleanupConnectionDrawing() {
        // Remove temporary connection line
        const tempLine = document.getElementById('temp-connection');
        if (tempLine) tempLine.remove();
        
        // Reset state
        state.isDrawingConnection = false;
        state.connectionStart = null;
        state.connectionStartPoint = null;
        
        // Remove event listeners
        modelingCanvas.removeEventListener('mousemove', moveConnection);
        document.removeEventListener('mouseup', endConnection);
    }
    
    function createConnection(sourceComponentId, sourcePointIndex, targetComponentId, targetPointIndex) {
        const id = generateId();
        const connection = {
            id,
            sourceComponent: sourceComponentId,
            sourcePoint: sourcePointIndex,
            targetComponent: targetComponentId,
            targetPoint: targetPointIndex
        };
        
        state.connections.push(connection);
        renderConnection(connection);
        saveHistoryState();
        return connection;
    }
    
    function renderConnection(connection) {
        const sourceComponent = state.components.find(c => c.id === connection.sourceComponent);
        const targetComponent = state.components.find(c => c.id === connection.targetComponent);
        
        if (!sourceComponent || !targetComponent) return;
        
        const sourcePoint = sourceComponent.connectionPoints[connection.sourcePoint];
        const targetPoint = targetComponent.connectionPoints[connection.targetPoint];
        
        // Calculate absolute positions
        const sourceX = sourceComponent.x + sourcePoint.x;
        const sourceY = sourceComponent.y + sourcePoint.y;
        const targetX = targetComponent.x + targetPoint.x;
        const targetY = targetComponent.y + targetPoint.y;
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = `connection-${connection.id}`;
        svg.classList.add('connection-line');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke', '#495057');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        
        // Calculate path
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        
        // Create a curved path
        let pathData;
        if (Math.abs(dx) > Math.abs(dy)) {
            const midX = sourceX + dx / 2;
            pathData = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
        } else {
            const midY = sourceY + dy / 2;
            pathData = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
        }
        
        path.setAttribute('d', pathData);
        svg.appendChild(path);
        
        modelingCanvas.appendChild(svg);
    }
    
    function updateConnections(component) {
        state.connections.forEach(connection => {
            if (connection.sourceComponent === component.id || connection.targetComponent === component.id) {
                const connectionElem = document.getElementById(`connection-${connection.id}`);
                if (connectionElem) connectionElem.remove();
                renderConnection(connection);
            }
        });
    }
    
    function deleteConnection(connectionId) {
        const index = state.connections.findIndex(c => c.id === connectionId);
        if (index !== -1) {
            // Remove the connection from DOM
            const connectionElem = document.getElementById(`connection-${connectionId}`);
            if (connectionElem) connectionElem.remove();
            
            // Remove from state
            state.connections.splice(index, 1);
            saveHistoryState();
        }
    }
    
    // Properties panel functions
    function showComponentProperties(component) {
        propertiesContent.innerHTML = '';
        
        const heading = document.createElement('h4');
        heading.textContent = component.label;
        propertiesContent.appendChild(heading);
        
        // Create properties form
        const form = document.createElement('form');
        form.addEventListener('submit', e => e.preventDefault());
        
        for (const [key, value] of Object.entries(component.properties)) {
            const group = document.createElement('div');
            group.className = 'property-group';
            
            const label = document.createElement('label');
            label.className = 'property-label';
            label.textContent = formatPropertyLabel(key);
            
            const input = document.createElement('input');
            input.className = 'property-input';
            input.value = value;
            input.name = key;
            
            input.addEventListener('change', () => {
                component.properties[key] = input.value;
                
                // If the name property changed, update the label
                if (key === 'name') {
                    const componentElem = document.getElementById(`component-${component.id}`);
                    if (componentElem) {
                        const labelElem = componentElem.querySelector('.component-label');
                        if (labelElem) labelElem.textContent = input.value;
                    }
                }
                
                saveHistoryState();
            });
            
            group.appendChild(label);
            group.appendChild(input);
            form.appendChild(group);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tool-button';
        deleteBtn.textContent = 'Delete Component';
        deleteBtn.style.marginTop = '20px';
        deleteBtn.style.width = '100%';
        deleteBtn.addEventListener('click', () => {
            deleteComponent(component.id);
        });
        
        form.appendChild(deleteBtn);
        propertiesContent.appendChild(form);
    }
    
    function showNoSelection() {
        propertiesContent.innerHTML = '<p class="no-selection-message">Select a component to view its properties</p>';
    }
    
    // Utility functions
    function formatPropertyLabel(key) {
        // Convert camelCase to words with spaces and capitalize first letter
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Dragging functionality
    function startDragging(e, element, component) {
        e.preventDefault();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = component.x;
        const startTop = component.y;
        
        function dragMove(moveEvent) {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            
            component.x = startLeft + dx;
            component.y = startTop + dy;
            
            // Make sure component stays within canvas
            component.x = Math.max(0, component.x);
            component.y = Math.max(0, component.y);
            
            updateComponentPosition(component);
        }
        
        function dragEnd() {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            saveHistoryState();
        }
        
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }
    
    // Drag and Drop from Components Panel
    componentItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('component-type', this.dataset.component);
            // Set a ghost image
            const ghostImg = document.createElement('img');
            ghostImg.src = this.querySelector('img').src;
            ghostImg.style.width = '40px';
            ghostImg.style.height = '40px';
            document.body.appendChild(ghostImg);
            e.dataTransfer.setDragImage(ghostImg, 20, 20);
            setTimeout(() => {
                document.body.removeChild(ghostImg);
            }, 0);
        });
    });
    
    modelingCanvas.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    modelingCanvas.addEventListener('drop', function(e) {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('component-type');
        if (componentType) {
            const canvasRect = modelingCanvas.getBoundingClientRect();
            const x = e.clientX - canvasRect.left + modelingCanvas.scrollLeft - 30; // Center the component
            const y = e.clientY - canvasRect.top + modelingCanvas.scrollTop - 30;
            const component = createComponent(componentType, x, y);
            selectComponent(component);
        }
    });
    
    // Canvas click handler
    modelingCanvas.addEventListener('click', function(e) {
        if (e.target === modelingCanvas || e.target.classList.contains('grid-background')) {
            selectComponent(null);
        }
    });
    
    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show active tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Button handlers
    clearCanvasBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
            clearCanvas();
        }
    });
    
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    
    simulateBtn.addEventListener('click', function() {
        runSimulation();
    });
    
    saveBtn.addEventListener('click', function() {
        saveModel();
    });
    
    loadBtn.addEventListener('click', function() {
        loadModel();
    });
    
    // History management
    function saveHistoryState() {
        // Remove any future states if we're in the middle of history
        if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
        }
        
        state.historyIndex++;
        state.history.push({
            components: JSON.parse(JSON.stringify(state.components)),
            connections: JSON.parse(JSON.stringify(state.connections))
        });
        
        updateHistoryButtons();
    }
    
    function updateHistoryButtons() {
        undoBtn.disabled = state.historyIndex < 1;
        redoBtn.disabled = state.historyIndex >= state.history.length - 1;
    }
    
    function undo() {
        if (state.historyIndex < 1) return;
        
        state.historyIndex--;
        loadHistoryState();
    }
    
    function redo() {
        if (state.historyIndex >= state.history.length - 1) return;
        
        state.historyIndex++;
        loadHistoryState();
    }
    
    function loadHistoryState() {
        const historyState = state.history[state.historyIndex];
        
        // Clear current state
        clearCanvasElements();
        
        // Load components
        state.components = JSON.parse(JSON.stringify(historyState.components));
        state.connections = JSON.parse(JSON.stringify(historyState.connections));
        
        // Render everything
        state.components.forEach(component => renderComponent(component));
        state.connections.forEach(connection => renderConnection(connection));
        
        // Update selection
        if (state.selectedComponent) {
            const newSelectedComponent = state.components.find(c => c.id === state.selectedComponent.id);
            selectComponent(newSelectedComponent || null);
        }
        
        updateHistoryButtons();
    }
    
    // Canvas operations
    function clearCanvas() {
        clearCanvasElements();
        state.components = [];
        state.connections = [];
        state.selectedComponent = null;
        saveHistoryState();
        showNoSelection();
    }
    
    function clearCanvasElements() {
        // Remove all components
        const componentElems = modelingCanvas.querySelectorAll('.canvas-component');
        componentElems.forEach(elem => elem.remove());
        
        // Remove all connections
        const connectionElems = modelingCanvas.querySelectorAll('.connection-line');
        connectionElems.forEach(elem => elem.remove());
    }
    
    // Save and Load functionality
    function saveModel() {
        const modelData = {
            components: state.components,
            connections: state.connections
        };
        
        const dataStr = JSON.stringify(modelData);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportName = 'vsc-model-' + new Date().toISOString().slice(0, 10) + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    }
    
    function loadModel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const modelData = JSON.parse(event.target.result);
                    
                    // Clear current canvas
                    clearCanvasElements();
                    
                    // Load model data
                    state.components = modelData.components;
                    state.connections = modelData.connections;
                    state.selectedComponent = null;
                    
                    // Render everything
                    state.components.forEach(component => renderComponent(component));
                    state.connections.forEach(connection => renderConnection(connection));
                    
                    // Update selection
                    showNoSelection();
                    
                    // Save to history
                    saveHistoryState();
                    
                } catch (error) {
                    console.error('Error loading model:', error);
                    alert('Error loading model. The file may be corrupted.');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Simulation functionality
    function runSimulation() {
        // Basic validation
        if (state.components.length === 0) {
            alert('Please add components to the model before simulating.');
            return;
        }
        
        // Check for voltage source
        if (!state.components.some(c => c.type === 'voltage-source')) {
            alert('Model requires at least one voltage source for simulation.');
            return;
        }
        
        // TODO: Add more sophisticated validation checks
        // ...
        
        // Show simulation results section
        simulationResults.classList.remove('hidden');
        
        // Scroll to results
        simulationResults.scrollIntoView({ behavior: 'smooth' });
        
        // Generate sample data for charts
        generateSimulationResults();
    }
    
    function generateSimulationResults() {
        // Sample data generation - in a real application, this would use the actual model
        // to generate simulation results
        
        // Voltage chart
        const voltageCanvas = document.getElementById('voltage-chart');
        const voltageCtx = voltageCanvas.getContext('2d');
        
        if (window.voltageChart) {
            window.voltageChart.destroy();
        }
        
        const timeAxis = Array.from({length: 100}, (_, i) => i * 0.1);
        const voltageData = timeAxis.map(t => Math.sin(2 * Math.PI * 50 * t) * 230 * Math.sqrt(2));
        
        window.voltageChart = new Chart(voltageCtx, {
            type: 'line',
            data: {
                labels: timeAxis,
                datasets: [{
                    label: 'Voltage (V)',
                    data: voltageData,
                    borderColor: '#007bff',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0
                }]
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
                            text: 'Voltage (V)'
                        }
                    }
                }
            }
        });
        
        // Current chart
        const currentCanvas = document.getElementById('current-chart');
        const currentCtx = currentCanvas.getContext('2d');
        
        if (window.currentChart) {
            window.currentChart.destroy();
        }
        
        // Sample current data with phase shift
        const currentData = timeAxis.map(t => Math.sin(2 * Math.PI * 50 * t - 0.1) * 10 * Math.sqrt(2));
        
        window.currentChart = new Chart(currentCtx, {
            type: 'line',
            data: {
                labels: timeAxis,
                datasets: [{
                    label: 'Current (A)',
                    data: currentData,
                    borderColor: '#28a745',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0
                }]
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
                            text: 'Current (A)'
                        }
                    }
                }
            }
        });
        
        // Power chart
        const powerCanvas = document.getElementById('power-chart');
        const powerCtx = powerCanvas.getContext('2d');
        
        if (window.powerChart) {
            window.powerChart.destroy();
        }
        
        // Calculate power as voltage * current
        const powerData = timeAxis.map((t, i) => voltageData[i] * currentData[i] / 1000); // Convert to kW
        
        window.powerChart = new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: timeAxis,
                datasets: [{
                    label: 'Active Power (kW)',
                    data: powerData,
                    borderColor: '#dc3545',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0
                }]
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
                            text: 'Power (kW)'
                        }
                    }
                }
            }
        });
        
        // Harmonics chart
        const harmonicCanvas = document.getElementById('harmonic-chart');
        const harmonicCtx = harmonicCanvas.getContext('2d');
        
        if (window.harmonicChart) {
            window.harmonicChart.destroy();
        }
        
        // Generate sample harmonic data
        const harmonics = Array.from({length: 20}, (_, i) => i + 1);
        const harmonicValues = harmonics.map(h => {
            if (h === 1) return 100; // Fundamental
            if (h % 2 === 0) return 0; // Even harmonics
            return Math.max(0, 100 / h + Math.random() * 5); // Odd harmonics with some randomness
        });
        
        window.harmonicChart = new Chart(harmonicCtx, {
            type: 'bar',
            data: {
                labels: harmonics,
                datasets: [{
                    label: 'Harmonic Content (%)',
                    data: harmonicValues,
                    backgroundColor: '#17a2b8',
                    borderColor: '#17a2b8',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Harmonic Order'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Magnitude (%)'
                        },
                        max: 100
                    }
                }
            }
        });
    }
    
    // Circuit Solver
    function solveCircuit() {
        // This is a placeholder for actual circuit solving functionality
        // In a real application, this would:
        // 1. Build a circuit model from components and connections
        // 2. Set up equations for nodes and branches
        // 3. Apply Kirchhoff's laws
        // 4. Solve the system of equations
        // 5. Calculate time-domain and/or frequency-domain results
        
        // For now, we'll just return some sample data
        return {
            timeAxis: Array.from({length: 100}, (_, i) => i * 0.1),
            voltages: {},
            currents: {},
            powers: {}
        };
    }
    
    // Component Type-Specific Functionality
    function updateConverterProperties(component) {
        // Example: Update additional derived properties for converter components
        if (component.type === 'converter') {
            // Calculate switching frequency in radians
            component.properties.switchingFreqRad = 2 * Math.PI * parseFloat(component.properties.switchingFreq);
            
            // Calculate other derived parameters...
        }
    }
    
    // Control System Functions
    function buildControlSystem() {
        // Find all control blocks
        const controlBlocks = state.components.filter(c => c.type === 'control-block');
        
        // Sort them topologically based on connections
        // (This would be a more complex function in practice)
        
        return controlBlocks;
    }
    
    function simulateControlSystem(inputs, controlBlocks, timeStep, duration) {
        // Initialize outputs
        const outputs = {};
        const timePoints = [];
        
        // For each time step
        for (let t = 0; t < duration; t += timeStep) {
            timePoints.push(t);
            
            // Process each control block in order
            for (const block of controlBlocks) {
                // Implementation would depend on block type
                // For example, for a PI controller:
                if (block.properties.type === 'PI') {
                    // PI control implementation
                    // (Would include integration, anti-windup, etc.)
                }
            }
        }
        
        return {
            timePoints,
            outputs
        };
    }
    
    // Performance optimization for large models
    function optimizeCanvasRendering() {
        // Only render components that are in the visible area
        const canvasRect = modelingCanvas.getBoundingClientRect();
        const visibleComponents = state.components.filter(component => {
            return component.x + 60 >= modelingCanvas.scrollLeft &&
                   component.x <= modelingCanvas.scrollLeft + canvasRect.width &&
                   component.y + 60 >= modelingCanvas.scrollTop &&
                   component.y <= modelingCanvas.scrollTop + canvasRect.height;
        });
        
        // Update visibility of components
        state.components.forEach(component => {
            const elem = document.getElementById(`component-${component.id}`);
            if (elem) {
                if (visibleComponents.includes(component)) {
                    elem.style.display = '';
                } else {
                    elem.style.display = 'none';
                }
            }
        });
        
        // Similarly, only render connections that involve visible components
        // ...
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Delete selected component with Delete key
        if (e.key === 'Delete' && state.selectedComponent) {
            deleteComponent(state.selectedComponent.id);
        }
        
        // Undo with Ctrl+Z
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            undo();
        }
        
        // Redo with Ctrl+Y or Ctrl+Shift+Z
        if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
            (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
            e.preventDefault();
            redo();
        }
        
        // Copy with Ctrl+C
        if (e.key === 'c' && (e.ctrlKey || e.metaKey) && state.selectedComponent) {
            e.preventDefault();
            // Store selected component data for paste operation
            window.copiedComponent = JSON.parse(JSON.stringify(state.selectedComponent));
        }
        
        // Paste with Ctrl+V
        if (e.key === 'v' && (e.ctrlKey || e.metaKey) && window.copiedComponent) {
            e.preventDefault();
            // Create a new component based on the copied one
            const newComponent = JSON.parse(JSON.stringify(window.copiedComponent));
            newComponent.id = generateId();
            newComponent.x += 20;  // Offset slightly
            newComponent.y += 20;
            newComponent.properties.name += '_copy';
            
            state.components.push(newComponent);
            renderComponent(newComponent);
            selectComponent(newComponent);
            saveHistoryState();
        }
    });
    
    // Model Validation
    function validateModel() {
        const errors = [];
        const warnings = [];
        
        // Check for components without connections
        state.components.forEach(component => {
            const hasConnections = state.connections.some(conn => 
                conn.sourceComponent === component.id || conn.targetComponent === component.id
            );
            
            if (!hasConnections) {
                warnings.push(`Component "${component.properties.name}" has no connections.`);
            }
        });
        
        // Check for loops in control blocks
        const controlBlocks = state.components.filter(c => c.type === 'control-block');
        // (Implementation for loop detection would go here)
        
        // Check for required components
        if (!state.components.some(c => c.type === 'voltage-source')) {
            errors.push('Model requires at least one voltage source.');
        }
        
        // Check for ground connection
        if (!state.components.some(c => c.type === 'ground')) {
            errors.push('Model requires at least one ground connection.');
        }
        
        return { errors, warnings };
    }
    
    // Export model to other formats
    function exportToMatlab() {
        // Generate MATLAB/Simulink compatible code
        let matlabCode = '% VSC Model generated by VSC Modeler\n\n';
        matlabCode += 'model = new_system(\'VSCModel\');\n';
        matlabCode += 'open_system(\'VSCModel\');\n\n';
        
        // Add components
        state.components.forEach(component => {
            matlabCode += `% Add ${component.label} "${component.properties.name}"\n`;
            // Code would vary by component type
            // ...
        });
        
        // Add connections
        state.connections.forEach(connection => {
            matlabCode += '% Add connection\n';
            // Code to connect components
            // ...
        });
        
        // Return the generated code
        return matlabCode;
    }
    
    // Mobile support
    function setupTouchEvents() {
        // Convert touch events to mouse events for compatibility
        const touchToMouse = function(touchEvent, mouseEventType) {
            const touch = touchEvent.touches[0] || touchEvent.changedTouches[0];
            const mouseEvent = new MouseEvent(mouseEventType, {
                clientX: touch.clientX,
                clientY: touch.clientY,
                buttons: 1
            });
            
            touchEvent.target.dispatchEvent(mouseEvent);
            touchEvent.preventDefault();
        };
        
        modelingCanvas.addEventListener('touchstart', e => touchToMouse(e, 'mousedown'));
        modelingCanvas.addEventListener('touchmove', e => touchToMouse(e, 'mousemove'));
        modelingCanvas.addEventListener('touchend', e => touchToMouse(e, 'mouseup'));
    }
    
    // Initialize the application
    function initialize() {
        initializeGrid();
        saveHistoryState(); // Initial empty state
        updateHistoryButtons();
        setupTouchEvents();
        
        // Show intro guide/tutorial on first visit
        if (!localStorage.getItem('vscModelerTutorialSeen')) {
            showIntroTutorial();
            localStorage.setItem('vscModelerTutorialSeen', 'true');
        }
    }
    
    function showIntroTutorial() {
        // Simple tutorial that highlights key areas of the interface
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial-overlay';
        tutorial.innerHTML = `
            <div class="tutorial-modal">
                <h3>Welcome to VSC Modeler!</h3>
                <p>This quick tutorial will help you get started.</p>
                <ol>
                    <li>Drag components from the left panel to the canvas</li>
                    <li>Connect components by dragging from connection points</li>
                    <li>Configure properties in the right panel</li>
                    <li>Run your simulation and analyze results</li>
                </ol>
                <button id="close-tutorial" class="tool-button primary">Got it!</button>
            </div>
        `;
        
        document.body.appendChild(tutorial);
        
        document.getElementById('close-tutorial').addEventListener('click', function() {
            tutorial.remove();
        });
    }
    
    // Run initialization
    initialize();
});

