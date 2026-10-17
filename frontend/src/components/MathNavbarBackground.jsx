import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function MathNavbarBackground() {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const ctx = canvas.getContext('2d');
        let t = 0;

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            if (W === 0 || H === 0) return;

            ctx.clearRect(0, 0, W, H);
            t += 0.012;

            const isDark = theme === 'dark';
            
            // Subtle, elegant palette
            const cyanRgb = isDark ? '56, 189, 248' : '2, 132, 199';
            const purpleRgb = isDark ? '192, 132, 252' : '147, 51, 234';
            const emeraldRgb = isDark ? '52, 211, 153' : '5, 150, 105';
            const textRgb = isDark ? '226, 232, 240' : '51, 65, 85';

            // 1. Background Grid (Coordinate System)
            ctx.strokeStyle = `rgba(${cyanRgb}, 0.04)`;
            ctx.lineWidth = 1;
            const stepG = 35;
            for (let x = 0; x < W; x += stepG) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
            for (let y = 0; y < H; y += stepG) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W, y);
                ctx.stroke();
            }

            // Helper function to draw arrow vectors
            const drawVector = (fromX, fromY, vecX, vecY, label, colorStr, width = 1.5) => {
                const headLen = 6;
                const toX = fromX + vecX;
                const toY = fromY + vecY;
                const angle = Math.atan2(vecY, vecX);

                ctx.strokeStyle = colorStr;
                ctx.fillStyle = colorStr;
                ctx.lineWidth = width;

                // Shaft
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(toX, toY);
                ctx.stroke();

                // Arrow head
                ctx.beginPath();
                ctx.moveTo(toX, toY);
                ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();

                if (label) {
                    ctx.font = 'bold 10px monospace';
                    ctx.fillText(label, toX + 4, toY + 2);
                }
            };

            // -------------------------------------------------------------
            // 2. LINEAR TRANSFORMATION DEMONSTRATION (Matrix T: R² -> R²)
            // -------------------------------------------------------------
            const angleT = Math.sin(t * 0.5) * 0.4;
            const shearT = Math.cos(t * 0.4) * 0.3;
            
            const a = Math.cos(angleT);
            const c = Math.sin(angleT);
            const b = shearT;
            const d = Math.cos(angleT);

            const originX = W * 0.78;
            const originY = H * 0.52;
            const unitLen = 30;

            // Draw transformed grid lines around origin
            ctx.strokeStyle = `rgba(${purpleRgb}, 0.08)`;
            ctx.lineWidth = 1;
            const numLines = 3;
            for (let i = -numLines; i <= numLines; i++) {
                const p1x = originX + (-numLines * a + i * b) * unitLen;
                const p1y = originY + (-numLines * c + i * d) * unitLen;
                const p2x = originX + (numLines * a + i * b) * unitLen;
                const p2y = originY + (numLines * c + i * d) * unitLen;
                ctx.beginPath();
                ctx.moveTo(p1x, p1y);
                ctx.lineTo(p2x, p2y);
                ctx.stroke();

                const q1x = originX + (i * a - numLines * b) * unitLen;
                const q1y = originY + (i * c - numLines * d) * unitLen;
                const q2x = originX + (i * a + numLines * b) * unitLen;
                const q2y = originY + (i * c + numLines * d) * unitLen;
                ctx.beginPath();
                ctx.moveTo(q1x, q1y);
                ctx.lineTo(q2x, q2y);
                ctx.stroke();
            }

            // Draw Transformed Basis Vectors: T(i^) and T(j^)
            const tiX = a * unitLen;
            const tiY = c * unitLen;
            const tjX = b * unitLen;
            const tjY = d * unitLen;

            drawVector(originX, originY, tiX, tiY, 'T(î)', `rgba(${cyanRgb}, 0.40)`, 1.5);
            drawVector(originX, originY, tjX, tjY, 'T(ĵ)', `rgba(${purpleRgb}, 0.40)`, 1.5);

            // Matrix notation text near transformation
            ctx.font = '10px monospace';
            ctx.fillStyle = `rgba(${textRgb}, 0.30)`;
            ctx.fillText(`T(x) = A · x`, originX - 45, originY - 38);
            ctx.fillText(`A = [${a.toFixed(1)} ${b.toFixed(1)}; ${c.toFixed(1)} ${d.toFixed(1)}]`, originX - 65, originY + 44);

            // -------------------------------------------------------------
            // 3. PARABOLIC FUNCTION & TANGENT VECTORS (y = ax² + bx + c)
            // -------------------------------------------------------------
            const pCenterX = W * 0.28;
            const pCenterY = H * 0.65;
            const pScale = 28;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(${cyanRgb}, 0.25)`;
            ctx.lineWidth = 1.5;
            let firstP = true;
            for (let px = -W * 0.22; px <= W * 0.22; px += 3) {
                const normX = px / pScale;
                const normY = -0.38 * Math.pow(normX, 2) + 0.9;
                const drawX = pCenterX + px;
                const drawY = pCenterY - normY * pScale;

                if (firstP) {
                    ctx.moveTo(drawX, drawY);
                    firstP = false;
                } else {
                    ctx.lineTo(drawX, drawY);
                }
            }
            ctx.stroke();

            // Animated tangent vector moving on the parabola
            const movingNormX = Math.sin(t * 0.8) * 2.0;
            const movingNormY = -0.38 * Math.pow(movingNormX, 2) + 0.9;
            const pointX = pCenterX + movingNormX * pScale;
            const pointY = pCenterY - movingNormY * pScale;

            const deriv = -0.76 * movingNormX;
            const vecLen = 24;
            const tangentVx = vecLen / Math.sqrt(1 + deriv * deriv);
            const tangentVy = -deriv * tangentVx;

            drawVector(pointX, pointY, tangentVx, tangentVy, 'v⃗ = (1, f\')', `rgba(${emeraldRgb}, 0.45)`, 1.5);

            // Point on parabola
            ctx.beginPath();
            ctx.arc(pointX, pointY, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${emeraldRgb}, 0.50)`;
            ctx.fill();

            // Parabola function label
            ctx.font = '10px monospace';
            ctx.fillStyle = `rgba(${cyanRgb}, 0.35)`;
            ctx.fillText('f(x) = -0.38x² + 0.9', pCenterX - 65, pCenterY + 22);

            // -------------------------------------------------------------
            // 4. VECTOR FIELD & MATHEMATICAL FORMULAS OVERLAY
            // -------------------------------------------------------------
            const mathItems = [
                { text: '∇ × v⃗ = 0', xRatio: 0.08, yRatio: 0.35, color: cyanRgb },
                { text: 'det(A) ≠ 0', xRatio: 0.54, yRatio: 0.30, color: purpleRgb },
                { text: 'A·v = λv', xRatio: 0.52, yRatio: 0.75, color: emeraldRgb },
                { text: '∫ (∇·F)dV', xRatio: 0.92, yRatio: 0.28, color: cyanRgb }
            ];

            ctx.font = '10px "Mona Sans", monospace';
            mathItems.forEach(item => {
                ctx.fillStyle = `rgba(${item.color}, 0.28)`;
                ctx.fillText(item.text, item.xRatio * W, item.yRatio * H);
            });

            animRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
        />
    );
}
