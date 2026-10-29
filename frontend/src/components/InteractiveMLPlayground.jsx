import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import "./InteractiveMLPlayground.css";

const lessons = [
  { id: "descent", title: "Gradient descent", subtitle: "Animated parameter optimization curve" },
  { id: "backprop", title: "Backpropagation", subtitle: "Animated gradient flow simulation" },
  { id: "network", title: "Neural network", subtitle: "Inputs → weighted neurons → output" },
  { id: "attention", title: "Causal masking", subtitle: "Which tokens can see which?" },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const fmt = (n) => Number.isFinite(n) ? (Math.abs(n) < 0.0001 ? "0.0000" : n.toFixed(4)) : "—";

export default function InteractiveMLPlayground({ embedded = false }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [lessonIndex, setLessonIndex] = useState(0);

  // Playground state for Lesson 02 (Network) and Lesson 03 (Attention)
  const [input1, setInput1] = useState(1.2);
  const [input2, setInput2] = useState(-0.7);
  const [w11, setW11] = useState(0.8);
  const [w12, setW12] = useState(-0.4);
  const [w21, setW21] = useState(-0.3);
  const [w22, setW22] = useState(0.9);
  const [wo1, setWo1] = useState(1.1);
  const [wo2, setWo2] = useState(-0.8);
  const [tokens, setTokens] = useState(["BOS", "The", "weather", "is", "cold"]);
  const [queryIndex, setQueryIndex] = useState(1);

  const current = lessons[lessonIndex];
  const go = (direction) => setLessonIndex((i) => clamp(i + direction, 0, lessons.length - 1));

  const hidden1 = sigmoid(input1 * w11 + input2 * w21);
  const hidden2 = sigmoid(input1 * w12 + input2 * w22);
  const output = sigmoid(hidden1 * wo1 + hidden2 * wo2);

  const ShellTag = embedded ? "div" : "main";

  const renderNetworkContent = () => (
    <div className="mlp-content mlp-content-stack">
      <div className="mlp-controls mlp-controls-wide">
        <div className="mlp-section-label">TUNE INPUTS & WEIGHTS</div>
        <div className="mlp-slider-grid">
          <NumberSlider label="Input x₁" value={input1} min={-2} max={2} step={0.1} onChange={setInput1} />
          <NumberSlider label="Input x₂" value={input2} min={-2} max={2} step={0.1} onChange={setInput2} />
          <NumberSlider label="Weight w₁₁" value={w11} min={-2} max={2} step={0.1} onChange={setW11} />
          <NumberSlider label="Weight w₂₁" value={w21} min={-2} max={2} step={0.1} onChange={setW21} />
          <NumberSlider label="Weight w₁₂" value={w12} min={-2} max={2} step={0.1} onChange={setW12} />
          <NumberSlider label="Weight w₂₂" value={w22} min={-2} max={2} step={0.1} onChange={setW22} />
          <NumberSlider label="Output weight v₁" value={wo1} min={-2} max={2} step={0.1} onChange={setWo1} />
          <NumberSlider label="Output weight v₂" value={wo2} min={-2} max={2} step={0.1} onChange={setWo2} />
        </div>
      </div>
      <div className="mlp-network-wrap">
        <div className="mlp-section-label">WATCH THE FORWARD PASS</div>
        <NetworkDiagram input1={input1} input2={input2} hidden1={hidden1} hidden2={hidden2} output={output} />
        <div className="mlp-formula-grid mlp-network-metrics">
          <div className="mlp-formula-card"><small>HIDDEN NEURON 1</small><code>σ(x₁w₁₁ + x₂w₂₁)</code><strong>{fmt(hidden1)}</strong></div>
          <div className="mlp-formula-card"><small>HIDDEN NEURON 2</small><code>σ(x₁w₁₂ + x₂w₂₂)</code><strong>{fmt(hidden2)}</strong></div>
          <div className="mlp-formula-card mlp-formula-highlight"><small>OUTPUT NEURON</small><code>σ(h₁v₁ + h₂v₂)</code><strong>{fmt(output)}</strong></div>
        </div>
        <p className="mlp-explanation">Each connection multiplies a signal by a weight. A neuron adds its weighted inputs, then applies the sigmoid activation σ, squeezing the result between 0 and 1. Move any slider to see the signal change through the network.</p>
      </div>
    </div>
  );

  const renderAttentionContent = () => (
    <div className="mlp-content mlp-content-stack">
      <div className="mlp-controls mlp-controls-wide">
        <div className="mlp-section-label">CHOOSE THE QUERY TOKEN</div>
        <div className="mlp-token-select">
          {tokens.map((token, i) => (
            <button key={`${token}-${i}`} className={`mlp-token-choice ${queryIndex === i ? "selected" : ""}`} onClick={() => setQueryIndex(i)}>
              <span className="mlp-radio">{queryIndex === i ? "●" : ""}</span>
              {token}
              <small>position {i}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="mlp-network-wrap">
        <div className="mlp-section-label">WHAT CAN “{tokens[queryIndex]}” ATTEND TO?</div>
        <div className="mlp-attention-grid">
          {tokens.map((token, i) => {
            const visible = i <= queryIndex;
            return (
              <div key={`${token}-cell-${i}`} className={`mlp-attention-cell ${visible ? "allowed" : "masked"}`}>
                <strong>{visible ? "✓" : "×"}</strong>
                <span>{token}</span>
                <small>{visible ? "visible" : "masked"}</small>
              </div>
            );
          })}
        </div>
        <div className="mlp-attention-matrix">
          <div className="mlp-matrix-title">Causal mask matrix</div>
          <div className="mlp-matrix">
            {tokens.map((rowToken, r) => (
              <div className="mlp-matrix-row" key={rowToken + r}>
                <span className="mlp-matrix-label">{rowToken}</span>
                {tokens.map((_, c) => (
                  <div key={c} className={`mlp-matrix-cell ${c <= r ? "matrix-open" : "matrix-blocked"} ${r === queryIndex ? "matrix-current-row" : ""}`}>
                    {c <= r ? "0" : "−∞"}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mlp-matrix-legend">
            <span>0 = allowed</span>
            <span>−∞ = masked before softmax</span>
          </div>
        </div>
        <p className="mlp-explanation">A causal mask prevents a token from looking into the future. The selected token can attend to itself and all earlier positions, but not later ones. In attention, masked scores receive −∞; softmax turns those positions into probability 0.</p>
      </div>
    </div>
  );

  return (
    <ShellTag className={`mlp-shell ${embedded ? "embedded" : ""}`}>
      <section className="mlp-panel">
        {/* Desktop View: Tabs + Slider + Arrows + Active Lesson */}
        <div className="mlp-desktop-view">
          <nav className="mlp-lesson-nav" aria-label="Choose lesson">
            {lessons.map((lesson, i) => {
              const isActive = lessonIndex === i;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setLessonIndex(i)}
                  className={`mlp-lesson-tab ${isActive ? "active" : ""} ${
                    isActive
                      ? isDark
                        ? "bg-[#ededf1] hover:bg-white text-[#070708] font-semibold"
                        : "bg-slate-900 hover:bg-black text-white font-semibold"
                      : isDark
                        ? "border border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40 text-gray-300 hover:text-white"
                        : "border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950"
                  }`}
                >
                  {lesson.title}
                </button>
              );
            })}
          </nav>
          <input
            className="mlp-progress-slider"
            type="range" min="0" max={lessons.length - 1} step="1"
            value={lessonIndex} onChange={(e) => setLessonIndex(Number(e.target.value))}
            aria-label="Slide between lessons"
          />

          <div className="mlp-stage-wrapper">
            {/* Previous Lesson Arrow */}
            <button
              className="mlp-side-arrow mlp-side-arrow-left"
              onClick={() => go(-1)}
              disabled={lessonIndex === 0}
              aria-label="Previous lesson"
              title="Previous lesson"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            {/* Next Lesson Arrow */}
            <button
              className="mlp-side-arrow mlp-side-arrow-right"
              onClick={() => go(1)}
              disabled={lessonIndex === lessons.length - 1}
              aria-label="Next lesson"
              title="Next lesson"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            {/* Lesson 01: Gradient Descent */}
            {current.id === "descent" && <GradientDescentVideoAnimation />}

            {/* Lesson 02: Backpropagation */}
            {current.id === "backprop" && <BackpropVideoAnimation />}

            {/* Lesson 03: Neural Network */}
            {current.id === "network" && renderNetworkContent()}

            {/* Lesson 04: Causal Masking */}
            {current.id === "attention" && renderAttentionContent()}
          </div>
        </div>

        {/* Mobile View: Render all lessons in a single column one after another */}
        <div className="mlp-mobile-column-view">
          {/* Lesson 01: Gradient Descent */}
          <div className="mlp-mobile-section">
            <div className="mlp-mobile-section-header">
              <span className="mlp-mobile-badge">01</span>
              <div>
                <h3 className="mlp-mobile-section-title">Gradient descent</h3>
                <p className="mlp-mobile-section-sub">Animated parameter optimization curve</p>
              </div>
            </div>
            <GradientDescentVideoAnimation />
          </div>

          {/* Lesson 02: Backpropagation */}
          <div className="mlp-mobile-section">
            <div className="mlp-mobile-section-header">
              <span className="mlp-mobile-badge">02</span>
              <div>
                <h3 className="mlp-mobile-section-title">Backpropagation</h3>
                <p className="mlp-mobile-section-sub">Animated gradient flow simulation</p>
              </div>
            </div>
            <BackpropVideoAnimation />
          </div>

          {/* Lesson 03: Neural Network */}
          <div className="mlp-mobile-section">
            <div className="mlp-mobile-section-header">
              <span className="mlp-mobile-badge">03</span>
              <div>
                <h3 className="mlp-mobile-section-title">Neural network</h3>
                <p className="mlp-mobile-section-sub">Inputs → weighted neurons → output</p>
              </div>
            </div>
            {renderNetworkContent()}
          </div>

          {/* Lesson 04: Causal Masking */}
          <div className="mlp-mobile-section">
            <div className="mlp-mobile-section-header">
              <span className="mlp-mobile-badge">04</span>
              <div>
                <h3 className="mlp-mobile-section-title">Causal masking</h3>
                <p className="mlp-mobile-section-sub">Which tokens can see which?</p>
              </div>
            </div>
            {renderAttentionContent()}
          </div>
        </div>
      </section>
    </ShellTag>
  );
}

// -------------------------------------------------------------
// Lesson 01: Backpropagation Animated Video Simulation (Manim Scene)
// -------------------------------------------------------------
function BackpropVideoAnimation() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [layoutMode, setLayoutMode] = useState("pipeline"); // "pipeline" (collinear -4, -1.5, 1, 4) or "branched"
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  const duration = 14.8; // 14.8s complete Manim BackpropScene cycle

  useEffect(() => {
    const tick = (now) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setTime((prev) => (prev + dt * speed) % duration);
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed]);

  // Manim easing function (smooth cubic ease in-out)
  const ease = (p) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);
  const getProgress = (start, end) => {
    if (time <= start) return 0;
    if (time >= end) return 1;
    return ease((time - start) / (end - start));
  };

  // Exact step timings matching the Python BackpropScene script:
  // 1. self.play(Write(title), run_time=1) -> 0.0 to 1.0s
  const titleProg = getProgress(0.0, 1.0);

  // 2. self.play(Create(x_node), Create(y_node), Write(x_label), Write(y_label), run_time=1) -> 1.0 to 2.0s
  const inputsProg = getProgress(1.0, 2.0);

  // 3. self.play(Create(multiply_node), Write(mul_label), GrowArrow(forward_xy), GrowArrow(forward_y), run_time=1.5) -> 2.0 to 3.5s
  const mulNodeProg = getProgress(2.0, 3.2);
  const forwardArrowsProg = getProgress(2.0, 3.5);

  // 4. self.play(GrowArrow(forward_z), Create(loss_node), Write(loss_label), Write(z_label), run_time=1.5) -> 3.5 to 5.0s
  const forwardZProg = getProgress(3.5, 4.8);
  const lossNodeProg = getProgress(3.8, 5.0);

  // 5. self.play(Write(forward_text), run_time=1) -> 5.0 to 6.0s
  // 6. self.wait(1) -> 6.0 to 7.0s
  const forwardTextProg = getProgress(5.0, 6.0);

  // 7. self.play(Transform(forward_text, backward_text), run_time=0.7) -> 7.0 to 7.7s
  const transformProg = getProgress(7.0, 7.7);

  // 8. self.play(GrowArrow(back_z), Write(MathTex("\frac{\partial L}{\partial z}").scale(0.7).next_to(back_z, UP)), run_time=1.5) -> 7.7 to 9.2s
  const backZProg = getProgress(7.7, 9.2);

  // 9. self.play(GrowArrow(back_x), GrowArrow(back_y), run_time=1.5) -> 9.2 to 10.7s
  const backInputsProg = getProgress(9.2, 10.7);

  // 10. self.play(Write(formulas), run_time=1.5) -> 10.7 to 12.2s
  // 11. self.wait(2) -> 12.2 to 14.8s
  const formulasProg = getProgress(10.7, 12.2);

  // Geometry computation for collinear pipeline vs branched DAG
  const isPipeline = layoutMode === "pipeline";

  // Coordinates (SVG viewport: 760 x 380)
  // In Manim: x_node is shifted LEFT * 4, y_node LEFT * 1.5, multiply_node RIGHT * 1, loss_node RIGHT * 4
  const coords = isPipeline
    ? {
        x: { x: 130, y: 175, r: 26 },
        y: { x: 280, y: 175, r: 26 },
        mul: { x: 440, y: 175, r: 35 },
        loss: { x: 620, y: 175, r: 26 },
      }
    : {
        x: { x: 140, y: 110, r: 26 },
        y: { x: 140, y: 240, r: 26 },
        mul: { x: 390, y: 175, r: 35 },
        loss: { x: 620, y: 175, r: 26 },
      };

  // Math helper for linear interpolation
  const lerp = (a, b, t) => a + (b - a) * t;

  // Linear GrowArrow evaluator
  const evalLine = (x1, y1, x2, y2, t) => {
    const clamped = Math.max(0, Math.min(1, t));
    const curX = lerp(x1, x2, clamped);
    const curY = lerp(y1, y2, clamped);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    return { curX, curY, angle };
  };

  // Quadratic Bezier GrowArrow evaluator (for arched collinear arrows over y_node)
  const evalBezier = (p0, p1, p2, t) => {
    const clamped = Math.max(0, Math.min(1, t));
    const mt = 1 - clamped;
    const curX = mt * mt * p0.x + 2 * mt * clamped * p1.x + clamped * clamped * p2.x;
    const curY = mt * mt * p0.y + 2 * mt * clamped * p1.y + clamped * clamped * p2.y;
    const dx = 2 * mt * (p1.x - p0.x) + 2 * clamped * (p2.x - p1.x);
    const dy = 2 * mt * (p1.y - p0.y) + 2 * clamped * (p2.y - p1.y);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { curX, curY, angle };
  };

  // 1. Forward Y -> Mul (buff 0.08)
  const f_y_start = { x: coords.y.x + coords.y.r + 4, y: coords.y.y };
  const f_y_end = { x: coords.mul.x - coords.mul.r - 4, y: coords.mul.y };
  const f_y_eval = evalLine(f_y_start.x, f_y_start.y, f_y_end.x, f_y_end.y, forwardArrowsProg);

  // 2. Forward X -> Mul
  // If pipeline: smooth arc curving over y_node
  // If branched: straight diagonal line
  const f_x_start = isPipeline
    ? { x: coords.x.x + coords.x.r + 2, y: coords.x.y - 8 }
    : { x: coords.x.x + coords.x.r + 4, y: coords.x.y + 4 };
  const f_x_ctrl = { x: 280, y: 78 };
  const f_x_end = isPipeline
    ? { x: coords.mul.x - coords.mul.r - 2, y: coords.mul.y - 12 }
    : { x: coords.mul.x - coords.mul.r - 4, y: coords.mul.y - 8 };
  const f_x_eval = isPipeline
    ? evalBezier(f_x_start, f_x_ctrl, f_x_end, forwardArrowsProg)
    : evalLine(f_x_start.x, f_x_start.y, f_x_end.x, f_x_end.y, forwardArrowsProg);

  // 3. Forward Mul -> Loss
  const f_z_start = { x: coords.mul.x + coords.mul.r + 4, y: coords.mul.y };
  const f_z_end = { x: coords.loss.x - coords.loss.r - 4, y: coords.loss.y };
  const f_z_eval = evalLine(f_z_start.x, f_z_start.y, f_z_end.x, f_z_end.y, forwardZProg);

  // 4. Backward Loss -> Mul (back_z)
  const b_z_start = { x: coords.loss.x - coords.loss.r - 4, y: coords.loss.y };
  const b_z_end = { x: coords.mul.x + coords.mul.r + 4, y: coords.mul.y };
  const b_z_eval = evalLine(b_z_start.x, b_z_start.y, b_z_end.x, b_z_end.y, backZProg);

  // 5. Backward Mul -> Y (back_y)
  const b_y_start = { x: coords.mul.x - coords.mul.r - 4, y: coords.mul.y + (isPipeline ? 0 : 8) };
  const b_y_end = { x: coords.y.x + coords.y.r + 4, y: coords.y.y - (isPipeline ? 0 : 4) };
  const b_y_eval = evalLine(b_y_start.x, b_y_start.y, b_y_end.x, b_y_end.y, backInputsProg);

  // 6. Backward Mul -> X (back_x)
  const b_x_start = isPipeline
    ? { x: coords.mul.x - coords.mul.r - 2, y: coords.mul.y - 12 }
    : { x: coords.mul.x - coords.mul.r - 4, y: coords.mul.y - 8 };
  const b_x_ctrl = { x: 280, y: 78 };
  const b_x_end = isPipeline
    ? { x: coords.x.x + coords.x.r + 2, y: coords.x.y - 8 }
    : { x: coords.x.x + coords.x.r + 4, y: coords.x.y + 4 };
  const b_x_eval = isPipeline
    ? evalBezier(b_x_start, b_x_ctrl, b_x_end, backInputsProg)
    : evalLine(b_x_start.x, b_x_start.y, b_x_end.x, b_x_end.y, backInputsProg);

  // Active Python Manim code line for the inspector
  const activeCodeLine =
    time < 1.0
      ? 28 // self.play(Write(title))
      : time < 2.0
      ? 30 // self.play(Create(x_node), Create(y_node)...)
      : time < 3.5
      ? 35 // self.play(Create(multiply_node)...)
      : time < 5.0
      ? 40 // self.play(GrowArrow(forward_z)...)
      : time < 6.0
      ? 46 // self.play(Write(forward_text))
      : time < 7.0
      ? 47 // self.wait(1)
      : time < 7.7
      ? 54 // self.play(Transform(forward_text, backward_text))
      : time < 9.2
      ? 64 // self.play(GrowArrow(back_z), Write(dL/dz))
      : time < 10.7
      ? 71 // self.play(GrowArrow(back_x), GrowArrow(back_y))
      : 86; // self.play(Write(formulas))

  return (
    <div className="mlp-video-card" style={{ background: "#101116", borderColor: "rgba(255, 255, 255, 0.12)" }}>
      {/* Top Status & View Selector Bar */}
      <div className="mlp-video-topbar" style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="mlp-video-pill" style={{ background: "rgba(88, 196, 221, 0.15)", color: "#58c4dd", borderColor: "rgba(88, 196, 221, 0.35)" }}>
          <span className="mlp-rec-dot" style={{ background: "#58c4dd", boxShadow: "0 0 8px #58c4dd" }} />
          <span>BACKPROPAGATION · COMPUTATION GRAPH</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Layout switcher */}
          <div style={{ display: "inline-flex", background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px", padding: "2px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <button
              onClick={() => setLayoutMode("pipeline")}
              style={{
                border: 0,
                background: isPipeline ? "#58c4dd" : "transparent",
                color: isPipeline ? "#090c10" : "#94a3b8",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Collinear Manim coordinates (x=-4, y=-1.5, ×=1, L=4)"
            >
              Collinear
            </button>
            <button
              onClick={() => setLayoutMode("branched")}
              style={{
                border: 0,
                background: !isPipeline ? "#58c4dd" : "transparent",
                color: !isPipeline ? "#090c10" : "#94a3b8",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Branched Tree DAG view"
            >
              Tree DAG
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Separate Line for Live State Updates */}
      <div
        style={{
          height: "26px",
          minHeight: "26px",
          maxHeight: "26px",
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0, 0, 0, 0.4)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          fontSize: "11px",
          fontWeight: "600",
          overflow: "hidden",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
        }}
      >
        <span style={{ color: time >= 7.0 ? "#fc6255" : "#58c4dd", overflow: "hidden", textOverflow: "ellipsis" }}>
          {time < 5.0 ? "Forward graph construction" : time < 7.0 ? "Forward pass complete (z=6)" : time < 10.7 ? "Backpropagating upstream gradients" : "Chain rule gradients applied"}
        </span>
        <span style={{ color: "#64748b", fontSize: "10px", fontFamily: "ui-monospace, monospace" }}>
          {time >= 7.0 ? "BACKWARD" : "FORWARD"}
        </span>
      </div>

      {/* Main Manim 16:9 Canvas Viewport (#101116) */}
      <div className="mlp-video-canvas-wrap" style={{ background: "#101116", padding: "14px 10px 4px" }}>
        <svg viewBox="0 0 760 380" style={{ width: "100%", maxWidth: "720px", height: "auto", overflow: "visible" }}>
          {/* Manim Glow Filter */}
          <defs>
            <filter id="manimGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Title: Text("Backpropagation", font_size=36, color=WHITE).to_edge(UP) */}
          <text
            x="380"
            y="38"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="24"
            fontFamily="'Inter', -apple-system, sans-serif"
            fontWeight="700"
            letterSpacing="-0.01em"
            opacity={titleProg}
          >
            Backpropagation
          </text>

          {/* 2. FORWARD ARROWS (Manim BLUE: #58C4DD) */}
          {/* Arrow: forward_y (y_node -> multiply_node) */}
          {forwardArrowsProg > 0.02 && (
            <g opacity={Math.min(1, forwardArrowsProg * 1.5)}>
              <line
                x1={f_y_start.x}
                y1={f_y_start.y}
                x2={f_y_eval.curX}
                y2={f_y_eval.curY}
                stroke="#58c4dd"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <polygon
                points="-7,-4 0,0 -7,4"
                fill="#58c4dd"
                transform={`translate(${f_y_eval.curX}, ${f_y_eval.curY}) rotate(${f_y_eval.angle})`}
              />
            </g>
          )}

          {/* Arrow: forward_xy (x_node -> multiply_node) */}
          {forwardArrowsProg > 0.02 && (
            <g opacity={Math.min(1, forwardArrowsProg * 1.5)}>
              {isPipeline ? (
                <>
                  <path
                    d={`M ${f_x_start.x} ${f_x_start.y} Q ${f_x_ctrl.x} ${f_x_ctrl.y} ${f_x_end.x} ${f_x_end.y}`}
                    fill="none"
                    stroke="#58c4dd"
                    strokeWidth="2.8"
                    strokeDasharray="300"
                    strokeDashoffset={300 * (1 - forwardArrowsProg)}
                    strokeLinecap="round"
                  />
                  <polygon
                    points="-7,-4 0,0 -7,4"
                    fill="#58c4dd"
                    transform={`translate(${f_x_eval.curX}, ${f_x_eval.curY}) rotate(${f_x_eval.angle})`}
                  />
                </>
              ) : (
                <>
                  <line
                    x1={f_x_start.x}
                    y1={f_x_start.y}
                    x2={f_x_eval.curX}
                    y2={f_x_eval.curY}
                    stroke="#58c4dd"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="-7,-4 0,0 -7,4"
                    fill="#58c4dd"
                    transform={`translate(${f_x_eval.curX}, ${f_x_eval.curY}) rotate(${f_x_eval.angle})`}
                  />
                </>
              )}
            </g>
          )}

          {/* Arrow: forward_z (multiply_node -> loss_node) */}
          {forwardZProg > 0.02 && (
            <g opacity={Math.min(1, forwardZProg * 1.5)}>
              <line
                x1={f_z_start.x}
                y1={f_z_start.y}
                x2={f_z_eval.curX}
                y2={f_z_eval.curY}
                stroke="#58c4dd"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <polygon
                points="-7,-4 0,0 -7,4"
                fill="#58c4dd"
                transform={`translate(${f_z_eval.curX}, ${f_z_eval.curY}) rotate(${f_z_eval.angle})`}
              />
            </g>
          )}

          {/* 3. BACKWARD ARROWS (Manim RED: #FC6255) */}
          {/* Arrow: back_z (loss_node -> multiply_node) */}
          {backZProg > 0.02 && (
            <g opacity={Math.min(1, backZProg * 1.5)}>
              <line
                x1={b_z_start.x}
                y1={b_z_start.y}
                x2={b_z_eval.curX}
                y2={b_z_eval.curY}
                stroke="#fc6255"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <polygon
                points="-7,-4 0,0 -7,4"
                fill="#fc6255"
                transform={`translate(${b_z_eval.curX}, ${b_z_eval.curY}) rotate(${b_z_eval.angle})`}
              />

              {/* MathTex: \frac{\partial L}{\partial z} next_to(back_z, UP) */}
              <g opacity={backZProg} transform={`translate(${(b_z_start.x + b_z_end.x) / 2}, ${b_z_start.y - 20})`}>
                <text textAnchor="middle" y="-5" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">
                  ∂L
                </text>
                <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#fc6255" strokeWidth="1.2" />
                <text textAnchor="middle" y="11" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">
                  ∂z
                </text>
              </g>
            </g>
          )}

          {/* Arrow: back_y (multiply_node -> y_node) */}
          {backInputsProg > 0.02 && (
            <g opacity={Math.min(1, backInputsProg * 1.5)}>
              <line
                x1={b_y_start.x}
                y1={b_y_start.y}
                x2={b_y_eval.curX}
                y2={b_y_eval.curY}
                stroke="#fc6255"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <polygon
                points="-7,-4 0,0 -7,4"
                fill="#fc6255"
                transform={`translate(${b_y_eval.curX}, ${b_y_eval.curY}) rotate(${b_y_eval.angle})`}
              />
            </g>
          )}

          {/* Arrow: back_x (multiply_node -> x_node) */}
          {backInputsProg > 0.02 && (
            <g opacity={Math.min(1, backInputsProg * 1.5)}>
              {isPipeline ? (
                <>
                  <path
                    d={`M ${b_x_start.x} ${b_x_start.y} Q ${b_x_ctrl.x} ${b_x_ctrl.y} ${b_x_end.x} ${b_x_end.y}`}
                    fill="none"
                    stroke="#fc6255"
                    strokeWidth="2.8"
                    strokeDasharray="300"
                    strokeDashoffset={300 * (1 - backInputsProg)}
                    strokeLinecap="round"
                  />
                  <polygon
                    points="-7,-4 0,0 -7,4"
                    fill="#fc6255"
                    transform={`translate(${b_x_eval.curX}, ${b_x_eval.curY}) rotate(${b_x_eval.angle})`}
                  />
                </>
              ) : (
                <>
                  <line
                    x1={b_x_start.x}
                    y1={b_x_start.y}
                    x2={b_x_eval.curX}
                    y2={b_x_eval.curY}
                    stroke="#fc6255"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="-7,-4 0,0 -7,4"
                    fill="#fc6255"
                    transform={`translate(${b_x_eval.curX}, ${b_x_eval.curY}) rotate(${b_x_eval.angle})`}
                  />
                </>
              )}
            </g>
          )}

          {/* 4. NODE: x_node Circle(radius=0.42, color=BLUE) + MathTex("x=2") */}
          {inputsProg > 0.01 && (
            <g transform={`translate(${coords.x.x}, ${coords.x.y})`}>
              <circle
                r={coords.x.r}
                fill="#101116"
                stroke="#58c4dd"
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * coords.x.r}
                strokeDashoffset={2 * Math.PI * coords.x.r * (1 - inputsProg)}
              />
              <text
                textAnchor="middle"
                y="5"
                fill="#ffffff"
                fontSize="15"
                fontFamily="'Cambria Math', Georgia, serif"
                fontStyle="italic"
                fontWeight="500"
                opacity={inputsProg}
              >
                x=2
              </text>
            </g>
          )}

          {/* 5. NODE: y_node Circle(radius=0.42, color=BLUE) + MathTex("y=3") */}
          {inputsProg > 0.01 && (
            <g transform={`translate(${coords.y.x}, ${coords.y.y})`}>
              <circle
                r={coords.y.r}
                fill="#101116"
                stroke="#58c4dd"
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * coords.y.r}
                strokeDashoffset={2 * Math.PI * coords.y.r * (1 - inputsProg)}
              />
              <text
                textAnchor="middle"
                y="5"
                fill="#ffffff"
                fontSize="15"
                fontFamily="'Cambria Math', Georgia, serif"
                fontStyle="italic"
                fontWeight="500"
                opacity={inputsProg}
              >
                y=3
              </text>
            </g>
          )}

          {/* 6. NODE: multiply_node Circle(radius=0.55, color=YELLOW) + MathTex("\times") + z_label */}
          {mulNodeProg > 0.01 && (
            <g transform={`translate(${coords.mul.x}, ${coords.mul.y})`}>
              <circle
                r={coords.mul.r}
                fill="#101116"
                stroke="#f9d71c"
                strokeWidth="2.6"
                strokeDasharray={2 * Math.PI * coords.mul.r}
                strokeDashoffset={2 * Math.PI * coords.mul.r * (1 - mulNodeProg)}
              />
              <text
                textAnchor="middle"
                y="8"
                fill="#ffffff"
                fontSize="28"
                fontFamily="system-ui, sans-serif"
                fontWeight="400"
                opacity={mulNodeProg}
              >
                ×
              </text>
              {/* MathTex: z=xy=6 next_to(multiply_node, DOWN) */}
              <text
                textAnchor="middle"
                y="55"
                fill="#ffffff"
                fontSize="15"
                fontFamily="'Cambria Math', Georgia, serif"
                fontStyle="italic"
                fontWeight="500"
                opacity={lossNodeProg}
              >
                z = xy = 6
              </text>
            </g>
          )}

          {/* 7. NODE: loss_node Circle(radius=0.42, color=GREEN) + MathTex("L") */}
          {lossNodeProg > 0.01 && (
            <g transform={`translate(${coords.loss.x}, ${coords.loss.y})`}>
              <circle
                r={coords.loss.r}
                fill="#101116"
                stroke="#83c167"
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * coords.loss.r}
                strokeDashoffset={2 * Math.PI * coords.loss.r * (1 - lossNodeProg)}
              />
              <text
                textAnchor="middle"
                y="6"
                fill="#ffffff"
                fontSize="17"
                fontFamily="'Cambria Math', Georgia, serif"
                fontStyle="italic"
                fontWeight="600"
                opacity={lossNodeProg}
              >
                L
              </text>
            </g>
          )}

          {/* 8. Bottom Banners: FORWARD PASS / BACKWARD PASS text */}
          {forwardTextProg > 0.01 && time < 7.7 && (
            <text
              x="380"
              y="320"
              textAnchor="middle"
              fill="#58c4dd"
              fontSize="16"
              fontFamily="'Inter', -apple-system, sans-serif"
              fontWeight="700"
              letterSpacing="0.04em"
              opacity={forwardTextProg * (1 - transformProg)}
            >
              FORWARD PASS: compute values
            </text>
          )}

          {transformProg > 0.01 && time < 10.7 && (
            <text
              x="380"
              y="320"
              textAnchor="middle"
              fill="#fc6255"
              fontSize="16"
              fontFamily="'Inter', -apple-system, sans-serif"
              fontWeight="700"
              letterSpacing="0.04em"
              opacity={transformProg}
            >
              BACKWARD PASS: compute gradients
            </text>
          )}

          {/* 9. Final Formulas (VGroup arranged DOWN, buff=0.25, scaled 0.8, to_edge(DOWN, buff=0.85)) */}
          {formulasProg > 0.01 && (
            <g opacity={formulasProg} transform="translate(380, 298)">
              {/* Formula 1: \frac{\partial L}{\partial x} = \frac{\partial L}{\partial z} \, y */}
              <g transform="translate(0, 0)">
                <g transform="translate(-52, 0)">
                  <text textAnchor="middle" y="-5" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂L</text>
                  <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#fc6255" strokeWidth="1.2" />
                  <text textAnchor="middle" y="11" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂x</text>
                </g>
                <text x="-24" y="3" fill="#ffffff" fontSize="15" fontWeight="400">=</text>
                <g transform="translate(2, 0)">
                  <text textAnchor="middle" y="-5" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂L</text>
                  <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#fc6255" strokeWidth="1.2" />
                  <text textAnchor="middle" y="11" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂z</text>
                </g>
                <text x="22" y="3" fill="#ffffff" fontSize="15" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic">y</text>
                <text x="40" y="3" fill="#94a3b8" fontSize="13">= 1 · 3 = 3</text>
              </g>

              {/* Formula 2: \frac{\partial L}{\partial y} = \frac{\partial L}{\partial z} \, x */}
              <g transform="translate(0, 32)">
                <g transform="translate(-52, 0)">
                  <text textAnchor="middle" y="-5" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂L</text>
                  <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#fc6255" strokeWidth="1.2" />
                  <text textAnchor="middle" y="11" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂y</text>
                </g>
                <text x="-24" y="3" fill="#ffffff" fontSize="15" fontWeight="400">=</text>
                <g transform="translate(2, 0)">
                  <text textAnchor="middle" y="-5" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂L</text>
                  <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#fc6255" strokeWidth="1.2" />
                  <text textAnchor="middle" y="11" fill="#fc6255" fontSize="13" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic" fontWeight="600">∂z</text>
                </g>
                <text x="22" y="3" fill="#ffffff" fontSize="15" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic">x</text>
                <text x="40" y="3" fill="#94a3b8" fontSize="13">= 1 · 2 = 2</text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Video Control Bar */}
      <div className="mlp-video-controls-bar" style={{ background: "#0d1117" }}>
        <button
          className="mlp-btn-play"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          title={isPlaying ? "Pause" : "Play"}
          style={{ background: time >= 7.0 ? "#fc6255" : "#58c4dd", color: "#090c10" }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button
          className="mlp-btn-restart"
          onClick={() => { setTime(0); setIsPlaying(true); }}
          title="Restart animation"
          aria-label="Restart animation"
        >
          ↺
        </button>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.05"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          className="mlp-video-scrubber"
          aria-label="Video scrubber"
          style={{ accentColor: time >= 7.0 ? "#fc6255" : "#58c4dd" }}
        />
        <span className="mlp-video-timestamp">
          {`00:${Math.floor(time).toString().padStart(2, "0")} / 00:15`}
        </span>
        <button
          className="mlp-video-speed"
          onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}
          title="Playback speed"
        >
          {speed}x
        </button>
      </div>

      {/* Fast Jump Stage Pills */}
      <div className="mlp-video-info-strip" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setTime(0.0)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--mlp-border)",
              background: time < 2.0 ? "rgba(88, 196, 221, 0.25)" : "transparent",
              color: time < 2.0 ? "#58c4dd" : "var(--mlp-muted)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            1. Nodes Setup
          </button>
          <button
            onClick={() => setTime(2.0)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--mlp-border)",
              background: time >= 2.0 && time < 5.0 ? "rgba(88, 196, 221, 0.25)" : "transparent",
              color: time >= 2.0 && time < 5.0 ? "#58c4dd" : "var(--mlp-muted)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            2. Forward Pass
          </button>
          <button
            onClick={() => setTime(5.0)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--mlp-border)",
              background: time >= 5.0 && time < 7.0 ? "rgba(88, 196, 221, 0.25)" : "transparent",
              color: time >= 5.0 && time < 7.0 ? "#58c4dd" : "var(--mlp-muted)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            3. Compute Values
          </button>
          <button
            onClick={() => setTime(7.0)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--mlp-border)",
              background: time >= 7.0 && time < 10.7 ? "rgba(252, 98, 85, 0.25)" : "transparent",
              color: time >= 7.0 && time < 10.7 ? "#fc6255" : "var(--mlp-muted)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            4. Backward Pass
          </button>
          <button
            onClick={() => setTime(10.7)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--mlp-border)",
              background: time >= 10.7 ? "rgba(252, 98, 85, 0.25)" : "transparent",
              color: time >= 10.7 ? "#fc6255" : "var(--mlp-muted)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            5. Formulas
          </button>
        </div>

        <span style={{ fontSize: "11px", color: "#64748b" }}>
          Camera bg: <code>#101116</code> · Vector Graph Engine
        </span>
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// Lesson 04: Gradient Descent Animated Video Simulation (2D & 3D Manim)
// -------------------------------------------------------------
function GradientDescentVideoAnimation() {
  const [dimMode, setDimMode] = useState("2d"); // "2d" or "3d"
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const canvasRef = useRef(null);

  // 3D Interactive camera drag state
  const [userCamera, setUserCamera] = useState(null); // { theta, phi } or null
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, theta: 0, phi: 0 });

  const duration = dimMode === "3d" ? 15.0 : 10.0;

  useEffect(() => {
    const tick = (now) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setTime((prev) => (prev + dt * speed) % duration);
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed, duration]);

  // Smooth easing helper
  const easeInOut = (p) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);

  // -----------------------------------------------------------
  // 3D MANIM GRADIENT DESCENT LOGIC & MATHEMATICS
  // L(θ₁, θ₂) = 0.22 * (θ₁² + θ₂²)
  // Position tracker: starts at t = 2.3
  // θ₁ = 0.8 * t, θ₂ = 0.65 * t
  // Learning rate η = 0.8, factor = 1 - 0.44 * 0.8 = 0.648
  // 9 update steps between 5.5s and 11.35s (0.65s per step)
  // -----------------------------------------------------------
  const factor = 1 - 0.44 * 0.8; // 0.648

  // Compute position parameter t(time)
  const getPositionT = (t) => {
    if (t < 3.5) return 2.3;
    if (t >= 11.35) return 2.3 * Math.pow(factor, 9);

    const stepFloat = (t - 3.5) / 0.87;
    const currentStep = Math.min(8, Math.floor(stepFloat));
    const stepFrac = stepFloat - currentStep;
    const smoothFrac = easeInOut(Math.max(0, Math.min(1, stepFrac)));

    const startVal = 2.3 * Math.pow(factor, currentStep);
    const endVal = 2.3 * Math.pow(factor, currentStep + 1);
    return startVal + (endVal - startVal) * smoothFrac;
  };

  const posT = getPositionT(time);
  const theta1 = 0.8 * posT;
  const theta2 = 0.65 * posT;
  const loss3D = 0.22 * (theta1 * theta1 + theta2 * theta2);
  const gradNorm = 0.44 * Math.sqrt(theta1 * theta1 + theta2 * theta2);

  const stepCount =
    time < 3.5
      ? 0
      : time >= 11.35
      ? 9
      : Math.min(9, Math.floor((time - 3.5) / 0.87) + 1);

  // Animated camera theta: -45 deg to -30 deg at the end
  let baseCameraTheta = (-45 * Math.PI) / 180;
  if (time >= 12.35 && time <= 13.85) {
    const rotProg = (time - 12.35) / 1.5;
    const smoothRot = easeInOut(Math.max(0, Math.min(1, rotProg)));
    baseCameraTheta = ((-45 + 15 * smoothRot) * Math.PI) / 180;
  } else if (time > 13.85) {
    baseCameraTheta = (-30 * Math.PI) / 180;
  }

  const cameraTheta = userCamera ? userCamera.theta : baseCameraTheta;
  const cameraPhi = userCamera ? userCamera.phi : (58 * Math.PI) / 180;

  // 3D Canvas Render Effect
  useEffect(() => {
    if (dimMode !== "3d") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 680;
    const height = 370;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Canvas Background (#101116)
    ctx.fillStyle = "#101116";
    ctx.fillRect(0, 0, width, height);

    // 3D Projection Engine (Manim ThreeDScene spherical camera coordinate conventions)
    const project = (x, y, z) => {
      const cosT = Math.cos(cameraTheta);
      const sinT = Math.sin(cameraTheta);
      const cosP = Math.cos(cameraPhi);
      const sinP = Math.sin(cameraPhi);

      // Camera coordinates with elevation phi and azimuth theta looking at origin
      const xCam = -x * sinT + y * cosT;
      const yCam = (-x * cosT - y * sinT) * cosP + z * sinP;
      const zCam = (x * cosT + y * sinT) * sinP + z * cosP;

      const zoom = 1.72;
      const scale = (height / 7.2) * zoom;
      const screenX = width / 2 + xCam * scale;
      const screenY = height / 2 - yCam * scale + 52;
      return { x: screenX, y: screenY, depth: zCam };
    };

    // 1. Surface Fade-In (0.5s to 2.0s)
    const surfaceAlpha = Math.min(1, Math.max(0, (time - 0.5) / 1.5));

    if (surfaceAlpha > 0.01) {
      // 3D Paraboloid surface mesh: L(u, v) = 0.22 * (u² + v²)
      // Radial color gradient matching user screenshot: deep purple center -> teal rim
      const N = 26;
      const minU = -2.5, maxU = 2.5;
      const minV = -2.5, maxV = 2.5;
      const du = (maxU - minU) / N;
      const dv = (maxV - minV) / N;

      const quads = [];
      for (let i = 0; i < N; i++) {
        const u0 = minU + i * du;
        const u1 = u0 + du;
        for (let j = 0; j < N; j++) {
          const v0 = minV + j * dv;
          const v1 = v0 + dv;

          const z00 = 0.22 * (u0 * u0 + v0 * v0);
          const z10 = 0.22 * (u1 * u1 + v0 * v0);
          const z11 = 0.22 * (u1 * u1 + v1 * v1);
          const z01 = 0.22 * (u0 * u0 + v1 * v1);

          const p00 = project(u0, v0, z00);
          const p10 = project(u1, v0, z10);
          const p11 = project(u1, v1, z11);
          const p01 = project(u0, v1, z01);

          const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) / 4;
          const midU = (u0 + u1) / 2;
          const midV = (v0 + v1) / 2;
          const rNorm = Math.min(1, Math.sqrt(midU * midU + midV * midV) / 3.535);

          // Radial gradient interpolation (deep purple at bottom of bowl -> indigo -> teal at rim)
          let rR, rG, rB;
          if (rNorm < 0.45) {
            const frac = rNorm / 0.45;
            rR = Math.round(34 * (1 - frac) + 14 * frac);
            rG = Math.round(10 * (1 - frac) + 30 * frac);
            rB = Math.round(58 * (1 - frac) + 70 * frac);
          } else {
            const frac = (rNorm - 0.45) / 0.55;
            rR = Math.round(14 * (1 - frac) + 12 * frac);
            rG = Math.round(30 * (1 - frac) + 88 * frac);
            rB = Math.round(70 * (1 - frac) + 112 * frac);
          }

          quads.push({
            pts: [p00, p10, p11, p01],
            depth: avgDepth,
            fillColor: `rgba(${rR}, ${rG}, ${rB}, 0.94)`,
          });
        }
      }

      // Painter's algorithm: smallest depth (farthest from camera) drawn first
      quads.sort((a, b) => a.depth - b.depth);

      ctx.save();
      ctx.globalAlpha = surfaceAlpha;
      for (const q of quads) {
        ctx.beginPath();
        ctx.moveTo(q.pts[0].x, q.pts[0].y);
        ctx.lineTo(q.pts[1].x, q.pts[1].y);
        ctx.lineTo(q.pts[2].x, q.pts[2].y);
        ctx.lineTo(q.pts[3].x, q.pts[3].y);
        ctx.closePath();

        ctx.fillStyle = q.fillColor;
        ctx.fill();

        // Fine cyan/teal grid lines matching screenshot
        ctx.strokeStyle = "rgba(45, 212, 191, 0.35)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Arrow Drawing Helper with wide triangular arrowhead matching Manim
    const draw3DArrow = (p1, p2, color, lineWidth = 3.6, headSize = 9) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len < 2) return;

      const angle = Math.atan2(dy, dx);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(
        p2.x - headSize * Math.cos(angle - Math.PI / 6.5),
        p2.y - headSize * Math.sin(angle - Math.PI / 6.5)
      );
      ctx.lineTo(
        p2.x - headSize * Math.cos(angle + Math.PI / 6.5),
        p2.y - headSize * Math.sin(angle + Math.PI / 6.5)
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // 2. 3D Coordinate Axes (matching screenshot theta1 axis extending left)
    const axesAlpha = Math.min(1, Math.max(0, (time - 0.5) / 1.2));
    if (axesAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = axesAlpha * 0.75;

      // X axis (θ₁) extending to the left with arrow and label matching screenshot
      const xStart = project(2.2, 0, 0);
      const xEnd = project(-2.8, 0, 0);
      draw3DArrow(xStart, xEnd, "#94a3b8", 1.6, 7);

      // Y axis (θ₂)
      const yStart = project(0, 2.2, 0);
      const yEnd = project(0, -2.8, 0);
      draw3DArrow(yStart, yEnd, "#64748b", 1.4, 6);

      // Z axis (L)
      const z0 = project(0, 0, 0);
      const z1 = project(0, 0, 2.8);
      draw3DArrow(z0, z1, "rgba(148, 163, 184, 0.45)", 1.2, 6);

      // Axis Labels
      ctx.font = "italic 15px 'Cambria Math', Georgia, serif";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("θ₁", xEnd.x - 14, xEnd.y - 2);
      ctx.fillText("θ₂", yEnd.x + 14, yEnd.y + 6);
      ctx.fillText("L", z1.x, z1.y - 12);
      ctx.restore();
    }

    // 3. Global Minimum Marker at (0, 0, 0)
    const minAlpha = Math.min(1, Math.max(0, (time - 1.2) / 1.0));
    if (minAlpha > 0.01) {
      const minPt = project(0, 0, 0);
      ctx.save();
      ctx.globalAlpha = minAlpha;

      ctx.beginPath();
      ctx.arc(minPt.x, minPt.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = "#83c167";
      ctx.shadowColor = "#83c167";
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.fillStyle = "#83c167";
      ctx.textAlign = "center";
      ctx.shadowBlur = 0;
      ctx.fillText("Minimum (0,0)", minPt.x, minPt.y + 16);
      ctx.restore();
    }

    // 4. Descending Ball & the Two Parameter Component Arrows (matching attached image)
    if (time >= 1.5) {
      // Current point on 3D surface
      const curX = theta1;
      const curY = theta2;
      const curZ = loss3D;
      const curPt = project(curX, curY, curZ);

      // Previous step position for magenta trajectory arrow
      const prevStepIdx = time < 3.5 ? 0 : Math.max(0, stepCount - 1);
      const prevT = time < 3.5 ? 2.3 : 2.3 * Math.pow(factor, prevStepIdx);
      const prevX = 0.8 * prevT;
      const prevY = 0.65 * prevT;
      const prevZ = 0.22 * (prevX * prevX + prevY * prevY);
      const prevPt = project(prevX, prevY, prevZ);

      // Persistent yellow trajectory trail
      ctx.save();
      ctx.strokeStyle = "rgba(249, 215, 28, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      const trailPoints = 60;
      const startT = 2.3;
      const endT = posT;
      let started = false;
      for (let s = 0; s <= trailPoints; s++) {
        const frac = s / trailPoints;
        const cT = startT + (endT - startT) * frac;
        const tx = 0.8 * cT;
        const ty = 0.65 * cT;
        const tz = 0.22 * (tx * tx + ty * ty);
        const pt = project(tx, ty, tz);
        if (!started) {
          ctx.moveTo(pt.x, pt.y);
          started = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Bold Magenta Descent Arrow from Previous Position to Current (matches screenshot)
      const distFromPrev = Math.hypot(curPt.x - prevPt.x, curPt.y - prevPt.y);
      if (distFromPrev > 6) {
        // Magenta starting sphere at tail
        ctx.save();
        ctx.beginPath();
        ctx.arc(prevPt.x, prevPt.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ff2ea6";
        ctx.shadowColor = "#ff2ea6";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Bold Magenta arrow connecting down to current point
        draw3DArrow(prevPt, curPt, "#ff2ea6", 4.2, 9.5);
      }

      // CURRENT MAGENTA BALL
      ctx.save();
      // Outer halo
      ctx.beginPath();
      ctx.arc(curPt.x, curPt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 46, 166, 0.25)";
      ctx.fill();

      // Core sphere
      ctx.beginPath();
      ctx.arc(curPt.x, curPt.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#ff2ea6";
      ctx.shadowColor = "#ff2ea6";
      ctx.shadowBlur = 12;
      ctx.fill();

      // Specular shine
      ctx.beginPath();
      ctx.arc(curPt.x - 2, curPt.y - 2, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();

      // TWO PARAMETER COMPONENT ARROWS (shown whenever descending down into the minimum)
      if (time < 12.0 && posT > 0.04) {
        // Step vector scale for clear visibility matching screenshot
        const arrowScale = 2.6;
        const dTheta1 = -0.44 * curX * 0.8 * arrowScale;
        const dTheta2 = -0.44 * curY * 0.8 * arrowScale;

        // 1. Parameter 1 Component (Yellow Arrow along θ₁)
        const p1_3D = {
          x: curX + dTheta1,
          y: curY,
          z: 0.22 * ((curX + dTheta1) ** 2 + curY ** 2),
        };
        const p1_screen = project(p1_3D.x, p1_3D.y, p1_3D.z);
        draw3DArrow(curPt, p1_screen, "#facc15", 3.8, 9);

        // 2. Parameter 2 Component (Cyan Arrow along θ₂)
        const p2_3D = {
          x: curX,
          y: curY + dTheta2,
          z: 0.22 * (curX ** 2 + (curY + dTheta2) ** 2),
        };
        const p2_screen = project(p2_3D.x, p2_3D.y, p2_3D.z);
        draw3DArrow(curPt, p2_screen, "#00e5ff", 3.8, 9);

        // 3. Combined Resultant Vector (Magenta Arrow)
        const pBoth_3D = {
          x: curX + dTheta1,
          y: curY + dTheta2,
          z: 0.22 * ((curX + dTheta1) ** 2 + (curY + dTheta2) ** 2),
        };
        const pBoth_screen = project(pBoth_3D.x, pBoth_3D.y, pBoth_3D.z);
        draw3DArrow(curPt, pBoth_screen, "#ff2ea6", 4.2, 10);

        // Text badges next to arrowheads
        ctx.save();
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.shadowBlur = 0;

        // Yellow θ₁ tag
        ctx.fillStyle = "#facc15";
        ctx.fillText("θ₁", p1_screen.x - 14, p1_screen.y - 6);

        // Cyan θ₂ tag
        ctx.fillStyle = "#00e5ff";
        ctx.fillText("θ₂", p2_screen.x + 8, p2_screen.y + 12);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [dimMode, time, cameraTheta, cameraPhi, posT, theta1, theta2, loss3D, stepCount]);

  // Pointer drag event handlers for 3D Orbiting
  const handlePointerDown = (e) => {
    if (dimMode !== "3d") return;
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      theta: cameraTheta,
      phi: cameraPhi,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || dimMode !== "3d") return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newTheta = dragStartRef.current.theta + dx * 0.007;
    const newPhi = Math.max(0.18, Math.min(Math.PI / 2 - 0.05, dragStartRef.current.phi + dy * 0.007));
    setUserCamera({ theta: newTheta, phi: newPhi });
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // -----------------------------------------------------------
  // 2D GRADIENT DESCENT LOGIC (Single parameter down parabola)
  // L(θ) = (θ - 2.65)²
  // -----------------------------------------------------------
  const progress2D = (time % 10.0) / 10.0;
  const initialTheta2D = 0.45;
  const targetTheta2D = 2.65;
  const eta2D = 0.15; // Learning rate η
  const currentTheta2D = targetTheta2D + (initialTheta2D - targetTheta2D) * Math.exp(-progress2D * 3.4);
  const loss2D = (currentTheta2D - targetTheta2D) ** 2;
  const derivative2D = 2 * (currentTheta2D - targetTheta2D);
  const stepSize2D = eta2D * Math.abs(derivative2D);

  const axisLeft2D = 65;
  const axisRight2D = 455;
  const axisY2D = 222;
  const topY2D = 85;
  const maxLoss2D = 6.8;
  const thetaMin2D = -0.2;
  const thetaMax2D = 3.8;

  const mapX2D = (t) => axisLeft2D + ((t - thetaMin2D) / (thetaMax2D - thetaMin2D)) * (axisRight2D - axisLeft2D);
  const mapY2D = (l) => axisY2D - (Math.min(maxLoss2D, l) / maxLoss2D) * (axisY2D - topY2D);
  const ballX2D = mapX2D(currentTheta2D);
  const ballY2D = mapY2D(loss2D);
  const targetX2D = mapX2D(targetTheta2D);
  const targetY2D = axisY2D;

  const scaleX2D = (axisRight2D - axisLeft2D) / (thetaMax2D - thetaMin2D);
  const scaleY2D = (axisY2D - topY2D) / maxLoss2D;
  const scaleFactor2D = scaleY2D / scaleX2D;

  // Tangent line unit vector (mathematically exact derivative on screen)
  // Screen Y increases downwards: dY_screen / dX_screen = - derivative * scaleFactor
  const slopeScreen2D = -derivative2D * scaleFactor2D;
  const tangentLen2D = Math.sqrt(1 + slopeScreen2D * slopeScreen2D);
  const tangentUx = 1 / tangentLen2D;
  const tangentUy = slopeScreen2D / tangentLen2D;

  // Tangent line segment: length 84px (half-length 42px)
  const tangentHalf = 42;
  const tanX1 = ballX2D - tangentHalf * tangentUx;
  const tanY1 = ballY2D - tangentHalf * tangentUy;
  const tanX2 = ballX2D + tangentHalf * tangentUx;
  const tanY2 = ballY2D + tangentHalf * tangentUy;

  // Step vector down slope towards the minimum
  const stepDirX = -Math.sign(derivative2D) * tangentUx;
  const stepDirY = -Math.sign(derivative2D) * tangentUy;
  const arrowDist = Math.min(28, Math.max(12, Math.abs(derivative2D) * 7));
  const arrowStartX = ballX2D - (arrowDist + 6) * stepDirX;
  const arrowStartY = ballY2D - (arrowDist + 6) * stepDirY;
  const arrowEndX = ballX2D - 6 * stepDirX;
  const arrowEndY = ballY2D - 6 * stepDirY;

  const curvePoints2D = [];
  for (let t = -0.15; t <= 3.7; t += 0.05) {
    const l = (t - targetTheta2D) ** 2;
    if (l <= maxLoss2D + 0.3) {
      curvePoints2D.push(`${mapX2D(t).toFixed(1)},${mapY2D(l).toFixed(1)}`);
    }
  }
  const pathD2D = `M ${curvePoints2D.join(" L ")}`;
  const firstPt2D = curvePoints2D[0].split(",");
  const lastPt2D = curvePoints2D[curvePoints2D.length - 1].split(",");
  const fillD2D = `${pathD2D} L ${lastPt2D[0]},${axisY2D} L ${firstPt2D[0]},${axisY2D} Z`;

  return (
    <div className="mlp-video-card" style={{ background: "#101116", borderColor: "rgba(255, 255, 255, 0.12)", marginTop: "10px" }}>
      {/* Top Status & 2D / 3D Switcher Bar */}
      <div className="mlp-video-topbar" style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="mlp-video-pill" style={{ background: "rgba(131, 193, 103, 0.15)", color: "#83c167", borderColor: "rgba(131, 193, 103, 0.35)" }}>
          <span className="mlp-rec-dot" style={{ background: "#83c167", boxShadow: "0 0 8px #83c167" }} />
          <span>{dimMode === "3d" ? "3D SURFACE · GRADIENT DESCENT" : "2D OPTIMIZATION · CONVERGENCE"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* 2D / 3D View Switcher */}
          <div style={{ display: "inline-flex", background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px", padding: "2px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <button
              onClick={() => { setDimMode("2d"); setTime(0); }}
              style={{
                border: 0,
                background: dimMode === "2d" ? "#83c167" : "transparent",
                color: dimMode === "2d" ? "#090c10" : "#94a3b8",
                padding: "3px 10px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Show 2D Gradient Descent Optimization"
            >
              2D Curve
            </button>
            <button
              onClick={() => { setDimMode("3d"); setTime(0); }}
              style={{
                border: 0,
                background: dimMode === "3d" ? "#83c167" : "transparent",
                color: dimMode === "3d" ? "#090c10" : "#94a3b8",
                padding: "3px 10px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Show 3D Gradient Descent Surface"
            >
              3D Surface
            </button>
          </div>

          {dimMode === "3d" && userCamera && (
            <button
              onClick={() => setUserCamera(null)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                color: "#94a3b8",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "10px",
                cursor: "pointer",
              }}
              title="Reset camera orientation"
            >
              ↺ Reset Angle
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Separate Line for Live Step Updates (fixed height to eliminate background jitter) */}
      <div
        style={{
          height: "26px",
          minHeight: "26px",
          maxHeight: "26px",
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0, 0, 0, 0.4)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          fontSize: "11px",
          fontWeight: "600",
          overflow: "hidden",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: time >= 11.35 ? "#83c167" : "#58c4dd",
              boxShadow: time >= 11.35 ? "0 0 6px #83c167" : "0 0 6px #58c4dd",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: dimMode === "3d" ? (time >= 11.35 ? "#83c167" : "#58c4dd") : (loss2D < 0.1 ? "#83c167" : "#58c4dd"),
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {dimMode === "3d"
              ? (time < 1.5 ? "Building 3D Loss Landscape" : time < 3.5 ? "Initial Point on Paraboloid Rim" : time < 11.35 ? `Step ${stepCount} of 9: Two parameters descending into minimum` : "Converged to minimum (0,0,0)")
              : `Convergence: ${Math.round(progress2D * 100)}%`}
          </span>
        </div>
        <span style={{ color: "#64748b", fontSize: "10.5px", fontFamily: "ui-monospace, monospace", flexShrink: 0 }}>
          {dimMode === "3d" ? `θ₁=${fmt(theta1)}  θ₂=${fmt(theta2)}` : `θ=${fmt(currentTheta2D)}`}
        </span>
      </div>

      {/* 3D MANIM VIEWPORT */}
      {dimMode === "3d" ? (
        <div
          className="mlp-video-canvas-wrap"
          style={{ background: "#101116", padding: "12px 10px 6px", position: "relative", cursor: "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <canvas
            ref={canvasRef}
            style={{ width: "100%", maxWidth: "680px", height: "auto", display: "block", borderRadius: "10px", touchAction: "none" }}
          />

          {/* SVG Overlay: MathTex Equations & Fixed-in-frame Labels */}
          <svg viewBox="0 0 680 370" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {/* 1. Title: Text("Gradient Descent in 3D", font_size=32, color=WHITE).to_edge(UP) */}
            <text x="340" y="26" textAnchor="middle" fill="#ffffff" fontSize="21" fontFamily="'Inter', sans-serif" fontWeight="700">
              Gradient Descent in 3D
            </text>

            {/* 2. Loss Equation Card (UL): L(θ₁,θ₂) = 0.22(θ₁² + θ₂²) */}
            {time >= 1.0 && (
              <g transform="translate(24, 52)">
                <rect x="-8" y="-14" width="166" height="28" rx="6" fill="rgba(16, 17, 22, 0.88)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                <text x="75" y="4" textAnchor="middle" fill="#ffffff" fontSize="12.5" fontFamily="'Cambria Math', Georgia, serif" fontStyle="italic">
                  L(θ₁,θ₂) = 0.22(θ₁² + θ₂²)
                </text>
              </g>
            )}

            {/* 3. Update Rule Card (UR): θ_new = θ - η∇L */}
            {time >= 2.5 && (
              <g transform="translate(490, 52)">
                <rect x="-8" y="-14" width="165" height="28" rx="6" fill="rgba(16, 17, 22, 0.88)" stroke="rgba(249, 215, 28, 0.35)" strokeWidth="1" />
                <text x="74" y="4" textAnchor="middle" fill="#f9d71c" fontSize="12.5" fontFamily="'Cambria Math', Georgia, serif" fontWeight="600">
                  θ_new = θ − η∇L (η=0.8)
                </text>
              </g>
            )}

            {/* 4. Two Parameter Gradient Arrows Legend (matching user image) */}
            {time >= 1.5 && (
              <g transform="translate(340, 52)">
                <rect x="-135" y="-12" width="270" height="24" rx="12" fill="rgba(16, 17, 22, 0.88)" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1" />
                <circle cx="-114" cy="0" r="4.5" fill="#facc15" />
                <text x="-103" y="3.5" fill="#facc15" fontSize="10.5" fontWeight="700" fontFamily="system-ui">θ₁</text>
                <circle cx="-45" cy="0" r="4.5" fill="#00e5ff" />
                <text x="-33" y="3.5" fill="#00e5ff" fontSize="10.5" fontWeight="700" fontFamily="system-ui">θ₂</text>
                <circle cx="26" cy="0" r="4.5" fill="#ff2ea6" />
                <text x="38" y="3.5" fill="#ff2ea6" fontSize="10.5" fontWeight="700" fontFamily="system-ui">Step (−η∇L)</text>
              </g>
            )}

            {/* 5. Highlight Converged Result: "Loss decreases toward the minimum" */}
            {time >= 11.35 && (
              <text x="340" y="342" textAnchor="middle" fill="#83c167" fontSize="14" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="0.02em">
                Loss decreases toward the minimum
              </text>
            )}

            {/* Drag Hint */}
            <text x="340" y="358" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="'Inter', sans-serif">
              Drag surface to orbit 3D camera
            </text>
          </svg>
        </div>
      ) : (
        /* 2D OPTIMIZATION VIEWPORT */
        <div className="mlp-video-canvas-wrap" style={{ background: "#101116", padding: "12px 8px 4px" }}>
          <svg viewBox="0 0 500 270" style={{ width: "100%", maxWidth: "560px", height: "auto" }}>
            <defs>
              <linearGradient id="curveFill2D" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#83c167" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#83c167" stopOpacity="0.0" />
              </linearGradient>
              <marker id="tangentArrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#83c167" />
              </marker>
              <marker id="bottomArrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#83c167" />
              </marker>
            </defs>

            {/* Top Math Formulation in the empty space above the parabola */}
            <g transform="translate(275, 38)">
              {/* θ ← θ − η */}
              <text
                x="-34"
                y="2"
                textAnchor="end"
                fontFamily="'Inter', -apple-system, sans-serif"
                fontSize="21"
                fontWeight="600"
              >
                <tspan fill="#58c4dd" fontStyle="italic">θ</tspan>
                <tspan fill="#e2e8f0" fontWeight="400" dx="7"> ← </tspan>
                <tspan fill="#58c4dd" fontStyle="italic" dx="7">θ</tspan>
                <tspan fill="#e2e8f0" fontWeight="400" dx="7"> − </tspan>
                <tspan fill="#f59e0b" fontStyle="italic" dx="7">η</tspan>
              </text>

              {/* Fraction: dL / dθ */}
              <g transform="translate(-18, 0)">
                {/* Numerator: dL */}
                <text
                  x="18"
                  y="-7"
                  textAnchor="middle"
                  fontFamily="'Inter', -apple-system, sans-serif"
                  fontSize="16"
                  fontWeight="600"
                  fill="#f59e0b"
                >
                  <tspan fontStyle="normal">d</tspan>
                  <tspan fontStyle="italic">L</tspan>
                </text>

                {/* Fraction Line */}
                <line
                  x1="2"
                  y1="-2"
                  x2="34"
                  y2="-2"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Denominator: dθ */}
                <text
                  x="18"
                  y="16"
                  textAnchor="middle"
                  fontFamily="'Inter', -apple-system, sans-serif"
                  fontSize="16"
                  fontWeight="600"
                  fill="#f59e0b"
                >
                  <tspan fontStyle="normal">d</tspan>
                  <tspan fontStyle="italic">θ</tspan>
                </text>
              </g>
            </g>

            {/* Active Live Parameter Readout Badge */}
            <g transform="translate(275, 66)" textAnchor="middle">
              <rect
                x="-148"
                y="-10"
                width="296"
                height="20"
                rx="10"
                fill="rgba(255, 255, 255, 0.04)"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
              <text
                x="0"
                y="4"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="'Fira Code', 'Roboto Mono', monospace"
                fontWeight="500"
              >
                η = <tspan fill="#f59e0b">0.15</tspan> · θ = <tspan fill="#58c4dd">{fmt(currentTheta2D)}</tspan> · dL/dθ = <tspan fill="#f59e0b">{fmt(derivative2D)}</tspan>
              </text>
            </g>

            {/* Coordinate Axes */}
            {/* L Axis (Vertical) */}
            <line x1="45" y1={topY2D - 10} x2="45" y2={axisY2D} stroke="#475569" strokeWidth="1.5" />
            <line x1="41" y1={topY2D - 10} x2="49" y2={topY2D - 10} stroke="#475569" strokeWidth="1.5" />
            <text x="32" y={topY2D - 5} fill="#94a3b8" fontSize="16" fontStyle="italic" fontFamily="serif" fontWeight="700">
              L
            </text>

            {/* Horizontal Axis */}
            <line x1="45" y1={axisY2D} x2={axisRight2D + 15} y2={axisY2D} stroke="#475569" strokeWidth="1.5" />

            {/* Axis Tick Marks */}
            {[0, 1, 2, 3].map((val) => (
              <g key={val}>
                <line
                  x1={mapX2D(val)}
                  y1={axisY2D - 3}
                  x2={mapX2D(val)}
                  y2={axisY2D + 5}
                  stroke="#64748b"
                  strokeWidth="1.2"
                />
                <text
                  x={mapX2D(val)}
                  y={axisY2D + 18}
                  fill="#64748b"
                  fontSize="9.5"
                  fontFamily="'Inter', sans-serif"
                  textAnchor="middle"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Parabolic Loss Curve */}
            <path d={fillD2D} fill="url(#curveFill2D)" />
            <path d={pathD2D} fill="none" stroke="#83c167" strokeWidth="2.5" />

            {/* Tangent Line Slope (Moving strictly tangent, touching at exactly one point) */}
            <line
              x1={tanX1}
              y1={tanY1}
              x2={tanX2}
              y2={tanY2}
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Descent Arrow along Tangent Line */}
            {arrowDist >= 10 && (
              <g>
                {/* Grey origin anchor dot on tangent line */}
                <circle cx={arrowStartX} cy={arrowStartY} r="2.8" fill="#94a3b8" />
                {/* Descent vector arrow pointing along tangent towards minimum */}
                <line
                  x1={arrowStartX}
                  y1={arrowStartY}
                  x2={arrowEndX}
                  y2={arrowEndY}
                  stroke="#83c167"
                  strokeWidth="2.4"
                  markerEnd="url(#tangentArrowHead)"
                />
              </g>
            )}

            {/* Dashed Vertical Projection from Ball to Horizontal Axis */}
            <line
              x1={ballX2D}
              y1={ballY2D}
              x2={ballX2D}
              y2={axisY2D}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Horizontal Step Bracket / Distance between θ and θ* */}
            {ballX2D < targetX2D - 6 && (
              <g stroke="#f87171" strokeWidth="1.8">
                <line x1={ballX2D} y1={axisY2D - 14} x2={targetX2D} y2={axisY2D - 14} />
                <line x1={ballX2D} y1={axisY2D - 19} x2={ballX2D} y2={axisY2D - 9} />
                <line x1={targetX2D} y1={axisY2D - 19} x2={targetX2D} y2={axisY2D - 9} />
              </g>
            )}

            {/* Horizontal Axis Parameter θ Indicator */}
            <circle cx={ballX2D} cy={axisY2D} r="10" fill="rgba(88, 196, 221, 0.22)" />
            <circle cx={ballX2D} cy={axisY2D} r="5" fill="#58c4dd" />
            <text
              x={ballX2D}
              y={axisY2D - 22}
              textAnchor="middle"
              fill="#58c4dd"
              fontSize="14"
              fontFamily="serif"
              fontStyle="italic"
              fontWeight="700"
            >
              θ
            </text>

            {/* Horizontal Axis Minimum θ* Indicator */}
            <circle cx={targetX2D} cy={axisY2D} r="10" fill="rgba(131, 193, 103, 0.22)" />
            <circle cx={targetX2D} cy={axisY2D} r="5" fill="#83c167" />
            <text
              x={targetX2D + 16}
              y={axisY2D - 18}
              textAnchor="start"
              fill="#83c167"
              fontSize="14"
              fontFamily="serif"
              fontStyle="italic"
              fontWeight="700"
            >
              θ*
            </text>

            {/* Direction Arrow Below Axis */}
            {ballX2D < targetX2D - 12 && (
              <line
                x1={ballX2D}
                y1={axisY2D + 16}
                x2={ballX2D + Math.min(26, targetX2D - ballX2D)}
                y2={axisY2D + 16}
                stroke="#83c167"
                strokeWidth="2.4"
                markerEnd="url(#bottomArrowHead)"
              />
            )}

            {/* Rolling Optimization Ball on Parabola */}
            <circle cx={ballX2D} cy={ballY2D} r="13" fill="rgba(249, 115, 22, 0.24)" />
            <circle cx={ballX2D} cy={ballY2D} r="6.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* Video Control Bar */}
      <div className="mlp-video-controls-bar" style={{ background: "#0d1117" }}>
        <button
          className="mlp-btn-play"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          title={isPlaying ? "Pause" : "Play"}
          style={{ background: "#83c167", color: "#090c10" }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button
          className="mlp-btn-restart"
          onClick={() => { setTime(0); setIsPlaying(true); }}
          title="Restart optimization"
          aria-label="Restart optimization"
        >
          ↺
        </button>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.05"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          className="mlp-video-scrubber"
          aria-label="Video scrubber"
          style={{ accentColor: "#83c167" }}
        />
        <span className="mlp-video-timestamp">
          {`00:${Math.floor(time).toString().padStart(2, "0")} / 00:${Math.floor(duration).toString().padStart(2, "0")}`}
        </span>
        <button
          className="mlp-video-speed"
          onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}
          title="Playback speed"
        >
          {speed}x
        </button>
      </div>

      {/* 3D Stage Jump Buttons */}
      {dimMode === "3d" ? (
        <div className="mlp-video-info-strip" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={() => setTime(0.0)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--mlp-border)",
                background: time < 1.5 ? "rgba(131, 193, 103, 0.25)" : "transparent",
                color: time < 1.5 ? "#83c167" : "var(--mlp-muted)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              1. 3D Landscape
            </button>
            <button
              onClick={() => setTime(1.8)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--mlp-border)",
                background: time >= 1.5 && time < 3.5 ? "rgba(131, 193, 103, 0.25)" : "transparent",
                color: time >= 1.5 && time < 3.5 ? "#83c167" : "var(--mlp-muted)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              2. Starting Point
            </button>
            <button
              onClick={() => setTime(4.37)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--mlp-border)",
                background: time >= 3.5 && time < 11.35 ? "rgba(131, 193, 103, 0.25)" : "transparent",
                color: time >= 3.5 && time < 11.35 ? "#83c167" : "var(--mlp-muted)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              3. Descent (Two Arrows)
            </button>
            <button
              onClick={() => setTime(11.35)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--mlp-border)",
                background: time >= 11.35 ? "rgba(131, 193, 103, 0.25)" : "transparent",
                color: time >= 11.35 ? "#83c167" : "var(--mlp-muted)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              4. Convergence
            </button>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            Camera: φ=58° · θ=-45° → -30° · Zoom=1.45
          </span>
        </div>
      ) : (
        <div className="mlp-video-info-strip" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={() => { setTime(0.0); setIsPlaying(true); }}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--mlp-border)",
                background: progress2D < 0.2 ? "rgba(131, 193, 103, 0.25)" : "transparent",
                color: progress2D < 0.2 ? "#83c167" : "var(--mlp-muted)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              1. Start (θ = 0.45)
            </button>
            <button
              onClick={() => { setTime(3.0); setIsPlaying(true); }}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--mlp-border)",
                background: progress2D >= 0.2 && progress2D < 0.7 ? "rgba(131, 193, 103, 0.25)" : "transparent",
                color: progress2D >= 0.2 && progress2D < 0.7 ? "#83c167" : "var(--mlp-muted)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              2. Tangent Descent
            </button>
            <button
              onClick={() => { setTime(8.0); setIsPlaying(true); }}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--mlp-border)",
                background: progress2D >= 0.7 ? "rgba(131, 193, 103, 0.25)" : "transparent",
                color: progress2D >= 0.7 ? "#83c167" : "var(--mlp-muted)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              3. Minimum (θ* = 2.65)
            </button>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            Step: Δθ = η·(dL/dθ) · η = 0.15
          </span>
        </div>
      )}

    </div>
  );
}

function NumberSlider({ label, value, min, max, step, onChange }) {
  return (
    <label className="mlp-range-field">
      <span>{label}<strong>{fmt(value)}</strong></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <small><span>{min}</span><span>{max}</span></small>
    </label>
  );
}

function NetworkDiagram({ input1, input2, hidden1, hidden2, output }) {
  const nodes = [
    { x: 55, y: 55, label: "x₁", value: input1, type: "input" },
    { x: 55, y: 145, label: "x₂", value: input2, type: "input" },
    { x: 220, y: 55, label: "h₁", value: hidden1, type: "hidden" },
    { x: 220, y: 145, label: "h₂", value: hidden2, type: "hidden" },
    { x: 385, y: 100, label: "ŷ", value: output, type: "output" },
  ];
  const links = [[0,2],[0,3],[1,2],[1,3],[2,4],[3,4]];
  return (
    <svg className="mlp-network-svg" viewBox="0 0 440 205" role="img" aria-label="Interactive neural network diagram showing two inputs, two hidden neurons, and one output">
      {links.map(([a,b], i) => {
        const from = nodes[a], to = nodes[b];
        return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="mlp-network-link" strokeWidth={1 + Math.abs(from.value) * 0.5} />;
      })}
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="24" className={`mlp-neuron ${n.type}`} />
          <text x={n.x} y={n.y - 3} textAnchor="middle" className="mlp-neuron-label">{n.label}</text>
          <text x={n.x} y={n.y + 11} textAnchor="middle" className="mlp-neuron-value">{n.value.toFixed(2)}</text>
        </g>
      ))}
      <text x="55" y="194" textAnchor="middle" className="mlp-layer-label">INPUTS</text>
      <text x="220" y="194" textAnchor="middle" className="mlp-layer-label">HIDDEN LAYER</text>
      <text x="385" y="194" textAnchor="middle" className="mlp-layer-label">OUTPUT</text>
    </svg>
  );
}
