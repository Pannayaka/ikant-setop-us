"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { api } from "@/lib/api";
import type { FishType, ColdStorage, FishQuality, CreateStockBatchPayload } from "@/types/api";

type Step = 1 | 2 | 3 | 4;

const QUALITY_OPTIONS: {
  value: FishQuality; label: string; desc: string;
  color: string; bg: string; emoji: string;
}[] = [
  { value: "baik",   label: "Baik",   desc: "Segar, tidak berbau, sisik utuh",    color: "#00e676", bg: "rgba(0,230,118,0.1)",  emoji: "🟢" },
  { value: "sedang", label: "Sedang", desc: "Sedikit berbau, masih layak jual",   color: "#ffc107", bg: "rgba(255,193,7,0.1)",  emoji: "🟡" },
  { value: "buruk",  label: "Buruk",  desc: "Bau menyengat, perlu segera dijual", color: "#f44336", bg: "rgba(244,67,54,0.1)",  emoji: "🔴" },
];

const WEIGHT_PRESETS = [25, 50, 100, 150, 200, 300];
const STEP_META = [
  { label: "Jenis",    icon: "🐟" },
  { label: "Kualitas", icon: "⭐" },
  { label: "Lokasi",   icon: "❄️" },
  { label: "Berat",    icon: "⚖️" },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center" }}>
      {STEP_META.map((meta, i) => {
        const idx = (i + 1) as Step;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={meta.label} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? "16px" : "13px", fontWeight: 800, fontFamily: "var(--font-mono)",
                background: done ? "var(--accent-primary)" : active ? "rgba(0,230,118,0.15)" : "var(--bg-elevated)",
                border: `2px solid ${done ? "var(--accent-primary)" : active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                color: done ? "var(--bg-primary)" : active ? "var(--accent-primary)" : "var(--text-muted)",
                boxShadow: active ? "0 0 16px rgba(0,230,118,0.3)" : "none",
                transition: "all 0.3s ease",
              }}>
                {done ? "✓" : active ? meta.icon : idx}
              </div>
              <span style={{
                fontSize: "9px", letterSpacing: "0.06em", textTransform: "uppercase",
                fontWeight: active ? 700 : 400,
                color: active ? "var(--accent-primary)" : done ? "var(--text-secondary)" : "var(--text-muted)",
                transition: "color 0.3s ease",
              }}>
                {meta.label}
              </span>
            </div>
            {i < 3 && (
              <div style={{
                flex: 1, height: "2px", margin: "0 6px", marginBottom: "22px",
                background: done ? "var(--accent-primary)" : "var(--border-subtle)",
                transition: "background 0.4s ease", borderRadius: "1px",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonCard({ height = "80px" }: { height?: string }) {
  return (
    <div style={{
      height, borderRadius: "var(--radius-md)",
      backgroundImage: "linear-gradient(90deg, #172110 25%, #1e2d18 50%, #172110 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

function StepFishType({ fishTypes, selected, onSelect, loading }: {
  fishTypes: FishType[]; selected: string | null;
  onSelect: (id: string) => void; loading: boolean;
}) {
  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Ikan apa yang masuk?</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>Pilih jenis ikan yang baru dibongkar</div>
      </div>
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} height="96px" />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {fishTypes.map((ft, i) => {
            const isSelected = selected === ft.id;
            return (
              <button key={ft.id} onClick={() => onSelect(ft.id)} style={{
                background: isSelected ? "rgba(0,230,118,0.1)" : "var(--bg-card)",
                border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-md)", padding: "18px 12px 14px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                transition: "all 0.2s ease",
                transform: isSelected ? "scale(0.96)" : "scale(1)",
                boxShadow: isSelected ? "0 0 20px rgba(0,230,118,0.15)" : "none",
                animationDelay: `${i * 0.05}s`, animation: "fadeUp 0.3s ease both",
              }}>
                <span style={{ fontSize: "30px", lineHeight: 1 }}>🐟</span>
                <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "var(--accent-primary)" : "var(--text-primary)" }}>
                  {ft.name}
                </span>
                {isSelected && (
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "var(--bg-primary)", fontWeight: 800,
                  }}>✓</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepQuality({ selected, onSelect }: {
  selected: FishQuality | null; onSelect: (q: FishQuality) => void;
}) {
  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Bagaimana kondisinya?</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>Nilai kualitas ikan sesuai kondisi lapangan</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {QUALITY_OPTIONS.map((opt, i) => {
          const isSelected = selected === opt.value;
          return (
            <button key={opt.value} onClick={() => onSelect(opt.value)} style={{
              background: isSelected ? opt.bg : "var(--bg-card)",
              border: `2px solid ${isSelected ? opt.color : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-md)", padding: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "14px",
              transition: "all 0.2s ease", transform: isSelected ? "scale(0.98)" : "scale(1)",
              boxShadow: isSelected ? `0 0 20px ${opt.color}20` : "none",
              textAlign: "left", animationDelay: `${i * 0.07}s`, animation: "fadeUp 0.3s ease both",
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                background: isSelected ? `${opt.color}20` : "var(--bg-elevated)",
                border: `1px solid ${isSelected ? opt.color : "var(--border-subtle)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", transition: "all 0.2s ease",
              }}>{opt.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: isSelected ? opt.color : "var(--text-primary)", transition: "color 0.2s ease" }}>{opt.label}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                background: isSelected ? opt.color : "var(--bg-elevated)",
                border: `2px solid ${isSelected ? opt.color : "var(--border-subtle)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", color: isSelected ? "var(--bg-primary)" : "transparent",
                fontWeight: 800, transition: "all 0.2s ease",
              }}>✓</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepColdStorage({ storages, selected, onSelect, loading }: {
  storages: ColdStorage[]; selected: string | null;
  onSelect: (id: string) => void; loading: boolean;
}) {
  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Simpan di mana?</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>Pilih lokasi cold storage tujuan</div>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1,2,3].map(i => <SkeletonCard key={i} height="76px" />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {storages.map((cs, i) => {
            const isSelected = selected === cs.id;
            return (
              <button key={cs.id} onClick={() => onSelect(cs.id)} style={{
                background: isSelected ? "rgba(0,230,118,0.08)" : "var(--bg-card)",
                border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-md)", padding: "14px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "14px",
                transition: "all 0.2s ease", transform: isSelected ? "scale(0.98)" : "scale(1)",
                boxShadow: isSelected ? "0 0 20px rgba(0,230,118,0.12)" : "none",
                textAlign: "left", animationDelay: `${i * 0.07}s`, animation: "fadeUp 0.3s ease both",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                  background: isSelected ? "rgba(0,230,118,0.15)" : "var(--bg-elevated)",
                  border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", transition: "all 0.2s ease",
                }}>❄️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: isSelected ? "var(--accent-primary)" : "var(--text-primary)", transition: "color 0.2s ease" }}>{cs.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {cs.location_label}</div>
                </div>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                  background: isSelected ? "var(--accent-primary)" : "var(--bg-elevated)",
                  border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", color: isSelected ? "var(--bg-primary)" : "transparent",
                  fontWeight: 800, transition: "all 0.2s ease",
                }}>✓</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepWeight({ weight, onWeightChange, notes, onNotesChange, fishType, quality, coldStorage }: {
  weight: string; onWeightChange: (v: string) => void;
  notes: string; onNotesChange: (v: string) => void;
  fishType: FishType | undefined; quality: FishQuality | null; coldStorage: ColdStorage | undefined;
}) {
  const qualityCfg = QUALITY_OPTIONS.find(q => q.value === quality);
  const isValid = !isNaN(parseFloat(weight)) && parseFloat(weight) > 0;
  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Berapa beratnya?</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>Masukkan berat ikan dalam kilogram</div>
      </div>
      {/* Ringkasan */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: "16px", display: "flex", gap: "0" }}>
        {[
          { icon: "🐟", label: fishType?.name ?? "—" },
          { icon: qualityCfg?.emoji ?? "—", label: qualityCfg?.label ?? "—", color: qualityCfg?.color },
          { icon: "❄️", label: coldStorage?.name ?? "—" },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", borderRight: i < 2 ? "1px solid var(--border-subtle)" : "none", padding: "0 8px" }}>
            <span style={{ fontSize: "16px" }}>{item.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: 600, textAlign: "center", color: item.color ?? "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{item.label}</span>
          </div>
        ))}
      </div>
      {/* Input besar */}
      <div style={{
        background: "var(--bg-card)", border: `2px solid ${isValid ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-md)", padding: "8px 20px", marginBottom: "12px",
        display: "flex", alignItems: "center", gap: "8px",
        boxShadow: isValid ? "0 0 24px rgba(0,230,118,0.12)" : "none", transition: "all 0.2s ease",
      }}>
        <input type="number" inputMode="decimal" placeholder="0" value={weight}
          onChange={(e) => onWeightChange(e.target.value)} autoFocus
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: "48px", fontWeight: 800, fontFamily: "var(--font-mono)",
            color: isValid ? "var(--accent-primary)" : "var(--text-muted)",
            padding: "8px 0", lineHeight: 1, transition: "color 0.2s ease",
          }} />
        <span style={{ fontSize: "20px", color: isValid ? "var(--accent-primary)" : "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600, opacity: 0.7 }}>kg</span>
      </div>
      {/* Presets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
        {WEIGHT_PRESETS.map((preset) => {
          const isActive = weight === String(preset);
          return (
            <button key={preset} onClick={() => onWeightChange(String(preset))} style={{
              background: isActive ? "rgba(0,230,118,0.1)" : "var(--bg-elevated)",
              border: `1.5px solid ${isActive ? "var(--accent-primary)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)", color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
              fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-mono)",
              padding: "14px 8px", cursor: "pointer", transition: "all 0.15s ease",
              transform: isActive ? "scale(0.96)" : "scale(1)",
            }}>
              {preset} <span style={{ fontSize: "10px", opacity: 0.7 }}>kg</span>
            </button>
          );
        })}
      </div>
      {/* Catatan */}
      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: "8px" }}>Catatan (opsional)</div>
      <textarea placeholder="Contoh: dari KM Sejahtera, muatan pagi..." value={notes}
        onChange={(e) => onNotesChange(e.target.value)} rows={3}
        style={{
          width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)", padding: "12px 14px", color: "var(--text-primary)",
          fontSize: "13px", fontFamily: "var(--font-body)", resize: "none", outline: "none",
          boxSizing: "border-box", lineHeight: 1.5,
        }} />
    </div>
  );
}

function SuccessScreen({ fishName, weightKg, storageName, onAddMore, onViewStock }: {
  fishName: string; weightKg: number; storageName: string;
  onAddMore: () => void; onViewStock: () => void;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", padding: "32px 24px", gap: "20px",
      animation: "fadeUp 0.4s ease both", textAlign: "center",
    }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: "rgba(0,230,118,0.12)", border: "2px solid var(--accent-primary)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px",
        boxShadow: "0 0 40px rgba(0,230,118,0.2)",
        animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>✓</div>
      <div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Stok Berhasil Dicatat!</div>
        <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{weightKg} kg</span> {fishName} masuk ke{" "}
          <span style={{ color: "var(--text-secondary)" }}>{storageName}</span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Dashboard dan daftar stok sudah diperbarui</div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
        <button onClick={onAddMore} style={{
          width: "100%", minHeight: "54px", borderRadius: "var(--radius-md)",
          background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)",
          fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)",
          boxShadow: "0 4px 20px rgba(0,230,118,0.25)",
        }}>+ Tambah Stok Lagi</button>
        <button onClick={onViewStock} style={{
          width: "100%", minHeight: "54px", borderRadius: "var(--radius-md)",
          background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)", fontSize: "15px", fontWeight: 600,
          cursor: "pointer", fontFamily: "var(--font-body)",
        }}>Lihat Daftar Stok</button>
      </div>
    </div>
  );
}

export default function StocksNewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fishTypes, setFishTypes] = useState<FishType[]>([]);
  const [storages, setStorages] = useState<ColdStorage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFish, setSelectedFish] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<FishQuality | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [fishRes, storageRes] = await Promise.all([api.fishTypes.list(), api.coldStorages.list()]);
        setFishTypes(fishRes.data);
        setStorages(storageRes.data);
      } catch { setError("Gagal memuat data. Coba refresh."); }
      finally { setLoadingData(false); }
    }
    load();
  }, []);

  const selectedFishType = fishTypes.find(f => f.id === selectedFish);
  const selectedColdStorage = storages.find(s => s.id === selectedStorage);
  const weightNum = parseFloat(weight);
  const canSubmit = !isNaN(weightNum) && weightNum > 0 && !submitting;

  const handleFishSelect = (id: string) => { setSelectedFish(id); setTimeout(() => setStep(2), 300); };
  const handleQualitySelect = (q: FishQuality) => { setSelectedQuality(q); setTimeout(() => setStep(3), 300); };
  const handleStorageSelect = (id: string) => { setSelectedStorage(id); setTimeout(() => setStep(4), 300); };

  const handleSubmit = async () => {
    if (!selectedFish || !selectedQuality || !selectedStorage || !canSubmit) return;
    setSubmitting(true); setError(null);
    try {
      const payload: CreateStockBatchPayload = {
        fish_type_id: selectedFish, cold_storage_id: selectedStorage,
        quality: selectedQuality, initial_weight_kg: weightNum,
        notes: notes || undefined,
      };
      await api.stocks.create(payload);
      setSuccess(true);
    } catch { setError("Gagal menyimpan stok. Coba lagi."); }
    finally { setSubmitting(false); }
  };

  const handleReset = () => {
    setStep(1); setSelectedFish(null); setSelectedQuality(null);
    setSelectedStorage(null); setWeight(""); setNotes("");
    setSuccess(false); setError(null);
  };

  if (success) {
    return (
      <MobileLayout title="Stok Masuk">
        <style href="stocks-new-anim" precedence="default">{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          @keyframes popIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        `}</style>
        <SuccessScreen fishName={selectedFishType?.name ?? "Ikan"} weightKg={weightNum}
          storageName={selectedColdStorage?.name ?? ""} onAddMore={handleReset}
          onViewStock={() => router.push("/stocks")} />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Stok Masuk" headerLeft={
      step > 1 ? (
        <button onClick={() => setStep((step - 1) as Step)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-secondary)", fontSize: "22px",
          width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px",
        }}>‹</button>
      ) : null
    }>
      <style href="stocks-new-styles" precedence="default">{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        @keyframes popIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
        textarea::placeholder, input::placeholder { color:var(--text-muted); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <StepIndicator current={step} />
        {error && (
          <div style={{ margin: "0 16px 12px", background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: "12px", color: "#f44336" }}>
            {error}
          </div>
        )}
        {step === 1 && <StepFishType fishTypes={fishTypes} selected={selectedFish} onSelect={handleFishSelect} loading={loadingData} />}
        {step === 2 && <StepQuality selected={selectedQuality} onSelect={handleQualitySelect} />}
        {step === 3 && <StepColdStorage storages={storages} selected={selectedStorage} onSelect={handleStorageSelect} loading={loadingData} />}
        {step === 4 && (
          <StepWeight weight={weight} onWeightChange={setWeight} notes={notes} onNotesChange={setNotes}
            fishType={selectedFishType} quality={selectedQuality} coldStorage={selectedColdStorage} />
        )}
        {step === 4 && (
          <div style={{ padding: "16px" }}>
            <button onClick={handleSubmit} disabled={!canSubmit} style={{
              width: "100%", minHeight: "56px", borderRadius: "var(--radius-md)",
              background: canSubmit ? "var(--accent-primary)" : "var(--bg-elevated)",
              border: `1.5px solid ${canSubmit ? "var(--accent-primary)" : "var(--border-subtle)"}`,
              color: canSubmit ? "var(--bg-primary)" : "var(--text-muted)",
              fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-body)",
              cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s ease",
              boxShadow: canSubmit ? "0 4px 20px rgba(0,230,118,0.25)" : "none",
            }}>
              {submitting ? "Menyimpan..." : "✓ Simpan Stok Masuk"}
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
