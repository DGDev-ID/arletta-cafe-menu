export interface ApiResponse {
  success: boolean
  message: string
  data: CafeTableData
}

export interface CafeTableData {
  cafe: Cafe
  table: CafeTable
  menu_categories: MenuCategory[]
  transaction?: ActiveTransaction | null
}

export interface Cafe {
  id: string
  unique_id: string
  name: string
  address: string
  address_coordinate: string
  description: string
  created_at: string
  updated_at: string
}

export interface CafeTable {
  id: number
  cafe_id: string
  name: string
  status: string
  description: string
  is_open_bill: number
  created_at: string
  updated_at: string
}

export interface ActiveTransaction {
  id: number
  cust_name: string | null
  status: string
  is_open_bill: number
  details: ActiveTransactionDetail[]
}

export interface ActiveTransactionDetail {
  id: number
  menu_id: number
  menu_name?: string
  menu?: { name: string }
  amount: number
  price: number | string
  description: string | null
  status: string | null
}

export interface Menu {
  id: number
  cafe_id: string
  menu_category_id: number
  name: string
  description: string
  img_url: string | null
  price: string
  status: string
  is_combo?: boolean
  created_at: string
  updated_at: string
  selectable_materials?: SelectableMaterial[]
}

export interface MenuCategory {
  id: number
  cafe_id: string
  name: string
  parent_id: number | null
  description: string
  created_at: string
  updated_at: string
  menus: Menu[]
  children: MenuCategory[]
}

export interface CheckMaterialBulkRequest {
  menu_id: number
  quantity: number
}

export interface CheckMaterialBulkResponse {
  success: boolean
  message: string
  data: null
}

export interface MakeTransactionRequest {
  cafe_id: string
  table_id: number
  payment_type: 'manual' | 'qris'
  cust_name?: string
  promo_code?: string
  details: {
    menu_id: number
    amount: number
    description: string | null
  }[]
}

export interface TransactionDetail {
  menu_name: string
  amount: number
  price: number
  description: string | null
}

export interface TransactionResponse {
  transaction_id: number
  cafe_name: string
  table_name: string
  cust_name?: string
  price: number
  fee: number
  total_price: number
  payment_type: 'manual' | 'qris'
  details: TransactionDetail[]
  snap_token?: string
  qr_code?: string
  expired_at?: string
}

export interface TransactionStatusResponse {
  success: boolean
  message: string
  data: 'success' | 'pending' | 'failed' | 'in_order'
}

export interface CreateOpenBillRequest {
  cafe_table_id: number
  cust_name: string
}

export interface CreateOpenBillResponse {
  success: boolean
  message: string
  data: ActiveTransaction
}

export interface AddOrderOpenBillRequest {
  cafe_table_id: number
  orders: { menu_id: number; amount: number }[]
}

export interface AddOrderOpenBillResponse {
  success: boolean
  message: string
  data: null
}

export interface CheckPromoRequest {
  cafe_id: string
  promo_code: string
}

export interface PromoData {
  id: number
  cafe_id: number
  promo_code: string
  type: 'discount_percent' | 'discount_amount'
  value: string // "15.00" dari backend
  status: boolean
}

export interface CheckPromoResponse {
  success: boolean
  message: string
  data: PromoData | null
}

// ─── Landing Page ────────────────────────────────────────────────────────────

export interface LandingMenuPromo {
  id: number
  menu_id: number
  type: 'discount_percent' | 'discount_amount'
  discount_amount: string
}

export interface LandingMenuCategory {
  id: number
  name: string
  parent_id: number | null
}

export interface LandingMenuItem {
  id: number
  cafe_id: string
  menu_category_id: number
  name: string
  description: string
  img_url: string | null
  price: string
  status: string
  category: LandingMenuCategory | null
  promo: LandingMenuPromo | null
  created_at: string
  updated_at: string
}

export interface LandingGallery {
  id: number
  img_url: string
  created_at: string
  updated_at: string
}

export interface LandingCafe {
  id: string
  unique_id: string
  name: string
  address: string
  address_coordinate: string | null
  description: string | null
  img_url: string | null
  phone_number: string | null
  ppn_fee: string | null
  qris_fee: string | null
  created_at: string
  updated_at: string
}

export interface LandingPageData {
  menus: LandingMenuItem[]
  gallery: LandingGallery[]
  all_cafe: LandingCafe[]
}

export interface LandingPageResponse {
  success: boolean
  message: string
  data: LandingPageData
}

export interface MaterialVariant {
  id: number
  material_id: number
  name: string
  stock: string
  minimum_stock: string
}

export interface SelectableMaterial {
  material_id: number
  material_name: string
  variants: MaterialVariant[]
}

export interface SelectedVariant {
  material_id: number
  variant_id: number
  material_name?: string // nama bahan, cth: "Biji Kopi"
  variant_name?: string // nama pilihan, cth: "Temanggung"
}

export interface CartItemVariant {
  menu_id: number
  selected_variants: SelectedVariant[]
}
