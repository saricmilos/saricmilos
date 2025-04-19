/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

import React, { useState, useEffect } from 'react';
import { ArrowRightCircle } from 'lucide-react';

const DCPowerFlowVisualization = () => {
  const [buses, setBuses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [powerFlows, setPowerFlows] = useState([]);
  const [voltages, setVoltages] = useState([]);
  const [slackBus, setSlackBus] = useState(0);
  const [busCount, setBusCount] = useState(5);
  const [basePower, setBasePower] = useState(100);
  const [baseVoltage, setBaseVoltage] = useState(345);
  const [powerInjections, setPowerInjections] = useState([null, 100, -100, 100, -100]);
  const [showLabels, setShowLabels] = useState(true);

  // Bus names for the visualization
  const busNames = [
    'Lleida', 'Tarragona', 'Barcelona', 'Girona',
    'Santa Llogaia'
  ];

  // Define possible connections for up to 5 buses
  const defaultConnections = [
    { from: 0, to: 3, distance: 260, resistance: 1.5, key: 'b1_4' },
    { from: 1, to: 2, distance: 100, resistance: 0.57, key: 'b2_3' },
    { from: 2, to: 3, distance: 115, resistance: 0.66, key: 'b3_4' },
    { from: 3, to: 4, distance: 38.5, resistance: 0.22, key: 'b4_5' },
    { from: 0, to: 1, distance: 120, resistance: 0.69, key: 'b1_2' },
    { from: 0, to: 2, distance: 180, resistance: 1.03, key: 'b1_3' },
    { from: 1, to: 4, distance: 150, resistance: 0.86, key: 'b2_5' },
    { from: 2, to: 4, distance: 140, resistance: 0.8, key: 'b3_5' },
    { from: 0, to: 4, distance: 275, resistance: 1.58, key: 'b1_5' }
  ];

  // Randomly generated active connections for demonstration
  const generateRandomConnections = (count) => {
    // Always include these core connections for a connected grid
    const coreConnections = defaultConnections.slice(0, 4);
    
    // Add some random additional connections
    let additionalCount = Math.min(3, defaultConnections.length - 4);
    const additionalOptions = defaultConnections.slice(4);
    const additionalConnections = [];
    
    while (additionalConnections.length < additionalCount && additionalOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * additionalOptions.length);
      const connection = additionalOptions.splice(randomIndex, 1)[0];
      if (connection.from < count && connection.to < count) {
        additionalConnections.push(connection);
      }
    }
    
    return [...coreConnections.filter(c => c.from < count && c.to < count), ...additionalConnections];
  };

  // Calculate DC power flow
  const calculateDCPowerFlow = () => {
    // Create admittance matrix
    const Y = Array(busCount).fill().map(() => Array(busCount).fill(0));
    
    // Fill off-diagonal elements (negative of conductance)
    connections.forEach(conn => {
      const conductance = 1 / conn.resistance;
      Y[conn.from][conn.to] = Y[conn.to][conn.from] = -conductance;
    });
    
    // Fill diagonal elements (sum of conductances)
    for (let i = 0; i < busCount; i++) {
      for (let j = 0; j < busCount; j++) {
        if (i !== j) {
          Y[i][i] -= Y[i][j]; // Subtract because off-diagonals are negative
        }
      }
    }
    
    // Create reduced system (removing slack bus)
    const reducedY = [];
    const reducedP = [];
    
    for (let i = 0; i < busCount; i++) {
      if (i !== slackBus) {
        const row = [];
        for (let j = 0; j < busCount; j++) {
          if (j !== slackBus) {
            row.push(Y[i][j]);
          }
        }
        reducedY.push(row);
        
        // Add power injection (convert from MW to per unit)
        const injection = powerInjections[i] || 0;
        reducedP.push(injection / basePower);
      }
    }
    
    // Solve reduced system using Gaussian elimination
    const reducedTheta = solveLinearSystem(reducedY, reducedP);
    
    // Reconstruct full voltage angles
    const theta = Array(busCount).fill(0); // Slack bus is 0
    let idx = 0;
    for (let i = 0; i < busCount; i++) {
      if (i !== slackBus) {
        theta[i] = reducedTheta[idx++];
      }
    }
    
    // Calculate line flows
    const flows = connections.map(conn => {
      const conductance = 1 / conn.resistance;
      const flow = (theta[conn.from] - theta[conn.to]) * conductance;
      return {
        ...conn,
        flow: flow * basePower, // Convert to MW
        fromName: busNames[conn.from],
        toName: busNames[conn.to]
      };
    });
    
    // Calculate slack bus power
    let slackPower = 0;
    flows.forEach(flow => {
      if (flow.from === slackBus) {
        slackPower -= flow.flow;
      } else if (flow.to === slackBus) {
        slackPower += flow.flow;
      }
    });
    
    // Update state
    setPowerFlows(flows);
    setVoltages(theta.map((angle, i) => ({
      bus: i,
      name: busNames[i],
      angle: angle,
      angleDeg: angle * (180 / Math.PI),
      power: i === slackBus ? slackPower : powerInjections[i]
    })));
  };
  
  // Helper function to solve linear equations
  const solveLinearSystem = (A, b) => {
    const n = A.length;
    
    // Clone matrices to avoid modifying originals
    const augmented = A.map((row, i) => [...row, b[i]]);
    
    // Forward elimination
    for (let k = 0; k < n - 1; k++) {
      // Find pivot
      let maxRow = k;
      let maxVal = Math.abs(augmented[k][k]);
      
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(augmented[i][k]) > maxVal) {
          maxVal = Math.abs(augmented[i][k]);
          maxRow = i;
        }
      }
      
      // Swap rows if needed
      if (maxRow !== k) {
        [augmented[k], augmented[maxRow]] = [augmented[maxRow], augmented[k]];
      }
      
      // Eliminate
      for (let i = k + 1; i < n; i++) {
        const factor = augmented[i][k] / augmented[k][k];
        for (let j = k; j <= n; j++) {
          augmented[i][j] -= factor * augmented[k][j];
        }
      }
    }
    
    // Back substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }
    
    return x;
  };

  // Initialize buses based on count
  useEffect(() => {
    const newBuses = [];
    for (let i = 0; i < busCount; i++) {
      const angle = (i / busCount) * 2 * Math.PI;
      const radius = 140;
      
      newBuses.push({
        id: i,
        name: busNames[i],
        x: 200 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
        power: i === 0 ? null : (i % 2 === 0 ? 100 : -100)
      });
    }
    setBuses(newBuses);
    
    // Generate connections
    const newConnections = generateRandomConnections(busCount);
    setConnections(newConnections);
    
    // Update power injections
    const newInjections = Array(busCount).fill(0).map((_, i) => 
      i === slackBus ? null : (i % 2 === 0 ? 100 : -100)
    );
    setPowerInjections(newInjections);
    
  }, [busCount]);

  // Calculate power flow when dependencies change
  useEffect(() => {
    calculateDCPowerFlow();
  }, [connections, powerInjections, slackBus, baseVoltage, basePower]);

  // Handle bus count change
  const handleBusCountChange = (e) => {
    const newCount = parseInt(e.target.value);
    if (newCount >= 2 && newCount <= 5) {
      setBusCount(newCount);
      if (slackBus >= newCount) {
        setSlackBus(0);
      }
    }
  };

  // Handle slack bus change
  const handleSlackBusChange = (e) => {
    setSlackBus(parseInt(e.target.value));
  };

  // Handle power injection change
  const handlePowerChange = (index, value) => {
    const newInjections = [...powerInjections];
    newInjections[index] = value === '' ? null : parseFloat(value);
    setPowerInjections(newInjections);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">DC Power Flow Visualization</h2>
        <p className="text-sm">Interactive model for up to 5 buses</p>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Buses</label>
            <input 
              type="range" 
              min="2" 
              max="5" 
              value={busCount} 
              onChange={handleBusCountChange}
              className="w-32"
            />
            <span className="ml-2">{busCount}</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slack Bus</label>
            <select 
              value={slackBus} 
              onChange={handleSlackBusChange}
              className="border rounded p-1"
            >
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>
                  {bus.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Power (MVA)</label>
            <input 
              type="number" 
              value={basePower} 
              onChange={(e) => setBasePower(parseFloat(e.target.value))}
              className="border rounded p-1 w-20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Voltage (kV)</label>
            <input 
              type="number" 
              value={baseVoltage} 
              onChange={(e) => setBaseVoltage(parseFloat(e.target.value))}
              className="border rounded p-1 w-20"
            />
          </div>
          
          <div className="ml-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Show Labels</label>
            <input 
              type="checkbox" 
              checked={showLabels} 
              onChange={() => setShowLabels(!showLabels)}
              className="mr-1"
            />
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-2/3">
            <div className="border rounded-lg p-4 bg-gray-50 relative">
              <svg width="400" height="400" viewBox="0 0 400 400">
                {/* Connections */}
                {connections.map(conn => {
                  const from = buses.find(b => b.id === conn.from);
                  const to = buses.find(b => b.id === conn.to);
                  if (!from || !to) return null;
                  
                  const flow = powerFlows.find(f => 
                    (f.from === conn.from && f.to === conn.to) ||
                    (f.from === conn.to && f.to === conn.from)
                  );
                  
                  // Line color and thickness based on flow
                  const absFlow = flow ? Math.abs(flow.flow) : 0;
                  const maxFlow = Math.max(...powerFlows.map(f => Math.abs(f.flow)), 1);
                  const lineThickness = 1 + (absFlow / maxFlow) * 5;
                  
                  // Direction indicator
                  const showFlow = flow && Math.abs(flow.flow) > 0.01;
                  const isPositive = flow && flow.flow > 0;
                  const flowColor = isPositive ? "#28a745" : "#dc3545";
                  
                  // Arrow calculations
                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const unitX = dx / length;
                  const unitY = dy / length;
                  
                  // Position arrow at 60% of the way
                  const arrowX = from.x + unitX * length * 0.6;
                  const arrowY = from.y + unitY * length * 0.6;
                  
                  // Text positioning
                  const textX = from.x + unitX * length * 0.5;
                  const textY = from.y + unitY * length * 0.5 - 10;
                  
                  return (
                    <g key={`${conn.from}-${conn.to}`}>
                      {/* Base connection line */}
                      <line 
                        x1={from.x} 
                        y1={from.y} 
                        x2={to.x} 
                        y2={to.y} 
                        stroke="#888" 
                        strokeWidth={2} 
                      />
                      
                      {/* Flow line overlay */}
                      {showFlow && (
                        <line 
                          x1={from.x} 
                          y1={from.y} 
                          x2={to.x} 
                          y2={to.y} 
                          stroke={flowColor} 
                          strokeWidth={lineThickness} 
                          strokeOpacity="0.6"
                          strokeDasharray="5,5"
                        />
                      )}
                      
                      {/* Flow arrow */}
                      {showFlow && (
                        <g transform={`translate(${arrowX}, ${arrowY})`}>
                          <circle 
                            r="8" 
                            fill={flowColor} 
                            opacity="0.8"
                          />
                          <ArrowRightCircle 
                            size={16} 
                            color="white" 
                            style={{
                              transform: isPositive ? 
                                `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)` : 
                                `rotate(${(Math.atan2(dy, dx) + Math.PI) * 180 / Math.PI}deg)`
                            }}
                          />
                        </g>
                      )}
                      
                      {/* Flow label */}
                      {showFlow && showLabels && (
                        <text 
                          x={textX} 
                          y={textY} 
                          textAnchor="middle" 
                          fill={flowColor} 
                          fontSize="11" 
                          fontWeight="bold"
                          stroke="white" 
                          strokeWidth="0.5"
                          paintOrder="stroke"
                        >
                          {Math.abs(flow.flow).toFixed(1)} MW
                        </text>
                      )}
                    </g>
                  );
                })}
                
                {/* Buses */}
                {buses.map(bus => {
                  const voltage = voltages.find(v => v.bus === bus.id);
                  const isSlack = bus.id === slackBus;
                  const power = voltage ? voltage.power : 0;
                  
                  // Status indicator
                  const isPowerPositive = power > 0;
                  const statusColor = isSlack ? "#ff9800" : 
                                     power === 0 ? "#888" : 
                                     isPowerPositive ? "#28a745" : "#dc3545";
                  
                  return (
                    <g key={bus.id}>
                      {/* Bus node */}
                      <circle 
                        cx={bus.x} 
                        cy={bus.y} 
                        r={isSlack ? 15 : 12} 
                        fill={isSlack ? "#ff9800" : "#1e88e5"} 
                        stroke={statusColor}
                        strokeWidth={3}
                      />
                      
                      {/* Bus label */}
                      <text 
                        x={bus.x} 
                        y={bus.y} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="white" 
                        fontWeight="bold"
                        fontSize="10"
                      >
                        {bus.id + 1}
                      </text>
                      
                      {/* Bus name */}
                      <text 
                        x={bus.x} 
                        y={bus.y - 20} 
                        textAnchor="middle" 
                        fill="#333" 
                        fontWeight="bold"
                        fontSize="12"
                      >
                        {bus.name}
                      </text>
                      
                      {/* Power value */}
                      {showLabels && (
                        <text 
                          x={bus.x} 
                          y={bus.y + 25} 
                          textAnchor="middle" 
                          fill={statusColor}
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {isSlack ? "Slack" : `${power?.toFixed(1)} MW`}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-bold mb-2">Power Injections (MW)</h3>
              <div className="space-y-2">
                {buses.map(bus => (
                  <div key={bus.id} className="flex items-center">
                    <div className="w-24 font-medium text-sm">{bus.name}:</div>
                    <input 
                      type="number" 
                      disabled={bus.id === slackBus}
                      value={bus.id === slackBus ? 'Slack' : (powerInjections[bus.id] || '')} 
                      onChange={(e) => handlePowerChange(bus.id, e.target.value)}
                      className="border rounded p-1 w-20 text-right"
                      placeholder={bus.id === slackBus ? "Slack" : "0"}
                    />
                    {bus.id === slackBus && (
                      <span className="ml-2 text-sm text-orange-500">
                        {voltages.find(v => v.bus === slackBus)?.power?.toFixed(1) || '0'} MW
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <h3 className="font-bold mt-4 mb-2">Results</h3>
              <div className="space-y-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-1 text-left">Bus</th>
                      <th className="p-1 text-right">Angle (deg)</th>
                      <th className="p-1 text-right">Power (MW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voltages.map(v => (
                      <tr key={v.bus} className="border-b">
                        <td className="p-1">{v.name}</td>
                        <td className="p-1 text-right">{v.angleDeg.toFixed(2)}°</td>
                        <td className="p-1 text-right">{v.power?.toFixed(1) || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCPowerFlowVisualization;