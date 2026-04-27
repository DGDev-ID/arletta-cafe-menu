import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { watch } from 'vue'
import type { Menu } from '@/types/api'
import { checkAvailableMaterial, checkAvailableMaterialBulk } from '@/services/api'

export interface CartItem {
  id: number
  name: string
  price: number
  image: string | null
  quantity: number
  description?: string | null
}

// Item yang sudah ada di open bill (dari server), read-only di cart
export interface LockedCartItem {
  id: number         // transaction_detail.id
  menu_id: number
  name: string
  price: number
  quantity: number
  description: string | null
  isLocked: true     // penanda item dari server
}

const CART_STORAGE_KEY = 'arletta-cafe-cart'

function loadCartFromStorage(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as CartItem[]
      return parsed.map((it) => ({
        ...it,
        description: (it as Partial<CartItem>).description ?? null,
      }))
    }
  } catch {
    // ignore
  }
  return []
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const useCartStore = defineStore('cart', () => {
  // Item yang baru ditambahkan user di sesi ini
  const items = ref<CartItem[]>(loadCartFromStorage())

  // Item yang sudah ada di open bill aktif (dari server), untuk ditampilkan
  const lockedItems = ref<LockedCartItem[]>([])

  // Flag: apakah sedang dalam mode open bill
  const isOpenBillMode = ref(false)

  watch(items, (newItems) => { saveCartToStorage(newItems) }, { deep: true })

  // Getters
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const isEmpty = computed(() => items.value.length === 0)

  // Total harga locked items (sudah dipesan sebelumnya)
  const lockedTotalPrice = computed(() =>
    lockedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  // Actions
  function setOpenBillMode(locked: LockedCartItem[]) {
    isOpenBillMode.value = true
    lockedItems.value = locked
    // Reset cart baru saat masuk open bill
    items.value = []
  }

  function clearOpenBillMode() {
    isOpenBillMode.value = false
    lockedItems.value = []
  }

  function addToCart(menuItem: Menu) {
    const existing = items.value.find((item) => item.id === menuItem.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        id: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        image: menuItem.img_url,
        quantity: 1,
        description: null,
      })
    }
  }

  function removeFromCart(itemId: number) {
    const index = items.value.findIndex((item) => item.id === itemId)
    if (index !== -1) items.value.splice(index, 1)
  }

  function increaseQty(itemId: number) {
    const item = items.value.find((item) => item.id === itemId)
    if (item) item.quantity++
  }

  function decreaseQty(itemId: number) {
    const item = items.value.find((item) => item.id === itemId)
    if (item) {
      if (item.quantity > 1) item.quantity--
      else removeFromCart(itemId)
    }
  }

  function setItemDescription(itemId: number, desc: string | null) {
    const item = items.value.find((i) => i.id === itemId)
    if (item) item.description = desc
  }

  async function checkAndAdd(menuItem: Menu): Promise<{ success: boolean; message: string }> {
    const currentQty = items.value.find((i) => i.id === menuItem.id)?.quantity ?? 0
    const result = await checkAvailableMaterial({ menu_id: menuItem.id, quantity: currentQty + 1 })
    if (!result.success) return { success: false, message: result.message }
    addToCart(menuItem)
    return { success: true, message: result.message }
  }

  async function checkAndIncrease(menuItem: Menu): Promise<{ success: boolean; message: string }> {
    const currentQty = items.value.find((i) => i.id === menuItem.id)?.quantity ?? 0
    const result = await checkAvailableMaterial({ menu_id: menuItem.id, quantity: currentQty + 1 })
    if (!result.success) return { success: false, message: result.message }
    increaseQty(menuItem.id)
    return { success: true, message: result.message }
  }

  async function checkAndDecrease(menuItem: Menu): Promise<{ success: boolean; message: string }> {
    const currentQty = items.value.find((i) => i.id === menuItem.id)?.quantity ?? 0
    const nextQty = currentQty - 1
    if (nextQty <= 0) {
      removeFromCart(menuItem.id)
      return { success: true, message: '' }
    }
    const result = await checkAvailableMaterial({ menu_id: menuItem.id, quantity: nextQty })
    if (!result.success) return { success: false, message: result.message }
    decreaseQty(menuItem.id)
    return { success: true, message: result.message }
  }

  function clearCart() {
    items.value = []
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  async function checkBulk(): Promise<{ success: boolean; message: string }> {
    if (items.value.length === 0) return { success: true, message: '' }
    const result = await checkAvailableMaterialBulk({
      items: items.value.map((item) => ({ menu_id: item.id, quantity: item.quantity })),
    })
    return { success: result.success, message: result.message }
  }

  async function checkAndIncreaseById(itemId: number): Promise<{ success: boolean; message: string }> {
    const cartItem = items.value.find((i) => i.id === itemId)
    if (!cartItem) return { success: false, message: 'Item tidak ditemukan' }
    const result = await checkAvailableMaterial({ menu_id: itemId, quantity: cartItem.quantity + 1 })
    if (!result.success) return { success: false, message: result.message }
    increaseQty(itemId)
    return { success: true, message: result.message }
  }

  async function checkAndDecreaseById(itemId: number): Promise<{ success: boolean; message: string }> {
    const cartItem = items.value.find((i) => i.id === itemId)
    if (!cartItem) return { success: false, message: 'Item tidak ditemukan' }
    const nextQty = cartItem.quantity - 1
    if (nextQty <= 0) {
      removeFromCart(itemId)
      return { success: true, message: '' }
    }
    const result = await checkAvailableMaterial({ menu_id: itemId, quantity: nextQty })
    if (!result.success) return { success: false, message: result.message }
    decreaseQty(itemId)
    return { success: true, message: result.message }
  }

  return {
    items,
    lockedItems,
    isOpenBillMode,
    totalPrice,
    totalItems,
    isEmpty,
    lockedTotalPrice,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    checkAndAdd,
    checkAndIncrease,
    checkAndDecrease,
    checkBulk,
    clearCart,
    checkAndIncreaseById,
    checkAndDecreaseById,
    setItemDescription,
    setOpenBillMode,
    clearOpenBillMode,
  }
})