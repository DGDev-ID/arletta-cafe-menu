<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from 'primevue/usetoast'
import type { CartItem } from '@/stores/cart'

const props = defineProps<{
  item: CartItem
}>()

const cartStore = useCartStore()
const toast = useToast()
const isLoading = ref(false)
const localNote = ref<string | null>(props.item.description ?? null)

// sync localNote to store when editing
watch(localNote, (v) => {
  cartStore.setItemDescription(props.item.id, v ?? null)
})

async function handleIncrease(itemId: number) {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const result = await cartStore.checkAndIncreaseById(itemId)
    if (!result.success) {
      toast.add({
        severity: 'warn',
        summary: 'Tidak Tersedia',
        detail: result.message || 'Stok tidak mencukupi',
        life: 3000,
      })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function handleDecrease(itemId: number) {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await cartStore.checkAndDecreaseById(itemId)
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan', life: 3000 })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-secondary p-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200 animate-slide-in-right"
  >
    <!-- Image -->
    <img
      :src="item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'"
      :alt="item.name"
      class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0"
    />

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-semibold text-text truncate">{{ item.name }}</h4>
      <p class="text-sm font-bold text-primary mt-0.5">
        Rp {{ item.price.toLocaleString('id-ID') }}
      </p>

      <!-- Quantity Controls -->
      <div class="flex items-center gap-2 mt-2">
        <button
          @click="handleDecrease(item.id)"
          :disabled="isLoading"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent hover:text-white text-text transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="isLoading" class="pi pi-spinner pi-spin text-xs"></i>
          <i v-else class="pi pi-minus text-xs"></i>
        </button>
        <span class="text-sm font-semibold text-text min-w-[20px] text-center">
          {{ item.quantity }}
        </span>
        <button
          @click="handleIncrease(item.id)"
          :disabled="isLoading"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-primary hover:text-white text-text transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="isLoading" class="pi pi-spinner pi-spin text-xs"></i>
          <i v-else class="pi pi-plus text-xs"></i>
        </button>
      </div>

      <!-- Per-item note -->
      <div class="mt-3">
        <textarea
          v-model="localNote"
          placeholder="Catatan untuk item ini (contoh: tanpa es)"
          rows="2"
          class="w-full text-sm text-text bg-secondary-light rounded-xl px-3 py-2 border border-secondary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none placeholder:text-text-light/60"
        ></textarea>
      </div>
    </div>

    <!-- Subtotal & Delete -->
    <div class="flex flex-col items-end gap-2 shrink-0">
      <button
        @click="cartStore.removeFromCart(item.id)"
        :disabled="isLoading"
        class="text-text-light hover:text-danger transition-colors duration-200 p-1 disabled:opacity-50"
        title="Hapus item"
      >
        <i class="pi pi-trash text-sm"></i>
      </button>
      <span class="text-sm font-bold text-accent">
        Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}
      </span>
    </div>
  </div>
</template>