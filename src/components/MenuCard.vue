<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Menu } from '@/types/api'
import { useCartStore } from '@/stores/cart'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  item: Menu
}>()

const cartStore = useCartStore()
const toast = useToast()
const isAdding = ref(false)

const price = computed(() => parseFloat(props.item.price))

// Check if this item is already in the cart and get its quantity
const cartItem = computed(() => cartStore.items.find((ci) => ci.id === props.item.id))
const inCart = computed(() => !!cartItem.value)
const quantity = computed(() => cartItem.value?.quantity ?? 0)

const placeholderImage =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'

function handleAdd() {
  isAdding.value = true
  cartStore.addToCart(props.item)
  toast.add({
    severity: 'success',
    summary: 'Ditambahkan!',
    detail: `${props.item.name} ditambahkan ke keranjang`,
    life: 2000,
  })
  setTimeout(() => {
    isAdding.value = false
  }, 500)
}

function handleIncrease() {
  cartStore.increaseQty(props.item.id)
}

function handleDecrease() {
  cartStore.decreaseQty(props.item.id)
}
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
  >
    <!-- Image -->
    <div class="relative overflow-hidden h-44 sm:h-48">
      <img
        :src="item.img_url || placeholderImage"
        :alt="item.name"
        class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        loading="lazy"
      />
      <span
        v-if="item.status !== 'available'"
        class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold"
      >
        Tidak Tersedia
      </span>
    </div>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1">
      <h3 class="text-base font-semibold text-text mb-1">{{ item.name }}</h3>
      <p class="text-xs text-text-light leading-relaxed mb-3 flex-1">{{ item.description }}</p>

      <div class="mt-auto">
        <span class="text-base font-bold text-primary block mb-2">
          Rp {{ price.toLocaleString('id-ID') }}
        </span>

        <!-- Quantity controls if already in cart -->
        <div v-if="inCart" class="flex items-center gap-1.5">
          <button
            @click="handleDecrease"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent hover:text-white text-text transition-colors duration-200 shrink-0"
          >
            <i :class="quantity === 1 ? 'pi pi-trash' : 'pi pi-minus'" class="text-xs"></i>
          </button>
          <span class="text-sm font-bold text-text w-6 text-center shrink-0">{{ quantity }}</span>
          <button
            @click="handleIncrease"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors duration-200 shrink-0"
          >
            <i class="pi pi-plus text-xs"></i>
          </button>
        </div>

        <!-- Add button if not in cart -->
        <button
          v-else
          @click="handleAdd"
          :disabled="item.status !== 'available'"
          class="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-xl transition-all duration-200 active:scale-95"
          :class="{ 'animate-pulse-once bg-success!': isAdding }"
        >
          <i class="pi pi-plus text-xs"></i>
          Tambah
        </button>
      </div>
    </div>
  </div>
</template>
