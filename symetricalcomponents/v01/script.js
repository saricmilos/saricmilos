// Symmetrical Components Calculator
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const balancedBtn = document.getElementById('balanced-btn');
    
    // Input fields
    const phaseAMag = document.getElementById('phase-a-magnitude');
    const phaseAAngle = document.getElementById('phase-a-angle');
    const phaseBMag = document.getElementById('phase-b-magnitude');
    const phaseBAngle = document.getElementById('phase-b-angle');
    const phaseCMag = document.getElementById('phase-c-magnitude');
    const phaseCAngle = document.getElementById('phase-c-angle');
    
    // Result fields
    const positiveMag = document.getElementById('positive-magnitude');
    const positiveAngle = document.getElementById('positive-angle');
    const negativeMag = document.getElementById('negative-magnitude');
    const negativeAngle = document.getElementById('negative-angle');
    const zeroMag = document.getElementById('zero-magnitude');
    const zeroAngle = document.getElementById('zero-angle');
    
    // Canvas for phasor diagram
    const canvas = document.getElementById('phasor-diagram');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    
    // Complex number operations
    class Complex {
        constructor(mag, angleDeg) {
            this.mag = mag || 0;
            this.angle = (angleDeg || 0) * Math.PI / 180; // Convert to radians
            this.real = this.mag * Math.cos(this.angle);
            this.imag = this.mag * Math.sin(this.angle);
        }
        
        static fromRectangular(real, imag) {
            const complex = new Complex();
            complex.real = real;
            complex.imag = imag;
            complex.mag = Math.sqrt(real * real + imag * imag);
            complex.angle = Math.atan2(imag, real);
            return complex;
        }
        
        add(other) {
            return Complex.fromRectangular(
                this.real + other.real,
                this.imag + other.imag
            );
        }
        
        multiply(other) {
            return Complex.fromRectangular(
                this.real * other.real - this.imag * other.imag,
                this.real * other.imag + this.imag * other.real
            );
        }
        
        toString() {
            return `${this.mag.toFixed(2)} ∠ ${(this.angle * 180 / Math.PI).toFixed(1)}°`;
        }
    }
    
    // Operator a (120° rotation)
    const a = new Complex(1, 120);
    // Operator a² (240° rotation)
    const a2 = new Complex(1, 240);

    function formatAngle(complex) {
        return complex.mag < 1e-3 ? '0°' : `${(complex.angle * 180 / Math.PI).toFixed(1)}°`;
    }

    // Calculate symmetrical components
    function calculateSymmetricalComponents() {
        // Get input values
        const Va = new Complex(
            parseFloat(phaseAMag.value) || 0, 
            parseFloat(phaseAAngle.value) || 0
        );
        const Vb = new Complex(
            parseFloat(phaseBMag.value) || 0, 
            parseFloat(phaseBAngle.value) || 0
        );
        const Vc = new Complex(
            parseFloat(phaseCMag.value) || 0, 
            parseFloat(phaseCAngle.value) || 0
        );

        // Calculate components
        // V0 = (Va + Vb + Vc) / 3
        const V0real = (Va.real + Vb.real + Vc.real) / 3;
        const V0imag = (Va.imag + Vb.imag + Vc.imag) / 3;
        const V0 = Complex.fromRectangular(V0real, V0imag);

        // V1 = (Va + a*Vb + a²*Vc) / 3
        const aVb = Vb.multiply(a);
        const a2Vc = Vc.multiply(a2);
        const V1real = (Va.real + aVb.real + a2Vc.real) / 3;
        const V1imag = (Va.imag + aVb.imag + a2Vc.imag) / 3;
        const V1 = Complex.fromRectangular(V1real, V1imag);

        // V2 = (Va + a²*Vb + a*Vc) / 3
        const a2Vb = Vb.multiply(a2);
        const aVc = Vc.multiply(a);
        const V2real = (Va.real + a2Vb.real + aVc.real) / 3;
        const V2imag = (Va.imag + a2Vb.imag + aVc.imag) / 3;
        const V2 = Complex.fromRectangular(V2real, V2imag);

        // Update results display
        positiveMag.textContent = V1.mag.toFixed(2);
        positiveAngle.textContent = formatAngle(V1);

        negativeMag.textContent = V2.mag.toFixed(2);
        negativeAngle.textContent = formatAngle(V2);

        
        zeroMag.textContent = V0.mag.toFixed(2);
        zeroAngle.textContent = formatAngle(V0);

        // Draw phasor diagram
        drawPhasorDiagram(Va, Vb, Vc, V0, V1, V2);
    }

    // Draw the phasor diagram
    function drawPhasorDiagram(Va, Vb, Vc, V0, V1, V2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Find the maximum magnitude for scaling
        const maxMag = Math.max(
            Va.mag, Vb.mag, Vc.mag,
            V0.mag, V1.mag, V2.mag
        );
        
        // Calculate scale factor (80% of half the smaller dimension)
        const scaleFactor = 0.8 * Math.min(centerX, centerY) / (maxMag > 0 ? maxMag : 1);
        
        // Draw coordinate axes
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // Draw circle for scale reference
        ctx.beginPath();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.arc(centerX, centerY, scaleFactor, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw phase phasors
        drawPhasor(centerX, centerY, Va, '#FF3B30', 'Phase A', scaleFactor);
        drawPhasor(centerX, centerY, Vb, '#34C759', 'Phase B', scaleFactor);
        drawPhasor(centerX, centerY, Vc, '#007AFF', 'Phase C', scaleFactor);
        
        // Draw symmetrical component phasors
        drawPhasor(centerX, centerY, V1, '#AF52DE', 'Positive', scaleFactor, true);
        drawPhasor(centerX, centerY, V2, '#FF9500', 'Negative', scaleFactor, true);
        drawPhasor(centerX, centerY, V0, '#5856D6', 'Zero', scaleFactor, true);
        
        // Draw legend
        drawLegend();
    }
    
    // Draw a single phasor
    function drawPhasor(x, y, complex, color, label, scale, dashed = false) {
        const endX = x + complex.real * scale;
        const endY = y - complex.imag * scale; // Subtract because canvas Y is inverted
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        if (dashed) {
            ctx.setLineDash([5, 3]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        
        // Draw arrowhead
        const headLen = 10;
        const angle = Math.atan2(y - endY, endX - x);
        ctx.lineTo(
            endX - headLen * Math.cos(angle - Math.PI / 6),
            endY - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headLen * Math.cos(angle + Math.PI / 6),
            endY - headLen * Math.sin(angle + Math.PI / 6)
        );
        
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Add label
        ctx.fillStyle = color;
        ctx.font = '12px "SF Pro Display", Arial, sans-serif';
        ctx.fillText(label, endX + 5, endY - 5);
    }
    
    // Draw legend
    function drawLegend() {
        const legendX = 20;
        let legendY = 30;
        const lineSize = 15;
        const spacing = 25;
        
        // Phase components
        drawLegendItem(legendX, legendY, '#FF3B30', 'Phase A', false);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#34C759', 'Phase B', false);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#007AFF', 'Phase C', false);
        
        // Symmetrical components
        legendY += spacing * 1.5;
        drawLegendItem(legendX, legendY, '#AF52DE', 'Positive Sequence', true);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#FF9500', 'Negative Sequence', true);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#5856D6', 'Zero Sequence', true);
    }
    
    // Draw a legend item
    function drawLegendItem(x, y, color, label, dashed) {
        const lineSize = 15;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        if (dashed) {
            ctx.setLineDash([5, 3]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + lineSize, y);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.fillStyle = '#333';
        ctx.font = '12px "SF Pro Display", Arial, sans-serif';
        ctx.fillText(label, x + lineSize + 5, y + 4);
    }
    
    // Set default values for a balanced system
    function setBalancedSystem() {
        phaseAMag.value = 100;
        phaseAAngle.value = 0;
        phaseBMag.value = 100;
        phaseBAngle.value = -120;
        phaseCMag.value = 100;
        phaseCAngle.value = 120;
        
        calculateSymmetricalComponents();
    }
    
    // Reset all inputs and results
    function resetInputs() {
        phaseAMag.value = '';
        phaseAAngle.value = '';
        phaseBMag.value = '';
        phaseBAngle.value = '';
        phaseCMag.value = '';
        phaseCAngle.value = '';
        
        positiveMag.textContent = '0';
        positiveAngle.textContent = '0°';
        negativeMag.textContent = '0';
        negativeAngle.textContent = '0°';
        zeroMag.textContent = '0';
        zeroAngle.textContent = '0°';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw empty diagram with axes
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw coordinate axes
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // Draw circle for scale reference
        ctx.beginPath();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.arc(centerX, centerY, 0.8 * Math.min(centerX, centerY), 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Event listeners
    calculateBtn.addEventListener('click', calculateSymmetricalComponents);
    resetBtn.addEventListener('click', resetInputs);
    balancedBtn.addEventListener('click', setBalancedSystem);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
        
        // Redraw if we have values
        if (phaseAMag.value && phaseBMag.value && phaseCMag.value) {
            calculateSymmetricalComponents();
        } else {
            resetInputs();
        }
    });
    
    // Initial setup
    resizeCanvas();
    resetInputs();
    
    // Update copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();
});