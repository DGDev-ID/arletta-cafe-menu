<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import CartItemCard from '@/components/CartItemCard.vue'

const route = useRoute()
const cartStore = useCartStore()
</script>

<template>
  <div class="min-h-screen bg-bg">
    <!-- Header -->
    <div class="bg-primary text-white px-4 py-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-3">
          <RouterLink
            :to="{ path: '/', query: route.query }"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors duration-200"
          >
            <i class="pi pi-arrow-left text-sm"></i>
          </RouterLink>
          <div>
            <h2 class="text-xl font-bold">Keranjang Saya</h2>
            <p class="text-secondary/80 text-xs mt-0.5">{{ cartStore.totalItems }} item dipilih</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 pb-36">
      <!-- Empty State -->
      <div v-if="cartStore.isEmpty" class="text-center py-16">
        <i class="pi pi-shopping-cart text-5xl text-accent mb-4 block"></i>
        <h3 class="text-lg font-semibold text-text mb-2">Keranjang Kosong</h3>
        <p class="text-sm text-text-light mb-6">Belum ada item yang ditambahkan</p>
        <RouterLink
          :to="{ path: '/', query: route.query }"
          class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 text-sm"
        >
          <i class="pi pi-arrow-left text-xs"></i>
          Lihat Menu
        </RouterLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="flex flex-col gap-3">
        <CartItemCard v-for="item in cartStore.items" :key="item.id" :item="item" />

        <!-- Order Note -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary p-4 mt-2">
          <label class="flex items-center gap-2 text-sm font-semibold text-text mb-2">
            <i class="pi pi-pencil text-primary text-xs"></i>
            Catatan Pesanan
          </label>
          <textarea
            v-model="cartStore.orderNote"
            placeholder="Contoh: tidak pakai es, extra gula, alergi kacang..."
            rows="3"
            class="w-full text-sm text-text bg-secondary-light rounded-xl px-4 py-3 border border-secondary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none transition-colors duration-200 placeholder:text-text-light/60"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Bottom Bar (Fixed) -->
    <div
      v-if="!cartStore.isEmpty"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 z-40"
    >
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-text-light">Total Pesanan</span>
          <span class="text-xl font-bold text-primary">
            Rp {{ cartStore.totalPrice.toLocaleString('id-ID') }}
          </span>
        </div>
        <div class="flex gap-3">
          <RouterLink
            :to="{ path: '/', query: route.query }"
            class="flex-1 text-center bg-secondary hover:bg-secondary text-text font-medium py-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-1.5"
          >
            <i class="pi pi-plus text-xs"></i>
            Tambah Lagi
          </RouterLink>
          <RouterLink
            :to="{ path: '/checkout', query: route.query }"
            class="flex-1 text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-1.5"
          >
            Checkout
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
