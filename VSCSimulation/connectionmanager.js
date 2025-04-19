// connection-manager.js - Handles connections between components

const ConnectionManager = (function() {
    // Private variables
    let connections = [];
    let isDrawingConnection = false;
    let connectionStart = null;
    let connectionStartPoint = null;
    
    // DOM References
    let modelingCanvas;
    
    // Private methods
    function generateId() {
        return 'conn-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    function renderConnection(connection) {
        const sourceComponent = ComponentManager.getComponentById(connection.sourceComponent);
        const targetComponent = ComponentManager.getComponentById(connection.targetComponent);
        
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
    
    function cleanupConnectionDrawing() {
        // Remove temporary connection line
        const tempLine = document.getElementById('temp-connection');
        if (tempLine) tempLine.remove();
        
        // Reset state
        isDrawingConnection = false;
        connectionStart = null;
        connectionStartPoint = null;
        
        // Remove event listeners
        modelingCanvas.removeEventListener('mousemove', moveConnection);
        document.removeEventListener('mouseup', endConnection);
    }
    
    function moveConnection(e) {
        if (!isDrawingConnection) return;
        
        const canvasRect = modelingCanvas.getBoundingClientRect();
        const endPoint = {
            x: e.clientX - canvasRect.left + modelingCanvas.scrollLeft,
            y: e.clientY - canvasRect.top + modelingCanvas.scrollTop
        };
        
        // Update the temporary line
        const tempLine = document.getElementById('temp-connection');
        if (tempLine) {
            const path = tempLine.querySelector('path');
            path.setAttribute('d', `M ${connectionStartPoint.x} ${connectionStartPoint.y} L ${endPoint.x} ${endPoint.y}`);
        }
    }
    
    function endConnection(e) {
        if (!isDrawingConnection) return;
        
        // Check if ending on a connection point
        let targetComponentId = null;
        let targetPointIndex = null;
        
        if (e.target.classList.contains('connection-point')) {
            targetComponentId = e.target.dataset.componentId;
            targetPointIndex = parseInt(e.target.dataset.pointIndex);
            
            // Don't connect to the same point
            if (targetComponentId === connectionStart.componentId && 
                targetPointIndex === connectionStart.pointIndex) {
                cleanupConnectionDrawing();
                return;
            }
            
            // Create the connection
            createConnection(
                connectionStart.componentId, 
                connectionStart.pointIndex, 
                targetComponentId, 
                targetPointIndex
            );
        }
        
        cleanupConnectionDrawing();
    }
    
    // Public API
    return {
        init: function() {
            modelingCanvas = document.getElementById('modeling-canvas');
            console.log('Connection Manager initialized');
        },
        
        startConnection: function(e) {
            e.stopPropagation();
            
            const componentId = e.target.dataset.componentId;
            const pointIndex = parseInt(e.target.dataset.pointIndex);
            const component = ComponentManager.getComponentById(componentId);
            
            if (component) {
                isDrawingConnection = true;
                connectionStart = {
                    componentId,
                    pointIndex
                };
                
                const rect = e.target.getBoundingClientRect();
                const canvasRect = modelingCanvas.getBoundingClientRect();
                
                connectionStartPoint = {
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
        },
        
        createConnection: function(sourceComponentId, sourcePointIndex, targetComponentId, targetPointIndex) {
            const id = generateId();
            const connection = {
                id,
                sourceComponent: sourceComponentId,
                sourcePoint: sourcePointIndex,
                targetComponent: targetComponentId,
                targetPoint: targetPointIndex
            };
            
            connections.push(connection);
            renderConnection(connection);
            HistoryManager.saveHistoryState();
            return connection;
        },
        
        updateConnections: function(component) {
            connections.forEach(connection => {
                if (connection.sourceComponent === component.id || connection.targetComponent === component.id) {
                    const connectionElem = document.getElementById(`connection-${connection.id}`);
                    if (connectionElem) connectionElem.remove();
                    renderConnection(connection);
                }
            });
        },
        
        deleteConnection: function(connectionId) {
            const index = connections.findIndex(c => c.id === connectionId);
            if (index !== -1) {
                // Remove the connection from DOM
                const connectionElem = document.getElementById(`connection-${connectionId}`);
                if (connectionElem) connectionElem.remove();
                
                // Remove from state
                connections.splice(index, 1);
                HistoryManager.saveHistoryState();
            }
        },
        
        deleteConnectionsForComponent: function(componentId) {
            connections = connections.filter(conn => {
                if (conn.sourceComponent === componentId || conn.targetComponent === componentId) {
                    const connElem = document.getElementById(`connection-${conn.id}`);
                    if (connElem) connElem.remove();
                    return false;
                }
                return true;
            });
        },
        
        getConnections: function() {
            return connections;
        },
        
        clearConnections: function() {
            connections = [];
        }
    };
})();