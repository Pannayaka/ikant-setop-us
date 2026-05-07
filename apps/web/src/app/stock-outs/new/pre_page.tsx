"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { api } from "@/lib/api";
import type { StockBatch, FishType, CreateStockOutPayload } from "@/types/api";

// ── Helpers ───────────────────────────────────────────────────
function formatKg(kg: number) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

// ── Destination presets ───────────────────────────────────────
const DESTINATION_PRESETS = [
  "Restoran Daeng Syamsul",
  "Pasar Sentral Makassar",
  "Pembeli Langsung",
  "Ekspor / Pihak Lain",
];

// ── Big Button ────────────────────────────────────────────────
function BigButton({ onClick, disabled = false, variant = "primary", children }: {
  onClick: () => void; disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}) {
  const colors = {
    primary:   { bg: "var(--warn-orange)",      text: "#fff",                border: "var(--warn-orange)"        },
    secondary: { bg: "var(--bg-elevated)",       text: "var(--text-primary)", border: "var(--border-subtle)"      },
    danger:    { bg: "rgba(244,67,54,0.15)",     text: "#f44336",             border: "rgba(244,67,54,0.4)"       },
  };
  const c = colors[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", minHeight: "52px", borderRadius: "var(--radius-md)",
        background: disabled ? "var(--bg-elevated)" : c.bg,
        border: `1.5px solid ${disabled ? "var(--border-subtle)" : c.border}`,
        color: disabled ? "var(--text-muted)" : c.text,
        fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-body)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease", letterSpacing: "0.02em",
      }}
    >
      {children}
    </button>
  );
}

// ── Batch Selector Card ───────────────────────────────────────
function BatchCard({ batch, selected, onToggle, inputKg, onKgChange }: {
  batch: StockBatch; selected: boolean;
  onToggle: () => void;
  inputKg: string; onKgChange: (v: string) => void;
}) {
  const days    = daysSince(batch.entered_at);
  const isOld   = days >= 3;

  return (
    <div style={{
      background: selected ? "rgba(255,109,0,0.08)" : "var(--bg-card)",
      border: `2px solid ${selected ? "var(--warn-orange)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      transition: "all 0.2s ease",
      animation: "fadeUp 0.3s ease both",
    }}>
      {/* Header row — tap untuk pilih */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", background: "none", border: "none",
          padding: "12px 14px", cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: "10px",
        }}
      >
        {/* Checkbox visual */}
        <div style={{
          width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
          background: selected ? "var(--warn-orange)" : "var(--bg-elevated)",
          border: `2px solid ${selected ? "var(--warn-orange)" : "var(--border-subtle)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", color: "#fff", fontWeight: 700,
          transition: "all 0.15s ease",
        }}>
          {selected ? "✓" : ""}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {batch.fish_type?.name ?? "—"}
            </span>
            {isOld && (
              <span style={{
                fontSize: "9px", background: "rgba(244,67,54,0.15)",
                color: "#f44336", padding: "1px 5px", borderRadius: "4px", fontWeight: 600,
              }}>
                FIFO PRIORITAS
              </span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            ❄️ {batch.cold_storage?.name} · masuk {formatDate(batch.entered_at)}
            {days > 0 && (
              <span style={{ color: isOld ? "#f44336" : "#ffc107", marginLeft: "4px" }}>
                ({days} hari lalu)
              </span>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>
            {formatKg(batch.remaining_weight_kg)}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>tersedia</div>
        </div>
      </button>

      {/* Input berat — muncul kalau dipilih */}
      {selected && (
        <div style={{
          padding: "0 14px 12px",
          borderTop: "1px solid rgba(255,109,0,0.2)",
          animation: "fadeUp 0.2s ease both",
        }}>
          <div style={{ fontSize: "10px", color: "var(--warn-orange)", marginBottom: "6px", marginTop: "8px", fontWeight: 600 }}>
            Berapa kg yang dikeluarkan?
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "var(--bg-elevated)", borderRadius: "10px",
            border: "1px solid rgba(255,109,0,0.3)", padding: "4px 12px",
          }}>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={inputKg}
              onChange={(e) => onKgChange(e.target.value)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-mono)",
                color: inputKg ? "var(--warn-orange)" : "var(--text-muted)",
                padding: "8px 0",
              }}
            />
            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
              / {formatKg(batch.remaining_weight_kg)}
            </span>
          </div>
          {/* Preset: 25%, 50%, 75%, semua */}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            {[25, 50, 75, 100].map(pct => {
              const val = Math.round(batch.remaining_weight_kg * pct / 100);
              return (
                <button
                  key={pct}
                  onClick={() => onKgChange(String(val))}
                  style={{
                    flex: 1, background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px", padding: "6px 4px",
                    fontSize: "10px", fontWeight: 600,
                    color: "var(--text-secondary)", cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {pct === 100 ? "Semua" : `${pct}%`}
                </button>
              );
            })}
          </div>
          {/* Validasi */}
          {inputKg && parseFloat(inputKg) > batch.remaining_weight_kg && (
            <div style={{ fontSize: "11px", color: "#f44336", marginTop: "6px" }}>
              ⚠ Melebihi stok tersedia ({formatKg(batch.remaining_weight_kg)})
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────
function SuccessScreen({ totalKg, destination, onBack, onViewHistory }: {
  totalKg: number; destination: string;
  onBack: () => void; onViewHistory: () => void;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "48px 24px", gap: "16px",
      animation: "fadeUp 0.4s ease both", textAlign: "center",
    }}>
      <div style={{
        width: "72px", height: "72px", borderRadius: "50%",
        background: "rgba(255,109,0,0.15)", border: "2px solid var(--warn-orange)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "32px",
      }}>
        ✓
      </div>
      <div>
        <div style={{
          fontSize: "20px", fontWeight: 800, color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
        }}>
          Pengeluaran Berhasil!
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>
          <span style={{ color: "var(--warn-orange)", fontWeight: 700 }}>{formatKg(totalKg)}</span> ikan
          berhasil dicatat keluar ke <span style={{ color: "var(--text-primary)" }}>{destination}</span>.
          Stok dan dashboard sudah diperbarui.
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
        <BigButton onClick={onViewHistory} variant="primary">Lihat Riwayat Keluar</BigButton>
        <BigButton onClick={onBack} variant="secondary">Kembali ke Stok</BigButton>
      </div>
    </div>
  );
}

// ── Inner component (pakai useSearchParams) ───────────────────
function StockOutForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Prefill dari query string (kalau datang dari tombol "Keluarkan" di /stocks)
  const prefillBatchId = searchParams.get("batch_id");

  const [batches,     setBatches]     = useState<StockBatch[]>([]);
  const [fishTypes,   setFishTypes]   = useState<FishType[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [filterFish,  setFilterFish]  = useState<string | null>(null);

  // Pilihan: { batchId -> kg yang mau dikeluarkan }
  const [selections,  setSelections]  = useState<Record<string, string>>({});
  const [destination, setDestination] = useState("");
  const [notes,       setNotes]       = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [batchRes, fishRes] = await Promise.all([
          api.stocks.listFIFO(),
          api.fishTypes.list(),
        ]);
        setBatches(batchRes.data);
        setFishTypes(fishRes.data);

        // Auto-select batch dari query string
        if (prefillBatchId) {
          const found = batchRes.data.find(b => b.id === prefillBatchId);
          if (found) {
            setSelections({ [prefillBatchId]: String(found.remaining_weight_kg) });
            setFilterFish(found.fish_type_id);
          }
        }
      } catch {
        setError("Gagal memuat data stok.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [prefillBatchId]);

  const filteredBatches = filterFish
    ? batches.filter(b => b.fish_type_id === filterFish)
    : batches;

  const toggleBatch = (id: string) => {
    setSelections(prev => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        delete next[id];
      } else {
        next[id] = "";
      }
      return next;
    });
  };

  const setKg = (id: string, val: string) => {
    setSelections(prev => ({ ...prev, [id]: val }));
  };

  // Validasi
  const selectedItems = Object.entries(selections).filter(([, kg]) => {
    const n = parseFloat(kg);
    return !isNaN(n) && n > 0;
  });

  const isOverLimit = Object.entries(selections).some(([id, kg]) => {
    const batch = batches.find(b => b.id === id);
    return batch && parseFloat(kg) > batch.remaining_weight_kg;
  });

  const totalOut    = selectedItems.reduce((s, [, kg]) => s + parseFloat(kg), 0);
  const canSubmit   = selectedItems.length > 0 && destination.trim() !== "" && !isOverLimit && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateStockOutPayload = {
        destination: destination.trim(),
        notes: notes.trim() || undefined,
        items: selectedItems.map(([id, kg]) => ({
          stock_batch_id: id,
          weight_kg: parseFloat(kg),
        })),
      };
      await api.stockOuts.create(payload);
      setSuccess(true);
    } catch {
      setError("Gagal menyimpan pengeluaran. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <MobileLayout title="Stok Keluar">
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <SuccessScreen
          totalKg={totalOut}
          destination={destination}
          onBack={() => router.push("/stocks")}
          onViewHistory={() => router.push("/stock-outs")}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Stok Keluar"
      headerLeft={
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-secondary)", fontSize: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px",
          }}
        >
          ‹
        </button>
      }
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        textarea::placeholder, input::placeholder { color: var(--text-muted); }
      `}</style>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
            borderRadius: "var(--radius-sm)", padding: "10px 12px",
            fontSize: "12px", color: "#f44336",
          }}>
            {error}
          </div>
        )}

        {/* ── Bagian 1: Tujuan ── */}
        <div>
          <div style={{
            fontSize: "11px", color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            fontWeight: 600, marginBottom: "8px",
          }}>
            Tujuan Pengeluaran
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)", padding: "4px 14px",
            display: "flex", alignItems: "center",
          }}>
            <input
              type="text"
              placeholder="Ke mana ikan ini pergi?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: "14px", color: "var(--text-primary)",
                fontFamily: "var(--font-body)", padding: "12px 0",
              }}
            />
          </div>
          {/* Preset tujuan */}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
            {DESTINATION_PRESETS.map(d => (
              <button
                key={d}
                onClick={() => setDestination(d)}
                style={{
                  background: destination === d ? "rgba(255,109,0,0.1)" : "var(--bg-elevated)",
                  border: `1px solid ${destination === d ? "var(--warn-orange)" : "var(--border-subtle)"}`,
                  borderRadius: "6px", padding: "5px 10px",
                  fontSize: "11px", color: destination === d ? "var(--warn-orange)" : "var(--text-muted)",
                  cursor: "pointer", fontFamily: "var(--font-body)",
                  transition: "all 0.15s ease",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bagian 2: Pilih stok ── */}
        <div>
          <div style={{
            fontSize: "11px", color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            fontWeight: 600, marginBottom: "8px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>Pilih Stok yang Dikeluarkan</span>
            {selectedItems.length > 0 && (
              <span style={{ color: "var(--warn-orange)", fontWeight: 700, fontSize: "10px" }}>
                {selectedItems.length} dipilih · {formatKg(totalOut)}
              </span>
            )}
          </div>

          {/* Filter jenis ikan */}
          <div style={{
            display: "flex", gap: "6px", overflowX: "auto",
            marginBottom: "10px", scrollbarWidth: "none", paddingBottom: "2px",
          }}>
            <button
              onClick={() => setFilterFish(null)}
              style={{
                background: filterFish === null ? "var(--accent-glow)" : "var(--bg-card)",
                border: `1px solid ${filterFish === null ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                borderRadius: "16px", padding: "5px 12px", whiteSpace: "nowrap",
                fontSize: "11px", color: filterFish === null ? "var(--accent-primary)" : "var(--text-muted)",
                cursor: "pointer", fontFamily: "var(--font-body)", flexShrink: 0,
              }}
            >
              Semua
            </button>
            {fishTypes.map(ft => (
              <button
                key={ft.id}
                onClick={() => setFilterFish(ft.id)}
                style={{
                  background: filterFish === ft.id ? "var(--accent-glow)" : "var(--bg-card)",
                  border: `1px solid ${filterFish === ft.id ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                  borderRadius: "16px", padding: "5px 12px", whiteSpace: "nowrap",
                  fontSize: "11px", color: filterFish === ft.id ? "var(--accent-primary)" : "var(--text-muted)",
                  cursor: "pointer", fontFamily: "var(--font-body)", flexShrink: 0,
                }}
              >
                {ft.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: "72px", borderRadius: "var(--radius-md)", background: "var(--bg-card)",
                  backgroundImage: "linear-gradient(90deg, #172110 25%, #1e2d18 50%, #172110 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                }} />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "12px",
              background: "var(--bg-card)", borderRadius: "var(--radius-md)",
            }}>
              Tidak ada stok tersedia
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredBatches.map(batch => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  selected={selections[batch.id] !== undefined}
                  onToggle={() => toggleBatch(batch.id)}
                  inputKg={selections[batch.id] ?? ""}
                  onKgChange={(v) => setKg(batch.id, v)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Bagian 3: Catatan ── */}
        <div>
          <div style={{
            fontSize: "11px", color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            fontWeight: 600, marginBottom: "8px",
          }}>
            Catatan (opsional)
          </div>
          <textarea
            placeholder="Contoh: pembayaran tunai, antar jam 14.00..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{
              width: "100%", background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)", padding: "12px",
              color: "var(--text-primary)", fontSize: "13px",
              fontFamily: "var(--font-body)", resize: "none",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* ── Ringkasan + Submit ── */}
        {selectedItems.length > 0 && (
          <div style={{
            background: "rgba(255,109,0,0.06)",
            border: "1px solid rgba(255,109,0,0.2)",
            borderRadius: "var(--radius-md)", padding: "12px 14px",
            animation: "fadeUp 0.2s ease both",
          }}>
            <div style={{ fontSize: "10px", color: "var(--warn-orange)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Ringkasan Pengeluaran
            </div>
            {selectedItems.map(([id, kg]) => {
              const batch = batches.find(b => b.id === id);
              return (
                <div key={id} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "12px", color: "var(--text-secondary)", marginBottom: "3px",
                }}>
                  <span>{batch?.fish_type?.name ?? id}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--warn-orange)" }}>
                    {formatKg(parseFloat(kg))}
                  </span>
                </div>
              );
            })}
            <div style={{
              borderTop: "1px solid rgba(255,109,0,0.2)", paddingTop: "6px", marginTop: "6px",
              display: "flex", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                Total keluar
              </span>
              <span style={{ fontSize: "14px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--warn-orange)" }}>
                {formatKg(totalOut)}
              </span>
            </div>
          </div>
        )}

        <BigButton onClick={handleSubmit} disabled={!canSubmit} variant="primary">
          {submitting ? "Menyimpan..." : `↑ Simpan Pengeluaran${totalOut > 0 ? ` · ${formatKg(totalOut)}` : ""}`}
        </BigButton>

        <div style={{ height: "8px" }} />
      </div>
    </MobileLayout>
  );
}

// ── Page wrapper dengan Suspense (wajib karena useSearchParams) ─
export default function StockOutNewPage() {
  return (
    <Suspense fallback={
      <MobileLayout title="Stok Keluar">
        <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
          Memuat...
        </div>
      </MobileLayout>
    }>
      <StockOutForm />
    </Suspense>
  );
}
