<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/stores/cart'

defineProps<{
  item: CartItem
}>()

const cartStore = useCartStore()
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-secondary p-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200 animate-slide-in-right"
  >
    <!-- Image -->
    <img
      :src="
        item.image ||
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
      "
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
          @click="cartStore.decreaseQty(item.id)"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent hover:text-white text-text transition-colors duration-200"
        >
          <i class="pi pi-minus text-xs"></i>
        </button>
        <span class="text-sm font-semibold text-text min-w-[20px] text-center">
          {{ item.quantity }}
        </span>
        <button
          @click="cartStore.increaseQty(item.id)"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-primary hover:text-white text-text transition-colors duration-200"
        >
          <i class="pi pi-plus text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Subtotal & Delete -->
    <div class="flex flex-col items-end gap-2 shrink-0">
      <button
        @click="cartStore.removeFromCart(item.id)"
        class="text-text-light hover:text-danger transition-colors duration-200 p-1"
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
