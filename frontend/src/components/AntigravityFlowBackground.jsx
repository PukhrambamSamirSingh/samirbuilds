import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * AntigravityFlowBackground
 * Implements the signature Google Antigravity vector field / particle liftoff flow.
 * Displays hundreds of directional flowing dashes/dots moving in a gravitational/liftoff curve:
 * - Left side: Vibrant blues & cyans
 * - Center: Violet & indigo
 * - Right: Magenta & coral/rose
 * Adapts dynamically to both Light and Dark themes.
 */
export default function AntigravityFlowBackground({ className = '' }) {
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

        let width = 0;
        let height = 0;

        const resize = () => {
            if (!canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener('resize', resize);

        // Mouse interaction
        let mouseX = -9999;
        let mouseY = -9999;
        let targetMouseX = -9999;
        let targetMouseY = -9999;

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            targetMouseX = e.clientX - rect.left;
            targetMouseY = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            targetMouseX = -9999;
            targetMouseY = -9999;
        };

        const parent = canvas.parentElement;
        if (parent) {
            parent.addEventListener('mousemove', handleMouseMove);
            parent.addEventListener('mouseleave', handleMouseLeave);
        }

        // Particle System
        // In the screenshot, there is a dense, elegant array of oriented vector dashes
        const PARTICLE_COUNT = 320;

        const createParticle = (spawnRandom = false) => {
            const x = Math.random() * (width || 800);
            const y = spawnRandom ? Math.random() * (height || 500) : (height || 500) + Math.random() * 40;
            return {
                x,
                y,
                baseSpeed: 0.9 + Math.random() * 1.4,
                lengthFactor: 0.8 + Math.random() * 0.8,
                thickness: 1.2 + Math.random() * 1.4,
                alpha: 0.35 + Math.random() * 0.55,
                age: Math.random() * 200,
                maxAge: 180 + Math.random() * 240,
                // slight individual flutter
                seed: Math.random() * 100,
            };
        };

        const particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(true));

        let t = 0;

        // Flow field vector evaluation at position (x, y)
        // Curves upward and flares outwards like the Google Antigravity liftoff field
        const getVelocity = (x, y, time) => {
            const nx = (x - width * 0.5) / (width * 0.5 || 1); // -1 to 1
            const ny = (y - height * 0.5) / (height * 0.5 || 1); // -1 to 1

            // Base upward liftoff
            let vy = -1.6 - 0.4 * (1 - Math.abs(nx));

            // Curving lateral flow: left curves in then up, right flares outward
            let vx = nx * 1.1 + Math.sin(ny * 2.2 + time * 0.5) * 0.35;

            // Subtle harmonic wave
            vx += Math.cos(nx * 3.0 + ny * 1.5 + time) * 0.25;
            vy += Math.sin(nx * 2.0 - time * 0.8) * 0.2;

            // Mouse deflection force
            if (mouseX > 0 && mouseY > 0) {
                const dx = x - mouseX;
                const dy = y - mouseY;
                const distSq = dx * dx + dy * dy;
                const radius = 130;
                if (distSq < radius * radius && distSq > 1) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / radius) * 2.5;
                    vx += (dx / dist) * force;
                    vy += (dy / dist) * force;
                }
            }

            return { vx, vy };
        };

        // Interpolate Google Antigravity colors:
        // Blue (#2563eb) -> Cyan (#06b6d4) -> Violet (#8b5cf6) -> Magenta (#d946ef) -> Rose/Coral (#f43f5e)
        const getColor = (ratio, isDark, alpha) => {
            let r, g, b;
            if (ratio < 0.28) {
                // Blue to Cyan
                const f = ratio / 0.28;
                if (isDark) {
                    r = Math.round(37 + f * (6 - 37));
                    g = Math.round(99 + f * (182 - 99));
                    b = Math.round(235 + f * (212 - 235));
                } else {
                    r = Math.round(29 + f * (2 - 29));
                    g = Math.round(78 + f * (132 - 78));
                    b = Math.round(216 + f * (199 - 216));
                }
            } else if (ratio < 0.62) {
                // Cyan/Blue to Violet
                const f = (ratio - 0.28) / 0.34;
                if (isDark) {
                    r = Math.round(6 + f * (168 - 6));
                    g = Math.round(182 + f * (85 - 182));
                    b = Math.round(212 + f * (247 - 212));
                } else {
                    r = Math.round(2 + f * (147 - 2));
                    g = Math.round(132 + f * (51 - 132));
                    b = Math.round(199 + f * (234 - 199));
                }
            } else {
                // Violet to Magenta/Coral
                const f = (ratio - 0.62) / 0.38;
                if (isDark) {
                    r = Math.round(168 + f * (244 - 168));
                    g = Math.round(85 + f * (63 - 85));
                    b = Math.round(247 + f * (94 - 247));
                } else {
                    r = Math.round(147 + f * (225 - 147));
                    g = Math.round(51 + f * (29 - 51));
                    b = Math.round(234 + f * (72 - 234));
                }
            }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const render = () => {
            t += 0.015;
            const isDark = themeRef.current === 'dark';

            // Smooth mouse interpolation
            if (targetMouseX > 0) {
                mouseX += (targetMouseX - mouseX) * 0.1;
                mouseY += (targetMouseY - mouseY) * 0.1;
            } else {
                mouseX = -9999;
                mouseY = -9999;
            }

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Optional subtle ambient gradient fill
            if (isDark) {
                ctx.fillStyle = '#030712';
                ctx.fillRect(0, 0, width, height);

                // Subtle deep blue/purple ambient glow in center
                const ambient = ctx.createRadialGradient(
                    width * 0.5,
                    height * 0.6,
                    20,
                    width * 0.5,
                    height * 0.5,
                    Math.max(width, height) * 0.7
                );
                ambient.addColorStop(0, 'rgba(30, 58, 138, 0.25)');
                ambient.addColorStop(0.5, 'rgba(88, 28, 135, 0.12)');
                ambient.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
                ctx.fillStyle = ambient;
                ctx.fillRect(0, 0, width, height);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);

                // Subtle delicate ambient glow in light mode
                const ambientLight = ctx.createRadialGradient(
                    width * 0.5,
                    height * 0.5,
                    10,
                    width * 0.5,
                    height * 0.5,
                    Math.max(width, height) * 0.65
                );
                ambientLight.addColorStop(0, 'rgba(238, 242, 255, 0.45)');
                ambientLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = ambientLight;
                ctx.fillRect(0, 0, width, height);
            }

            // Draw and update each vector particle
            ctx.lineCap = 'round';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.age++;

                const { vx, vy } = getVelocity(p.x, p.y, t);
                const speed = Math.sqrt(vx * vx + vy * vy);

                // Move particle
                p.x += vx * p.baseSpeed;
                p.y += vy * p.baseSpeed;

                // Respawn if outside or too old
                if (
                    p.y < -20 ||
                    p.x < -30 ||
                    p.x > width + 30 ||
                    p.y > height + 40 ||
                    p.age > p.maxAge
                ) {
                    particles[i] = createParticle(false);
                    // Spawn mostly from bottom or bottom sides to create the continuous upward liftoff
                    particles[i].y = height + Math.random() * 20;
                    particles[i].x = Math.random() * width;
                    continue;
                }

                // Fade in at start and fade out near end of life or top edge
                let lifeAlpha = 1;
                if (p.age < 25) lifeAlpha = p.age / 25;
                else if (p.age > p.maxAge - 30) lifeAlpha = (p.maxAge - p.age) / 30;

                // Fade near top edge
                if (p.y < 60) {
                    lifeAlpha *= Math.max(0, p.y / 60);
                }

                const currentAlpha = Math.max(0.05, Math.min(0.9, p.alpha * lifeAlpha));

                // Direction angle
                const angle = Math.atan2(vy, vx);

                // Dash length: between 3px and 9px based on speed
                const dashLen = Math.max(3.5, Math.min(10, speed * 2.8 * p.lengthFactor));

                const x1 = p.x - Math.cos(angle) * (dashLen * 0.5);
                const y1 = p.y - Math.sin(angle) * (dashLen * 0.5);
                const x2 = p.x + Math.cos(angle) * (dashLen * 0.5);
                const y2 = p.y + Math.sin(angle) * (dashLen * 0.5);

                // Color based on x position ratio across canvas
                const ratio = Math.max(0, Math.min(1, p.x / (width || 1)));
                const strokeColor = getColor(ratio, isDark, currentAlpha);

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = p.thickness;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove);
                parent.removeEventListener('mouseleave', handleMouseLeave);
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
