import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const LAYER_SIZES = [3, 5, 5, 4, 2];
const LAYER_X_PERCENT = [0.08, 0.28, 0.5, 0.72, 0.92];
const LABELS = ['Input', 'Hidden', 'Hidden', 'Hidden', 'Output'];

export default function NeuralNetworkBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas to fill parent
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    const dark = theme === 'dark';

    // Build layer node positions on the fly inside draw
    const buildLayers = () => {
      const W = canvas.width;
      const H = canvas.height;
      return LAYER_SIZES.map((count, li) =>
        Array.from({ length: count }, (_, i) => ({
          x: LAYER_X_PERCENT[li] * W,
          y: H * (0.5 + (i - (count - 1) / 2) * 0.13),
        }))
      );
    };

    // Pulses
    const pulses = Array.from({ length: 8 }, () => {
      const li = Math.floor(Math.random() * (LAYER_SIZES.length - 1));
      return {
        li,
        fi: Math.floor(Math.random() * LAYER_SIZES[li]),
        ti: Math.floor(Math.random() * LAYER_SIZES[li + 1]),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.007,
      };
    });

    const nodeDot = dark ? '#fbbf24' : '#6366f1';
    const glowRgb = dark ? '251,191,36' : '99,102,241';
    const lineColor = dark ? 'rgba(148,163,184,0.13)' : 'rgba(71,85,105,0.1)';
    const labelColor = dark ? 'rgba(148,163,184,0.45)' : 'rgba(71,85,105,0.4)';

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const layers = buildLayers();

      // --- Connections ---
      ctx.lineWidth = 1;
      ctx.strokeStyle = lineColor;
      for (let li = 0; li < layers.length - 1; li++) {
        layers[li].forEach(a => {
          layers[li + 1].forEach(b => {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          });
        });
      }

      // --- Pulses ---
      pulses.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.li = Math.floor(Math.random() * (LAYER_SIZES.length - 1));
          p.fi = Math.floor(Math.random() * LAYER_SIZES[p.li]);
          p.ti = Math.floor(Math.random() * LAYER_SIZES[p.li + 1]);
        }
        if (!layers[p.li] || !layers[p.li + 1]) return;
        const a = layers[p.li][p.fi];
        const b = layers[p.li + 1][p.ti];
        if (!a || !b) return;
        const px = a.x + (b.x - a.x) * p.progress;
        const py = a.y + (b.y - a.y) * p.progress;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, 10);
        grad.addColorStop(0, `rgba(${glowRgb},1)`);
        grad.addColorStop(1, `rgba(${glowRgb},0)`);
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // --- Nodes ---
      layers.forEach(layer => {
        layer.forEach(({ x, y }) => {
          // outer glow
          const grd = ctx.createRadialGradient(x, y, 0, x, y, 18);
          grd.addColorStop(0, `rgba(${glowRgb},0.35)`);
          grd.addColorStop(1, `rgba(${glowRgb},0)`);
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          // dot
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = nodeDot;
          ctx.fill();
          ctx.strokeStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      });

      // --- Labels ---
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = labelColor;
      LABELS.forEach((label, li) => {
        const x = LAYER_X_PERCENT[li] * W;
        ctx.fillText(label, x, H * 0.9);
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
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
