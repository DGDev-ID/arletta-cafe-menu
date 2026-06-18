import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TransactionResponse } from '@/types/api'

const STORAGE_KEY = 'arletta_order_history'
const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

export interface HistoryOrder {
  /** Transaction ID from backend */
  transactionId: number
  /** Generated order number (e.g. ARL-20260618-1234) */
  orderNumber: string
  /** Customer name */
  custName: string
  /** Cafe name */
  cafeName: string
  /** Table name */
  tableName: string
  /** Subtotal before fee */
  price: number
  /** Fee (PPN, QRIS, etc.) */
  fee: number
  /** Total price after fee */
  totalPrice: number
  /** Payment method */
  paymentType: 'manual' | 'qris' | 'debit'
  /** Menu items */
  details: {
    menuName: string
    amount: number
    price: number
    description: string | null
  }[]
  /** Timestamp when this order was saved (ISO string) */
  savedAt: string
}

function loadFromStorage(): HistoryOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const orders: HistoryOrder[] = JSON.parse(raw)
    // Filter out expired orders (older than 24 hours)
    const now = Date.now()
    return orders.filter((o) => now - new Date(o.savedAt).getTime() < EXPIRY_MS)
  } catch {
    return []
  }
}

function saveToStorage(orders: HistoryOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export const useOrderHistoryStore = defineStore('orderHistory', () => {
  const orders = ref<HistoryOrder[]>(loadFromStorage())

  /** Orders sorted newest first, with expired entries pruned */
  const activeOrders = computed(() => {
    const now = Date.now()
    return orders.value
      .filter((o) => now - new Date(o.savedAt).getTime() < EXPIRY_MS)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
  })

  const hasOrders = computed(() => activeOrders.value.length > 0)

  /** Add a successful transaction to history */
  function addOrder(transaction: TransactionResponse, orderNumber: string, custName: string) {
    // Prune expired first
    const now = Date.now()
    orders.value = orders.value.filter(
      (o) => now - new Date(o.savedAt).getTime() < EXPIRY_MS,
    )

    // Avoid duplicates
    if (orders.value.some((o) => o.transactionId === transaction.transaction_id)) {
      return
    }

    const entry: HistoryOrder = {
      transactionId: transaction.transaction_id,
      orderNumber,
      custName,
      cafeName: transaction.cafe_name,
      tableName: transaction.table_name,
      price: transaction.price,
      fee: transaction.fee,
      totalPrice: transaction.total_price,
      paymentType: transaction.payment_type,
      details: transaction.details.map((d) => ({
        menuName: d.menu_name,
        amount: d.amount,
        price: d.price,
        description: d.description,
      })),
      savedAt: new Date().toISOString(),
    }

    orders.value.push(entry)
    saveToStorage(orders.value)
  }

  /** Remove a single order (manual clear) */
  function removeOrder(transactionId: number) {
    orders.value = orders.value.filter((o) => o.transactionId !== transactionId)
    saveToStorage(orders.value)
  }

  /** Clear all history */
  function clearAll() {
    orders.value = []
    saveToStorage(orders.value)
  }

  /** Refresh: prune expired and persist */
  function pruneExpired() {
    const now = Date.now()
    orders.value = orders.value.filter(
      (o) => now - new Date(o.savedAt).getTime() < EXPIRY_MS,
    )
    saveToStorage(orders.value)
  }

  return {
    orders,
    activeOrders,
    hasOrders,
    addOrder,
    removeOrder,
    clearAll,
    pruneExpired,
  }
})
