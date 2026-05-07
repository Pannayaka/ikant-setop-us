"use client";

import { useEffect, useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { api } from "@/lib/api";
import type { DashboardSummary, RecentMovement } from "@/types/api";

// ── Helpers ──────────────────────────────────────────────────
function formatKg(kg: number) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

const QUALITY_CONFIG = {
  baik:   { label: "Baik",   color: "#00e676", bg: "rgba(0,230,118,0.12)"  },
  sedang: { label: "Sedang", color: "#ffc107", bg: "rgba(255,193,7,0.12)"  },
  buruk:  { label: "Buruk",  color: "#f44336", bg: "rgba(244,67,54,0.12)"  },
};

const MOVEMENT_CONFIG = {
  stock_in:        { label: "Masuk",          color: "#00e676", symbol: "↓" },
  stock_out:       { label: "Keluar",         color: "#ff6d00", symbol: "↑" },
  quality_change:  { label: "Ubah Kualitas",  color: "#ffc107", symbol: "~" },
  location_change: { label: "Pindah Lokasi",  color: "#42a5f5", symbol: "→" },
};

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ w = "100%", h = "20px", radius = "6px" }: { w?: string; h?: string; radius?: string }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, #172110 25%, #1e2d18 50%, #172110 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label, value, unit, accent, sub, loading,
}: {
  label: string; value: string; unit?: string;
  accent: string; sub?: string; loading?: boolean;
}) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${accent}22`,
      borderRadius: "var(--radius-md)",
      padding: "14px 12px",
      display: "flex", flexDirection: "column", gap: "6px",
      animation: "fadeUp 0.4s ease both",
    }}>
      <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </span>
      {loading ? (
        <Skeleton h="28px" w="70%" />
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
          <span style={{ fontSize: "26px", fontWeight: 800, color: accent, fontFamily: "var(--font-mono)", lineHeight: 1 }}>
            {value}
          </span>
          {unit && <span style={{ fontSize: "11px", color: accent, opacity: 0.7 }}>{unit}</span>}
        </div>
      )}
      {sub && !loading && (
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{sub}</span>
      )}
    </div>
  );
}

// ── Quality Bar ───────────────────────────────────────────────
function QualityBar({ baik, sedang, buruk }: { baik: number; sedang: number; buruk: number }) {
  const total = baik + sedang + buruk || 1;
  const pctBaik   = (baik   / total) * 100;
  const pctSedang = (sedang / total) * 100;
  const pctBuruk  = (buruk  / total) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* bar */}
      <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", gap: "2px" }}>
        {pctBaik > 0 && (
          <div style={{ width: `${pctBaik}%`, background: "#00e676", borderRadius: "4px", transition: "width 0.6s ease" }} />
        )}
        {pctSedang > 0 && (
          <div style={{ width: `${pctSedang}%`, background: "#ffc107", borderRadius: "4px", transition: "width 0.6s ease" }} />
        )}
        {pctBuruk > 0 && (
          <div style={{ width: `${pctBuruk}%`, background: "#f44336", borderRadius: "4px", transition: "width 0.6s ease" }} />
        )}
      </div>
      {/* legend */}
      <div style={{ display: "flex", gap: "12px" }}>
        {(["baik", "sedang", "buruk"] as const).map((q) => {
          const count = q === "baik" ? baik : q === "sedang" ? sedang : buruk;
          const cfg = QUALITY_CONFIG[q];
          return (
            <div key={q} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: cfg.color }} />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                {cfg.label} <span style={{ color: cfg.color, fontWeight: 600 }}>{count}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Fish Type Row ─────────────────────────────────────────────
function FishTypeRow({
  name, totalKg, batchCount, maxKg,
}: { name: string; totalKg: number; batchCount: number; maxKg: number }) {
  const pct = maxKg > 0 ? (totalKg / maxKg) * 100 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{name}</span>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          {formatKg(totalKg)}
          <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "4px" }}>{batchCount} batch</span>
        </span>
      </div>
      <div style={{ height: "4px", background: "var(--bg-elevated)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: "linear-gradient(90deg, var(--accent-primary), var(--accent-dim))",
          borderRadius: "2px", transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ── Movement Item ─────────────────────────────────────────────
function MovementItem({ movement }: { movement: RecentMovement }) {
  const cfg = MOVEMENT_CONFIG[movement.type];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 0",
      borderBottom: "1px solid var(--border-subtle)",
      animation: "fadeUp 0.3s ease both",
    }}>
      {/* symbol bubble */}
      <div style={{
        width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
        background: `${cfg.color}18`,
        border: `1px solid ${cfg.color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", fontWeight: 700, color: cfg.color,
        fontFamily: "var(--font-mono)",
      }}>
        {cfg.symbol}
      </div>
      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {movement.description}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
          {movement.created_by_name} · {timeAgo(movement.created_at)}
        </div>
      </div>
      {/* weight badge */}
      {movement.weight_kg && (
        <div style={{
          flexShrink: 0, fontSize: "11px", fontWeight: 600,
          color: cfg.color, fontFamily: "var(--font-mono)",
          background: `${cfg.color}12`, padding: "2px 7px", borderRadius: "5px",
        }}>
          {formatKg(movement.weight_kg)}
        </div>
      )}
    </div>
  );
}

// ── Cold Storage Row ──────────────────────────────────────────
function ColdStorageRow({ name, location, totalKg, maxKg }: {
  name: string; location: string; totalKg: number; maxKg: number;
}) {
  const pct = maxKg > 0 ? (totalKg / maxKg) * 100 : 0;
  const color = pct > 80 ? "#f44336" : pct > 50 ? "#ffc107" : "#00e676";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px",
      }}>
        ❄
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{location}</div>
        <div style={{ marginTop: "5px", height: "3px", background: "var(--bg-elevated)", borderRadius: "2px" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px", transition: "width 0.8s ease" }} />
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
          {formatKg(totalKg)}
        </div>
      </div>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "14px",
      animation: "fadeUp 0.5s ease both",
    }}>
      <div style={{
        fontSize: "10px", color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: "12px", fontWeight: 600,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const [summary, setSummary]     = useState<DashboardSummary | null>(null);
  const [movements, setMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, movRes] = await Promise.all([
          api.dashboard.summary(),
          api.dashboard.recentMovements(),
        ]);
        setSummary(sumRes.data);
        setMovements(movRes.data);
      } catch (e) {
        setError("Gagal memuat data. Coba refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxFishKg = summary
    ? Math.max(...summary.stock_by_fish_type.map((f) => f.total_kg), 1)
    : 1;
  const maxStorageKg = summary
    ? Math.max(...summary.stock_by_cold_storage.map((s) => s.total_kg), 1)
    : 1;

  const now = new Date();
  const greeting =
    now.getHours() < 11 ? "Selamat pagi" :
    now.getHours() < 15 ? "Selamat siang" :
    now.getHours() < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <MobileLayout
      title="Dashboard"
      headerRight={
        <button
          onClick={() => { setLoading(true); setError(null); }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "18px", padding: "4px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Refresh"
        >
          ↻
        </button>
      }
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>

        {/* ── Greeting ── */}
        <div style={{ animation: "fadeUp 0.3s ease both" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{greeting}, Daeng 👋</div>
          <div style={{
            fontSize: "20px", fontWeight: 800,
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)", marginTop: "2px",
            letterSpacing: "0.01em",
          }}>
            Stok Ikan Hari Ini
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
            borderRadius: "var(--radius-sm)", padding: "12px",
            fontSize: "13px", color: "#f44336", textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {/* ── Stat Cards 2x2 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <StatCard
            label="Total Stok"
            value={loading ? "—" : formatKg(summary?.total_stock_kg ?? 0)}
            accent="var(--accent-primary)"
            sub={loading ? undefined : `${summary?.total_batches ?? 0} batch aktif`}
            loading={loading}
          />
          <StatCard
            label="Masuk Hari Ini"
            value={loading ? "—" : formatKg(summary?.total_stock_in_today_kg ?? 0)}
            accent="#42a5f5"
            loading={loading}
          />
          <StatCard
            label="Keluar Hari Ini"
            value={loading ? "—" : formatKg(summary?.total_stock_out_today_kg ?? 0)}
            accent="var(--warn-orange)"
            loading={loading}
          />
          <StatCard
            label="Kondisi Stok"
            value={loading ? "—" : `${summary?.batches_by_quality.baik ?? 0}`}
            unit="baik"
            accent="#00e676"
            sub={loading ? undefined : `${summary?.batches_by_quality.buruk ?? 0} batch buruk`}
            loading={loading}
          />
        </div>

        {/* ── Kualitas Stok ── */}
        {!loading && summary && (
          <SectionCard title="Distribusi Kualitas Stok">
            <QualityBar
              baik={summary.batches_by_quality.baik}
              sedang={summary.batches_by_quality.sedang}
              buruk={summary.batches_by_quality.buruk}
            />
          </SectionCard>
        )}
        {loading && <Skeleton h="80px" radius="14px" />}

        {/* ── Stok per Jenis Ikan ── */}
        {!loading && summary && summary.stock_by_fish_type.some((f) => f.total_kg > 0) && (
          <SectionCard title="Stok per Jenis Ikan">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {summary.stock_by_fish_type
                .filter((f) => f.total_kg > 0)
                .map((item) => (
                  <FishTypeRow
                    key={item.fish_type.id}
                    name={item.fish_type.name}
                    totalKg={item.total_kg}
                    batchCount={item.batch_count}
                    maxKg={maxFishKg}
                  />
                ))}
            </div>
          </SectionCard>
        )}
        {loading && <Skeleton h="120px" radius="14px" />}

        {/* ── Cold Storage ── */}
        {!loading && summary && (
          <SectionCard title="Kapasitas Cold Storage">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {summary.stock_by_cold_storage.map((item) => (
                <ColdStorageRow
                  key={item.cold_storage.id}
                  name={item.cold_storage.name}
                  location={item.cold_storage.location_label}
                  totalKg={item.total_kg}
                  maxKg={maxStorageKg}
                />
              ))}
            </div>
          </SectionCard>
        )}
        {loading && <Skeleton h="130px" radius="14px" />}

        {/* ── Aktivitas Terbaru ── */}
        <SectionCard title="Aktivitas Terbaru">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} h="40px" radius="8px" />)}
            </div>
          ) : movements.length === 0 ? (
            <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>
              Belum ada aktivitas hari ini
            </div>
          ) : (
            <div>
              {movements.map((m, i) => (
                <MovementItem key={m.id} movement={m} />
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── FIFO Alert ── */}
        {!loading && summary && summary.batches_by_quality.buruk > 0 && (
          <div style={{
            background: "rgba(244,67,54,0.08)",
            border: "1px solid rgba(244,67,54,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: "10px",
            animation: "fadeUp 0.6s ease both",
          }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#f44336" }}>
                Perhatian FIFO!
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Ada {summary.batches_by_quality.buruk} batch kualitas buruk — prioritaskan untuk dikeluarkan.
              </div>
            </div>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}
