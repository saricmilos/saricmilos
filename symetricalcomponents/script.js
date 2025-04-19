/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

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
        
        // Calculate scale factor (70% of half the smaller dimension)
        const scaleFactor = 0.7 * Math.min(centerX, centerY) / (maxMag > 0 ? maxMag : 1);
        
        // Draw background grid
        drawGrid(centerX, centerY, scaleFactor);
        
        // Draw coordinate axes
        drawAxes(centerX, centerY);
        
        // Draw circles for scale reference
        drawScaleCircles(centerX, centerY, scaleFactor, maxMag);
        
        // Draw phase phasors
        drawPhasor(centerX, centerY, Va, '#FF3B30', 'Phase A', scaleFactor, 3);
        drawPhasor(centerX, centerY, Vb, '#34C759', 'Phase B', scaleFactor, 3);
        drawPhasor(centerX, centerY, Vc, '#007AFF', 'Phase C', scaleFactor, 3);
        
        // Draw symmetrical component phasors
        drawPhasor(centerX, centerY, V1, '#AF52DE', 'Positive', scaleFactor, 2, true);
        drawPhasor(centerX, centerY, V2, '#FF9500', 'Negative', scaleFactor, 2, true);
        drawPhasor(centerX, centerY, V0, '#5856D6', 'Zero', scaleFactor, 2, true);
        
        // Draw legend
        drawLegend(maxMag);
    }

    // Draw background grid
    function drawGrid(centerX, centerY, scaleFactor) {
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 0.5;
        
        // Draw grid lines
        const gridSize = 20; // pixels between grid lines
        const numLines = Math.max(canvas.width, canvas.height) / gridSize;
        
        ctx.beginPath();
        for (let i = -numLines; i <= numLines; i++) {
            // Vertical lines
            ctx.moveTo(centerX + i * gridSize, 0);
            ctx.lineTo(centerX + i * gridSize, canvas.height);
            
            // Horizontal lines
            ctx.moveTo(0, centerY + i * gridSize);
            ctx.lineTo(canvas.width, centerY + i * gridSize);
        }
        ctx.stroke();
    }
    
    // Draw coordinate axes
    function drawAxes(centerX, centerY) {
        // Draw coordinate axes
        ctx.beginPath();
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1.5;
        
        // X-axis
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        
        // Y-axis
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // X-axis arrow
        ctx.beginPath();
        ctx.fillStyle = '#aaa';
        ctx.moveTo(canvas.width - 15, centerY - 5);
        ctx.lineTo(canvas.width - 5, centerY);
        ctx.lineTo(canvas.width - 15, centerY + 5);
        ctx.fill();
        
        // Y-axis arrow
        ctx.beginPath();
        ctx.moveTo(centerX - 5, 15);
        ctx.lineTo(centerX, 5);
        ctx.lineTo(centerX + 5, 15);
        ctx.fill();
        
        // Label the axes
        ctx.font = '14px "SF Pro Display", Arial, sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Real', canvas.width - 40, centerY - 10);
        ctx.fillText('Imag', centerX + 10, 20);
    }
    
    // Draw scale circles
    function drawScaleCircles(centerX, centerY, scaleFactor, maxMag) {
        // Draw circle for scale reference
        ctx.beginPath();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        // Draw multiple circles for scale reference
        const numCircles = 4;
        for (let i = 1; i <= numCircles; i++) {
            const radius = (i / numCircles) * maxMag * scaleFactor;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Add scale label
            const scaleValue = (i / numCircles) * maxMag;
            ctx.fillStyle = '#999';
            ctx.font = '12px "SF Pro Display", Arial, sans-serif';
            ctx.fillText(`${scaleValue.toFixed(0)}`, centerX + radius + 5, centerY);
        }
    }
    
    // Draw a single phasor
    function drawPhasor(x, y, complex, color, label, scale, lineWidth = 2, dashed = false) {
        if (complex.mag < 1e-3) return; // Don't draw zero magnitude phasors
        
        const endX = x + complex.real * scale;
        const endY = y - complex.imag * scale; // Subtract because canvas Y is inverted
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        
        if (dashed) {
            ctx.setLineDash([6, 3]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        
        // Draw arrowhead
        const headLen = 12;
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
        
        // Add label with magnitude and angle
        ctx.fillStyle = color;
        ctx.font = 'bold 13px "SF Pro Display", Arial, sans-serif';
        
        // Position the label better based on quadrant
        let labelX = endX;
        let labelY = endY;
        const offset = 16;
        
        // Adjust label position based on phasor angle
        if (complex.real >= 0 && complex.imag >= 0) {
            // First quadrant
            labelX += offset;
            labelY -= offset;
        } else if (complex.real < 0 && complex.imag >= 0) {
            // Second quadrant
            labelX -= offset + ctx.measureText(`${label} ${complex.mag.toFixed(1)}∠${(complex.angle * 180 / Math.PI).toFixed(0)}°`).width;
            labelY -= offset;
        } else if (complex.real < 0 && complex.imag < 0) {
            // Third quadrant
            labelX -= offset + ctx.measureText(`${label} ${complex.mag.toFixed(1)}∠${(complex.angle * 180 / Math.PI).toFixed(0)}°`).width;
            labelY += offset;
        } else {
            // Fourth quadrant
            labelX += offset;
            labelY += offset;
        }
        
        ctx.fillText(`${label} ${complex.mag.toFixed(1)}∠${(complex.angle * 180 / Math.PI).toFixed(0)}°`, labelX, labelY);
    }
    
    // Draw legend
    function drawLegend(maxMag) {
        const legendX = 20;
        let legendY = 30;
        const lineSize = 20;
        const spacing = 25;
        
        // Background for legend
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(legendX - 10, legendY - 20, 220, 200);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 10, legendY - 20, 220, 200);
        
        // Title
        ctx.font = 'bold 14px "SF Pro Display", Arial, sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText('Legend', legendX, legendY);
        legendY += spacing;
        
        // Phase components
        drawLegendItem(legendX, legendY, '#FF3B30', 'Phase A', false, 3);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#34C759', 'Phase B', false, 3);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#007AFF', 'Phase C', false, 3);
        
        // Symmetrical components
        legendY += spacing * 1.2;
        drawLegendItem(legendX, legendY, '#AF52DE', 'Positive Sequence', true, 2);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#FF9500', 'Negative Sequence', true, 2);
        legendY += spacing;
        drawLegendItem(legendX, legendY, '#5856D6', 'Zero Sequence', true, 2);
    }
    
    // Draw a legend item
    function drawLegendItem(x, y, color, label, dashed, lineWidth = 2) {
        const lineSize = 20;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        
        if (dashed) {
            ctx.setLineDash([6, 3]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + lineSize, y);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.fillStyle = '#333';
        ctx.font = '14px "SF Pro Display", Arial, sans-serif';
        ctx.fillText(label, x + lineSize + 10, y + 5);
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
        
        // Draw grid
        drawGrid(centerX, centerY);
        
        // Draw coordinate axes
        drawAxes(centerX, centerY);
        
        // Draw circle for scale reference
        ctx.beginPath();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.arc(centerX, centerY, 0.7 * Math.min(centerX, centerY), 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw legend
        drawLegend();
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

    window.onscroll = () => {
        document.getElementById("backToTop").style.display = 
            window.scrollY > 400 ? "block" : "none";
    };

    document.getElementById("backToTop").onclick = () =>
        window.scrollTo({ top: 0, behavior: 'smooth' });

    document.addEventListener('DOMContentLoaded', function() {
        // Get elements
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const body = document.body;
        
        // Toggle mobile menu on hamburger click
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function() {
                // Toggle active class on menu button
                this.classList.toggle('active');
                // Toggle active class on nav menu
                navMenu.classList.toggle('active');
                // Toggle no-scroll class on body to prevent scrolling when menu is open
                body.classList.toggle('no-scroll');
            });
        }
        
        // Close menu when clicking on a menu item
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Only perform this action on mobile
                if (window.innerWidth <= 768) {
                    mobileMenuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    body.classList.remove('no-scroll');
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            // Only perform this action on mobile and when menu is open
            if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
                // Check if click is outside the nav menu and not on the toggle button
                if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                    mobileMenuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    body.classList.remove('no-scroll');
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            // If window is resized above mobile breakpoint, reset mobile menu
            if (window.innerWidth > 768) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });
    });