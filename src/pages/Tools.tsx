import { useState } from "react";
import { Link } from "react-router";

export type Tool = { name: string; desc: string; tag: string; category: string };

export const TOOL_CATEGORIES = [
  {
    name: "Beams & Analysis",
    icon: "⊥",
    tools: [
      { name: "Beam Calculator", desc: "FEM solver with shear, moment & deflection — NBR 8800 × AISC 360 side by side, 974+ flexural profiles", tag: "FEM" },
      { name: "Cantilever Beam Calculator", desc: "Fixed–free beam analysis — tip deflection, fixing moment, and code checks", tag: "STRUCT" },
      { name: "Portal Frame Calculator", desc: "Real 2D frame FEM with gravity + wind loads, N/V/M diagrams, and base reactions", tag: "FEM" },
    ],
  },
  {
    name: "Sections & Weight",
    icon: "⊞",
    tools: [
      { name: "Moment of Inertia Calculator", desc: "Ix, Iy, section modulus, and centroid for 9 cross-sections plus a custom builder", tag: "SECTION" },
      { name: "Rebar Weight Calculator", desc: "Unit mass and weight across CA-50, ASTM, and EN standards with bar schedule export", tag: "MATERIAL" },
      { name: "Steel Plate Weight Calculator", desc: "Plate weight for rectangular, circular, or ring shapes with commercial thickness catalog", tag: "MATERIAL" },
      { name: "Steel Weight Calculator", desc: "Weight via catalog kg/m for hundreds of profiles with cut list export", tag: "MATERIAL" },
    ],
  },
  {
    name: "Columns",
    icon: "↑",
    tools: [
      { name: "Column Buckling Calculator", desc: "Euler critical load and design capacity per AISC 360 §E3 · NBR 8800 §5.3", tag: "COLUMN" },
    ],
  },
  {
    name: "Loads & Frames",
    icon: "◎",
    tools: [
      { name: "Load Combination Calculator", desc: "ULS & SLS combinations for NBR 8681, ASCE 7 and EN 1990 side by side", tag: "LOADS" },
      { name: "Steel Building Calculator", desc: "Parametric portal frame generator with wind loading and profile sizing", tag: "FRAME" },
    ],
  },
  {
    name: "Connections",
    icon: "⬡",
    tools: [
      { name: "Bolt Torque Calculator", desc: "Tightening torque and preload per T = K·F·d with ISO, ASTM, and SAE standards", tag: "CONN" },
    ],
  },
  {
    name: "Utilities",
    icon: "⚙",
    tools: [
      { name: "Mohr's Circle Calculator", desc: "Principal stresses, τmax, and von Mises with a draggable circle and yield check", tag: "STRESS" },
      { name: "Sheet Metal Gauge Calculator", desc: "Gauge-to-thickness conversion for steel, galvanized, stainless, and aluminum", tag: "SHEET" },
      { name: "Steel Unit Converter", desc: "Converts force, stress, moment, and inertia between SI and US units", tag: "UTIL" },
    ],
  },
];

const ALL_TOOLS: Tool[] = TOOL_CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.name }))
);

const ALL_CATEGORIES = ["All", ...TOOL_CATEGORIES.map((c) => c.name)];

export function toolSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function ToolCard({ tool, focused, onFocus }: { tool: Tool; focused: boolean; onFocus: () => void }) {
  return (
    <Link
      to={`/tools/${toolSlug(tool.name)}`}
      onClick={onFocus}
      className="text-left w-full group rounded-xl p-5 transition-all duration-150"
      style={{
        border: `1px solid ${focused ? "var(--yellow)" : "var(--border)"}`,
        background: focused ? "var(--yellow-dim)" : "var(--surface)",
        outline: "none",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="mono text-xs px-2 py-0.5 rounded"
          style={{
            background: focused ? "rgba(255,220,0,0.2)" : "var(--yellow-dim)",
            color: "var(--yellow)",
            border: "1px solid var(--border-accent)",
          }}
        >
          {tool.tag}
        </span>
        <span
          className="text-base transition-all duration-150"
          style={{ color: "var(--yellow)", opacity: focused ? 1 : 0 }}
        >
          →
        </span>
      </div>
      <div
        className="font-bold mb-2"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 19,
          letterSpacing: "0.02em",
          color: focused ? "var(--yellow)" : "var(--text)",
        }}
      >
        {tool.name}
      </div>
      <div className="text-xs mb-3" style={{ color: "var(--text-dim)", lineHeight: 1.65 }}>{tool.desc}</div>
      <div className="mono text-xs" style={{ color: "var(--text-muted)" }}>{tool.category}</div>
    </Link>
  );
}

export default function Tools() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [focusedTool, setFocusedTool] = useState<string | null>(null);

  const filtered = ALL_TOOLS.filter((t) => {
    const matchesCat = activeCategory === "All" || t.category === activeCategory;
    const matchesSearch =
      search.trim() === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.tag.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Page header */}
      <div
        className="relative grid-overlay"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-2)",
          padding: "56px 0 48px",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(255,220,0,0.04) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="mono text-xs mb-3" style={{ color: "var(--yellow)" }}>ENGINEERING CALCULATORS</div>
          <h1
            className="font-black mb-4"
            style={{
              fontSize: "clamp(44px, 6vw, 76px)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {ALL_TOOLS.length} PRECISION TOOLS.
            <br />
            <span style={{ color: "var(--text-dim)" }}>ZERO CONTEXT-SWITCHING.</span>
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-dim)", lineHeight: 1.75 }}>
            Industry-standard structural engineering calculators — beam analysis, section properties, load combinations, and connection checks — built into your design workspace.
          </p>

          {/* Search */}
          <div className="mt-8 flex items-center gap-3">
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 mono text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded text-sm outline-none w-72"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
            <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex gap-10">
        {/* Sidebar categories */}
        <aside className="hidden lg:block shrink-0" style={{ width: 200 }}>
          <div className="sticky" style={{ top: 80 }}>
            <div className="mono text-xs mb-4" style={{ color: "var(--text-muted)" }}>CATEGORIES</div>
            <nav className="space-y-1">
              {ALL_CATEGORIES.map((cat) => {
                const catObj = TOOL_CATEGORIES.find((c) => c.name === cat);
                const count = cat === "All" ? ALL_TOOLS.length : ALL_TOOLS.filter((t) => t.category === cat).length;
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded text-left text-sm transition-all duration-150"
                    style={{
                      background: active ? "var(--yellow-dim)" : "transparent",
                      color: active ? "var(--yellow)" : "var(--text-dim)",
                      border: `1px solid ${active ? "var(--border-accent)" : "transparent"}`,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {catObj && <span>{catObj.icon}</span>}
                      <span style={{ fontFamily: active ? "'Barlow Condensed', sans-serif" : "inherit", fontWeight: active ? 700 : 400 }}>
                        {cat}
                      </span>
                    </span>
                    <span className="mono text-xs" style={{ color: active ? "var(--yellow)" : "var(--text-muted)" }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Category divider */}
            <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />

            {/* Category icons on mobile filter chips */}
            <div className="space-y-3">
              {TOOL_CATEGORIES.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span style={{ color: "var(--yellow)", fontSize: 14 }}>{cat.icon}</span>
                  <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile category chips */}
        <div className="lg:hidden mb-8 flex flex-wrap gap-2" style={{ display: "none" }}>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="mono text-xs px-3 py-1.5 rounded"
              style={{
                background: activeCategory === cat ? "var(--yellow)" : "var(--surface)",
                color: activeCategory === cat ? "#0a0a00" : "var(--text-dim)",
                border: `1px solid ${activeCategory === cat ? "var(--yellow)" : "var(--border)"}`,
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile chips */}
          <div className="flex flex-wrap gap-2 mb-8 lg:hidden">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="mono text-xs px-3 py-1.5 rounded"
                style={{
                  background: activeCategory === cat ? "var(--yellow)" : "var(--surface)",
                  color: activeCategory === cat ? "#0a0a00" : "var(--text-dim)",
                  border: `1px solid ${activeCategory === cat ? "var(--yellow)" : "var(--border)"}`,
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4" style={{ color: "var(--border)" }}>⊘</div>
              <div className="font-bold text-xl mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "var(--text-dim)" }}>
                NO TOOLS MATCH
              </div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>Try adjusting your search or category filter</div>
            </div>
          ) : (
            <>
              {activeCategory === "All" ? (
                TOOL_CATEGORIES.map((cat) => {
                  const catTools = cat.tools
                    .map((t) => ({ ...t, category: cat.name }))
                    .filter((t) =>
                      search.trim() === "" ||
                      t.name.toLowerCase().includes(search.toLowerCase()) ||
                      t.desc.toLowerCase().includes(search.toLowerCase())
                    );
                  if (catTools.length === 0) return null;
                  return (
                    <div key={cat.name} className="mb-12">
                      <div className="flex items-center gap-3 mb-5">
                        <span style={{ color: "var(--yellow)", fontSize: 18 }}>{cat.icon}</span>
                        <h2
                          className="font-bold text-xl"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}
                        >
                          {cat.name.toUpperCase()}
                        </h2>
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                        <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>{catTools.length} tool{catTools.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                        {catTools.map((t) => (
                          <ToolCard
                            key={t.name}
                            tool={t}
                            focused={focusedTool === t.name}
                            onFocus={() => setFocusedTool(focusedTool === t.name ? null : t.name)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                  {filtered.map((t) => (
                    <ToolCard
                      key={t.name}
                      tool={t}
                      focused={focusedTool === t.name}
                      onFocus={() => setFocusedTool(focusedTool === t.name ? null : t.name)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* CTA at bottom */}
          <div
            className="mt-16 rounded-2xl p-10 text-center"
            style={{
              border: "1px solid var(--border-accent)",
              background: "var(--yellow-dim)",
            }}
          >
            <div className="mono text-xs mb-3" style={{ color: "var(--yellow)" }}>ALKAD PLATFORM</div>
            <h3
              className="font-black text-4xl mb-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}
            >
              RUN THESE TOOLS INSIDE YOUR DESIGN.
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-dim)", lineHeight: 1.7 }}>
              All calculators are available inline in the ALKAD model editor. No copy-paste. Results feed directly into your geometry parameters.
            </p>
            <button
              className="px-8 py-3 rounded font-black text-sm"
              style={{
                background: "var(--yellow)",
                color: "#0a0a00",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.07em",
                fontSize: 15,
              }}
            >
              START DESIGNING FREE →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
