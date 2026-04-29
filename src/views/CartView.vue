<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useCafeStore } from '@/stores/cafe'
import { useToast } from 'primevue/usetoast'
import { addOrderOpenBill } from '@/services/api'
import CartItemCard from '@/components/CartItemCard.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const cafeStore = useCafeStore()
const toast = useToast()
const isChecking = ref(false)
const isSubmittingOpenBill = ref(false)

// Apakah mode open bill aktif
const isOpenBill = computed(() => cartStore.isOpenBillMode)

// Untuk open bill: cart baru wajib ada item sebelum bisa kirim
const canSubmitOpenBill = computed(() => !cartStore.isEmpty)

async function handleCheckout() {
  if (isChecking.value) return
  isChecking.value = true
  try {
    const result = await cartStore.checkBulk()
    if (!result.success) {
      toast.add({
        severity: 'warn',
        summary: 'Stok Berubah',
        detail: result.message || 'Beberapa item mungkin tidak tersedia',
        life: 4000,
      })
      return
    }
    router.push({ path: '/checkout', query: route.query })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memeriksa ketersediaan item',
      life: 3000,
    })
  } finally {
    isChecking.value = false
  }
}

async function handleSubmitOpenBill() {
  if (isSubmittingOpenBill.value || cartStore.isEmpty) return
  isSubmittingOpenBill.value = true
  try {
    const res = await addOrderOpenBill({
      cafe_table_id: cafeStore.table!.id,
      orders: cartStore.items.map((item) => ({
        menu_id: item.id,
        amount: item.quantity,
      })),
    })

    if (!res.success) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.message, life: 3000 })
      return
    }

    toast.add({
      severity: 'success',
      summary: 'Pesanan Terkirim!',
      detail: 'Pesananmu sudah diterima dapur. Silakan tambah menu lain kapan saja.',
      life: 4000,
    })

    // Refresh data dari API agar locked items terupdate
    const { cafe_id, table_id } = route.query
    if (typeof cafe_id === 'string' && typeof table_id === 'string') {
      cafeStore.isLoaded = false
      await cafeStore.fetchCafeData(cafe_id, table_id)

      // Ganti bagian re-enter setelah fetchCafeData berhasil
      const trx = cafeStore.activeTransaction
      if (trx) {
        const locked = trx.details.map((d) => ({
          id: d.id,
          menu_id: d.menu_id,
          name: d.menu?.name ?? d.menu_name ?? `Menu #${d.menu_id}`,
          price: typeof d.price === 'string' ? parseFloat(d.price) : d.price,
          quantity: d.amount,
          description: d.description,
          isLocked: true as const,
        }))
        cartStore.setOpenBillMode(locked)
      }
    }

    // Kembali ke menu
    router.push({ path: '/menu', query: route.query })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal mengirim pesanan'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 })
  } finally {
    isSubmittingOpenBill.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <!-- Header -->
    <div class="bg-primary text-white px-4 py-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-3">
          <RouterLink
            :to="{ path: '/menu', query: route.query }"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors duration-200"
          >
            <i class="pi pi-arrow-left text-sm"></i>
          </RouterLink>
          <div>
            <h2 class="text-xl font-bold">Keranjang Saya</h2>
            <p class="text-secondary/80 text-xs mt-0.5">
              <template v-if="isOpenBill">Mode Open Bill</template>
              <template v-else>{{ cartStore.totalItems }} item dipilih</template>
            </p>
          </div>
          <!-- Badge open bill -->
          <div
            v-if="isOpenBill"
            class="ml-auto inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold"
          >
            <i class="pi pi-receipt text-[10px]"></i>
            Open Bill
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 pb-36">
      <!-- ── OPEN BILL MODE ── -->
      <template v-if="isOpenBill">
        <!-- Locked items (sudah dipesan sebelumnya) -->
        <div v-if="cartStore.lockedItems.length > 0" class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-check-circle text-success text-sm"></i>
            <p class="text-sm font-semibold text-text">Sudah Dipesan</p>
            <span class="text-xs text-text-light bg-secondary px-2 py-0.5 rounded-full ml-auto">
              {{ cartStore.lockedItems.length }} item
            </span>
          </div>
          <div class="flex flex-col gap-2">
            <!-- Ganti bagian locked items card di CartView.vue -->
            <div
              v-for="item in cartStore.lockedItems"
              :key="item.id"
              class="bg-white rounded-xl border border-secondary p-3 flex items-center gap-3"
            >
              <!-- Icon status -->
              <div
                class="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0"
              >
                <i class="pi pi-check text-success text-sm"></i>
              </div>

              <!-- Info menu -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-text truncate">{{ item.name }}</p>
                <p class="text-xs text-text-light mt-0.5">
                  {{ item.quantity }}x @ Rp {{ item.price.toLocaleString('id-ID') }}
                </p>
                <p v-if="item.description" class="text-xs text-text-light/70 mt-0.5 italic">
                  {{ item.description }}
                </p>
              </div>

              <!-- Subtotal -->
              <span class="text-sm font-semibold text-text shrink-0">
                Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div
          v-if="cartStore.lockedItems.length > 0 && !cartStore.isEmpty"
          class="flex items-center gap-2 mb-4"
        >
          <div class="h-px flex-1 bg-secondary"></div>
          <span class="text-xs font-semibold text-text-light uppercase tracking-wider"
            >Tambah Baru</span
          >
          <div class="h-px flex-1 bg-secondary"></div>
        </div>

        <!-- Cart items baru -->
        <div v-if="!cartStore.isEmpty" class="flex flex-col gap-3">
          <CartItemCard v-for="item in cartStore.items" :key="item.id" :item="item" />
        </div>

        <!-- Empty new cart -->
        <div
          v-if="cartStore.isEmpty && cartStore.lockedItems.length === 0"
          class="text-center py-16"
        >
          <i class="pi pi-shopping-cart text-5xl text-accent mb-4 block"></i>
          <h3 class="text-lg font-semibold text-text mb-2">Belum ada pesanan</h3>
          <p class="text-sm text-text-light mb-6">Pilih menu untuk ditambahkan ke open bill</p>
          <RouterLink
            :to="{ path: '/menu', query: route.query }"
            class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 text-sm"
          >
            <i class="pi pi-arrow-left text-xs"></i>
            Lihat Menu
          </RouterLink>
        </div>

        <div v-else-if="cartStore.isEmpty" class="text-center py-8 text-text-light">
          <i class="pi pi-plus-circle text-3xl text-accent mb-3 block"></i>
          <p class="text-sm font-medium">Tambahkan menu baru ke open bill</p>
          <RouterLink
            :to="{ path: '/menu', query: route.query }"
            class="inline-flex items-center gap-2 bg-secondary hover:bg-secondary text-text px-4 py-2 rounded-xl font-medium text-sm mt-3 transition-colors"
          >
            <i class="pi pi-plus text-xs"></i>
            Tambah Menu
          </RouterLink>
        </div>
      </template>

      <!-- ── NORMAL MODE ── -->
      <template v-else>
        <div v-if="cartStore.isEmpty" class="text-center py-16">
          <i class="pi pi-shopping-cart text-5xl text-accent mb-4 block"></i>
          <h3 class="text-lg font-semibold text-text mb-2">Keranjang Kosong</h3>
          <p class="text-sm text-text-light mb-6">Belum ada item yang ditambahkan</p>
          <RouterLink
            :to="{ path: '/menu', query: route.query }"
            class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 text-sm"
          >
            <i class="pi pi-arrow-left text-xs"></i>
            Lihat Menu
          </RouterLink>
        </div>
        <div v-else class="flex flex-col gap-3">
          <CartItemCard v-for="item in cartStore.items" :key="item.id" :item="item" />
        </div>
      </template>
    </div>

    <!-- ── Bottom Bar ── -->

    <!-- Open Bill Bottom Bar -->
    <div
      v-if="isOpenBill"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 z-40"
    >
      <div class="max-w-3xl mx-auto">
        <!-- Info total locked + baru -->
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm text-text-light">
            <span v-if="cartStore.lockedItems.length > 0">
              Sudah dipesan:
              <span class="font-medium text-text"
                >Rp {{ cartStore.lockedTotalPrice.toLocaleString('id-ID') }}</span
              >
            </span>
            <span v-if="!cartStore.isEmpty" :class="{ 'ml-3': cartStore.lockedItems.length > 0 }">
              Baru:
              <span class="font-medium text-primary"
                >Rp {{ cartStore.totalPrice.toLocaleString('id-ID') }}</span
              >
            </span>
          </div>
        </div>
        <div class="flex gap-3">
          <RouterLink
            :to="{ path: '/menu', query: route.query }"
            class="flex-1 text-center bg-secondary hover:bg-secondary text-text font-medium py-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-1.5"
          >
            <i class="pi pi-plus text-xs"></i>
            Tambah Lagi
          </RouterLink>
          <button
            @click="handleSubmitOpenBill"
            :disabled="isSubmittingOpenBill || !canSubmitOpenBill"
            class="flex-1 text-center bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-1.5"
          >
            <i v-if="isSubmittingOpenBill" class="pi pi-spinner pi-spin text-xs"></i>
            <template v-else>
              <i class="pi pi-send text-xs"></i>
              Kirim Pesanan
            </template>
          </button>
        </div>
        <p class="text-center text-xs text-text-light mt-2">
          Pembayaran dilakukan di kasir saat selesai
        </p>
      </div>
    </div>

    <!-- Normal Bottom Bar -->
    <div
      v-else-if="!cartStore.isEmpty"
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
            :to="{ path: '/menu', query: route.query }"
            class="flex-1 text-center bg-secondary hover:bg-secondary text-text font-medium py-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-1.5"
          >
            <i class="pi pi-plus text-xs"></i>
            Tambah Lagi
          </RouterLink>
          <button
            @click="handleCheckout"
            :disabled="isChecking"
            class="flex-1 text-center bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-1.5"
          >
            <i v-if="isChecking" class="pi pi-spinner pi-spin text-xs"></i>
            <template v-else>
              Checkout
              <i class="pi pi-arrow-right text-xs"></i>
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
