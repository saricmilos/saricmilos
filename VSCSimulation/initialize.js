// main.js - Entry point for the VSC Modeler application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    ComponentManager.init();
    ConnectionManager.init();
    UIManager.init();
    SimulationEngine.init();
    
    // Add the "Create Basic Circuit" button to the toolbar
    const canvasToolbar = document.querySelector('.canvas-toolbar');
    const basicCircuitBtn = document.createElement('button');
    basicCircuitBtn.id = 'create-basic-circuit';
    basicCircuitBtn.className = 'tool-button';
    basicCircuitBtn.textContent = 'Create Basic Circuit';
    canvasToolbar.appendChild(basicCircuitBtn);
    
    // Event listener for the basic circuit button
    basicCircuitBtn.addEventListener('click', function() {
        // Clear the canvas first
        UIManager.clearCanvas();
        
        // Create a basic circuit: voltage source, resistor, and ground
        const voltageSource = ComponentManager.createComponent('voltage-source', 200, 100);
        const resistor = ComponentManager.createComponent('resistor', 400, 100);
        const ground = ComponentManager.createComponent('ground', 600, 100);
        
        // Set properties
        voltageSource.properties.voltage = "12"; // 12V source
        voltageSource.properties.name = "VS1";
        ComponentManager.updateComponent(voltageSource);
        
        resistor.properties.resistance = "100"; // 100 Ohm resistor
        resistor.properties.name = "R1";
        ComponentManager.updateComponent(resistor);
        
        ground.properties.name = "GND1";
        ComponentManager.updateComponent(ground);
        
        // Connect components
        ConnectionManager.createConnection(
            voltageSource.id, 1, // Bottom connection point of voltage source
            resistor.id, 0       // Left connection point of resistor
        );
        
        ConnectionManager.createConnection(
            resistor.id, 1,      // Right connection point of resistor
            ground.id, 0         // Top connection point of ground
        );
        
        // Select the voltage source to show its properties
        UIManager.selectComponent(voltageSource);
    });
    
    console.log('VSC Modeler initialized successfully');
});