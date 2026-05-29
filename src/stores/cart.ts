// stores/cart.ts — FULL FILE

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Menu, SelectedVariant } from '@/types/api'
import { checkAvailableMaterial, checkAvailableMaterialBulk } from '@/services/api'

export interface CartItem {
  id: number
  name: string
  price: number
  image: string | null
  quantity: number
  description?: string | null
  selected_variants?: SelectedVariant[] // TAMBAHAN
}

export interface LockedCartItem {
  id: number
  menu_id: number
  name: string
  price: number
  quantity: number
  description: string | null
  isLocked: true
}

const CART_STORAGE_KEY = 'arletta-cafe-cart'

function loadCartFromStorage(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as CartItem[]
      return parsed.map((it) => ({
        ...it,
        description: it.description ?? null,
        selected_variants: it.selected_variants ?? [],
      }))
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCartFromStorage())
  const lockedItems = ref<LockedCartItem[]>([])
  const isOpenBillMode = ref(false)

  watch(items, (newItems) => saveCartToStorage(newItems), { deep: true })

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const isEmpty = computed(() => items.value.length === 0)
  const lockedTotalPrice = computed(() =>
    lockedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  function setOpenBillMode(locked: LockedCartItem[]) {
    const wasAlreadyOpenBill = isOpenBillMode.value
    isOpenBillMode.value = true
    lockedItems.value = locked
    if (!wasAlreadyOpenBill) items.value = []
  }

  function clearOpenBillMode() {
    isOpenBillMode.value = false
    lockedItems.value = []
  }

  // MODIFIKASI: addToCart dengan support selected_variants
  function addToCart(menuItem: Menu, selectedVariants: SelectedVariant[] = []) {
    // Jika ada selectable material, setiap pilihan variant = item terpisah
    // (karena user bisa pilih Temanggung vs Kalimantan → produk berbeda secara stok)
    if (selectedVariants.length > 0) {
      // Cari item yang sama persis (menu + variant combination)
      const existing = items.value.find(
        (item) =>
          item.id === menuItem.id &&
          JSON.stringify(item.selected_variants) === JSON.stringify(selectedVariants),
      )
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
          selected_variants: selectedVariants,
        })
      }
    } else {
      const existing = items.value.find(
        (item) =>
          item.id === menuItem.id &&
          (!item.selected_variants || item.selected_variants.length === 0),
      )
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
          selected_variants: [],
        })
      }
    }
  }

  function removeFromCart(itemId: number, selectedVariants: SelectedVariant[] = []) {
    const index = items.value.findIndex(
      (item) =>
        item.id === itemId &&
        JSON.stringify(item.selected_variants ?? []) === JSON.stringify(selectedVariants),
    )
    if (index !== -1) items.value.splice(index, 1)
  }

  function increaseQty(itemId: number, selectedVariants: SelectedVariant[] = []) {
    const item = items.value.find(
      (i) =>
        i.id === itemId &&
        JSON.stringify(i.selected_variants ?? []) === JSON.stringify(selectedVariants),
    )
    if (item) item.quantity++
  }

  function decreaseQty(itemId: number, selectedVariants: SelectedVariant[] = []) {
    const item = items.value.find(
      (i) =>
        i.id === itemId &&
        JSON.stringify(i.selected_variants ?? []) === JSON.stringify(selectedVariants),
    )
    if (item) {
      if (item.quantity > 1) item.quantity--
      else removeFromCart(itemId, selectedVariants)
    }
  }

  function setItemDescription(itemId: number, desc: string | null) {
    const item = items.value.find((i) => i.id === itemId)
    if (item) item.description = desc
  }

  async function checkAndAdd(
    menuItem: Menu,
    selectedVariants: SelectedVariant[] = [],
  ): Promise<{ success: boolean; message: string }> {
    const currentQty =
      items.value.find(
        (i) =>
          i.id === menuItem.id &&
          JSON.stringify(i.selected_variants ?? []) === JSON.stringify(selectedVariants),
      )?.quantity ?? 0

    const result = await checkAvailableMaterial({
      menu_id: menuItem.id,
      quantity: currentQty + 1,
      selected_variants: selectedVariants,
    })
    if (!result.success) return { success: false, message: result.message }
    addToCart(menuItem, selectedVariants)
    return { success: true, message: result.message }
  }

  async function checkAndIncrease(
    menuItem: Menu,
    selectedVariants: SelectedVariant[] = [],
  ): Promise<{ success: boolean; message: string }> {
    const currentQty =
      items.value.find(
        (i) =>
          i.id === menuItem.id &&
          JSON.stringify(i.selected_variants ?? []) === JSON.stringify(selectedVariants),
      )?.quantity ?? 0

    const result = await checkAvailableMaterial({
      menu_id: menuItem.id,
      quantity: currentQty + 1,
      selected_variants: selectedVariants,
    })
    if (!result.success) return { success: false, message: result.message }
    increaseQty(menuItem.id, selectedVariants)
    return { success: true, message: result.message }
  }

  async function checkAndDecrease(
    menuItem: Menu,
    selectedVariants: SelectedVariant[] = [],
  ): Promise<{ success: boolean; message: string }> {
    const currentQty =
      items.value.find(
        (i) =>
          i.id === menuItem.id &&
          JSON.stringify(i.selected_variants ?? []) === JSON.stringify(selectedVariants),
      )?.quantity ?? 0

    const nextQty = currentQty - 1
    if (nextQty <= 0) {
      removeFromCart(menuItem.id, selectedVariants)
      return { success: true, message: '' }
    }
    const result = await checkAvailableMaterial({
      menu_id: menuItem.id,
      quantity: nextQty,
      selected_variants: selectedVariants,
    })
    if (!result.success) return { success: false, message: result.message }
    decreaseQty(menuItem.id, selectedVariants)
    return { success: true, message: result.message }
  }

  function clearCart() {
    items.value = []
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  async function checkBulk(): Promise<{ success: boolean; message: string }> {
    if (items.value.length === 0) return { success: true, message: '' }
    const result = await checkAvailableMaterialBulk({
      items: items.value.map((item) => ({
        menu_id: item.id,
        quantity: item.quantity,
        selected_variants: item.selected_variants ?? [],
      })),
    })
    return { success: result.success, message: result.message }
  }

  // Legacy methods untuk backward compat (CartView)
  async function checkAndIncreaseById(
    itemId: number,
  ): Promise<{ success: boolean; message: string }> {
    const cartItem = items.value.find((i) => i.id === itemId)
    if (!cartItem) return { success: false, message: 'Item tidak ditemukan' }
    const result = await checkAvailableMaterial({
      menu_id: itemId,
      quantity: cartItem.quantity + 1,
      selected_variants: cartItem.selected_variants ?? [],
    })
    if (!result.success) return { success: false, message: result.message }
    increaseQty(itemId, cartItem.selected_variants ?? [])
    return { success: true, message: result.message }
  }

  async function checkAndDecreaseById(
    itemId: number,
  ): Promise<{ success: boolean; message: string }> {
    const cartItem = items.value.find((i) => i.id === itemId)
    if (!cartItem) return { success: false, message: 'Item tidak ditemukan' }
    const nextQty = cartItem.quantity - 1
    if (nextQty <= 0) {
      removeFromCart(itemId, cartItem.selected_variants ?? [])
      return { success: true, message: '' }
    }
    const result = await checkAvailableMaterial({
      menu_id: itemId,
      quantity: nextQty,
      selected_variants: cartItem.selected_variants ?? [],
    })
    if (!result.success) return { success: false, message: result.message }
    decreaseQty(itemId, cartItem.selected_variants ?? [])
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
