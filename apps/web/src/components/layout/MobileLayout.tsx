"use client";

import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  /** Judul halaman yang muncul di header */
  title?: string;
  /** Kalau true, header tidak ditampilkan (misal di halaman form fullscreen) */
  hideHeader?: boolean;
  /** Kalau true, bottom nav tidak ditampilkan */
  hideBottomNav?: boolean;
  /** Tombol kiri header, biasanya back button */
  headerLeft?: ReactNode;
  /** Tombol kanan header, biasanya action button */
  headerRight?: ReactNode;
}

export function MobileLayout({
  children,
  title,
  hideHeader = false,
  hideBottomNav = false,
  headerLeft,
  headerRight,
}: MobileLayoutProps) {
  return (
    <>
      {/* Global CSS — taruh di sini biar portable tanpa globals.css */}
      <style href="mobile-layout" precedence="default">{`
        :root {
          --bg-primary: #0a0f0d;
          --bg-surface: #111a15;
          --bg-card: #172110;
          --bg-elevated: #1e2d18;

          --accent-primary: #00e676;
          --accent-dim: #00c853;
          --accent-glow: rgba(0, 230, 118, 0.15);

          --warn-orange: #ff6d00;
          --warn-red: #f44336;
          --warn-yellow: #ffc107;

          --text-primary: #e8f5e9;
          --text-secondary: #81c784;
          --text-muted: #4a6650;
          --text-inverse: #0a0f0d;

          --border-subtle: rgba(0, 230, 118, 0.12);
          --border-active: rgba(0, 230, 118, 0.4);

          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 20px;

          --header-height: 56px;
          --bottom-nav-height: 68px;

          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        html, body {
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.5;
          overscroll-behavior: none;
          -webkit-font-smoothing: antialiased;
        }

        /* Scrollbar custom */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 2px; }

      `}</style>

      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-primary)",
          maxWidth: "480px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* ── HEADER ── */}
        {!hideHeader && (
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              height: "var(--header-height)",
              background: "rgba(10, 15, 13, 0.92)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              gap: "12px",
            }}
          >
            {/* Kiri */}
            <div style={{ width: "40px", flexShrink: 0 }}>
              {headerLeft ?? null}
            </div>

            {/* Tengah — judul */}
            {title && (
              <h1
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </h1>
            )}

            {/* Kanan */}
            <div
              style={{
                width: "40px",
                flexShrink: 0,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {headerRight ?? null}
            </div>
          </header>
        )}

        {/* ── KONTEN ── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: hideBottomNav
              ? "16px"
              : "calc(var(--bottom-nav-height) + 16px)",
          }}
        >
          {children}
        </main>

        {/* ── BOTTOM NAV ── */}
        {!hideBottomNav && <BottomNav />}
      </div>
    </>
  );
}
