<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useCafeStore } from '@/stores/cafe'
import { useOrderHistoryStore } from '@/stores/orderHistory'
import { useLocation } from '@/composables/useLocation'
import { useOrderTimeLimit } from '@/composables/useOrderTimeLimit'

const route = useRoute()
const cartStore = useCartStore()
const cafeStore = useCafeStore()
const historyStore = useOrderHistoryStore()
const { cafeName, locationLabel } = useLocation()
const { isOrderingDisabled } = useOrderTimeLimit()
</script>

<template>
  <div class="sticky top-0 z-50">
    <!-- Main navbar -->
    <nav class="shadow-lg navbar-art">
      <div class="relative overflow-hidden">
        <div class="max-w-5xl mx-auto px-4 py-3 relative z-10">
          <div class="flex items-center justify-between">
            <!-- Logo & Cafe Name -->
            <RouterLink
              :to="{ path: '/menu', query: route.query }"
              class="flex items-center gap-2 text-white no-underline"
            >
              <i class="pi pi-coffee text-2xl text-accent"></i>
              <div>
                <h1 class="text-lg font-bold leading-tight text-white">
                  {{ cafeName ?? 'Arletta Cafe' }}
                </h1>
                <p
                  v-if="locationLabel"
                  class="text-[11px] text-secondary opacity-90 leading-none mt-0.5"
                >
                  <span>{{ locationLabel }}</span>
                </p>
              </div>
            </RouterLink>

            <div class="flex items-center gap-2">
            <!-- History Icon (sembunyikan jika only preview) -->
            <RouterLink
              v-if="!cafeStore.isOnlyPreview"
              :to="{ path: '/history', query: route.query }"
              class="relative flex items-center gap-1.5 text-white no-underline bg-white/15 hover:bg-white/25 px-2.5 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <i class="pi pi-clock text-lg"></i>
            </RouterLink>

            <!-- Cart Icon (sembunyikan jika only preview) -->
            <RouterLink
              v-if="!cafeStore.isOnlyPreview"
              :to="{ path: '/cart', query: route.query }"
              class="relative flex items-center gap-1.5 text-white no-underline bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <!-- Tampilkan icon receipt jika open bill, cart jika normal -->
              <i
                :class="cartStore.isOpenBillMode ? 'pi pi-receipt' : 'pi pi-shopping-cart'"
                class="text-lg"
              ></i>
              <span class="text-sm font-medium hidden sm:inline">
                {{ cartStore.isOpenBillMode ? 'Open Bill' : 'Keranjang' }}
              </span>
              <!-- Badge -->
              <span
                v-if="cartStore.totalItems > 0"
                class="absolute -top-2 -right-2 bg-accent text-white text-[11px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 animate-bounce-in"
              >
                {{ cartStore.totalItems }}
              </span>
            </RouterLink>

            <!-- Preview Mode Badge -->
            <div
              v-if="cafeStore.isOnlyPreview"
              class="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-xl text-white text-xs font-semibold"
            >
              <i class="pi pi-eye text-sm"></i>
              <span class="hidden sm:inline">Preview</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Open Bill active banner — tepat di bawah navbar, ikut sticky -->
    <div
      v-if="cartStore.isOpenBillMode && cafeStore.activeTransaction"
      class="bg-primary/95 backdrop-blur-sm text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2"
    >
      <i class="pi pi-receipt text-[10px]"></i>
      <span>Open Bill aktif —</span>
      <span class="font-bold">{{ cafeStore.activeTransaction.cust_name ?? 'Pelanggan' }}</span>
      <span class="opacity-60">·</span>
      <span class="opacity-70">Pembayaran di kasir</span>
    </div>

    <!-- Time Limit banner -->
    <div
      v-if="isOrderingDisabled"
      class="bg-red-500 text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-center text-center gap-2 leading-relaxed"
    >
      <i class="pi pi-exclamation-triangle text-xs sm:text-sm shrink-0"></i>
      <span>Mohon maaf, pemesanan tidak bisa dilakukan pada jam 23:45-00:15 malam.</span>
    </div>
  </div>
</template>

<style scoped>
.navbar-art {
  background: linear-gradient(135deg, #5a3d2b 0%, #6f4e37 40%, #8b6b4f 70%, #6f4e37 100%);
}
</style>
