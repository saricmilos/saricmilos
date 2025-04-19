/**
 * Enhanced Network Graph Visualization
 * Creates a beautiful and modern SVG graph of the power network
 * 
 * This script should be included after dynamic.js and will override
 * the renderNetworkGraph function with an enhanced version
 */

// Store the original renderNetworkGraph function if it exists
const originalRenderNetworkGraph = window.renderNetworkGraph || null;

// Override with enhanced version
window.renderNetworkGraph = function() {
    const container = document.getElementById('graph-container');
    
    // If no data is available yet, keep the original message
    if (!currentAdmittanceMatrix || currentAdmittanceMatrix.length === 0) {
        container.innerHTML = '<p>Click "Calculate Matrices" to generate a graph</p>';
        return;
    }
    
    // Set up dimensions
    const svgWidth = container.clientWidth || 600;
    const svgHeight = 500;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    
    // Clear previous graph
    container.innerHTML = '';
    
    // Create SVG element
    const svgHtml = `
        <svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <defs>
                <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="2" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="node-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4a6fa5" />
                    <stop offset="100%" stop-color="#334e7a" />
                </linearGradient>
                <linearGradient id="link-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#6c8ebf" />
                    <stop offset="100%" stop-color="#5a7ca8" />
                </linearGradient>
            </defs>
            <g class="network-graph" transform="translate(${margin.left}, ${margin.top})">
                <g class="links"></g>
                <g class="nodes"></g>
                <g class="labels"></g>
                <g class="legend"></g>
            </g>
        </svg>
    `;
    container.innerHTML = svgHtml;
    
    // Calculate node positions (improved circular layout)
    const nodes = [];
    const links = [];
    
    // Generate nodes with improved positions
    for (let i = 0; i < numberOfBuses; i++) {
        const angle = (i / numberOfBuses) * 2 * Math.PI;
        const radius = Math.min(width, height) / 2.5;
        
        // Add slight variation to positions for more natural look
        const radiusVariation = radius * (0.95 + Math.random() * 0.1);
        
        nodes.push({
            id: i,
            name: busNames[i],
            x: width / 2 + radiusVariation * Math.cos(angle),
            y: height / 2 + radiusVariation * Math.sin(angle)
        });
    }
    
    // Generate links
    activeConnections.forEach(conn => {
        if (currentResistances[conn.key]) {
            links.push({
                source: conn.from,
                target: conn.to,
                resistance: currentResistances[conn.key],
                admittance: 1 / currentResistances[conn.key]
            });
        }
    });
    
    // Get reference to SVG groups
    const svg = container.querySelector('svg');
    const linksGroup = svg.querySelector('.links');
    const nodesGroup = svg.querySelector('.nodes');
    const labelsGroup = svg.querySelector('.labels');
    
    // Calculate maximum admittance for scaling
    const maxAdmittance = Math.max(...links.map(l => l.admittance));
    
    // Draw links with curved paths for better aesthetics
    links.forEach(link => {
        const sourceNode = nodes[link.source];
        const targetNode = nodes[link.target];
        
        // Determine line thickness based on admittance (higher admittance = thicker line)
        const maxThickness = 5;
        const minThickness = 1;
        const thickness = minThickness + (link.admittance / maxAdmittance) * (maxThickness - minThickness);
        
        // Calculate control point for curved path
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        
        // Create curved path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${sourceNode.x},${sourceNode.y} A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'url(#link-gradient)');
        path.setAttribute('stroke-width', thickness);
        path.setAttribute('stroke-opacity', 0.8);
        path.setAttribute('class', 'link-path');
        
        // Add title for hover tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${sourceNode.name} - ${targetNode.name}
Resistance: ${formatNumber(link.resistance)} Ω
Admittance: ${formatNumber(link.admittance)} S`;
        path.appendChild(title);
        
        linksGroup.appendChild(path);
        
        // Add small animated dots on the lines to show power flow
        const animatedDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        animatedDot.setAttribute('r', 3);
        animatedDot.setAttribute('fill', '#ffffff');
        animatedDot.setAttribute('filter', 'url(#drop-shadow)');
        
        // Create animation
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('path', `M${sourceNode.x},${sourceNode.y} A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`);
        animateMotion.setAttribute('dur', (3 + Math.random() * 2) + 's');
        animateMotion.setAttribute('repeatCount', 'indefinite');
        
        animatedDot.appendChild(animateMotion);
        linksGroup.appendChild(animatedDot);
    });
    
    // Draw nodes
    nodes.forEach(node => {
        // Create node group
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'node');
        nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        
        // Create glow effect
        const nodeGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        nodeGlow.setAttribute('r', 14);
        nodeGlow.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
        nodeGlow.setAttribute('filter', 'url(#drop-shadow)');
        
        // Create node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 12);
        circle.setAttribute('fill', 'url(#node-gradient)');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', 2);
        
        // Add title for hover tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = node.name;
        circle.appendChild(title);
        
        // Add to node group
        nodeGroup.appendChild(nodeGlow);
        nodeGroup.appendChild(circle);
        nodesGroup.appendChild(nodeGroup);
        
        // Create node label with background for better readability
        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        textBg.setAttribute('x', -30);
        textBg.setAttribute('y', -30);
        textBg.setAttribute('width', 60);
        textBg.setAttribute('height', 20);
        textBg.setAttribute('rx', 10);
        textBg.setAttribute('ry', 10);
        textBg.setAttribute('fill', 'rgba(255, 255, 255, 0.85)');
        textBg.setAttribute('filter', 'url(#drop-shadow)');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 0);
        text.setAttribute('y', -18);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', '#333');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-size', '10px');
        text.textContent = node.name;
        
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.appendChild(textBg);
        labelGroup.appendChild(text);
        
        labelsGroup.appendChild(labelGroup);
        
        // Position the label group at the node position
        labelGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    });
    
    // Create a modern legend
    const legend = svg.querySelector('.legend');
    legend.setAttribute('transform', `translate(${width - 130}, 20)`);
    
    // Create legend background
    const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    legendBg.setAttribute('x', -10);
    legendBg.setAttribute('y', -10);
    legendBg.setAttribute('width', 120);
    legendBg.setAttribute('height', 75);
    legendBg.setAttribute('rx', 10);
    legendBg.setAttribute('ry', 10);
    legendBg.setAttribute('fill', 'rgba(255, 255, 255, 0.9)');
    legendBg.setAttribute('filter', 'url(#drop-shadow)');
    legend.appendChild(legendBg);
    
    // Add legend title
    const legendTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    legendTitle.setAttribute('x', 50);
    legendTitle.setAttribute('y', 10);
    legendTitle.setAttribute('text-anchor', 'middle');
    legendTitle.setAttribute('font-weight', 'bold');
    legendTitle.setAttribute('fill', '#333');
    legendTitle.textContent = 'Network Legend';
    legend.appendChild(legendTitle);
    
    // Add node legend item
    const nodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    nodeCircle.setAttribute('cx', 15);
    nodeCircle.setAttribute('cy', 30);
    nodeCircle.setAttribute('r', 8);
    nodeCircle.setAttribute('fill', 'url(#node-gradient)');
    nodeCircle.setAttribute('stroke', '#ffffff');
    nodeCircle.setAttribute('stroke-width', 1.5);
    legend.appendChild(nodeCircle);
    
    const nodeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nodeText.setAttribute('x', 30);
    nodeText.setAttribute('y', 34);
    nodeText.setAttribute('fill', '#333');
    nodeText.textContent = 'Bus';
    legend.appendChild(nodeText);
    
    // Add link legend item
    const linkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    linkPath.setAttribute('d', 'M0,50 C10,50 20,50 30,50');
    linkPath.setAttribute('stroke', 'url(#link-gradient)');
    linkPath.setAttribute('stroke-width', 3);
    linkPath.setAttribute('fill', 'none');
    legend.appendChild(linkPath);
    
    const linkText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    linkText.setAttribute('x', 40);
    linkText.setAttribute('y', 54);
    linkText.setAttribute('fill', '#333');
    linkText.textContent = 'Connection';
    legend.appendChild(linkText);
    
    // Add some subtle animations when the graph is first rendered
    nodes.forEach((node, index) => {
        const nodeElement = nodesGroup.childNodes[index];
        const labelElement = labelsGroup.childNodes[index];
        
        // Apply fade-in animation
        nodeElement.style.opacity = 0;
        labelElement.style.opacity = 0;
        
        setTimeout(() => {
            nodeElement.style.transition = 'opacity 0.5s ease-in-out';
            labelElement.style.transition = 'opacity 0.5s ease-in-out';
            nodeElement.style.opacity = 1;
            labelElement.style.opacity = 1;
        }, 100 + index * 50);
    });
    
    // Apply animations to links
    const pathElements = linksGroup.querySelectorAll('.link-path');
    pathElements.forEach((path, index) => {
        // Create animated dash effect
        const pathLength = path.getTotalLength();
        path.setAttribute('stroke-dasharray', pathLength);
        path.setAttribute('stroke-dashoffset', pathLength);
        
        setTimeout(() => {
            path.style.transition = 'stroke-dashoffset 1s ease-in-out';
            path.style.strokeDashoffset = 0;
        }, 300 + index * 50);
    });
};

// Add responsive handling
window.addEventListener('resize', () => {
    if (currentAdmittanceMatrix && currentAdmittanceMatrix.length > 0) {
        renderNetworkGraph();
    }
});