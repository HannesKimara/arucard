import { useState } from "react";
import { Link, useParams } from "react-router";
import EngineeringCanvas, { EngineeringDiagram, type DiagramPoint, type ToolKind } from "../components/EngineeringCanvas";
import { TOOL_CATEGORIES, toolSlug } from "./Tools";

type CanvasVariant = "beam" | "column" | "plate" | "connection" | "section";

const ALL_TOOLS = TOOL_CATEGORIES.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool, category: category.name })),
);

function getVariant(category: string, name: string): CanvasVariant {
  if (category === "Beams & Analysis") return name.includes("Column") ? "column" : "beam";
  if (category === "Columns") return "column";
  if (category === "Connections") return "connection";
  if (category === "Sections & Weight" || category === "Utilities") return name.includes("Plate") || name.includes("Gauge") ? "plate" : "section";
  return "beam";
}

function getToolKind(name: string): ToolKind {
  const kinds: Array<[string, ToolKind]> = [
    ["Beam Calculator", "beam"], ["Cantilever Beam Calculator", "cantilever"], ["Portal Frame Calculator", "portal"],
    ["Moment of Inertia Calculator", "inertia"], ["Rebar Weight Calculator", "rebar"],
    ["Steel Plate Weight Calculator", "plate-weight"], ["Steel Weight Calculator", "steel-weight"], ["Column Buckling Calculator", "buckling"],
    ["Load Combination Calculator", "load-combination"], ["Steel Building Calculator", "building"], ["Bolt Torque Calculator", "bolt-torque"],
    ["Mohr's Circle Calculator", "mohr"], ["Sheet Metal Gauge Calculator", "gauge"], ["Steel Unit Converter", "converter"],
  ];
  return kinds.find(([title]) => title === name)?.[1] ?? "section";
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getDiagramData(toolKind: ToolKind, length: number, load: number): { shear: DiagramPoint[]; moment: DiagramPoint[]; note: string } | null {
  if (!(["beam", "cantilever", "portal", "building"] as ToolKind[]).includes(toolKind)) return null;
  const stations = Array.from({ length: 21 }, (_, index) => (length * index) / 20);
  if (toolKind === "cantilever") {
    return {
      shear: stations.map((position) => ({ position, value: -load })),
      moment: stations.map((position) => ({ position, value: -load * (length - position) })),
      note: "End point load · fixed support at x = 0",
    };
  }
  if (toolKind === "portal" || toolKind === "building") {
    const distributedLoad = load / Math.max(length, 0.01);
    return {
      shear: stations.map((position) => ({ position, value: load / 2 - distributedLoad * position })),
      moment: stations.map((position) => ({ position, value: (load * position) / 2 - (distributedLoad * position ** 2) / 2 })),
      note: "Uniform roof load · simply supported beam approximation",
    };
  }
  return {
    shear: stations.map((position) => ({ position, value: position <= length / 2 ? load / 2 : -load / 2 })),
    moment: stations.map((position) => ({ position, value: position <= length / 2 ? (load * position) / 2 : (load * (length - position)) / 2 })),
    note: "Centered point load · simply supported beam",
  };
}

export default function ToolPage() {
  const { toolSlug: currentSlug } = useParams();
  const tool = ALL_TOOLS.find((item) => toolSlug(item.name) === currentSlug) ?? ALL_TOOLS[0];
  const variant = getVariant(tool.category, tool.name);
  const toolKind = getToolKind(tool.name);
  const [length, setLength] = useState(6);
  const [width, setWidth] = useState(240);
  const [depth, setDepth] = useState(12);
  const [load, setLoad] = useState(18);

  const result = toolKind === "bolt-torque"
    ? Math.round(load * width * 0.18)
    : toolKind === "inertia"
      ? Math.round((width * depth ** 3) / 12)
      : toolKind === "buckling"
        ? Math.round((Math.PI ** 2 * width * 1000) / Math.max(length ** 2, 1))
        : toolKind === "rebar" || toolKind === "plate-weight" || toolKind === "steel-weight"
          ? Math.round(length * width * depth * 0.00785)
          : Math.round((load * length * 100) / Math.max(depth, 1));
  const diagramData = getDiagramData(toolKind, length, load);
  const shearData = diagramData?.shear ?? [];
  const momentData = diagramData?.moment ?? [];
  const peakShear = Math.max(...shearData.map((point) => Math.abs(point.value)), 0);
  const peakMoment = Math.max(...momentData.map((point) => Math.abs(point.value)), 0);
  const exportDiagram = (kind: "shear" | "moment") => {
    const data = kind === "shear" ? shearData : momentData;
    downloadCsv(`${toolSlug(tool.name)}-${kind}-diagram.csv`, [
      ["Station", `Position (${variant === "beam" ? "m" : "mm"})`, `Value (${kind === "shear" ? "kN" : "kN·m"})`],
      ...data.map((point, index) => [`${index + 1}`, point.position.toFixed(3), point.value.toFixed(3)]),
    ]);
  };
  const exportPdf = () => window.print();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-12 md:py-16">
      <Link to="/tools" className="mono mb-8 inline-flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <span aria-hidden="true">←</span> ALL ENGINEERING TOOLS
      </Link>

      <div className="mb-10 max-w-3xl">
        <div className="mono mb-3 text-xs" style={{ color: "var(--yellow)" }}>{tool.category.toUpperCase()} / {tool.tag}</div>
        <h1 className="mb-4 text-4xl font-bold md:text-6xl">{tool.name}</h1>
        <p className="max-w-2xl text-base" style={{ color: "var(--text-dim)", lineHeight: 1.75 }}>{tool.desc}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-6">
          {diagramData && (
            <section className="beam-analysis-results" aria-label="Beam analysis results">
              <div className="mono beam-analysis-kicker">ANALYSIS SUMMARY</div>
              <h2>Beam analysis results</h2>
              <div className="beam-analysis-grid">
                <div><span>Peak shear</span><strong>{peakShear.toFixed(2)} kN</strong></div>
                <div><span>Peak moment</span><strong>{peakMoment.toFixed(2)} kN·m</strong></div>
                <div><span>Span</span><strong>{length.toFixed(2)} m</strong></div>
                <div><span>Applied load</span><strong>{load.toFixed(2)} kN</strong></div>
              </div>
              <p>Model assumption: {diagramData.note}.</p>
            </section>
          )}
          <EngineeringCanvas
            variant={variant}
            toolKind={toolKind}
            length={length}
            width={width}
            depth={depth}
            load={load}
            unit={variant === "beam" || variant === "column" ? "m" : "mm"}
          />
          {diagramData && (
            <>
              <EngineeringDiagram data={shearData} length={length} title={`Shear force diagram · ${diagramData.note}`} unit="kN" color="#ffdc00" stepped breakBefore />
              <EngineeringDiagram data={momentData} length={length} title={`Bending moment diagram · ${diagramData.note}`} unit="kN·m" color="#ffe86a" />
            </>
          )}
        </div>

        <aside className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="mono mb-6 text-xs" style={{ color: "var(--text-muted)" }}>PARAMETERS</div>
          <div className="space-y-5">
            <Parameter label={toolKind === "bolt-torque" ? "Bolt diameter" : toolKind === "inertia" ? "Section width" : toolKind === "mohr" ? "Normal stress" : variant === "beam" || variant === "column" ? "Span / height" : "Overall length"} value={length} unit={variant === "beam" || variant === "column" ? "m" : "mm"} onChange={setLength} min={1} max={100} />
            <Parameter label={toolKind === "rebar" ? "Bar count" : toolKind === "gauge" || toolKind === "converter" ? "Input value" : variant === "beam" ? "Section width" : "Overall width"} value={width} unit="mm" onChange={setWidth} min={20} max={600} />
            <Parameter label={toolKind === "bolt-torque" ? "Nut factor" : toolKind === "inertia" ? "Section depth" : variant === "beam" ? "Section depth" : "Thickness"} value={depth} unit="mm" onChange={setDepth} min={2} max={300} />
            <Parameter label={toolKind === "gauge" ? "Material thickness" : toolKind === "converter" ? "Converted value" : "Applied load"} value={load} unit={toolKind === "converter" ? "lb" : "kN"} onChange={setLoad} min={1} max={100} />
          </div>
          <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--border)" }}>
            <div className="mono mb-2 text-xs" style={{ color: "var(--text-muted)" }}>LIVE ESTIMATE</div>
            <div className="text-3xl font-bold" style={{ color: "var(--text)" }}>{result.toLocaleString()} <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>kN·mm</span></div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-dim)" }}>Updates as you adjust the geometry or load.</p>
          </div>
          {diagramData && (
            <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--border)" }}>
              <div className="mono mb-3 text-xs" style={{ color: "var(--text-muted)" }}>EXPORT DIAGRAM DATA</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => exportDiagram("shear")} className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--border-accent)", color: "var(--text)" }}>
                  ↓ Shear CSV
                </button>
                <button type="button" onClick={() => exportDiagram("moment")} className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--border-accent)", color: "var(--text)" }}>
                  ↓ Moment CSV
                </button>
              </div>
              <button type="button" onClick={exportPdf} className="mt-2 w-full rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--border-accent)", color: "var(--text)" }}>
                ↓ Export PDF
              </button>
              <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>21 live stations exported from the current span and load.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function Parameter({ label, value, unit, min, max, onChange }: { label: string; value: number; unit: string; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-medium">
        {label}
        <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>{unit}</span>
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
      />
    </label>
  );
}
