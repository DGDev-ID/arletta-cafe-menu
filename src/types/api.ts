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
  id: number
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
  cafe_id: number
  name: string
  status: string
  description: string
  created_at: string
  updated_at: string
}

export interface Menu {
  id: number
  cafe_id: number
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
  cafe_id: number
  name: string
  parent_id: number | null
  description: string
  created_at: string
  updated_at: string
  menus: Menu[]
  children: MenuCategory[]
}
