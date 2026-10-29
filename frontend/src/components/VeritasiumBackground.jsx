import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * VeritasiumBackground
 * Dynamically adapts between:
 * - Dark Mode: Cinematic Veritasium cosmic dark background with floating bokeh disks & glowing stardust.
 * - Light Mode: Elegant 3Blue1Brown-inspired warm cream backdrop with subtle isometric geometric lines & ambient floating particles.
 */
export default function VeritasiumBackground({ className = '' }) {
    const canvasRef = useRef(null);
    const { theme } = useTheme();
    const themeRef = useRef(theme);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let animationFrameId;
        const ctx = canvas.getContext('2d');

        let width = (canvas.width = canvas.offsetWidth);
        let height = (canvas.height = canvas.offsetHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);

        // Mouse parallax
        let targetMouseX = 0;
        let targetMouseY = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            targetMouseX = (e.clientX - rect.left) / rect.width - 0.5;
            targetMouseY = (e.clientY - rect.top) / rect.height - 0.5;
        };

        const parent = canvas.parentElement;
        if (parent) {
            parent.addEventListener('mousemove', handleMouseMove);
        }

        // Particle systems
        const bokehCount = 24;
        const bokehList = Array.from({ length: bokehCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 8 + Math.random() * 24,
            speedX: (Math.random() - 0.5) * 0.16,
            speedY: -0.12 - Math.random() * 0.22,
            pulseSpeed: 0.008 + Math.random() * 0.015,
            pulseOffset: Math.random() * Math.PI * 2,
            depth: 0.2 + Math.random() * 0.8,
            type: Math.floor(Math.random() * 4),
        }));

        const dustCount = 65;
        const dustList = Array.from({ length: dustCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0.7 + Math.random() * 1.6,
            baseAlpha: 0.2 + Math.random() * 0.6,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: -0.18 - Math.random() * 0.35,
            twinkleSpeed: 0.02 + Math.random() * 0.04,
            twinkleOffset: Math.random() * Math.PI * 2,
            depth: 0.4 + Math.random() * 0.9,
            isCyan: Math.random() > 0.5,
        }));

        let time = 0;

        const render = () => {
            time += 0.02;
            const isDark = themeRef.current === 'dark';

            currentMouseX += (targetMouseX - currentMouseX) * 0.05;
            currentMouseY += (targetMouseY - currentMouseY) * 0.05;

            if (isDark) {
                // ================= DARK MODE: VERITASIUM COSMIC DUST =================
                // 1. Base dark background
                ctx.fillStyle = '#030712';
                ctx.fillRect(0, 0, width, height);

                // 2. Deep blue cosmic radial glow
                const glowCenterX = width * 0.5 + currentMouseX * 35;
                const glowCenterY = height * 0.5 + currentMouseY * 25;
                const primaryGlow = ctx.createRadialGradient(
                    glowCenterX,
                    glowCenterY,
                    10,
                    glowCenterX,
                    glowCenterY,
                    Math.max(width, height) * 0.75
                );
                primaryGlow.addColorStop(0, 'rgba(30, 58, 138, 0.42)');
                primaryGlow.addColorStop(0.4, 'rgba(15, 23, 42, 0.7)');
                primaryGlow.addColorStop(0.75, 'rgba(8, 12, 26, 0.92)');
                primaryGlow.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
                ctx.fillStyle = primaryGlow;
                ctx.fillRect(0, 0, width, height);

                // Bokeh orbs
                const darkColors = [
                    'rgba(56, 189, 248, ',  // Cyan
                    'rgba(96, 165, 250, ',  // Sky blue
                    'rgba(99, 102, 241, ',  // Indigo
                    'rgba(168, 85, 247, ',  // Violet
                ];

                for (let i = 0; i < bokehList.length; i++) {
                    const b = bokehList[i];
                    b.x += b.speedX + currentMouseX * b.depth * 0.8;
                    b.y += b.speedY + currentMouseY * b.depth * 0.8;

                    if (b.y < -b.radius * 2) b.y = height + b.radius * 2;
                    if (b.y > height + b.radius * 2) b.y = -b.radius * 2;
                    if (b.x < -b.radius * 2) b.x = width + b.radius * 2;
                    if (b.x > width + b.radius * 2) b.x = -b.radius * 2;

                    const alpha = (0.07 + 0.08 * b.depth) * (0.8 + 0.3 * Math.sin(time * b.pulseSpeed * 20 + b.pulseOffset));
                    const colorPrefix = darkColors[b.type % darkColors.length];

                    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
                    grad.addColorStop(0, `${colorPrefix}${alpha})`);
                    grad.addColorStop(0.5, `${colorPrefix}${alpha * 0.5})`);
                    grad.addColorStop(1, `${colorPrefix}0)`);

                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                }

                // Stardust specks
                for (let i = 0; i < dustList.length; i++) {
                    const d = dustList[i];
                    d.x += d.speedX + currentMouseX * d.depth * 1.4;
                    d.y += d.speedY + currentMouseY * d.depth * 1.4;

                    if (d.y < -5) d.y = height + 5;
                    if (d.y > height + 5) d.y = -5;
                    if (d.x < -5) d.x = width + 5;
                    if (d.x > width + 5) d.x = -5;

                    const twinkle = Math.sin(time * d.twinkleSpeed * 20 + d.twinkleOffset);
                    const alpha = Math.max(0.05, Math.min(1, d.baseAlpha * (0.7 + 0.3 * twinkle)));

                    ctx.beginPath();
                    ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
                    ctx.fillStyle = d.isCyan
                        ? `rgba(186, 230, 253, ${alpha})`
                        : `rgba(255, 255, 255, ${alpha})`;
                    ctx.fill();
                }

                // Vignette
                const vignette = ctx.createRadialGradient(
                    width / 2,
                    height / 2,
                    Math.min(width, height) * 0.35,
                    width / 2,
                    height / 2,
                    Math.max(width, height) * 0.72
                );
                vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
                vignette.addColorStop(1, 'rgba(2, 6, 23, 0.75)');
                ctx.fillStyle = vignette;
                ctx.fillRect(0, 0, width, height);

            } else {
                // ================= LIGHT MODE: 3BLUE1BROWN WARM CANVAS =================
                // 1. Warm cream paper background
                ctx.fillStyle = '#faf8f5';
                ctx.fillRect(0, 0, width, height);

                // 2. Subtle isometric grid lines (like 3Blue1Brown author backdrop)
                ctx.save();
                ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)'; // faint warm amber line
                ctx.lineWidth = 1;

                const step = 48;
                for (let x = -width; x < width * 2; x += step) {
                    ctx.beginPath();
                    ctx.moveTo(x + currentMouseX * 15, 0);
                    ctx.lineTo(x + height * 0.577 + currentMouseX * 15, height);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x + currentMouseX * 15, height);
                    ctx.lineTo(x + height * 0.577 + currentMouseX * 15, 0);
                    ctx.stroke();
                }
                ctx.restore();

                // 3. Soft ambient warm radial glow
                const warmGlow = ctx.createRadialGradient(
                    width * 0.25 + currentMouseX * 20,
                    height * 0.4 + currentMouseY * 20,
                    20,
                    width * 0.25,
                    height * 0.4,
                    width * 0.6
                );
                warmGlow.addColorStop(0, 'rgba(245, 158, 11, 0.07)');
                warmGlow.addColorStop(0.6, 'rgba(254, 243, 199, 0.03)');
                warmGlow.addColorStop(1, 'rgba(250, 248, 245, 0)');
                ctx.fillStyle = warmGlow;
                ctx.fillRect(0, 0, width, height);

                // 4. Delicate floating particles in light mode
                const lightColors = [
                    'rgba(217, 119, 6, ',   // Warm amber
                    'rgba(59, 130, 246, ',  // Soft blue
                    'rgba(16, 185, 129, ',  // Emerald
                ];

                for (let i = 0; i < 16; i++) {
                    const b = bokehList[i];
                    b.x += b.speedX * 0.7;
                    b.y += b.speedY * 0.7;

                    if (b.y < -b.radius * 2) b.y = height + b.radius * 2;
                    if (b.y > height + b.radius * 2) b.y = -b.radius * 2;
                    if (b.x < -b.radius * 2) b.x = width + b.radius * 2;
                    if (b.x > width + b.radius * 2) b.x = -b.radius * 2;

                    const alpha = 0.04 * (0.8 + 0.3 * Math.sin(time * b.pulseSpeed * 15 + b.pulseOffset));
                    const colorPrefix = lightColors[b.type % lightColors.length];

                    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * 0.8);
                    grad.addColorStop(0, `${colorPrefix}${alpha})`);
                    grad.addColorStop(1, `${colorPrefix}0)`);

                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.radius * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
            style={{ display: 'block' }}
        />
    );
}
