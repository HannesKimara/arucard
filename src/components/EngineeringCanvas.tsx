type EngineeringCanvasProps = {
  variant: "beam" | "column" | "plate" | "connection" | "section";
  toolKind: ToolKind;
  length: number;
  width: number;
  depth: number;
  load: number;
  unit: string;
};

export type ToolKind =
  | "beam" | "cantilever" | "portal" | "shear-moment" | "inertia" | "rebar"
  | "plate-weight" | "steel-weight" | "buckling" | "load-combination" | "building"
  | "bolt-torque" | "mohr" | "gauge" | "converter" | "section";

export type DiagramPoint = { position: number; value: number };

type Point = { x: number; y: number };

function DimensionLine({ start, end, label, offset = 0 }: { start: Point; end: Point; label: string; offset?: number }) {
  const isHorizontal = start.y === end.y;
  const labelX = isHorizontal ? (start.x + end.x) / 2 : start.x + offset;
  const labelY = isHorizontal ? start.y + offset : (start.y + end.y) / 2;

  return (
    <g className="canvas-dimension">
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
      {isHorizontal ? (
        <>
          <line x1={start.x} y1={start.y - 6} x2={start.x} y2={start.y + 6} />
          <line x1={end.x} y1={end.y - 6} x2={end.x} y2={end.y + 6} />
        </>
      ) : (
        <>
          <line x1={start.x - 6} y1={start.y} x2={start.x + 6} y2={start.y} />
          <line x1={end.x - 6} y1={end.y} x2={end.x + 6} y2={end.y} />
        </>
      )}
      <text x={labelX} y={labelY} textAnchor={isHorizontal ? "middle" : "start"}>
        {label}
      </text>
    </g>
  );
}

function Support({ x, y }: Point) {
  return (
    <g className="canvas-support">
      <path d={`M ${x - 18} ${y + 20} L ${x + 18} ${y + 20} L ${x} ${y} Z`} />
      <line x1={x - 22} y1={y + 24} x2={x + 22} y2={y + 24} />
    </g>
  );
}

export function EngineeringDiagram({ data, length, title, unit, color, stepped = false, breakBefore = false }: { data: DiagramPoint[]; length: number; title: string; unit: string; color: string; stepped?: boolean; breakBefore?: boolean }) {
  const chartStart = 110;
  const chartEnd = 650;
  const baseline = 86;
  const maxValue = Math.max(...data.map((point) => Math.abs(point.value)), 1);
  const coordinates = data.map((point) => ({
    x: chartStart + (point.position / Math.max(length, 0.01)) * (chartEnd - chartStart),
    y: baseline - (point.value / maxValue) * 48,
  }));
  const linePath = stepped
    ? coordinates.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const previous = coordinates[index - 1];
      return `${path} L ${point.x} ${previous.y} L ${point.x} ${point.y}`;
    }, "")
    : coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${chartEnd} ${baseline} L ${chartStart} ${baseline} Z`;

  return (
    <section className={`engineering-diagram${breakBefore ? " engineering-diagram-break" : ""}`} aria-label={`${title} diagram`}>
      <div className="engineering-diagram-header">
        <h2>{title}</h2>
        <span className="mono">MAX {maxValue.toFixed(1)} {unit}</span>
      </div>
      <svg viewBox="0 0 760 130" role="img" aria-label={`${title} diagram over ${length} m`}>
        <defs>
          <pattern id={`diagram-grid-${title.replace(/\W/g, "-")}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,220,0,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="760" height="130" fill={`url(#diagram-grid-${title.replace(/\W/g, "-")})`} />
        <line className="canvas-diagram-axis" x1={chartStart} y1={baseline} x2={chartEnd} y2={baseline} />
        <path d={areaPath} fill={`${color}22`} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
        <text className="canvas-diagram-value" x="72" y="22">{unit}</text>
        <text className="canvas-diagram-value" x={chartStart} y="112">0</text>
        <text className="canvas-diagram-value" x={chartEnd} y="112" textAnchor="end">{length} m</text>
      </svg>
    </section>
  );
}

export default function EngineeringCanvas({ variant, toolKind, length, width, depth, load, unit }: EngineeringCanvasProps) {
  const beamStart = 110;
  const beamEnd = 650;
  const beamY = 220;
  const beamDepth = Math.max(12, Math.min(34, depth / 2));
  const loadHeight = Math.max(42, Math.min(115, load / 2));
  const dimensionUnit = unit === "mm" ? "mm" : "m";
  const shapeWidth = Math.max(100, Math.min(330, width * 1.35));
  const shapeHeight = Math.max(80, Math.min(230, depth * 2.2));

  const renderToolSpecific = () => {
    const center = 400;
    if (toolKind === "portal" || toolKind === "building") return (
      <>
        <line className="canvas-member" x1="250" y1="340" x2="250" y2="140" />
        <line className="canvas-member" x1="550" y1="340" x2="550" y2="140" />
        <line className="canvas-member" x1="250" y1="140" x2="550" y2="140" />
        {[250, 550].map((x) => <rect key={x} className="canvas-plate" x={x - 28} y="340" width="56" height="10" rx="2" />)}
        <line className="canvas-load" x1="300" y1="90" x2="300" y2="128" /><line className="canvas-load" x1="400" y1="90" x2="400" y2="128" /><line className="canvas-load" x1="500" y1="90" x2="500" y2="128" />
        <text className="canvas-load-label" x="315" y="80">{load} kN {toolKind === "building" ? "WIND" : "GRAVITY"}</text>
        <DimensionLine start={{ x: 250, y: 385 }} end={{ x: 550, y: 385 }} label={`${length} m BAY`} offset={22} />
        <DimensionLine start={{ x: 205, y: 140 }} end={{ x: 205, y: 340 }} label={`${depth} m HEIGHT`} offset={14} />
      </>
    );
    if (toolKind === "inertia") return (
      <><path className="canvas-member" d={`M ${center - shapeWidth / 2} 130 H ${center + shapeWidth / 2} V 155 H ${center + 16} V 305 H ${center + shapeWidth / 2} V 330 H ${center - shapeWidth / 2} V 305 H ${center - 16} V 155 H ${center - shapeWidth / 2} Z`} /><line className="canvas-centerline" x1={center} y1="80" x2={center} y2="380" /><DimensionLine start={{ x: center - shapeWidth / 2, y: 370 }} end={{ x: center + shapeWidth / 2, y: 370 }} label={`${width} mm`} offset={22} /><DimensionLine start={{ x: 590, y: 130 }} end={{ x: 590, y: 330 }} label={`${depth} mm`} offset={14} /><text className="canvas-load-label" x={center} y="410" textAnchor="middle">CENTROID / Ix / Iy</text></>
    );
    if (toolKind === "rebar") return (
      <><line className="canvas-member" x1="190" y1="150" x2="610" y2="150" /><line className="canvas-member" x1="190" y1="210" x2="610" y2="210" /><line className="canvas-member" x1="190" y1="270" x2="610" y2="270" /><line className="canvas-member" x1="190" y1="330" x2="610" y2="330" />{[220, 300, 380, 460, 540].map((x) => <circle key={x} className="canvas-hole" cx={x} cy="240" r={Math.max(6, Math.min(14, depth / 2))} />)}<DimensionLine start={{ x: 190, y: 380 }} end={{ x: 610, y: 380 }} label={`${length} m BAR SCHEDULE`} offset={22} /><text className="canvas-load-label" x="400" y="105" textAnchor="middle">CA-50 / ASTM / EN</text></>
    );
    if (toolKind === "bolt-torque") return (
      <><rect className="canvas-member" x="250" y="190" width="300" height="80" rx="6" /><circle className="canvas-hole" cx="400" cy="230" r={Math.max(12, Math.min(28, depth / 2))} /><line className="canvas-load" x1="400" y1="120" x2="400" y2="190" /><path className="canvas-load-head" d="M 393 132 L 400 120 L 407 132" /><text className="canvas-load-label" x="420" y="150">PRELOAD {load} kN</text><DimensionLine start={{ x: 250, y: 330 }} end={{ x: 550, y: 330 }} label={`${width} mm BOLT PATTERN`} offset={22} /></>
    );
    if (toolKind === "mohr") return (
      <><line className="canvas-axis" x1="170" y1="250" x2="630" y2="250" /><line className="canvas-axis" x1="400" y1="80" x2="400" y2="410" /><circle className="canvas-hole" cx={400 + load} cy="250" r={Math.max(40, Math.min(120, width / 2))} /><line className="canvas-load" x1="400" y1="250" x2={400 + load} y2="250" /><text className="canvas-load-label" x="420" y="225">σ₁ / σ₃</text><text className="canvas-load-label" x="400" y="430" textAnchor="middle">MOHR'S CIRCLE · VON MISES</text></>
    );
    if (toolKind === "gauge" || toolKind === "converter") return (
      <><rect className="canvas-member" x="230" y="145" width="340" height="190" rx="8" /><line className="canvas-centerline" x1="270" y1="190" x2="530" y2="190" /><line className="canvas-centerline" x1="270" y1="240" x2="530" y2="240" /><line className="canvas-centerline" x1="270" y1="290" x2="530" y2="290" /><text className="canvas-load-label" x="400" y="178" textAnchor="middle">{toolKind === "gauge" ? "GAUGE → THICKNESS" : "SI ↔ US UNITS"}</text><text className="canvas-load-label" x="400" y="225" textAnchor="middle">INPUT {width}</text><text className="canvas-load-label" x="400" y="275" textAnchor="middle">CONVERTED {depth}</text></>
    );
    if (toolKind === "shear-moment") return <text className="canvas-load-label" x="400" y="220" textAnchor="middle">DIAGRAMS BELOW</text>;
    if (toolKind === "cantilever") return <><rect className="canvas-member" x="150" y="205" width="400" height={beamDepth} rx="3" /><rect className="canvas-plate" x="120" y="150" width="18" height="150" /><line className="canvas-load" x1="550" y1="100" x2="550" y2="195" /><path className="canvas-load-head" d="M 543 180 L 550 195 L 557 180" /><text className="canvas-load-label" x="565" y="145">{load} kN</text><DimensionLine start={{ x: 150, y: 320 }} end={{ x: 550, y: 320 }} label={`${length} m CANTILEVER`} offset={22} /></>;
    return null;
  };

  const renderBeam = () => (
    <>
      <line className="canvas-axis" x1="72" y1={beamY + 60} x2="690" y2={beamY + 60} />
      <rect className="canvas-member" x={beamStart} y={beamY - beamDepth / 2} width={beamEnd - beamStart} height={beamDepth} rx="3" />
      <Support x={beamStart + 32} y={beamY + beamDepth / 2} />
      <Support x={beamEnd - 32} y={beamY + beamDepth / 2} />
      <line className="canvas-load" x1={(beamStart + beamEnd) / 2} y1={beamY - beamDepth / 2 - loadHeight} x2={(beamStart + beamEnd) / 2} y2={beamY - beamDepth / 2 - 4} />
      <path className="canvas-load-head" d={`M ${(beamStart + beamEnd) / 2 - 7} ${beamY - beamDepth / 2 - 15} L ${(beamStart + beamEnd) / 2} ${beamY - beamDepth / 2 - 3} L ${(beamStart + beamEnd) / 2 + 7} ${beamY - beamDepth / 2 - 15}`} />
      <text className="canvas-load-label" x={(beamStart + beamEnd) / 2 + 14} y={beamY - beamDepth / 2 - loadHeight / 2}>{load} kN</text>
      <DimensionLine start={{ x: beamStart, y: 320 }} end={{ x: beamEnd, y: 320 }} label={`${length} ${dimensionUnit}`} offset={22} />
      <DimensionLine start={{ x: beamEnd + 48, y: beamY - beamDepth / 2 }} end={{ x: beamEnd + 48, y: beamY + beamDepth / 2 }} label={`${depth} mm`} offset={12} />
    </>
  );

  const renderColumn = () => (
    <>
      <rect className="canvas-member" x="360" y={260 - shapeHeight / 2} width={shapeWidth / 4} height={shapeHeight} rx="4" />
      <rect className="canvas-plate" x="330" y={260 + shapeHeight / 2} width="120" height="14" rx="2" />
      <line className="canvas-axis" x1="260" y1="260" x2="540" y2="260" />
      <path className="canvas-load-head" d="M 400 82 L 393 96 L 407 96 Z" />
      <line className="canvas-load" x1="400" y1="82" x2="400" y2="145" />
      <text className="canvas-load-label" x="418" y="116">{load} kN</text>
      <DimensionLine start={{ x: 300, y: 120 }} end={{ x: 300, y: 260 + shapeHeight / 2 }} label={`${length} ${dimensionUnit}`} offset={14} />
      <DimensionLine start={{ x: 360, y: 305 }} end={{ x: 360 + shapeWidth / 4, y: 305 }} label={`${depth} mm`} offset={22} />
    </>
  );

  const renderPlate = () => (
    <>
      <rect className="canvas-member" x={400 - shapeWidth / 2} y={250 - shapeHeight / 2} width={shapeWidth} height={shapeHeight} rx="6" />
      <circle className="canvas-hole" cx="400" cy="250" r={Math.max(10, Math.min(28, depth / 2))} />
      <DimensionLine start={{ x: 400 - shapeWidth / 2, y: 390 }} end={{ x: 400 + shapeWidth / 2, y: 390 }} label={`${width} mm`} offset={22} />
      <DimensionLine start={{ x: 590, y: 250 - shapeHeight / 2 }} end={{ x: 590, y: 250 + shapeHeight / 2 }} label={`${length} mm`} offset={14} />
      <DimensionLine start={{ x: 400 - 20, y: 250 }} end={{ x: 400 + 20, y: 250 }} label={`Ø ${depth} mm`} offset={22} />
    </>
  );

  const renderConnection = () => (
    <>
      <rect className="canvas-member" x="270" y="120" width="260" height="34" rx="3" />
      <rect className="canvas-member" x="380" y="154" width="34" height="200" rx="3" />
      {[{ x: 320, y: 137 }, { x: 480, y: 137 }, { x: 397, y: 205 }, { x: 397, y: 300 }].map((hole) => <circle key={`${hole.x}-${hole.y}`} className="canvas-hole" cx={hole.x} cy={hole.y} r={Math.max(6, Math.min(13, depth / 3))} />)}
      <DimensionLine start={{ x: 270, y: 390 }} end={{ x: 530, y: 390 }} label={`${width} mm`} offset={22} />
      <DimensionLine start={{ x: 575, y: 120 }} end={{ x: 575, y: 354 }} label={`${length} mm`} offset={14} />
      <text className="canvas-load-label" x="425" y="92">PRELOAD {load} kN</text>
    </>
  );

  const renderSection = () => (
    <>
      <path className="canvas-member" d={`M ${400 - shapeWidth / 2} ${180 - shapeHeight / 2} H ${400 + shapeWidth / 2} V ${180 - shapeHeight / 2 + depth / 2} H 414 V ${180 + shapeHeight / 2 - depth / 2} H ${400 + shapeWidth / 2} V ${180 + shapeHeight / 2} H ${400 - shapeWidth / 2} V ${180 + shapeHeight / 2 - depth / 2} H 386 V ${180 - shapeHeight / 2 + depth / 2} H ${400 - shapeWidth / 2} Z`} />
      <line className="canvas-centerline" x1="400" y1="75" x2="400" y2="285" />
      <line className="canvas-centerline" x1="260" y1="180" x2="540" y2="180" />
      <DimensionLine start={{ x: 400 - shapeWidth / 2, y: 330 }} end={{ x: 400 + shapeWidth / 2, y: 330 }} label={`${width} mm`} offset={22} />
      <DimensionLine start={{ x: 570, y: 180 - shapeHeight / 2 }} end={{ x: 570, y: 180 + shapeHeight / 2 }} label={`${length} mm`} offset={14} />
      <text className="canvas-load-label" x="400" y="390" textAnchor="middle">I-SECTION · LIVE PROFILE</text>
    </>
  );

  return (
    <section className="engineering-canvas" aria-label="Live engineering calculation canvas">
      <div className="engineering-canvas-header">
        <div>
          <span className="mono engineering-canvas-kicker">LIVE GEOMETRY</span>
          <h2>Calculation canvas</h2>
        </div>
        <span className="engineering-canvas-status"><span /> Updating in real time</span>
      </div>
      <svg viewBox="0 0 760 440" role="img" aria-label={`Parametric ${variant} drawing with dimensions`}>
        <defs>
          <pattern id="canvas-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,220,0,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="760" height="440" fill="url(#canvas-grid)" />
        {renderToolSpecific()}
        {toolKind === "beam" && renderBeam()}
        {toolKind === "column" && renderColumn()}
        {(toolKind === "buckling") && renderColumn()}
        {(toolKind === "plate-weight" || toolKind === "steel-weight") && renderPlate()}
        {toolKind === "section" && renderSection()}
      </svg>
      <div className="engineering-canvas-footer mono">
        <span>MODEL PREVIEW</span>
        <span>{variant.toUpperCase()} / SI UNITS</span>
      </div>
    </section>
  );
}
