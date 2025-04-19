// component-manager.js - Handles component creation, rendering, and management

const ComponentManager = (function() {
    // Private variables
    let components = [];
    let selectedComponent = null;
    
    // Component templates
    const componentTemplates = {
        'voltage-source': {
            label: 'Voltage Source',
            image: '../VSCimages/DCVS.PNG',
            properties: {
                name: 'VS1',
                voltage: '12',
                unit: 'V',
                internal_resistance: '0'
            },
            connectionPoints: [
                { x: 30, y: 0, type: 'output' },  // Top
                { x: 30, y: 60, type: 'output' }   // Bottom
            ]
        },
        'resistor': {
            label: 'Resistor',
            image: '../VSCimages/resistance.PNG',
            properties: {
                name: 'R1',
                resistance: '100',
                unit: 'Ω',
                power_rating: '0.25'
            },
            connectionPoints: [
                { x: 0, y: 30, type: 'input' },   // Left
                { x: 60, y: 30, type: 'output' }   // Right
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
        // Additional components can be added here
    };
    
    // DOM References
    let modelingCanvas;
    
    // Private methods
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
            connectionPoint.addEventListener('mousedown', ConnectionManager.startConnection);
            
            componentElem.appendChild(connectionPoint);
        });
        
        // Event listeners for component
        componentElem.addEventListener('mousedown', function(e) {
            // Prevent if clicking on connection point
            if (e.target.classList.contains('connection-point')) return;
            
            UIManager.selectComponent(component);
            UIManager.startDragging(e, componentElem, component);
        });
        
        modelingCanvas.appendChild(componentElem);
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Public API
    return {
        init: function() {
            modelingCanvas = document.getElementById('modeling-canvas');
            console.log('Component Manager initialized');
        },
        
        createComponent: function(type, x, y) {
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
            
            components.push(component);
            renderComponent(component);
            HistoryManager.saveHistoryState();
            return component;
        },
        
        updateComponentPosition: function(component) {
            const componentElem = document.getElementById(`component-${component.id}`);
            if (componentElem) {
                componentElem.style.left = `${component.x}px`;
                componentElem.style.top = `${component.y}px`;
                
                // Update connections related to this component
                ConnectionManager.updateConnections(component);
            }
        },
        
        updateComponent: function(component) {
            const componentElem = document.getElementById(`component-${component.id}`);
            if (componentElem) {
                const labelElem = componentElem.querySelector('.component-label');
                if (labelElem) {
                    labelElem.textContent = component.properties.name || component.label;
                }
            }
        },
        
        deleteComponent: function(componentId) {
            const index = components.findIndex(c => c.id === componentId);
            if (index !== -1) {
                // Remove the component from DOM
                const componentElem = document.getElementById(`component-${componentId}`);
                if (componentElem) componentElem.remove();
                
                // Remove all connections related to this component
                ConnectionManager.deleteConnectionsForComponent(componentId);
                
                // Remove from state
                components.splice(index, 1);
                
                // Update selection if needed
                if (selectedComponent && selectedComponent.id === componentId) {
                    UIManager.selectComponent(null);
                }
                
                HistoryManager.saveHistoryState();
            }
        },
        
        getComponents: function() {
            return components;
        },
        
        getComponentById: function(id) {
            return components.find(c => c.id === id);
        },
        
        getSelectedComponent: function() {
            return selectedComponent;
        },
        
        setSelectedComponent: function(component) {
            selectedComponent = component;
        },
        
        getComponentTemplates: function() {
            return componentTemplates;
        },
        
        clearComponents: function() {
            components = [];
        }
    };
})();