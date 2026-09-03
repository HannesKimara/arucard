import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

const FEATURES = [
  {
    icon: "⬡",
    label: "AI Prompt Engine",
    desc: "Describe geometry in plain language. ALKAD translates engineering intent into parametric models in under 60 seconds.",
  },
  {
    icon: "◈",
    label: "Lattice & Topology",
    desc: "Generate optimized lattice structures, shell offsets, and topology results — all mesh-ready for manufacturing.",
  },
  {
    icon: "⚡",
    label: "FEM Validation",
    desc: "Built-in finite element solver checks structural integrity, stress distribution, and deflection inline during design.",
  },
  {
    icon: "⊕",
    label: "Multi-Domain Coupling",
    desc: "Bridge mechanical, electrical, and thermal domains in a single parametric graph without switching tools.",
  },
  {
    icon: "◐",
    label: "Web-Native Editor",
    desc: "Full-featured 3D model editor runs in the browser. No install. Real-time collaboration across engineering teams.",
  },
  {
    icon: "⊞",
    label: "Export Pipeline",
    desc: "Output STL, STEP, OBJ, or direct-to-slicer formats with manufacturing tolerances baked in.",
  },
];

const PROMPTS = [
  "Design a titanium lattice bracket with 40% mass reduction, max 500N load...",
  "Generate a parametric heat sink for 150W TDP, forced air, aluminum 6061...",
  "Create a topology-optimized motor mount for 3kg payload, 6061 Al, M6 bolts...",
  "Model an industrial jig fixture for 200mm cylindrical workpiece, 3-point contact...",
];

const STATS = [
  { value: "94×", label: "Faster prototyping vs CAD" },
  { value: "40%", label: "Average mass reduction" },
  { value: "15min", label: "Concept to printable model" },
  { value: "200+", label: "Manufacturing validations" },
];

function WireframeViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const project = (x: number, y: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rx = x * cos - z * sin;
      const rz = x * sin + z * cos;
      const scale = 200 / (200 + rz);
      return { x: cx + rx * scale, y: cy + y * scale, scale };
    };

    const size = 70;
    const N = 3;
    const pts: [number, number, number][] = [];
    for (let ix = 0; ix < N; ix++)
      for (let iy = 0; iy < N; iy++)
        for (let iz = 0; iz < N; iz++)
          pts.push([(ix - 1) * size, (iy - 1) * size, (iz - 1) * size]);

    const edges: [number, number, number, number, number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.sqrt(
          (pts[j][0] - pts[i][0]) ** 2 +
          (pts[j][1] - pts[i][1]) ** 2 +
          (pts[j][2] - pts[i][2]) ** 2
        );
        if (d <= size * 1.45) edges.push([...pts[i], ...pts[j]] as [number, number, number, number, number, number]);
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      angleRef.current += 0.004;
      const a = angleRef.current;
      const tiltCos = Math.cos(0.3);
      const tiltSin = Math.sin(0.3);
      ctx.lineWidth = 0.9;

      edges.forEach(([x1, y1, z1, x2, y2, z2]) => {
        const ty1 = y1 * tiltCos - z1 * tiltSin;
        const tz1 = y1 * tiltSin + z1 * tiltCos;
        const ty2 = y2 * tiltCos - z2 * tiltSin;
        const tz2 = y2 * tiltSin + z2 * tiltCos;
        const p1 = project(x1, ty1, tz1, a);
        const p2 = project(x2, ty2, tz2, a);
        const alpha = 0.1 + 0.2 * Math.min(p1.scale, p2.scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(255,220,0,${alpha})`;
        ctx.stroke();
      });

      pts.forEach(([x, y, z]) => {
        const ty = y * tiltCos - z * tiltSin;
        const tz = y * tiltSin + z * tiltCos;
        const p = project(x, ty, tz, a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,0,${p.scale * 0.85})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,0,${p.scale * 0.1})`;
        ctx.fill();
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,220,0,0.05) 0%, transparent 70%)" }}
      />
      <canvas ref={canvasRef} width={480} height={480} className="relative z-10 opacity-90" />
      {[
        ["top-4 left-4", "border-t border-l"],
        ["top-4 right-4", "border-t border-r"],
        ["bottom-4 left-4", "border-b border-l"],
        ["bottom-4 right-4", "border-b border-r"],
      ].map(([pos, bor], i) => (
        <div key={i} className={`absolute ${pos} w-6 h-6 ${bor}`} style={{ borderColor: "rgba(255,220,0,0.4)" }} />
      ))}
      <div className="absolute bottom-8 left-8 mono text-xs" style={{ color: "rgba(255,220,0,0.55)" }}>
        <div>NODES 27 · EDGES 54</div>
        <div>MASS REDUCTION 42%</div>
      </div>
      <div className="absolute top-8 right-8 mono text-xs text-right" style={{ color: "rgba(255,220,0,0.55)" }}>
        <div>ALKAD ENGINE v2.4</div>
        <div>REAL-TIME FEM ●</div>
      </div>
    </div>
  );
}

function PromptDemo() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const full = PROMPTS[promptIdx];
    let i = 0;
    setDisplayed("");
    setTyping(true);
    const interval = setInterval(() => {
      if (i <= full.length) {
        setDisplayed(full.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTyping(false);
        setTimeout(() => setPromptIdx((p) => (p + 1) % PROMPTS.length), 2400);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [promptIdx]);

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: "var(--yellow)", boxShadow: "0 0 8px var(--yellow)" }} />
        <span className="mono text-xs" style={{ color: "var(--text-dim)" }}>PROMPT ENGINE</span>
      </div>
      <div className="mono text-sm min-h-[52px]" style={{ color: "var(--text)" }}>
        {displayed}
        {typing && (
          <span style={{ color: "var(--yellow)", animation: "blink 1s step-end infinite" }}>|</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {PROMPTS.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i === promptIdx ? "var(--yellow)" : "var(--border)" }}
            />
          ))}
        </div>
        <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>↵ to generate</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative grid-overlay" style={{ paddingTop: 80, paddingBottom: 80, minHeight: "calc(100vh - 64px)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 65% 40%, rgba(255,220,0,0.05) 0%, transparent 70%)" }}
        />
        <div
          className="relative max-w-7xl mx-auto px-6 md:px-12 grid gap-16 items-center hero-grid"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded"
              style={{ background: "var(--yellow-dim)", border: "1px solid var(--border-accent)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--yellow)", boxShadow: "0 0 6px var(--yellow)" }} />
              <span className="mono text-xs" style={{ color: "var(--yellow)" }}>AI-NATIVE COMPUTATIONAL DESIGN</span>
            </div>

            <h1
              className="font-black leading-none mb-6"
              style={{
                fontSize: "clamp(52px, 7vw, 92px)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
              }}
            >
              PROTOTYPE IN
              <br />
              <span style={{ color: "var(--yellow)" }} className="yellow-glow-text">
                MINUTES,
              </span>
              <br />
              NOT MONTHS.
            </h1>

            <p className="text-base mb-10 max-w-lg" style={{ color: "var(--text-dim)", lineHeight: 1.75 }}>
              ALKAD is a computational design platform for mechanical, electrical, and industrial engineers. Describe your engineering intent — the AI builds it. Validate instantly. Ship sooner.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded font-bold text-sm"
                style={{
                  background: "var(--yellow)",
                  color: "#0a0a00",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.06em",
                  fontSize: 15,
                }}
              >
                START DESIGNING FREE <span>→</span>
              </button>
              <Link
                to="/tools"
                className="flex items-center gap-2 px-6 py-3 rounded font-bold text-sm transition-all duration-150"
                style={{
                  border: "1px solid var(--border-accent)",
                  color: "var(--yellow)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.06em",
                  fontSize: 15,
                }}
              >
                EXPLORE TOOLS
              </Link>
            </div>

            <PromptDemo />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div
                    className="font-black leading-none mb-1"
                    style={{ fontSize: 34, fontFamily: "'Barlow Condensed', sans-serif", color: "var(--yellow)" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative" style={{ height: 520 }}>
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            />
            <WireframeViewer />
          </div>
        </div>
      </section>

      {/* WORKFLOW STRIP */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-wrap items-center">
          {[
            ["01", "Describe intent via AI prompt"],
            ["02", "Parametric model generated"],
            ["03", "FEM validation inline"],
            ["04", "Export to manufacturing"],
          ].map(([n, label], i) => (
            <div key={n} className="flex items-center">
              <div className="flex items-center gap-3 px-5 py-2">
                <span className="mono text-xs font-bold" style={{ color: "var(--yellow)" }}>{n}</span>
                <span className="text-sm" style={{ color: "var(--text-dim)" }}>{label}</span>
              </div>
              {i < 3 && <span className="text-xl" style={{ color: "var(--border)" }}>›</span>}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <div className="mono text-xs mb-3" style={{ color: "var(--yellow)" }}>CAPABILITIES</div>
          <h2
            className="font-black"
            style={{ fontSize: "clamp(38px, 5vw, 62px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}
          >
            EVERY TOOL AN ENGINEER NEEDS,
            <br />
            <span style={{ color: "var(--text-dim)" }}>WIRED TOGETHER.</span>
          </h2>
        </div>

        <div
          className="grid features-grid gap-px"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", background: "var(--border)" }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="card-hover p-8"
              style={{ background: "var(--bg)" }}
            >
              <div className="text-2xl mb-5" style={{ color: "var(--yellow)" }}>{f.icon}</div>
              <div
                className="font-bold text-xl mb-3"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.02em" }}
              >
                {f.label}
              </div>
              <div className="text-sm" style={{ color: "var(--text-dim)", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)" }} className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mono text-xs mb-3" style={{ color: "var(--yellow)" }}>WORKFLOW</div>
          <h2
            className="font-black mb-16"
            style={{ fontSize: "clamp(38px, 5vw, 62px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}
          >
            FROM BRIEF TO PART
            <br />
            <span style={{ color: "var(--text-dim)" }}>IN THREE STEPS.</span>
          </h2>

          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {[
              {
                step: "01",
                title: "Prompt Your Design",
                body: "Type a natural-language engineering brief. Include load requirements, materials, weight targets, mounting constraints. ALKAD parses engineering semantics — not just keywords.",
                tag: "AI INTERPRETATION",
              },
              {
                step: "02",
                title: "Iterate the Model",
                body: "A parametric 3D model appears in the web editor. Tweak geometry with sliders or follow-up prompts. The FEM solver re-validates on every change.",
                tag: "REAL-TIME FEM",
              },
              {
                step: "03",
                title: "Export & Manufacture",
                body: "Download STEP, STL, or DXF. Send directly to connected slicers, CNC post-processors, or your PLM system. Full GD&T annotations included.",
                tag: "MANUFACTURING-READY",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-8 rounded-xl"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <span
                    className="font-black"
                    style={{
                      fontSize: 56,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      color: "rgba(255,220,0,0.12)",
                      lineHeight: 1,
                    }}
                  >
                    {item.step}
                  </span>
                  <span
                    className="mono text-xs px-2 py-1 rounded"
                    style={{
                      background: "var(--yellow-dim)",
                      color: "var(--yellow)",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <div
                  className="font-bold text-2xl mb-3"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {item.title}
                </div>
                <div className="text-sm" style={{ color: "var(--text-dim)", lineHeight: 1.75 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-wrap items-center justify-between gap-8">
          <div>
            <div
              className="font-black text-2xl mb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              TRUSTED BY ENGINEERING TEAMS AT
            </div>
            <div className="text-sm" style={{ color: "var(--text-dim)" }}>
              from aerospace startups to Fortune 500 manufacturers
            </div>
          </div>
          <div className="flex flex-wrap gap-10 items-center">
            {["SIEMENS", "BOEING", "BOSCH", "SHELL", "ABB"].map((co) => (
              <span
                key={co}
                className="font-black"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.1em",
                  fontSize: 18,
                  color: "rgba(255,220,0,0.25)",
                }}
              >
                {co}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grid-overlay" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,220,0,0.06) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="mono text-xs mb-4" style={{ color: "var(--yellow)" }}>EARLY ACCESS</div>
          <h2
            className="font-black mb-6"
            style={{
              fontSize: "clamp(48px, 7vw, 88px)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            JOIN THE ENGINEERS
            <br />
            <span style={{ color: "var(--yellow)" }} className="yellow-glow-text">
              ALREADY AHEAD.
            </span>
          </h2>
          <p className="text-base mb-12 max-w-xl mx-auto" style={{ color: "var(--text-dim)", lineHeight: 1.75 }}>
            ALKAD is in private beta. Request early access and we will onboard your team within 48 hours. No procurement required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <input
              type="email"
              placeholder="your.name@company.com"
              className="px-5 py-3 rounded text-sm outline-none w-full sm:w-80"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <button
              className="px-8 py-3 rounded font-black text-sm whitespace-nowrap"
              style={{
                background: "var(--yellow)",
                color: "#0a0a00",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.06em",
                fontSize: 15,
              }}
            >
              REQUEST ACCESS →
            </button>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              {
                name: "SOLO",
                price: "Free",
                note: "1 seat · 5 models/mo",
                features: ["AI prompt engine", "All calculators", "STL export"],
                highlight: false,
              },
              {
                name: "TEAM",
                price: "$149/mo",
                note: "Up to 10 seats",
                features: ["Unlimited models", "FEM validation", "STEP / DXF export", "Collaboration"],
                highlight: true,
              },
              {
                name: "ENTERPRISE",
                price: "Custom",
                note: "Unlimited seats",
                features: ["SSO & audit logs", "PLM integration", "Dedicated support", "SLA"],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="p-6 rounded-xl text-left"
                style={{
                  border: `1px solid ${plan.highlight ? "var(--yellow)" : "var(--border)"}`,
                  background: plan.highlight ? "var(--yellow-dim)" : "var(--surface)",
                }}
              >
                <div className="mono text-xs mb-3" style={{ color: plan.highlight ? "var(--yellow)" : "var(--text-muted)" }}>
                  {plan.name}
                </div>
                <div
                  className="font-black text-3xl mb-1"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {plan.price}
                </div>
                <div className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>{plan.note}</div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-dim)" }}>
                      <span style={{ color: "var(--yellow)" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
