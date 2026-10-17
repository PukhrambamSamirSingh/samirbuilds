import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function IdeaCanvasBackground() {
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

        // Question mark floating particles
        const qParticles = Array.from({ length: 18 }, () => ({
            x: Math.random(),
            y: Math.random(),
            size: 14 + Math.random() * 8,
            speedY: 0.0003 + Math.random() * 0.0005,
            speedX: (Math.random() - 0.5) * 0.0003,
            rot: (Math.random() - 0.5) * 0.4,
            alpha: 0.2 + Math.random() * 0.4
        }));

        // Node network configuration matching idea_image structure
        // Node 0: Lightbulb (Top Left)
        // Node 1: Top Mid Junction
        // Node 2: Top Right Node
        // Node 3: Center Mid Burst
        // Node 4: Bottom Left Junction
        // Node 5: Bottom Center Node
        // Node 6: Right Mid Junction
        // Node 7: Bottom Right Node
        const getNodePos = (W, H) => [
            { x: W * 0.22, y: H * 0.22, isBulb: true },
            { x: W * 0.46, y: H * 0.15 },
            { x: W * 0.70, y: H * 0.12 },
            { x: W * 0.40, y: H * 0.45, isBurst: true },
            { x: W * 0.18, y: H * 0.48 },
            { x: W * 0.32, y: H * 0.80 },
            { x: W * 0.84, y: H * 0.24 },
            { x: W * 0.78, y: H * 0.82 }
        ];

        // Arrow connections (from, to, progress)
        const connections = [
            { from: 0, to: 1 },
            { from: 0, to: 3 },
            { from: 0, to: 4 },
            { from: 1, to: 2 },
            { from: 1, to: 3 },
            { from: 2, to: 6 },
            { from: 3, to: 5 },
            { from: 4, to: 5 },
            { from: 6, to: 7 },
            { from: 2, to: 7 }
        ];

        // Light pulses traveling along connection paths
        const pulses = Array.from({ length: 12 }, () => ({
            connIdx: Math.floor(Math.random() * connections.length),
            progress: Math.random(),
            speed: 0.004 + Math.random() * 0.006
        }));

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            if (W === 0 || H === 0) return;

            ctx.clearRect(0, 0, W, H);
            t += 0.015;

            const isDark = theme === 'dark';
            
            // -------------------------------------------------------------
            // 1. 3D CENTRAL SPHERE (Right Center)
            // -------------------------------------------------------------
            const sphereX = W * 0.58;
            const sphereY = H * 0.56;
            const sphereR = Math.min(W, H) * 0.24;

            // Sphere drop shadow
            ctx.beginPath();
            ctx.ellipse(sphereX, sphereY + sphereR * 0.85, sphereR * 0.8, sphereR * 0.25, 0, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.18)';
            ctx.fill();

            // Radial gradient 3D sphere
            const sphereGrad = ctx.createRadialGradient(
                sphereX - sphereR * 0.3, sphereY - sphereR * 0.3, sphereR * 0.05,
                sphereX, sphereY, sphereR
            );
            if (isDark) {
                sphereGrad.addColorStop(0, '#64748b');
                sphereGrad.addColorStop(0.5, '#334155');
                sphereGrad.addColorStop(1, '#0f172a');
            } else {
                sphereGrad.addColorStop(0, '#ffffff');
                sphereGrad.addColorStop(0.4, '#e2e8f0');
                sphereGrad.addColorStop(0.85, '#94a3b8');
                sphereGrad.addColorStop(1, '#64748b');
            }
            ctx.beginPath();
            ctx.arc(sphereX, sphereY, sphereR, 0, Math.PI * 2);
            ctx.fillStyle = sphereGrad;
            ctx.fill();

            // -------------------------------------------------------------
            // 2. NETWORK NODES & ANIMATED CONNECTIONS
            // -------------------------------------------------------------
            const nodes = getNodePos(W, H);

            // Function to draw arrow along path
            const drawArrowLine = (fromX, fromY, toX, toY, drawProgress, colorStr) => {
                const currentX = fromX + (toX - fromX) * drawProgress;
                const currentY = fromY + (toY - fromY) * drawProgress;

                ctx.strokeStyle = colorStr;
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();

                // Arrow head at progress endpoint
                if (drawProgress > 0.1) {
                    const angle = Math.atan2(toY - fromY, toX - fromX);
                    const headLen = 9;
                    ctx.fillStyle = colorStr;
                    ctx.beginPath();
                    ctx.moveTo(currentX, currentY);
                    ctx.lineTo(currentX - headLen * Math.cos(angle - Math.PI / 6), currentY - headLen * Math.sin(angle - Math.PI / 6));
                    ctx.lineTo(currentX - headLen * Math.cos(angle + Math.PI / 6), currentY - headLen * Math.sin(angle + Math.PI / 6));
                    ctx.closePath();
                    ctx.fill();
                }
            };

            const lineColor = isDark ? 'rgba(241, 245, 249, 0.40)' : 'rgba(30, 41, 59, 0.45)';

            // Draw Connection Lines
            connections.forEach((conn) => {
                const n1 = nodes[conn.from];
                const n2 = nodes[conn.to];
                if (n1 && n2) {
                    // Pulsing animated line creation
                    const phase = (t + conn.from * 0.5) % (Math.PI * 2);
                    const prog = 0.5 + Math.sin(phase) * 0.5;
                    drawArrowLine(n1.x, n1.y, n2.x, n2.y, prog, lineColor);
                }
            });

            // Draw Traveling Light Pulses
            pulses.forEach(p => {
                p.progress += p.speed;
                if (p.progress >= 1) {
                    p.progress = 0;
                    p.connIdx = Math.floor(Math.random() * connections.length);
                }
                const conn = connections[p.connIdx];
                const n1 = nodes[conn.from];
                const n2 = nodes[conn.to];
                if (n1 && n2) {
                    const px = n1.x + (n2.x - n1.x) * p.progress;
                    const py = n1.y + (n2.y - n1.y) * p.progress;

                    const glowGrd = ctx.createRadialGradient(px, py, 0, px, py, 14);
                    glowGrd.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.9)' : 'rgba(37, 99, 235, 0.9)');
                    glowGrd.addColorStop(1, 'rgba(56, 189, 248, 0)');
                    ctx.beginPath();
                    ctx.arc(px, py, 14, 0, Math.PI * 2);
                    ctx.fillStyle = glowGrd;
                    ctx.fill();
                }
            });

            // -------------------------------------------------------------
            // 3. SPECIAL NODES: LIGHT BULB & RAY BURSTS
            // -------------------------------------------------------------
            nodes.forEach((node) => {
                if (node.isBulb) {
                    // Lightbulb glow
                    const bulbGlow = ctx.createRadialGradient(node.x, node.y, 5, node.x, node.y, 45);
                    bulbGlow.addColorStop(0, isDark ? 'rgba(253, 224, 71, 0.5)' : 'rgba(234, 179, 8, 0.4)');
                    bulbGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 45, 0, Math.PI * 2);
                    ctx.fillStyle = bulbGlow;
                    ctx.fill();

                    // Radiating bulb rays
                    const numRays = 8;
                    ctx.strokeStyle = isDark ? 'rgba(254, 240, 138, 0.7)' : 'rgba(202, 138, 4, 0.7)';
                    ctx.lineWidth = 2;
                    for (let r = 0; r < numRays; r++) {
                        const rayAngle = (r / numRays) * Math.PI * 2 + Math.sin(t) * 0.1;
                        const rayLen = 22 + Math.sin(t * 2 + r) * 4;
                        ctx.beginPath();
                        ctx.moveTo(node.x + Math.cos(rayAngle) * 16, node.y + Math.sin(rayAngle) * 16);
                        ctx.lineTo(node.x + Math.cos(rayAngle) * (16 + rayLen), node.y + Math.sin(rayAngle) * (16 + rayLen));
                        ctx.stroke();
                    }

                    // Draw Light Bulb Outline
                    ctx.strokeStyle = isDark ? '#ffffff' : '#1e293b';
                    ctx.fillStyle = isDark ? '#fef08a' : '#fef9c3';
                    ctx.lineWidth = 2.5;

                    ctx.beginPath();
                    ctx.arc(node.x, node.y - 4, 12, 0.8 * Math.PI, 0.2 * Math.PI, false);
                    ctx.lineTo(node.x + 6, node.y + 10);
                    ctx.lineTo(node.x - 6, node.y + 10);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // Bulb filament lines
                    ctx.beginPath();
                    ctx.moveTo(node.x - 4, node.y + 10);
                    ctx.lineTo(node.x - 4, node.y + 15);
                    ctx.moveTo(node.x + 4, node.y + 10);
                    ctx.lineTo(node.x + 4, node.y + 15);
                    ctx.stroke();

                } else if (node.isBurst) {
                    // Star burst rays
                    const numB = 14;
                    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.6)';
                    ctx.lineWidth = 1.5;
                    for (let b = 0; b < numB; b++) {
                        const bAngle = (b / numB) * Math.PI * 2 + t * 0.2;
                        const bLen = 18 + Math.sin(t * 3 + b) * 6;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(node.x + Math.cos(bAngle) * bLen, node.y + Math.sin(bAngle) * bLen);
                        ctx.stroke();
                    }
                } else {
                    // Regular node points
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
                    ctx.fill();
                }
            });

            // -------------------------------------------------------------
            // 4. FLOATING QUESTION MARK PARTICLES (?)
            // -------------------------------------------------------------
            ctx.font = 'bold italic 18px "Mona Sans", sans-serif';
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(30, 41, 59, 0.35)';

            qParticles.forEach((p) => {
                p.y -= p.speedY;
                p.x += p.speedX;
                if (p.y < -0.05) p.y = 1.05;
                if (p.x < -0.05) p.x = 1.05;
                if (p.x > 1.05) p.x = -0.05;

                const px = p.x * W;
                const py = p.y * H;

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(p.rot + Math.sin(t + px) * 0.1);
                ctx.fillText('?', 0, 0);
                ctx.restore();
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
            className="absolute inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-500"
        />
    );
}
