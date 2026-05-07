"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { api } from "@/lib/api";
import type { StockBatch, FishType, FishQuality } from "@/types/api";

// ── Helpers ───────────────────────────────────────────────────
function formatKg(kg: number) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

const QUALITY_CFG: Record<FishQuality, { label: string; color: string; bg: string }> = {
  baik:   { label: "Baik",   color: "#00e676", bg: "rgba(0,230,118,0.12)"  },
  sedang: { label: "Sedang", color: "#ffc107", bg: "rgba(255,193,7,0.12)"  },
  buruk:  { label: "Buruk",  color: "#f44336", bg: "rgba(244,67,54,0.12)"  },
};

// ── Skeleton ──────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: "var(--radius-md)",
      padding: "14px", border: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      {([["60%","14px"],["80%","11px"],["40%","11px"]] as [string,string][]).map(([w, h], i) => (
        <div key={i} style={{
          width: w, height: h, borderRadius: "4px",
          backgroundImage: "linear-gradient(90deg, #172110 25%, #1e2d18 50%, #172110 75%)",
          backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
        }} />
      ))}
    </div>
  );
}

// ── FIFO Rank Badge ───────────────────────────────────────────
function FifoRank({ rank }: { rank: number }) {
  const isTop  = rank === 1;
  const isTop3 = rank <= 3;
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
      background: isTop ? "var(--warn-orange)" : isTop3 ? "rgba(255,109,0,0.2)" : "var(--bg-elevated)",
      border: `1px solid ${isTop ? "var(--warn-orange)" : isTop3 ? "rgba(255,109,0,0.4)" : "var(--border-subtle)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)",
      color: isTop ? "#fff" : isTop3 ? "var(--warn-orange)" : "var(--text-muted)",
    }}>
      {rank}
    </div>
  );
}

// ── Stock Card ────────────────────────────────────────────────
function StockCard({ batch, rank, onStockOut }: {
  batch: StockBatch; rank: number; onStockOut: (batch: StockBatch) => void;
}) {
  const qCfg    = QUALITY_CFG[batch.quality];
  const days    = daysSince(batch.entered_at);
  const pctLeft = batch.initial_weight_kg > 0
    ? (batch.remaining_weight_kg / batch.initial_weight_kg) * 100
    : 0;
  const isUrgent = batch.quality === "buruk" || days >= 3;

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${isUrgent ? "rgba(244,67,54,0.25)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-md)",
      padding: "14px",
      animation: "fadeUp 0.35s ease both",
      position: "relative", overflow: "hidden",
    }}>
      {isUrgent && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
          background: "linear-gradient(180deg, #f44336, #ff6d00)",
        }} />
      )}

      {/* Row atas */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
        <FifoRank rank={rank} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              {batch.fish_type?.name ?? "—"}
            </span>
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "5px",
              background: qCfg.bg, color: qCfg.color,
            }}>
              {qCfg.label}
            </span>
            {isUrgent && (
              <span style={{
                fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "5px",
                background: "rgba(244,67,54,0.12)", color: "#f44336",
              }}>
                ⚡ Prioritas
              </span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
            ❄️ {batch.cold_storage?.name} · {batch.cold_storage?.location_label}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div style={{
            fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)",
            color: pctLeft > 50 ? "var(--accent-primary)" : pctLeft > 20 ? "#ffc107" : "#f44336",
          }}>
            {formatKg(batch.remaining_weight_kg)}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            dari {formatKg(batch.initial_weight_kg)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: "4px", background: "var(--bg-elevated)", borderRadius: "2px",
        overflow: "hidden", marginBottom: "10px",
      }}>
        <div style={{
          width: `${pctLeft}%`, height: "100%", borderRadius: "2px",
          background: pctLeft > 50 ? "var(--accent-primary)" : pctLeft > 20 ? "#ffc107" : "#f44336",
          transition: "width 0.6s ease",
        }} />
      </div>

      {/* Row bawah */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          📅 {formatDate(batch.entered_at)} {formatTime(batch.entered_at)}
          <span style={{
            marginLeft: "6px", fontSize: "10px",
            color: days >= 3 ? "#f44336" : days >= 1 ? "#ffc107" : "var(--text-muted)",
          }}>
            ({days === 0 ? "hari ini" : `${days} hari lalu`})
          </span>
        </div>
        <button
          onClick={() => onStockOut(batch)}
          style={{
            background: "var(--warn-orange)", border: "none",
            borderRadius: "8px", padding: "6px 12px",
            fontSize: "11px", fontWeight: 700, color: "#fff",
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          Keluarkan ↑
        </button>
      </div>
    </div>
  );
}

// ── Filter Chip ───────────────────────────────────────────────
function FilterChip({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--accent-glow)" : "var(--bg-card)",
        border: `1.5px solid ${active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        borderRadius: "20px", padding: "6px 14px", whiteSpace: "nowrap",
        fontSize: "12px", fontWeight: active ? 600 : 400,
        color: active ? "var(--accent-primary)" : "var(--text-muted)",
        cursor: "pointer", fontFamily: "var(--font-body)",
        transition: "all 0.15s ease", flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function StocksPage() {
  const router = useRouter();

  const [batches,    setBatches]    = useState<StockBatch[]>([]);
  const [fishTypes,  setFishTypes]  = useState<FishType[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [filterFish, setFilterFish] = useState<string | null>(null);

  const load = useCallback(async (fishTypeId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [batchRes, fishRes] = await Promise.all([
        api.stocks.listFIFO(fishTypeId),
        api.fishTypes.list(),
      ]);
      setBatches(batchRes.data);
      setFishTypes(fishRes.data);
    } catch {
      setError("Gagal memuat stok. Coba refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filterFish ?? undefined); }, [filterFish, load]);

  const handleStockOut = (batch: StockBatch) => {
    router.push(
      `/stock-outs/new?batch_id=${batch.id}&fish=${encodeURIComponent(batch.fish_type?.name ?? "")}&kg=${batch.remaining_weight_kg}`
    );
  };

  const totalKg     = batches.reduce((s, b) => s + b.remaining_weight_kg, 0);
  const urgentCount = batches.filter(b => b.quality === "buruk" || daysSince(b.entered_at) >= 3).length;

  return (
    <MobileLayout
      title="Daftar Stok"
      headerRight={
        <button
          onClick={() => router.push("/stocks/new")}
          style={{
            background: "var(--accent-primary)", border: "none",
            borderRadius: "8px", width: "32px", height: "32px",
            cursor: "pointer", color: "var(--bg-primary)",
            fontSize: "20px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          +
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
      `}</style>

      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* Summary bar */}
        {!loading && (
          <div style={{
            padding: "12px 16px",
            display: "flex", gap: "10px", alignItems: "center",
            borderBottom: "1px solid var(--border-subtle)",
            animation: "fadeUp 0.3s ease both",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total stok tersedia</div>
              <div style={{
                fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)",
                color: "var(--accent-primary)", lineHeight: 1.2,
              }}>
                {formatKg(totalKg)}
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "right" }}>
              <div>{batches.length} batch</div>
              {urgentCount > 0 && (
                <div style={{ color: "#f44336", fontWeight: 600, marginTop: "2px" }}>
                  ⚡ {urgentCount} prioritas
                </div>
              )}
            </div>
          </div>
        )}

        {/* FIFO label */}
        <div style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            fontSize: "10px", background: "var(--accent-glow)",
            color: "var(--accent-primary)", border: "1px solid var(--border-active)",
            borderRadius: "5px", padding: "2px 7px", fontWeight: 700, letterSpacing: "0.06em",
          }}>
            FIFO
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Diurutkan dari yang paling lama masuk
          </span>
        </div>

        {/* Filter chips */}
        <div style={{
          display: "flex", gap: "8px", overflowX: "auto",
          padding: "0 16px 12px", scrollbarWidth: "none",
        }}>
          <FilterChip label="Semua" active={filterFish === null} onClick={() => setFilterFish(null)} />
          {fishTypes.map(ft => (
            <FilterChip
              key={ft.id} label={ft.name}
              active={filterFish === ft.id}
              onClick={() => setFilterFish(ft.id)}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            margin: "0 16px 12px",
            background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
            borderRadius: "var(--radius-sm)", padding: "10px 12px",
            fontSize: "12px", color: "#f44336",
          }}>
            {error}
          </div>
        )}

        {/* Daftar batch */}
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading ? (
            [1,2,3].map(i => <CardSkeleton key={i} />)
          ) : batches.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 0",
              color: "var(--text-muted)", fontSize: "13px",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📦</div>
              {filterFish ? "Tidak ada stok untuk jenis ikan ini." : "Belum ada stok. Tambah stok masuk dulu!"}
              <div style={{ marginTop: "16px" }}>
                <button
                  onClick={() => router.push("/stocks/new")}
                  style={{
                    background: "var(--accent-primary)", border: "none",
                    borderRadius: "var(--radius-md)", padding: "12px 24px",
                    fontSize: "13px", fontWeight: 700, color: "var(--bg-primary)", cursor: "pointer",
                  }}
                >
                  + Tambah Stok
                </button>
              </div>
            </div>
          ) : (
            batches.map((batch, idx) => (
              <StockCard key={batch.id} batch={batch} rank={idx + 1} onStockOut={handleStockOut} />
            ))
          )}
        </div>

        <div style={{ height: "16px" }} />
      </div>
    </MobileLayout>
  );
}
