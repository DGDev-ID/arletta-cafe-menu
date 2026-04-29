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
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
}

export interface CheckPromoResponse {
  success: boolean
  message: string
  data: PromoData | null
}