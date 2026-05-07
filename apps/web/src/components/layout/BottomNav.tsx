"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================================
// ICONS — pakai SVG inline biar zero dependency
// ============================================================

const IconDashboard = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="8"
      height="8"
      rx="2"
      fill={active ? "var(--accent-primary)" : "none"}
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="1.8"
    />
    <rect
      x="13"
      y="3"
      width="8"
      height="8"
      rx="2"
      fill={active ? "var(--accent-primary)" : "none"}
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="1.8"
      opacity={active ? "0.5" : "1"}
    />
    <rect
      x="3"
      y="13"
      width="8"
      height="8"
      rx="2"
      fill={active ? "var(--accent-primary)" : "none"}
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="1.8"
      opacity={active ? "0.5" : "1"}
    />
    <rect
      x="13"
      y="13"
      width="8"
      height="8"
      rx="2"
      fill={active ? "var(--accent-primary)" : "none"}
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="1.8"
      opacity={active ? "0.3" : "1"}
    />
  </svg>
);

const IconStockIn = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3v12M12 15l-4-4M12 15l4-4"
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1"
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconStocks = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="1.8"
      fill={active ? "var(--accent-glow)" : "none"}
    />
    <path
      d="M16 7V6a4 4 0 00-8 0v1"
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9 12h6M9 15h4"
      stroke={active ? "var(--accent-primary)" : "var(--text-muted)"}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconStockOut = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21V9M12 9l-4 4M12 9l4 4"
      stroke={active ? "var(--warn-orange)" : "var(--text-muted)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 7V6a3 3 0 013-3h10a3 3 0 013 3v1"
      stroke={active ? "var(--warn-orange)" : "var(--text-muted)"}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ============================================================
// NAV CONFIG
// ============================================================

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: IconDashboard,
    matchPaths: ["/dashboard", "/"],
  },
  {
    href: "/stocks/new",
    label: "Masuk",
    icon: IconStockIn,
    matchPaths: ["/stocks/new"],
  },
  {
    href: "/stocks",
    label: "Stok",
    icon: IconStocks,
    matchPaths: ["/stocks"],
  },
  {
    href: "/stock-outs/new",
    label: "Keluar",
    icon: IconStockOut,
    matchPaths: ["/stock-outs/new", "/stock-outs"],
  },
] as const;

// ============================================================
// COMPONENT
// ============================================================

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.matchPaths.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p)));

  return (
    <>
      <style>{`
        @keyframes navPop {
          0% { transform: translateY(2px); opacity: 0.7; }
          60% { transform: translateY(-2px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        .nav-item-active .nav-icon {
          animation: navPop 0.25s ease forwards;
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "480px",
          height: "var(--bottom-nav-height)",
          background: "rgba(17, 26, 21, 0.96)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          zIndex: 100,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "nav-item-active" : ""}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "8px 4px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                position: "relative",
                transition: "background 0.15s ease",
                background: active ? "var(--accent-glow)" : "transparent",
              }}
            >
              {/* Indikator dot aktif */}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    top: "6px",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: item.label === "Keluar" ? "var(--warn-orange)" : "var(--accent-primary)",
                    boxShadow: `0 0 8px ${item.label === "Keluar" ? "var(--warn-orange)" : "var(--accent-primary)"}`,
                  }}
                />
              )}

              {/* Icon */}
              <span className="nav-icon">
                <Icon active={active} />
              </span>

              {/* Label */}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: active ? 600 : 400,
                  color:
                    active
                      ? item.label === "Keluar"
                        ? "var(--warn-orange)"
                        : "var(--accent-primary)"
                      : "var(--text-muted)",
                  fontFamily: "var(--font-body)",
                  letterSpacing: active ? "0.04em" : "0",
                  transition: "color 0.15s ease",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
