// ============================================
// Types matching the backend API response
// GET /get-menu-cafe-table?cafe_id=XXX&table_id=XXX
// ============================================

export interface ApiResponse {
  success: boolean
  message: string
  data: CafeTableData
}

export interface CafeTableData {
  cafe: Cafe
  table: CafeTable
  menu_categories: MenuCategory[]
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
  created_at: string
  updated_at: string
}

export interface Menu {
  id: number
  cafe_id: string
  menu_category_id: number
  name: string
  description: string
  img_url: string | null
  price: string // "22000.00" from backend
  status: string
  created_at: string
  updated_at: string
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
}

export interface TransactionStatusResponse {
  success: boolean
  message: string
  data: 'success' | 'pending' | 'failed' | 'in_order'
}
