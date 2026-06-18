<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderHistoryStore, type HistoryOrder } from '@/stores/orderHistory'

const route = useRoute()
const router = useRouter()
const historyStore = useOrderHistoryStore()

onMounted(() => {
  historyStore.pruneExpired()
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

function expiresIn(iso: string) {
  const elapsed = Date.now() - new Date(iso).getTime()
  const remaining = 24 * 60 * 60 * 1000 - elapsed
  if (remaining <= 0) return 'Kedaluwarsa'
  const hours = Math.floor(remaining / 3600000)
  const mins = Math.floor((remaining % 3600000) / 60000)
  if (hours > 0) return `${hours}j ${mins}m lagi`
  return `${mins}m lagi`
}

function paymentLabel(type: string) {
  if (type === 'qris') return 'QRIS'
  if (type === 'manual') return 'Tunai'
  if (type === 'debit') return 'Debit'
  return type
}

function backToMenu() {
  // Preserve cafe_id and table_id if available
  router.push({ path: '/menu', query: route.query })
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <!-- Header -->
    <div class="bg-primary text-white px-4 py-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-3">
          <button
            @click="backToMenu"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors duration-200"
          >
            <i class="pi pi-arrow-left text-sm"></i>
          </button>
          <div>
            <h2 class="text-xl font-bold">Riwayat Pesanan</h2>
            <p class="text-secondary/80 text-xs mt-0.5">
              Pesanan sukses dalam 24 jam terakhir
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 pb-24">
      <!-- Empty State -->
      <div v-if="!historyStore.hasOrders" class="text-center py-16">
        <div
          class="w-20 h-20 mx-auto mb-5 rounded-2xl bg-secondary-light flex items-center justify-center"
        >
          <i class="pi pi-clock text-3xl text-accent"></i>
        </div>
        <h3 class="text-lg font-semibold text-text mb-2">Belum Ada Riwayat</h3>
        <p class="text-sm text-text-light mb-6 max-w-xs mx-auto">
          Pesanan yang berhasil akan muncul di sini dan otomatis hilang setelah 24 jam
        </p>
        <button
          @click="backToMenu"
          class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 text-sm"
        >
          <i class="pi pi-arrow-left text-xs"></i>
          Lihat Menu
        </button>
      </div>

      <!-- Order List -->
      <template v-else>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-list text-primary text-sm"></i>
            <span class="text-sm font-semibold text-text">
              {{ historyStore.activeOrders.length }} Pesanan
            </span>
          </div>
          <button
            @click="historyStore.clearAll()"
            class="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <i class="pi pi-trash text-[10px]"></i>
            Hapus Semua
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div
            v-for="(order, idx) in historyStore.activeOrders"
            :key="order.transactionId"
            class="bg-white rounded-2xl shadow-sm border border-secondary overflow-hidden animate-slide-up"
            :style="{ animationDelay: `${idx * 0.06}s`, opacity: 0 }"
          >
            <!-- Card Header -->
            <div class="px-4 pt-4 pb-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0"
                  >
                    <i class="pi pi-check-circle text-success text-lg"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-text truncate">
                      {{ order.orderNumber }}
                    </p>
                    <p class="text-xs text-text-light mt-0.5 flex items-center gap-1.5">
                      <i class="pi pi-clock text-[10px]"></i>
                      {{ timeAgo(order.savedAt) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    :class="
                      order.paymentType === 'qris'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'bg-green-50 text-green-600 border border-green-200'
                    "
                  >
                    {{ paymentLabel(order.paymentType) }}
                  </span>
                  <button
                    @click="historyStore.removeOrder(order.transactionId)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-text-light/40 hover:bg-red-50 hover:text-red-400 transition-colors"
                  >
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Info row -->
              <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-light">
                <span class="flex items-center gap-1">
                  <i class="pi pi-user text-[10px]"></i>
                  {{ order.custName }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-map-marker text-[10px]"></i>
                  {{ order.cafeName }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-table text-[10px]"></i>
                  {{ order.tableName }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-calendar text-[10px]"></i>
                  {{ formatDate(order.savedAt) }} {{ formatTime(order.savedAt) }}
                </span>
              </div>
            </div>

            <!-- Menu items -->
            <div class="px-4 py-3 border-t border-secondary/60">
              <div class="flex flex-col divide-y divide-secondary/40">
                <div
                  v-for="(item, i) in order.details"
                  :key="i"
                  class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span
                      class="w-5 h-5 rounded-md bg-secondary-light text-text-light text-[10px] font-bold flex items-center justify-center shrink-0"
                    >
                      {{ item.amount }}x
                    </span>
                    <span class="text-sm text-text truncate">{{ item.menuName }}</span>
                  </div>
                  <span class="text-sm font-medium text-text shrink-0 ml-2">
                    {{ formatCurrency(item.price) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer totals -->
            <div class="px-4 py-3 bg-secondary-light/50 border-t border-secondary/60">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-text-light">Total</span>
                  <span
                    class="text-[10px] text-text-light/50 flex items-center gap-1"
                    :title="'Kedaluwarsa ' + expiresIn(order.savedAt)"
                  >
                    <i class="pi pi-clock text-[8px]"></i>
                    {{ expiresIn(order.savedAt) }}
                  </span>
                </div>
                <span class="text-base font-bold text-primary">
                  {{ formatCurrency(order.totalPrice) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
