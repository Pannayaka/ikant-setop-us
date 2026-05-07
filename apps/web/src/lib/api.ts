import type {
  FishType,
  ColdStorage,
  StockBatch,
  StockOut,
  DashboardSummary,
  RecentMovement,
  CreateStockBatchPayload,
  CreateStockOutPayload,
  UpdateStockBatchPayload,
  ApiResponse,
  ApiListResponse,
} from "@/types/api";

// ============================================================
// CONFIG
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Ganti jadi false kalau backend Pison sudah siap
const USE_MOCK = true;

// Simulasi network delay (ms) biar berasa nyata
const MOCK_DELAY = 400;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ============================================================
// MOCK DATA
// ============================================================

const MOCK_FISH_TYPES: FishType[] = [
  {
    id: "ft-1",
    name: "Tuna",
    image_url: "/fish/tuna.png",
    description: "Ikan tuna segar",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "ft-2",
    name: "Tongkol",
    image_url: "/fish/tongkol.png",
    description: "Ikan tongkol segar",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "ft-3",
    name: "Cakalang",
    image_url: "/fish/cakalang.png",
    description: "Ikan cakalang segar",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "ft-4",
    name: "Kakap",
    image_url: "/fish/kakap.png",
    description: "Ikan kakap merah",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "ft-5",
    name: "Kerapu",
    image_url: "/fish/kerapu.png",
    description: "Ikan kerapu hidup",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
];

const MOCK_COLD_STORAGES: ColdStorage[] = [
  {
    id: "cs-1",
    name: "Cold Storage A",
    location_label: "Zona A - Pelabuhan Utara",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "cs-2",
    name: "Cold Storage B",
    location_label: "Zona B - Pelabuhan Selatan",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "cs-3",
    name: "Cold Storage C",
    location_label: "Zona C - Gudang Tengah",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
];

let MOCK_STOCK_BATCHES: StockBatch[] = [
  {
    id: "sb-1",
    fish_type_id: "ft-1",
    fish_type: MOCK_FISH_TYPES[0],
    cold_storage_id: "cs-1",
    cold_storage: MOCK_COLD_STORAGES[0],
    created_by: "user-1",
    quality: "baik",
    initial_weight_kg: 250,
    remaining_weight_kg: 180,
    entered_at: "2026-05-01T06:00:00Z",
    status: "partial",
    notes: "Kapal KM Sejahtera",
    created_at: "2026-05-01T06:00:00Z",
    updated_at: "2026-05-01T06:00:00Z",
  },
  {
    id: "sb-2",
    fish_type_id: "ft-1",
    fish_type: MOCK_FISH_TYPES[0],
    cold_storage_id: "cs-2",
    cold_storage: MOCK_COLD_STORAGES[1],
    created_by: "user-1",
    quality: "sedang",
    initial_weight_kg: 120,
    remaining_weight_kg: 120,
    entered_at: "2026-05-02T07:30:00Z",
    status: "available",
    notes: "",
    created_at: "2026-05-02T07:30:00Z",
    updated_at: "2026-05-02T07:30:00Z",
  },
  {
    id: "sb-3",
    fish_type_id: "ft-2",
    fish_type: MOCK_FISH_TYPES[1],
    cold_storage_id: "cs-1",
    cold_storage: MOCK_COLD_STORAGES[0],
    created_by: "user-1",
    quality: "baik",
    initial_weight_kg: 300,
    remaining_weight_kg: 300,
    entered_at: "2026-05-02T08:00:00Z",
    status: "available",
    created_at: "2026-05-02T08:00:00Z",
    updated_at: "2026-05-02T08:00:00Z",
  },
  {
    id: "sb-4",
    fish_type_id: "ft-3",
    fish_type: MOCK_FISH_TYPES[2],
    cold_storage_id: "cs-3",
    cold_storage: MOCK_COLD_STORAGES[2],
    created_by: "user-1",
    quality: "buruk",
    initial_weight_kg: 80,
    remaining_weight_kg: 30,
    entered_at: "2026-04-29T05:00:00Z",
    status: "partial",
    notes: "Perlu segera dikeluarkan",
    created_at: "2026-04-29T05:00:00Z",
    updated_at: "2026-05-01T10:00:00Z",
  },
];

const MOCK_RECENT_MOVEMENTS: RecentMovement[] = [
  {
    id: "mv-1",
    type: "stock_in",
    description: "Tuna masuk 250 kg ke Cold Storage A",
    weight_kg: 250,
    fish_type_name: "Tuna",
    created_at: "2026-05-01T06:00:00Z",
    created_by_name: "Baso",
  },
  {
    id: "mv-2",
    type: "stock_out",
    description: "Tuna keluar 70 kg ke Restoran Daeng",
    weight_kg: 70,
    fish_type_name: "Tuna",
    created_at: "2026-05-01T14:00:00Z",
    created_by_name: "Baso",
  },
  {
    id: "mv-3",
    type: "stock_in",
    description: "Tongkol masuk 300 kg ke Cold Storage A",
    weight_kg: 300,
    fish_type_name: "Tongkol",
    created_at: "2026-05-02T08:00:00Z",
    created_by_name: "Baso",
  },
  {
    id: "mv-4",
    type: "quality_change",
    description: "Cakalang kualitas diubah dari sedang → buruk",
    fish_type_name: "Cakalang",
    created_at: "2026-05-02T10:30:00Z",
    created_by_name: "Daeng Syamsul",
  },
];

// ============================================================
// MOCK HANDLERS
// ============================================================

const mockApi = {
  async getFishTypes(): Promise<ApiListResponse<FishType>> {
    await delay(MOCK_DELAY);
    return { data: MOCK_FISH_TYPES, total: MOCK_FISH_TYPES.length };
  },

  async getColdStorages(): Promise<ApiListResponse<ColdStorage>> {
    await delay(MOCK_DELAY);
    return { data: MOCK_COLD_STORAGES, total: MOCK_COLD_STORAGES.length };
  },

  async getStockBatchesFIFO(fishTypeId?: string): Promise<ApiListResponse<StockBatch>> {
    await delay(MOCK_DELAY);
    let batches = [...MOCK_STOCK_BATCHES].filter((b) => b.status !== "empty");
    if (fishTypeId) {
      batches = batches.filter((b) => b.fish_type_id === fishTypeId);
    }
    // Sort by FIFO: oldest entered_at first
    batches.sort((a, b) => new Date(a.entered_at).getTime() - new Date(b.entered_at).getTime());
    return { data: batches, total: batches.length };
  },

  async createStockBatch(payload: CreateStockBatchPayload): Promise<ApiResponse<StockBatch>> {
    await delay(MOCK_DELAY);
    const fishType = MOCK_FISH_TYPES.find((f) => f.id === payload.fish_type_id);
    const coldStorage = MOCK_COLD_STORAGES.find((c) => c.id === payload.cold_storage_id);
    const newBatch: StockBatch = {
      id: `sb-${Date.now()}`,
      ...payload,
      fish_type: fishType,
      cold_storage: coldStorage,
      created_by: "user-1",
      remaining_weight_kg: payload.initial_weight_kg,
      entered_at: new Date().toISOString(),
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_STOCK_BATCHES = [newBatch, ...MOCK_STOCK_BATCHES];
    return { data: newBatch, message: "Stok berhasil ditambahkan" };
  },

  async createStockOut(payload: CreateStockOutPayload): Promise<ApiResponse<StockOut>> {
    await delay(MOCK_DELAY);
    const totalWeight = payload.items.reduce((sum, item) => sum + item.weight_kg, 0);

    // Update remaining weight di mock data
    payload.items.forEach((item) => {
      const batch = MOCK_STOCK_BATCHES.find((b) => b.id === item.stock_batch_id);
      if (batch) {
        batch.remaining_weight_kg -= item.weight_kg;
        batch.updated_at = new Date().toISOString();
        if (batch.remaining_weight_kg <= 0) {
          batch.remaining_weight_kg = 0;
          batch.status = "empty";
        } else {
          batch.status = "partial";
        }
      }
    });

    const stockOut: StockOut = {
      id: `so-${Date.now()}`,
      destination: payload.destination,
      total_weight_kg: totalWeight,
      out_at: new Date().toISOString(),
      notes: payload.notes,
      created_by: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: payload.items.map((item, idx) => ({
        id: `soi-${Date.now()}-${idx}`,
        stock_out_id: `so-${Date.now()}`,
        stock_batch_id: item.stock_batch_id,
        weight_kg: item.weight_kg,
        created_at: new Date().toISOString(),
      })),
    };
    return { data: stockOut, message: "Pengeluaran ikan berhasil dicatat" };
  },

  async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    await delay(MOCK_DELAY);
    const activeBatches = MOCK_STOCK_BATCHES.filter((b) => b.status !== "empty");
    const totalStockKg = activeBatches.reduce((sum, b) => sum + b.remaining_weight_kg, 0);

    const summary: DashboardSummary = {
      total_stock_kg: totalStockKg,
      total_stock_in_today_kg: 420,
      total_stock_out_today_kg: 70,
      total_batches: activeBatches.length,
      batches_by_quality: {
        baik: activeBatches.filter((b) => b.quality === "baik").length,
        sedang: activeBatches.filter((b) => b.quality === "sedang").length,
        buruk: activeBatches.filter((b) => b.quality === "buruk").length,
      },
      stock_by_fish_type: MOCK_FISH_TYPES.slice(0, 3).map((ft) => ({
        fish_type: ft,
        total_kg: activeBatches
          .filter((b) => b.fish_type_id === ft.id)
          .reduce((sum, b) => sum + b.remaining_weight_kg, 0),
        batch_count: activeBatches.filter((b) => b.fish_type_id === ft.id).length,
      })),
      stock_by_cold_storage: MOCK_COLD_STORAGES.map((cs) => ({
        cold_storage: cs,
        total_kg: activeBatches
          .filter((b) => b.cold_storage_id === cs.id)
          .reduce((sum, b) => sum + b.remaining_weight_kg, 0),
      })),
    };
    return { data: summary };
  },

  async getRecentMovements(): Promise<ApiListResponse<RecentMovement>> {
    await delay(MOCK_DELAY);
    return { data: MOCK_RECENT_MOVEMENTS, total: MOCK_RECENT_MOVEMENTS.length };
  },

  async updateStockBatch(
    id: string,
    payload: UpdateStockBatchPayload
  ): Promise<ApiResponse<StockBatch>> {
    await delay(MOCK_DELAY);
    const batch = MOCK_STOCK_BATCHES.find((b) => b.id === id);
    if (!batch) throw new Error("Batch tidak ditemukan");
    Object.assign(batch, payload, { updated_at: new Date().toISOString() });
    return { data: batch, message: "Stok berhasil diperbarui" };
  },
};

// ============================================================
// REAL API HANDLERS
// ============================================================

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Terjadi kesalahan" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ============================================================
// PUBLIC API — pakai ini di semua halaman/komponen
// Otomatis switch antara mock dan real API
// ============================================================

export const api = {
  fishTypes: {
    list: () =>
      USE_MOCK
        ? mockApi.getFishTypes()
        : fetcher<ApiListResponse<FishType>>("/fish-types"),
  },

  coldStorages: {
    list: () =>
      USE_MOCK
        ? mockApi.getColdStorages()
        : fetcher<ApiListResponse<ColdStorage>>("/cold-storages"),
  },

  stocks: {
    listFIFO: (fishTypeId?: string) =>
      USE_MOCK
        ? mockApi.getStockBatchesFIFO(fishTypeId)
        : fetcher<ApiListResponse<StockBatch>>(
            `/stocks/fifo${fishTypeId ? `?fish_type_id=${fishTypeId}` : ""}`
          ),

    create: (payload: CreateStockBatchPayload) =>
      USE_MOCK
        ? mockApi.createStockBatch(payload)
        : fetcher<ApiResponse<StockBatch>>("/stocks", {
            method: "POST",
            body: JSON.stringify(payload),
          }),

    update: (id: string, payload: UpdateStockBatchPayload) =>
      USE_MOCK
        ? mockApi.updateStockBatch(id, payload)
        : fetcher<ApiResponse<StockBatch>>(`/stocks/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          }),
  },

  stockOuts: {
    create: (payload: CreateStockOutPayload) =>
      USE_MOCK
        ? mockApi.createStockOut(payload)
        : fetcher<ApiResponse<StockOut>>("/stock-outs", {
            method: "POST",
            body: JSON.stringify(payload),
          }),
  },

  dashboard: {
    summary: () =>
      USE_MOCK
        ? mockApi.getDashboardSummary()
        : fetcher<ApiResponse<DashboardSummary>>("/dashboard/summary"),

    recentMovements: () =>
      USE_MOCK
        ? mockApi.getRecentMovements()
        : fetcher<ApiListResponse<RecentMovement>>("/dashboard/recent-movements"),
  },
};
