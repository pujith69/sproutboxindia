/* ────────────────────────────────────────────────
   Shared TypeScript types for SproutBox
   ──────────────────────────────────────────────── */

export type UserRole = "grower" | "restaurant" | "admin"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/* ── Grower Dashboard Types ────────────────────── */

export type TaskStatus = "assigned" | "growing" | "qc_pending" | "approved" | "completed"
export type MilestoneStatus = "upcoming" | "active" | "completed"

export interface TrayAssignment {
  id: string
  grower_id: string
  tray_code: string
  crop_name: string
  start_date: string
  expected_harvest_date: string
  status: TaskStatus
  current_day: number
  total_days: number
  seed_type: string
  seed_batch_id: string
  seed_quantity_grams: number
  created_at: string
}

export interface DailyInstruction {
  id: string
  tray_id: string
  day_number: number
  title: string
  description: string
  is_completed: boolean
}

export interface Milestone {
  id: string
  tray_id: string
  day_number: number
  title: string
  description: string
  status: MilestoneStatus
  image_url: string | null
}

export interface GrowthUpload {
  id: string
  tray_id: string
  day_number: number
  image_url: string
  notes: string | null
  uploaded_at: string
}

export interface YieldRecord {
  id: string
  tray_id: string
  weight_grams: number
  quality_rating: number
  notes: string | null
  recorded_at: string
}

/* ── Restaurant Dashboard Types ────────────────── */

export type OrderStatus = "pending" | "assigned_to_growers" | "growing" | "ready_for_harvest" | "delivered"
export type SubscriptionFrequency = "daily" | "weekly" | "biweekly"

export interface OrderItem {
  crop_name: string
  quantity_kg: number
}

export interface Order {
  id: string
  restaurant_id: string
  items: OrderItem[]
  total_trays: number
  status: OrderStatus
  delivery_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  restaurant_id: string
  items: OrderItem[]
  frequency: SubscriptionFrequency
  next_delivery: string
  is_active: boolean
  created_at: string
}

export interface Feedback {
  id: string
  restaurant_id: string
  order_id: string
  rating: number
  comment: string | null
  created_at: string
}

/* ── Invoicing Types ─────────────────────────────── */

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  order_id: string
  restaurant_id: string
  grower_id: string | null
  invoice_number: string
  status: InvoiceStatus
  subtotal: number
  tax_amount: number
  total_amount: number
  currency: string
  due_date: string
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  crop_name: string
  quantity_kg: number
  price_per_kg: number
  total: number
}
