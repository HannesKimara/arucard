import { Outlet, NavLink, useLocation } from "react-router";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Product", to: "/" },
  { label: "Tools", to: "/tools" },
  { label: "Workflow", to: "/#workflow" },
  { label: "Enterprise", to: "/#enterprise" },
  { label: "Docs", to: "/#docs" },
];

export default function Root() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12"
        style={{
          height: 64,
          background: "rgba(10,10,0,0.9)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <polygon
              points="14,2 26,8 26,20 14,26 2,20 2,8"
              stroke="rgba(255,220,0,0.85)"
              strokeWidth="1.5"
              fill="rgba(255,220,0,0.07)"
            />
            <polygon
              points="14,7 21,11 21,17 14,21 7,17 7,11"
              stroke="rgba(255,220,0,0.4)"
              strokeWidth="1"
              fill="rgba(255,220,0,0.04)"
            />
            <circle cx="14" cy="14" r="2.5" fill="rgba(255,220,0,0.95)" />
          </svg>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              letterSpacing: "0.18em",
              fontSize: 20,
              color: "var(--text)",
            }}
          >
            ALKAD
          </span>
          <span
            className="mono text-xs px-1.5 py-0.5 rounded"
            style={{
              background: "var(--yellow-dim)",
              color: "var(--yellow)",
              border: "1px solid var(--border-accent)",
            }}
          >
            BETA
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className="text-sm transition-colors duration-150"
              style={({ isActive }) => ({
                color: isActive && l.to === location.pathname ? "var(--yellow)" : "var(--text-dim)",
              })}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => {
                const isActive = l.to === location.pathname;
                e.currentTarget.style.color = isActive ? "var(--yellow)" : "var(--text-dim)";
              }}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="#" className="hidden md:block text-sm transition-colors" style={{ color: "var(--text-dim)" }}>
            Sign in
          </a>
          <button
            className="text-sm font-bold px-5 py-2 rounded transition-all duration-150"
            style={{
              background: "var(--yellow)",
              color: "#0a0a00",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.07em",
              fontSize: 13,
            }}
          >
            REQUEST ACCESS
          </button>
          <button className="md:hidden" onClick={() => setOpen(!open)} style={{ color: "var(--text-dim)", fontSize: 20 }}>
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-20 px-6 md:hidden"
          style={{ background: "rgba(10,10,0,0.97)", borderBottom: "1px solid var(--border)" }}
        >
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className="py-4 text-lg border-b font-bold"
              style={{ borderColor: "var(--border)", fontFamily: "'Barlow Condensed', sans-serif", color: "var(--text)" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}

      <div style={{ paddingTop: 64 }}>
        <Outlet />
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="rgba(255,220,0,0.6)" strokeWidth="1.5" fill="rgba(255,220,0,0.04)" />
              <circle cx="14" cy="14" r="2.5" fill="rgba(255,220,0,0.7)" />
            </svg>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: "0.16em", fontSize: 16 }}>
              ALKAD
            </span>
          </div>
          <div className="flex flex-wrap gap-8">
            {["Privacy", "Terms", "Security", "Status", "Contact"].map((l) => (
              <a key={l} href="#" className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
                {l}
              </a>
            ))}
          </div>
          <div className="mono text-xs" style={{ color: "var(--text-muted)" }}>
            © 2025 ALKAD, INC. — COMPUTATIONAL DESIGN PLATFORM
          </div>
        </div>
      </footer>
    </div>
  );
}
