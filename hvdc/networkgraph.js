/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

/**
 * Creates and updates network graph visualization
 */
function updateNetworkGraph() {
    if (!busNames.length || !connections.length) {
        document.getElementById('network-graph-container').innerHTML = 
            '<p>Configure your network and click "Calculate Matrices" to generate graph</p>';
        return;
    }
    
    // Clear the container
    const container = document.getElementById('network-graph-container');
    container.innerHTML = '';
    
    // Create SVG element
    const width = container.clientWidth;
    const height = 500;
    const margin = 30;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'network-graph');
    container.appendChild(svg);
    
    // Create graph nodes (buses)
    const nodes = busNames.map((name, index) => ({
        id: index,
        name: name,
        x: 0,  // Will be set by simulation
        y: 0   // Will be set by simulation
    }));
    
    // Create graph links (connections)
    const links = connections.map(conn => ({
        source: conn.from,
        target: conn.to,
        distance: conn.distance / 1000, // Convert to km for display
        resistance: (parseFloat(document.getElementById('resistivity').value) * conn.distance) / 
                    parseFloat(document.getElementById('area').value)
    }));
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(d => Math.min(100, 30 + d.distance / 10)))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30))
        .on('tick', ticked);
    
    // Create link elements
    const link = d3.select(svg)
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', d => Math.max(1, 4 - Math.log10(d.resistance)))
        .attr('stroke-opacity', 0.8);
    
    // Create distance labels
    const linkLabels = d3.select(svg)
        .selectAll('.link-label')
        .data(links)
        .enter()
        .append('text')
        .attr('class', 'link-label')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .attr('text-anchor', 'middle')
        .text(d => `${d.distance.toFixed(1)} km`);
    
    // Create node elements
    const node = d3.select(svg)
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'bus-node')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragging)
            .on('end', dragEnded));
    
    // Add circles to nodes
    node.append('circle')
        .attr('r', 20)
        .attr('fill', '#4a90e2')
        .attr('stroke', '#2a70c2')
        .attr('stroke-width', 2);
    
    // Add labels to nodes
    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text(d => d.name);
    
    // Add tooltips
    node.append('title')
        .text(d => d.name);
    
    // Update positions on simulation tick
    function ticked() {
        // Keep nodes within bounds
        nodes.forEach(node => {
            node.x = Math.max(margin, Math.min(width - margin, node.x));
            node.y = Math.max(margin, Math.min(height - margin, node.y));
        });
        
        // Update link positions
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        // Update link label positions
        linkLabels
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2 - 5);
        
        // Update node positions
        node
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }
    
    // Drag functions
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragging(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    // Add legend
    const legend = d3.select(svg)
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 150}, 20)`);
    
    legend.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('font-weight', 'bold')
        .text('Legend:');
    
    legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 20)
        .attr('r', 8)
        .attr('fill', '#4a90e2');
    
    legend.append('text')
        .attr('x', 25)
        .attr('y', 24)
        .text('Bus');
    
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 40)
        .attr('x2', 20)
        .attr('y2', 40)
        .attr('stroke', '#999')
        .attr('stroke-width', 2);
    
    legend.append('text')
        .attr('x', 25)
        .attr('y', 44)
        .text('Connection');
    
    // Add instructions
    const instructions = d3.select(svg)
        .append('g')
        .attr('class', 'instructions')
        .attr('transform', `translate(10, ${height - 30})`);
    
    instructions.append('text')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text('Drag nodes to rearrange the graph');
}

// Make sure to add this function call to the performCalculations function
// Add this line at the end of the performCalculations function:
// updateNetworkGraph();