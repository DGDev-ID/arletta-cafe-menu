import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
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

const CART_STORAGE_KEY = 'arletta-cafe-cart'

function loadCartFromStorage(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as CartItem[]
      // ensure backwards compatibility: older items may not have description
      return parsed.map((it) => ({
        ...it,
        description: (it as Partial<CartItem>).description ?? null,
      }))
    }
  } catch {
    // ignore parse errors
  }
  return []
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

// global orderNote storage removed; use per-item descriptions instead

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>(loadCartFromStorage())

  // Watch for changes and persist to localStorage
  watch(
    items,
    (newItems) => {
      saveCartToStorage(newItems)
    },
    { deep: true },
  )

  // no global order note to watch

  // Getters
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Actions (raw — tanpa API check)
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
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function increaseQty(itemId: number) {
    const item = items.value.find((item) => item.id === itemId)
    if (item) {
      item.quantity++
    }
  }

  function decreaseQty(itemId: number) {
    const item = items.value.find((item) => item.id === itemId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        removeFromCart(itemId)
      }
    }
  }

  function setItemDescription(itemId: number, desc: string | null) {
    const item = items.value.find((i) => i.id === itemId)
    if (item) {
      item.description = desc
    }
  }

  // Actions dengan API check
  async function checkAndAdd(menuItem: Menu): Promise<{ success: boolean; message: string }> {
    const currentQty = items.value.find((i) => i.id === menuItem.id)?.quantity ?? 0
    const nextQty = currentQty + 1

    const result = await checkAvailableMaterial({ menu_id: menuItem.id, quantity: nextQty })

    if (!result.success) {
      return { success: false, message: result.message }
    }

    addToCart(menuItem)
    return { success: true, message: result.message }
  }

  async function checkAndIncrease(menuItem: Menu): Promise<{ success: boolean; message: string }> {
    const currentQty = items.value.find((i) => i.id === menuItem.id)?.quantity ?? 0
    const nextQty = currentQty + 1

    const result = await checkAvailableMaterial({ menu_id: menuItem.id, quantity: nextQty })

    if (!result.success) {
      return { success: false, message: result.message }
    }

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

    if (!result.success) {
      return { success: false, message: result.message }
    }

    decreaseQty(menuItem.id)
    return { success: true, message: result.message }
  }

  function clearCart() {
    items.value = []
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  async function checkBulk(): Promise<{ success: boolean; message: string }> {
    if (items.value.length === 0) return { success: true, message: '' }

    const payload = {
      items: items.value.map((item) => ({
        menu_id: item.id,
        quantity: item.quantity,
      })),
    }

    const result = await checkAvailableMaterialBulk(payload)
    return { success: result.success, message: result.message }
  }

  async function checkAndIncreaseById(
    itemId: number,
  ): Promise<{ success: boolean; message: string }> {
    const cartItem = items.value.find((i) => i.id === itemId)
    if (!cartItem) return { success: false, message: 'Item tidak ditemukan' }

    const nextQty = cartItem.quantity + 1
    const result = await checkAvailableMaterial({ menu_id: itemId, quantity: nextQty })

    if (!result.success) {
      return { success: false, message: result.message }
    }

    increaseQty(itemId)
    return { success: true, message: result.message }
  }

  async function checkAndDecreaseById(
    itemId: number,
  ): Promise<{ success: boolean; message: string }> {
    const cartItem = items.value.find((i) => i.id === itemId)
    if (!cartItem) return { success: false, message: 'Item tidak ditemukan' }

    const nextQty = cartItem.quantity - 1

    if (nextQty <= 0) {
      removeFromCart(itemId)
      return { success: true, message: '' }
    }

    const result = await checkAvailableMaterial({ menu_id: itemId, quantity: nextQty })

    if (!result.success) {
      return { success: false, message: result.message }
    }

    decreaseQty(itemId)
    return { success: true, message: result.message }
  }

  return {
    items,
    // global orderNote removed
    totalPrice,
    totalItems,
    isEmpty,
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
  }
})
