import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Menu } from '@/types/api'

export interface CartItem {
  id: number
  name: string
  price: number
  image: string | null
  quantity: number
}

const CART_STORAGE_KEY = 'arletta-cafe-cart'
const NOTE_STORAGE_KEY = 'arletta-cafe-note'

function loadCartFromStorage(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    if (data) {
      return JSON.parse(data) as CartItem[]
    }
  } catch {
    // ignore parse errors
  }
  return []
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

function loadNoteFromStorage(): string {
  return localStorage.getItem(NOTE_STORAGE_KEY) ?? ''
}

function saveNoteToStorage(note: string) {
  if (note) {
    localStorage.setItem(NOTE_STORAGE_KEY, note)
  } else {
    localStorage.removeItem(NOTE_STORAGE_KEY)
  }
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>(loadCartFromStorage())
  const orderNote = ref<string>(loadNoteFromStorage())

  // Watch for changes and persist to localStorage
  watch(
    items,
    (newItems) => {
      saveCartToStorage(newItems)
    },
    { deep: true },
  )

  watch(orderNote, (newNote) => {
    saveNoteToStorage(newNote)
  })

  // Getters
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Actions
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

  function clearCart() {
    items.value = []
    orderNote.value = ''
    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem(NOTE_STORAGE_KEY)
  }

  return {
    items,
    orderNote,
    totalPrice,
    totalItems,
    isEmpty,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  }
})
