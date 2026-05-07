// ============================================================
// ENUMS
// ============================================================

export type FishQuality = "baik" | "sedang" | "buruk";
export type StockStatus = "available" | "partial" | "empty";
export type UserRole = "admin" | "punggawa";
export type MovementType = "stock_in" | "stock_out" | "quality_change" | "location_change";

// ============================================================
// ENTITIES
// ============================================================

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface FishType {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ColdStorage {
  id: string;
  name: string;
  location_label: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface StockBatch {
  id: string;
  fish_type_id: string;
  fish_type?: FishType;
  cold_storage_id: string;
  cold_storage?: ColdStorage;
  created_by: string;
  quality: FishQuality;
  initial_weight_kg: number;
  remaining_weight_kg: number;
  entered_at: string;
  status: StockStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockOut {
  id: string;
  destination: string;
  total_weight_kg: number;
  out_at: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  items: StockOutItem[];
}

export interface StockOutItem {
  id: string;
  stock_out_id: string;
  stock_batch_id: string;
  stock_batch?: StockBatch;
  weight_kg: number;
  created_at: string;
}

export interface StockMovement {
  id: string;
  stock_batch_id: string;
  previous_cold_storage_id?: string;
  new_cold_storage_id?: string;
  created_by: string;
  movement_type: MovementType;
  weight_kg?: number;
  previous_quality?: FishQuality;
  new_quality?: FishQuality;
  description?: string;
  created_at: string;
}

// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardSummary {
  total_stock_kg: number;
  total_stock_in_today_kg: number;
  total_stock_out_today_kg: number;
  total_batches: number;
  batches_by_quality: {
    baik: number;
    sedang: number;
    buruk: number;
  };
  stock_by_fish_type: Array<{
    fish_type: FishType;
    total_kg: number;
    batch_count: number;
  }>;
  stock_by_cold_storage: Array<{
    cold_storage: ColdStorage;
    total_kg: number;
  }>;
}

export interface RecentMovement {
  id: string;
  type: MovementType;
  description: string;
  weight_kg?: number;
  fish_type_name?: string;
  created_at: string;
  created_by_name: string;
}

// ============================================================
// REQUEST PAYLOADS
// ============================================================

export interface CreateStockBatchPayload {
  fish_type_id: string;
  cold_storage_id: string;
  quality: FishQuality;
  initial_weight_kg: number;
  notes?: string;
}

export interface CreateStockOutPayload {
  destination: string;
  notes?: string;
  items: Array<{
    stock_batch_id: string;
    weight_kg: number;
  }>;
}

export interface UpdateStockBatchPayload {
  quality?: FishQuality;
  cold_storage_id?: string;
  notes?: string;
}

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ApiError {
  message: string;
  code?: string;
}
