"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { api } from "@/lib/api";
import type { StockBatch, FishType, CreateStockOutPayload } from "@/types/api";

function formatKg(kg: number) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

const DESTINATION_PRESETS = ["Restoran Daeng Syamsul", "Pasar Sentral Makassar", "Pembeli Langsung", "Ekspor / Pihak Lain"];

function SkeletonCard() {
  return (
    <div style={{
      height: "80px", borderRadius: "var(--radius-md)",
      backgroundImage: "linear-gradient(90deg, #172110 25%, #1e2d18 50%, #172110 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

function BatchCard({ batch, selected, onToggle, inputKg, onKgChange }: {
  batch: StockBatch; selected: boolean;
  onToggle: () => void; inputKg: string; onKgChange: (v: string) => void;
}) {
  const days = daysSince(batch.entered_at);
  const isOld = days >= 3;
  const isOver = inputKg !== "" && parseFloat(inputKg) > batch.remaining_weight_kg;

  return (
    <div style={{
      background: selected ? "rgba(255,109,0,0.06)" : "var(--bg-card)",
      border: `2px solid ${selected ? "var(--warn-orange)" : isOld ? "rgba(244,67,54,0.2)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-md)", overflow: "hidden",
      transition: "all 0.2s ease", animation: "fadeUp 0.3s ease both",
      boxShadow: selected ? "0 0 20px rgba(255,109,0,0.1)" : "none",
    }}>
      <button onClick={onToggle} style={{
        width: "100%", background: "none", border: "none",
        padding: "14px", cursor: "pointer", textAlign: "left",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width: "24px", height: "24px", borderRadius: "7px", flexShrink: 0,
          background: selected ? "var(--warn-orange)" : "var(--bg-elevated)",
          border: `2px solid ${selected ? "var(--warn-orange)" : "var(--border-subtle)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", color: "#fff", fontWeight: 800, transition: "all 0.15s ease",
        }}>
          {selected ? "✓" : ""}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: selected ? "var(--warn-orange)" : "var(--text-primary)", transition: "color 0.2s ease" }}>
              {batch.fish_type?.name ?? "—"}
            </span>
            {isOld && (
              <span style={{ fontSize: "9px", background: "rgba(244,67,54,0.12)", color: "#f44336", padding: "2px 6px", borderRadius: "4px", fontWeight: 700, letterSpacing: "0.04em" }}>
                ⚡ FIFO
              </span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            ❄️ {batch.cold_storage?.name} · masuk {formatDate(batch.entered_at)}
            {days > 0 && <span style={{ color: isOld ? "#f44336" : "#ffc107", marginLeft: "4px" }}>({days}h lalu)</span>}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>{formatKg(batch.remaining_weight_kg)}</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>tersedia</div>
        </div>
      </button>

      {selected && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(255,109,0,0.15)", animation: "fadeUp 0.2s ease both" }}>
          <div style={{ fontSize: "10px", color: "var(--warn-orange)", marginBottom: "8px", marginTop: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Jumlah yang dikeluarkan
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-elevated)",
            borderRadius: "10px", border: `1.5px solid ${isOver ? "#f44336" : "rgba(255,109,0,0.3)"}`,
            padding: "4px 14px", transition: "border-color 0.2s ease",
          }}>
            <input type="number" inputMode="decimal" placeholder="0" value={inputKg}
              onChange={(e) => onKgChange(e.target.value)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)",
                color: isOver ? "#f44336" : inputKg ? "var(--warn-orange)" : "var(--text-muted)",
                padding: "8px 0", transition: "color 0.2s ease",
              }} />
            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>/ {formatKg(batch.remaining_weight_kg)}</span>
          </div>
          {isOver && <div style={{ fontSize: "11px", color: "#f44336", marginTop: "5px" }}>⚠ Melebihi stok tersedia</div>}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            {[25, 50, 75, 100].map(pct => {
              const val = Math.round(batch.remaining_weight_kg * pct / 100);
              const isActive = inputKg === String(val);
              return (
                <button key={pct} onClick={() => onKgChange(String(val))} style={{
                  flex: 1, background: isActive ? "rgba(255,109,0,0.12)" : "var(--bg-card)",
                  border: `1px solid ${isActive ? "var(--warn-orange)" : "var(--border-subtle)"}`,
                  borderRadius: "6px", padding: "7px 4px", fontSize: "11px", fontWeight: 600,
                  color: isActive ? "var(--warn-orange)" : "var(--text-muted)", cursor: "pointer",
                  fontFamily: "var(--font-mono)", transition: "all 0.15s ease",
                }}>
                  {pct === 100 ? "Semua" : `${pct}%`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SuccessScreen({ totalKg, destination, onBack, onViewHistory }: {
  totalKg: number; destination: string; onBack: () => void; onViewHistory: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "32px 24px", gap: "20px", animation: "fadeUp 0.4s ease both", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,109,0,0.12)", border: "2px solid var(--warn-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", boxShadow: "0 0 40px rgba(255,109,0,0.2)", animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>✓</div>
      <div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Pengeluaran Berhasil!</div>
        <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--warn-orange)", fontWeight: 700 }}>{formatKg(totalKg)}</span> ikan keluar ke <span style={{ color: "var(--text-secondary)" }}>{destination}</span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Stok dan dashboard sudah diperbarui</div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
        <button onClick={onViewHistory} style={{ width: "100%", minHeight: "54px", borderRadius: "var(--radius-md)", background: "var(--warn-orange)", border: "none", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 4px 20px rgba(255,109,0,0.25)" }}>Lihat Riwayat Keluar</button>
        <button onClick={onBack} style={{ width: "100%", minHeight: "54px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>Kembali ke Stok</button>
      </div>
    </div>
  );
}

function StockOutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillBatchId = searchParams.get("batch_id");

  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [fishTypes, setFishTypes] = useState<FishType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterFish, setFilterFish] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [batchRes, fishRes] = await Promise.all([api.stocks.listFIFO(), api.fishTypes.list()]);
        setBatches(batchRes.data);
        setFishTypes(fishRes.data);
        if (prefillBatchId) {
          const found = batchRes.data.find(b => b.id === prefillBatchId);
          if (found) { setSelections({ [prefillBatchId]: String(found.remaining_weight_kg) }); setFilterFish(found.fish_type_id); }
        }
      } catch { setError("Gagal memuat data stok."); }
      finally { setLoading(false); }
    }
    load();
  }, [prefillBatchId]);

  const filteredBatches = filterFish ? batches.filter(b => b.fish_type_id === filterFish) : batches;
  const selectedItems = Object.entries(selections).filter(([, kg]) => { const n = parseFloat(kg); return !isNaN(n) && n > 0; });
  const isOverLimit = Object.entries(selections).some(([id, kg]) => { const batch = batches.find(b => b.id === id); return batch && parseFloat(kg) > batch.remaining_weight_kg; });
  const totalOut = selectedItems.reduce((s, [, kg]) => s + parseFloat(kg), 0);
  const canSubmit = selectedItems.length > 0 && destination.trim() !== "" && !isOverLimit && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError(null);
    try {
      const payload: CreateStockOutPayload = { destination: destination.trim(), notes: notes.trim() || undefined, items: selectedItems.map(([id, kg]) => ({ stock_batch_id: id, weight_kg: parseFloat(kg) })) };
      await api.stockOuts.create(payload);
      setSuccess(true);
    } catch { setError("Gagal menyimpan pengeluaran. Coba lagi."); }
    finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <MobileLayout title="Stok Keluar">
        <style href="stock-out-anim" precedence="default">{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          @keyframes popIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        `}</style>
        <SuccessScreen totalKg={totalOut} destination={destination} onBack={() => router.push("/stocks")} onViewHistory={() => router.push("/stock-outs")} />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Stok Keluar" headerLeft={
      <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "22px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>‹</button>
    }>
      <style href="stock-out-styles" precedence="default">{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        @keyframes popIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
        textarea::placeholder, input::placeholder { color:var(--text-muted); }
      `}</style>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {error && <div style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: "12px", color: "#f44336" }}>{error}</div>}

        <div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Ikan ini mau ke mana?</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>Pilih atau ketik tujuan pengeluaran</div>
          <div style={{ background: "var(--bg-card)", border: `1.5px solid ${destination ? "var(--warn-orange)" : "var(--border-subtle)"}`, borderRadius: "var(--radius-md)", padding: "4px 14px", display: "flex", alignItems: "center", transition: "border-color 0.2s ease" }}>
            <input type="text" placeholder="Contoh: Restoran Daeng Syamsul" value={destination} onChange={(e) => setDestination(e.target.value)} style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-body)", padding: "13px 0" }} />
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
            {DESTINATION_PRESETS.map(d => (
              <button key={d} onClick={() => setDestination(d)} style={{ background: destination === d ? "rgba(255,109,0,0.1)" : "var(--bg-elevated)", border: `1px solid ${destination === d ? "var(--warn-orange)" : "var(--border-subtle)"}`, borderRadius: "6px", padding: "6px 10px", fontSize: "11px", color: destination === d ? "var(--warn-orange)" : "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.15s ease" }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Stok mana yang keluar?</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>Urutan FIFO — yang paling lama masuk di atas</div>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginBottom: "10px", scrollbarWidth: "none", paddingBottom: "2px" }}>
            {[{ id: null, name: "Semua" }, ...fishTypes.map(ft => ({ id: ft.id, name: ft.name }))].map(ft => (
              <button key={ft.id ?? "all"} onClick={() => setFilterFish(ft.id)} style={{ background: filterFish === ft.id ? "var(--accent-glow)" : "var(--bg-card)", border: `1px solid ${filterFish === ft.id ? "var(--accent-primary)" : "var(--border-subtle)"}`, borderRadius: "16px", padding: "5px 14px", whiteSpace: "nowrap", fontSize: "11px", color: filterFish === ft.id ? "var(--accent-primary)" : "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-body)", flexShrink: 0, transition: "all 0.15s ease" }}>
                {ft.name}
              </button>
            ))}
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : filteredBatches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "12px", background: "var(--bg-card)", borderRadius: "var(--radius-md)" }}>Tidak ada stok tersedia</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredBatches.map(batch => (
                <BatchCard key={batch.id} batch={batch} selected={selections[batch.id] !== undefined}
                  onToggle={() => { setSelections(prev => { const next = { ...prev }; if (next[batch.id] !== undefined) delete next[batch.id]; else next[batch.id] = ""; return next; }); }}
                  inputKg={selections[batch.id] ?? ""}
                  onKgChange={(v) => setSelections(prev => ({ ...prev, [batch.id]: v }))} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: "8px" }}>Catatan (opsional)</div>
          <textarea placeholder="Contoh: bayar tunai, antar jam 14.00..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "12px 14px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body)", resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
        </div>

        {selectedItems.length > 0 && (
          <div style={{ background: "rgba(255,109,0,0.06)", border: "1px solid rgba(255,109,0,0.2)", borderRadius: "var(--radius-md)", padding: "14px", animation: "fadeUp 0.2s ease both" }}>
            <div style={{ fontSize: "10px", color: "var(--warn-orange)", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ringkasan Pengeluaran</div>
            {selectedItems.map(([id, kg]) => { const batch = batches.find(b => b.id === id); return (<div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}><span>{batch?.fish_type?.name ?? id}</span><span style={{ fontFamily: "var(--font-mono)", color: "var(--warn-orange)" }}>{formatKg(parseFloat(kg))}</span></div>); })}
            <div style={{ borderTop: "1px solid rgba(255,109,0,0.2)", paddingTop: "8px", marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Total keluar</span>
              <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--warn-orange)" }}>{formatKg(totalOut)}</span>
            </div>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!canSubmit} style={{ width: "100%", minHeight: "56px", borderRadius: "var(--radius-md)", background: canSubmit ? "var(--warn-orange)" : "var(--bg-elevated)", border: `1.5px solid ${canSubmit ? "var(--warn-orange)" : "var(--border-subtle)"}`, color: canSubmit ? "#fff" : "var(--text-muted)", fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-body)", cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s ease", boxShadow: canSubmit ? "0 4px 20px rgba(255,109,0,0.25)" : "none", marginBottom: "8px" }}>
          {submitting ? "Menyimpan..." : `↑ Simpan Pengeluaran${totalOut > 0 ? ` · ${formatKg(totalOut)}` : ""}`}
        </button>
      </div>
    </MobileLayout>
  );
}

export default function StockOutNewPage() {
  return (
    <Suspense fallback={<MobileLayout title="Stok Keluar"><div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>Memuat...</div></MobileLayout>}>
      <StockOutForm />
    </Suspense>
  );
}
