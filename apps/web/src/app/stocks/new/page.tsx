"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { api } from "@/lib/api";
import type { FishType, ColdStorage, FishQuality, CreateStockBatchPayload } from "@/types/api";

// ── Types ─────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4; // jenis → kualitas → lokasi → berat+konfirmasi

// ── Helpers ──────────────────────────────────────────────────
const QUALITY_OPTIONS: { value: FishQuality; label: string; desc: string; color: string; emoji: string }[] = [
  { value: "baik",   label: "Baik",   desc: "Segar, tidak berbau, sisik utuh",     color: "#00e676", emoji: "🟢" },
  { value: "sedang", label: "Sedang", desc: "Sedikit berbau, masih layak jual",    color: "#ffc107", emoji: "🟡" },
  { value: "buruk",  label: "Buruk",  desc: "Bau menyengat, perlu segera dijual",  color: "#f44336", emoji: "🔴" },
];

const WEIGHT_PRESETS = [25, 50, 100, 150, 200, 250];

// ── Sub-components ────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps = ["Jenis", "Kualitas", "Lokasi", "Berat"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", padding: "0 16px 12px" }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done    = idx < current;
        const active  = idx === current;
        const pending = idx > current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: idx < steps.length ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-mono)",
                background: done ? "var(--accent-primary)" : active ? "var(--accent-glow)" : "var(--bg-elevated)",
                border: `2px solid ${done ? "var(--accent-primary)" : active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                color: done ? "var(--bg-primary)" : active ? "var(--accent-primary)" : "var(--text-muted)",
                transition: "all 0.3s ease",
              }}>
                {done ? "✓" : idx}
              </div>
              <span style={{
                fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                color: active ? "var(--accent-primary)" : done ? "var(--text-secondary)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400,
              }}>
                {label}
              </span>
            </div>
            {idx < steps.length && (
              <div style={{
                flex: 1, height: "2px", margin: "0 4px", marginBottom: "18px",
                background: done ? "var(--accent-primary)" : "var(--border-subtle)",
                transition: "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "11px", color: "var(--text-muted)",
      textTransform: "uppercase", letterSpacing: "0.08em",
      fontWeight: 600, marginBottom: "10px",
    }}>
      {children}
    </div>
  );
}

function BigButton({
  onClick, disabled = false, variant = "primary", children,
}: {
  onClick: () => void; disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}) {
  const colors = {
    primary:   { bg: "var(--accent-primary)",  text: "var(--bg-primary)",   border: "var(--accent-primary)" },
    secondary: { bg: "var(--bg-elevated)",      text: "var(--text-primary)", border: "var(--border-subtle)"  },
    danger:    { bg: "rgba(244,67,54,0.15)",    text: "#f44336",             border: "rgba(244,67,54,0.4)"   },
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
        transition: "all 0.15s ease",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </button>
  );
}

// ── STEP 1: Pilih Jenis Ikan ──────────────────────────────────
function StepFishType({
  fishTypes, selected, onSelect, loading,
}: {
  fishTypes: FishType[]; selected: string | null;
  onSelect: (id: string) => void; loading: boolean;
}) {
  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      <SectionTitle>Pilih Jenis Ikan</SectionTitle>
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              height: "80px", borderRadius: "var(--radius-md)",
              background: "var(--bg-card)",
              animation: "shimmer 1.4s infinite",
              backgroundImage: "linear-gradient(90deg, #172110 25%, #1e2d18 50%, #172110 75%)",
              backgroundSize: "200% 100%",
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {fishTypes.map((ft) => {
            const isSelected = selected === ft.id;
            return (
              <button
                key={ft.id}
                onClick={() => onSelect(ft.id)}
                style={{
                  background: isSelected ? "var(--accent-glow)" : "var(--bg-card)",
                  border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "16px 12px",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                  transition: "all 0.2s ease",
                  transform: isSelected ? "scale(0.97)" : "scale(1)",
                }}
              >
                <span style={{ fontSize: "28px" }}>🐟</span>
                <span style={{
                  fontSize: "13px", fontWeight: 600,
                  color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}>
                  {ft.name}
                </span>
                {isSelected && (
                  <span style={{ fontSize: "10px", color: "var(--accent-primary)" }}>✓ Dipilih</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── STEP 2: Pilih Kualitas ────────────────────────────────────
function StepQuality({
  selected, onSelect,
}: {
  selected: FishQuality | null; onSelect: (q: FishQuality) => void;
}) {
  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      <SectionTitle>Pilih Kualitas Ikan</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {QUALITY_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={{
                background: isSelected ? `${opt.color}12` : "var(--bg-card)",
                border: `2px solid ${isSelected ? opt.color : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-md)",
                padding: "16px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: "14px",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "24px", flexShrink: 0 }}>{opt.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "15px", fontWeight: 700,
                  color: isSelected ? opt.color : "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {opt.desc}
                </div>
              </div>
              {isSelected && (
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: opt.color, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", color: "var(--bg-primary)", fontWeight: 700,
                }}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── STEP 3: Pilih Cold Storage ────────────────────────────────
function StepColdStorage({
  storages, selected, onSelect, loading,
}: {
  storages: ColdStorage[]; selected: string | null;
  onSelect: (id: string) => void; loading: boolean;
}) {
  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      <SectionTitle>Pilih Lokasi Cold Storage</SectionTitle>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: "72px", borderRadius: "var(--radius-md)",
              background: "var(--bg-card)",
              animation: "shimmer 1.4s infinite",
              backgroundImage: "linear-gradient(90deg, #172110 25%, #1e2d18 50%, #172110 75%)",
              backgroundSize: "200% 100%",
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {storages.map((cs) => {
            const isSelected = selected === cs.id;
            return (
              <button
                key={cs.id}
                onClick={() => onSelect(cs.id)}
                style={{
                  background: isSelected ? "var(--accent-glow)" : "var(--bg-card)",
                  border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "12px",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                  background: isSelected ? "rgba(0,230,118,0.2)" : "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px",
                }}>
                  ❄️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "14px", fontWeight: 600,
                    color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                  }}>
                    {cs.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {cs.location_label}
                  </div>
                </div>
                {isSelected && (
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "var(--accent-primary)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", color: "var(--bg-primary)", fontWeight: 700,
                  }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── STEP 4: Input Berat + Konfirmasi ──────────────────────────
function StepWeight({
  weight, onWeightChange, notes, onNotesChange,
  fishType, quality, coldStorage,
}: {
  weight: string; onWeightChange: (v: string) => void;
  notes: string; onNotesChange: (v: string) => void;
  fishType: FishType | undefined;
  quality: FishQuality | null;
  coldStorage: ColdStorage | undefined;
}) {
  const qualityCfg = quality ? QUALITY_OPTIONS.find(q => q.value === quality) : null;

  return (
    <div style={{ padding: "0 16px", animation: "fadeUp 0.3s ease both" }}>
      {/* Ringkasan pilihan */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: "16px",
      }}>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
          Ringkasan Input
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Jenis Ikan</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
              {fishType?.name ?? "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Kualitas</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: qualityCfg?.color ?? "var(--text-primary)" }}>
              {qualityCfg?.emoji} {qualityCfg?.label ?? "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Lokasi</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
              {coldStorage?.name ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Input berat manual */}
      <SectionTitle>Masukkan Berat (kg)</SectionTitle>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)", padding: "4px 16px",
        display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
      }}>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: "32px", fontWeight: 800, fontFamily: "var(--font-mono)",
            color: weight ? "var(--accent-primary)" : "var(--text-muted)",
            padding: "12px 0",
          }}
        />
        <span style={{ fontSize: "16px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>kg</span>
      </div>

      {/* Preset tombol berat */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
        {WEIGHT_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onWeightChange(String(preset))}
            style={{
              background: weight === String(preset) ? "var(--accent-glow)" : "var(--bg-elevated)",
              border: `1.5px solid ${weight === String(preset) ? "var(--accent-primary)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              color: weight === String(preset) ? "var(--accent-primary)" : "var(--text-secondary)",
              fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-mono)",
              padding: "12px 8px", cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {preset} kg
          </button>
        ))}
      </div>

      {/* Catatan opsional */}
      <SectionTitle>Catatan (opsional)</SectionTitle>
      <textarea
        placeholder="Contoh: dari KM Sejahtera, muatan pagi..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
        style={{
          width: "100%", background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)", padding: "12px",
          color: "var(--text-primary)", fontSize: "13px",
          fontFamily: "var(--font-body)", resize: "none", outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────
function SuccessScreen({ onAddMore, onViewStock }: { onAddMore: () => void; onViewStock: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "48px 24px", gap: "16px",
      animation: "fadeUp 0.4s ease both", textAlign: "center",
    }}>
      <div style={{
        width: "72px", height: "72px", borderRadius: "50%",
        background: "var(--accent-glow)", border: "2px solid var(--accent-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "32px",
      }}>
        ✓
      </div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
          Stok Berhasil Dicatat!
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
          Data ikan sudah masuk ke inventori dan dashboard diperbarui.
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
        <BigButton onClick={onAddMore} variant="primary">+ Tambah Stok Lagi</BigButton>
        <BigButton onClick={onViewStock} variant="secondary">Lihat Daftar Stok</BigButton>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function StocksNewPage() {
  const router = useRouter();

  const [step, setStep]               = useState<Step>(1);
  const [fishTypes, setFishTypes]     = useState<FishType[]>([]);
  const [storages, setStorages]       = useState<ColdStorage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Form state
  const [selectedFish,    setSelectedFish]    = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<FishQuality | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [weight,          setWeight]          = useState<string>("");
  const [notes,           setNotes]           = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const [fishRes, storageRes] = await Promise.all([
          api.fishTypes.list(),
          api.coldStorages.list(),
        ]);
        setFishTypes(fishRes.data);
        setStorages(storageRes.data);
      } catch {
        setError("Gagal memuat data. Coba refresh.");
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  const selectedFishType    = fishTypes.find(f => f.id === selectedFish);
  const selectedColdStorage = storages.find(s => s.id === selectedStorage);

  // Validasi per step
  const canProceed = () => {
    if (step === 1) return !!selectedFish;
    if (step === 2) return !!selectedQuality;
    if (step === 3) return !!selectedStorage;
    if (step === 4) return !!weight && parseFloat(weight) > 0;
    return false;
  };

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!selectedFish || !selectedQuality || !selectedStorage || !weight) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateStockBatchPayload = {
        fish_type_id:      selectedFish,
        cold_storage_id:   selectedStorage,
        quality:           selectedQuality,
        initial_weight_kg: parseFloat(weight),
        notes:             notes || undefined,
      };
      await api.stocks.create(payload);
      setSuccess(true);
    } catch {
      setError("Gagal menyimpan stok. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedFish(null);
    setSelectedQuality(null);
    setSelectedStorage(null);
    setWeight("");
    setNotes("");
    setSuccess(false);
    setError(null);
  };

  if (success) {
    return (
      <MobileLayout title="Stok Masuk" hideBottomNav={false}>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <SuccessScreen
          onAddMore={handleReset}
          onViewStock={() => router.push("/stocks")}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Stok Masuk"
      headerLeft={
        step > 1 ? (
          <button
            onClick={handleBack}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-secondary)", fontSize: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px",
            }}
          >
            ‹
          </button>
        ) : null
      }
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        textarea::placeholder, input::placeholder { color: var(--text-muted); }
      `}</style>

      <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "0" }}>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Error banner */}
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

        {/* Step content */}
        <div style={{ flex: 1 }}>
          {step === 1 && (
            <StepFishType
              fishTypes={fishTypes}
              selected={selectedFish}
              onSelect={(id) => { setSelectedFish(id); }}
              loading={loadingData}
            />
          )}
          {step === 2 && (
            <StepQuality
              selected={selectedQuality}
              onSelect={(q) => { setSelectedQuality(q); }}
            />
          )}
          {step === 3 && (
            <StepColdStorage
              storages={storages}
              selected={selectedStorage}
              onSelect={(id) => { setSelectedStorage(id); }}
              loading={loadingData}
            />
          )}
          {step === 4 && (
            <StepWeight
              weight={weight}
              onWeightChange={setWeight}
              notes={notes}
              onNotesChange={setNotes}
              fishType={selectedFishType}
              quality={selectedQuality}
              coldStorage={selectedColdStorage}
            />
          )}
        </div>

        {/* CTA Button */}
        <div style={{ padding: "16px", paddingTop: "20px" }}>
          {step < 4 ? (
            <BigButton onClick={handleNext} disabled={!canProceed()}>
              Lanjut →
            </BigButton>
          ) : (
            <BigButton
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              variant="primary"
            >
              {submitting ? "Menyimpan..." : "✓ Simpan Stok Masuk"}
            </BigButton>
          )}
        </div>

      </div>
    </MobileLayout>
  );
}
