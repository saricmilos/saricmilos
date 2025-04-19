/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

const originalRenderNetworkGraph = window.renderNetworkGraph || null;

window.renderNetworkGraph = function () {
  const container = document.getElementById('graph-container');

  if (!currentAdmittanceMatrix || currentAdmittanceMatrix.length === 0) {
    container.innerHTML = '<p>Click "Calculate Matrices" to generate a graph</p>';
    return;
  }

  const svgWidth = container.clientWidth || 600;
  const svgHeight = 500;
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  container.innerHTML = '';
  const svgHtml = `
    <svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <g class="network-graph" transform="translate(${margin.left}, ${margin.top})">
        <g class="links"></g>
        <g class="nodes"></g>
        <g class="labels"></g>
      </g>
    </svg>
  `;
  container.innerHTML = svgHtml;

  const svg = container.querySelector('svg');
  const linksGroup = svg.querySelector('.links');
  const nodesGroup = svg.querySelector('.nodes');
  const labelsGroup = svg.querySelector('.labels');

  const nodes = [];
  for (let i = 0; i < numberOfBuses; i++) {
    const angle = (i / numberOfBuses) * 2 * Math.PI;
    const radius = Math.min(width, height) / 2.5;
    nodes.push({
      id: i,
      name: busNames[i],
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
    });
  }

  const links = activeConnections.map(conn => {
    const resistance = currentResistances[conn.key];
    return {
      source: conn.from,
      target: conn.to,
      resistance: resistance,
      admittance: 1 / resistance,
    };
  });

  const maxAdmittance = Math.max(...links.map(l => l.admittance));
  const basePower = parseFloat(document.getElementById('base-power')?.value || '100');

  links.forEach(link => {
    const sourceNode = nodes[link.source];
    const targetNode = nodes[link.target];
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const dr = Math.sqrt(dx * dx + dy * dy);

    const thickness = 1 + (link.admittance / maxAdmittance) * 4;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${sourceNode.x},${sourceNode.y} A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#6c8ebf');
    path.setAttribute('stroke-width', thickness);
    path.setAttribute('stroke-opacity', 0.7);
    linksGroup.appendChild(path);

    if (typeof lineFlows !== 'undefined' && lineFlows.length > 0) {
      const flow = lineFlows.find(f =>
        (f.from === link.source && f.to === link.target) ||
        (f.from === link.target && f.to === link.source)
      );

      if (flow) {
        const powerMW = flow.power * basePower;
        const isPositive = flow.power >= 0;
        const flowColor = isPositive ? '#28a745' : '#dc3545';

        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;

        const flowLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        flowLabel.setAttribute('x', midX);
        flowLabel.setAttribute('y', midY - 10);
        flowLabel.setAttribute('text-anchor', 'middle');
        flowLabel.setAttribute('fill', flowColor);
        flowLabel.setAttribute('font-size', '11');
        flowLabel.setAttribute('font-weight', 'bold');
        flowLabel.textContent = `${Math.abs(powerMW).toFixed(1)} MW`;
        labelsGroup.appendChild(flowLabel);
      }
    }
  });

  nodes.forEach(node => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${node.x},${node.y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', 10);
    circle.setAttribute('fill', '#1e88e5');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', 2);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 0);
    text.setAttribute('y', -15);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#333');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-weight', 'bold');
    text.textContent = node.name;

    group.appendChild(circle);
    group.appendChild(text);
    nodesGroup.appendChild(group);
  });
};
