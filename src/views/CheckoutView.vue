<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useLocation } from '@/composables/useLocation'
import { useCafeStore } from '@/stores/cafe'
import { makeTransaction, checkPromoCode, ApiError } from '@/services/api'
import type { TransactionResponse, PromoData } from '@/types/api'
import PaymentModal from '@/components/checkout/PaymentModal.vue'
import ManualPaymentStatus from '@/components/checkout/ManualPaymentStatus.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const cafeStore = useCafeStore()
const { cafeName, locationLabel, locationIcon, deliveryMessage } = useLocation()

onMounted(() => {
  if (cartStore.isOpenBillMode) {
    router.replace({ path: '/cart', query: route.query })
  }
})

const isOrdering = ref(false)
const orderSuccess = ref(false)
const orderNumber = ref('')
const customerName = ref('')
const savedCustomer = ref('')
const isCustomerValid = computed(() => customerName.value.trim().length > 0)

// Payment
const showPaymentModal = ref(false)
const transactionData = ref<TransactionResponse | null>(null)
const showManualPayment = ref(false)

// Error state
interface TransactionError {
  message: string
  unavailableMenus: string[]
}
const transactionError = ref<TransactionError | null>(null)

// ── Promo ───────────────────────────────────────────────────────
const promoCode = ref('')
const isCheckingPromo = ref(false)
const appliedPromo = ref<PromoData | null>(null)
const promoError = ref('')
const promoInput = ref('')

// Hitung diskon berdasarkan promo yang aktif
const discountAmount = computed(() => {
  if (!appliedPromo.value) return 0
  const subtotal = cartStore.totalPrice
  const value = parseFloat(appliedPromo.value.value)

  if (appliedPromo.value.type === 'discount_percent') {
    return Math.round((subtotal * value) / 100)
  }
  // discount_amount
  return Math.min(value, subtotal)
})

const finalPrice = computed(() => cartStore.totalPrice - discountAmount.value)

async function handleCheckPromo() {
  const code = promoInput.value.trim().toUpperCase() // ← tambah .toUpperCase()
  if (!code) return

  promoError.value = ''
  appliedPromo.value = null
  isCheckingPromo.value = true

  try {
    const res = await checkPromoCode({
      cafe_id: cafeStore.cafe!.unique_id,
      promo_code: code, // sudah uppercase
    })

    if (!res.success || !res.data) {
      promoError.value = res.message || 'Kode promo tidak valid'
      return
    }

    appliedPromo.value = res.data
    promoCode.value = code // sudah uppercase
  } catch {
    promoError.value = 'Gagal memeriksa kode promo'
  } finally {
    isCheckingPromo.value = false
  }
}

function removePromo() {
  appliedPromo.value = null
  promoCode.value = ''
  promoInput.value = ''
  promoError.value = ''
}
// ────────────────────────────────────────────────────────────────

function generateOrderNumber() {
  const now = new Date()
  return `ARL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

function handleOrder() {
  if (!isCustomerValid.value) return
  transactionError.value = null
  showPaymentModal.value = true
}

async function handlePaymentSelect(type: 'manual' | 'qris' | 'qr') {
  const normalizedType = type === 'qr' ? 'qris' : type
  isOrdering.value = true
  transactionError.value = null

  try {
    const payload = {
      cafe_id: cafeStore.cafe!.unique_id,
      table_id: cafeStore.table!.id,
      payment_type: normalizedType,
      cust_name: customerName.value.trim(),
      ...(promoCode.value ? { promo_code: promoCode.value } : {}),
      details: cartStore.items.map((item) => ({
        menu_id: item.id,
        amount: item.quantity,
        description: item.description ?? null,
      })),
    }

    const res = await makeTransaction(payload)

    transactionData.value = res.data
    showPaymentModal.value = false

    if (normalizedType === 'qris') {
      loadMidtransSnap(res.data.snap_token!)
    } else {
      showManualPayment.value = true
      savedCustomer.value = customerName.value.trim()
      cartStore.clearCart()
    }
  } catch (err: unknown) {
    showPaymentModal.value = false

    if (err instanceof ApiError) {
      if (err.status === 400) {
        const errData = err.data as {
          message: string
          errors: { unavailable_menus?: string[] } | null
        } | null
        transactionError.value = {
          message: errData?.message ?? err.message,
          unavailableMenus: errData?.errors?.unavailable_menus ?? [],
        }
      } else {
        transactionError.value = {
          message: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
          unavailableMenus: [],
        }
      }
    } else {
      transactionError.value = {
        message: 'Terjadi kesalahan. Silakan coba lagi.',
        unavailableMenus: [],
      }
    }
  } finally {
    isOrdering.value = false
  }
}

function loadMidtransSnap(snapToken: string) {
  const script = document.createElement('script')
  script.src = 'https://app.midtrans.com/snap/snap.js'
  script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string)
  script.onload = () => {
    // @ts-expect-error window.snap is not defined on the Window type
    window.snap.pay(snapToken, {
      onSuccess: () => {
        savedCustomer.value = customerName.value.trim()
        cartStore.clearCart()
        orderNumber.value = generateOrderNumber()
        orderSuccess.value = true
      },
      onPending: () => {},
      onError: () => {},
      onClose: () => {},
    })
  }
  document.body.appendChild(script)
}

function handleManualSuccess() {
  orderNumber.value = generateOrderNumber()
  orderSuccess.value = true
  showManualPayment.value = false
}

function backToMenu() {
  router.push({ path: '/menu', query: route.query })
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <!-- Header -->
    <div class="bg-primary text-white px-4 py-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-3">
          <RouterLink
            :to="{ path: '/cart', query: route.query }"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors duration-200"
          >
            <i class="pi pi-arrow-left text-sm"></i>
          </RouterLink>
          <div>
            <h2 class="text-xl font-bold">Checkout</h2>
            <p class="text-secondary/80 text-xs mt-0.5">Konfirmasi pesananmu</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Success State -->
    <div v-if="orderSuccess" class="max-w-3xl mx-auto px-4 py-12 text-center">
      <div class="bg-white rounded-2xl shadow-lg p-8 animate-bounce-in">
        <i class="pi pi-check-circle text-5xl text-success mb-4 block"></i>
        <h2 class="text-2xl font-bold text-text mb-2">Pesanan Berhasil!</h2>
        <p class="text-text-light text-sm mb-6">Pesananmu sedang disiapkan oleh dapur kami</p>

        <div class="bg-secondary-light rounded-xl p-4 mb-4">
          <p class="text-xs text-text-light mb-1">Nomor Pesanan</p>
          <p class="text-lg font-bold text-primary">{{ orderNumber }}</p>
        </div>
        <div class="bg-secondary-light rounded-xl p-4 mb-4">
          <p class="text-xs text-text-light mb-1">Lokasi</p>
          <p class="text-lg font-bold text-primary">{{ locationLabel }}</p>
          <p v-if="cafeName" class="text-xs text-text-light mt-0.5">
            <i class="pi pi-map-marker text-[10px]"></i> {{ cafeName }}
          </p>
        </div>
        <div v-if="savedCustomer" class="bg-secondary-light rounded-xl p-4 mb-6 text-left">
          <p class="text-xs text-text-light mb-1">Nama Pelanggan</p>
          <p class="text-sm font-medium text-text leading-relaxed">{{ savedCustomer }}</p>
        </div>

        <p class="text-xs text-text-light mb-6">{{ deliveryMessage }}</p>

        <button
          @click="backToMenu"
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <i class="pi pi-arrow-left text-sm"></i>
          Kembali ke Menu
        </button>
      </div>
    </div>

    <!-- Manual Payment Status -->
    <div v-else-if="showManualPayment && transactionData" class="max-w-3xl mx-auto px-4 py-6">
      <ManualPaymentStatus :transaction="transactionData" @success="handleManualSuccess" />
    </div>

    <!-- Checkout Content -->
    <div v-else class="max-w-3xl mx-auto px-4 py-6 pb-36">
      <div v-if="cartStore.isEmpty" class="text-center py-16">
        <i class="pi pi-clipboard text-5xl text-accent mb-4 block"></i>
        <h3 class="text-lg font-semibold text-text mb-2">Belum Ada Pesanan</h3>
        <p class="text-sm text-text-light mb-6">Pilih menu terlebih dahulu</p>
        <RouterLink
          :to="{ path: '/menu', query: route.query }"
          class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 text-sm"
        >
          <i class="pi pi-arrow-left text-xs"></i>
          Lihat Menu
        </RouterLink>
      </div>

      <template v-else>
        <!-- Transaction Error -->
        <div v-if="transactionError" class="bg-white rounded-2xl border border-red-200 p-4 mb-4">
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-circle text-red-500 text-lg mt-0.5 shrink-0"></i>
            <div class="flex-1">
              <p class="text-sm font-semibold text-red-600 mb-1">Pesanan Gagal</p>
              <p class="text-sm text-red-500 leading-relaxed">{{ transactionError.message }}</p>
              <div
                v-if="transactionError.unavailableMenus.length > 0"
                class="mt-3 bg-red-50 rounded-xl p-3"
              >
                <p class="text-xs font-semibold text-red-500 mb-2">Menu tidak tersedia:</p>
                <ul class="flex flex-col gap-1">
                  <li
                    v-for="menu in transactionError.unavailableMenus"
                    :key="menu"
                    class="flex items-center gap-2 text-xs text-red-500"
                  >
                    <i class="pi pi-times-circle text-[10px] shrink-0"></i>
                    {{ menu }}
                  </li>
                </ul>
              </div>
              <button
                @click="transactionError = null"
                class="mt-3 text-xs text-red-400 hover:text-red-600 underline transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>

        <!-- Table Info -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-secondary p-4 mb-4 flex items-center gap-3"
        >
          <div class="w-10 h-10 bg-secondary-light rounded-xl flex items-center justify-center">
            <i :class="locationIcon" class="text-primary text-lg"></i>
          </div>
          <div>
            <p class="text-xs text-text-light">Lokasi</p>
            <p class="text-lg font-bold text-primary">{{ locationLabel }}</p>
            <p v-if="cafeName" class="text-xs text-text-light mt-0.5">
              <i class="pi pi-map-marker text-[10px]"></i> {{ cafeName }}
            </p>
          </div>
        </div>

        <!-- Customer Name -->
        <div class="bg-white rounded-2xl shadow-sm border border-secondary p-4 mb-4">
          <h3 class="text-sm font-semibold text-text mb-2 flex items-center gap-2">
            <i class="pi pi-user text-primary"></i> Nama Pelanggan
          </h3>
          <input
            v-model="customerName"
            type="text"
            placeholder="Masukkan nama pelanggan"
            class="w-full bg-secondary-light rounded-xl px-4 py-2 text-sm text-text placeholder:text-text-light"
          />
          <p v-if="!isCustomerValid" class="text-xs text-primary mt-2">
            Isi dulu nama pelanggan sebelum memesan ya
          </p>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-2xl shadow-sm border border-secondary p-4 mb-4">
          <h3 class="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <i class="pi pi-list text-primary"></i> Ringkasan Pesanan
          </h3>
          <div class="flex flex-col divide-y divide-secondary">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <img
                  :src="
                    item.image ||
                    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
                  "
                  :alt="item.name"
                  class="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-text truncate">{{ item.name }}</p>
                  <p class="text-xs text-text-light">
                    {{ item.quantity }}x @ Rp {{ item.price.toLocaleString('id-ID') }}
                  </p>
                  <p v-if="item.description" class="text-xs text-text-light mt-1">
                    {{ item.description }}
                  </p>
                </div>
              </div>
              <span class="text-sm font-semibold text-accent ml-2 shrink-0">
                Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}
              </span>
            </div>
          </div>
        </div>

        <!-- ── Kode Promo ── -->
        <div class="bg-white rounded-2xl shadow-sm border border-secondary p-4 mb-4">
          <h3 class="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <i class="pi pi-tag text-primary"></i> Kode Promo
          </h3>

          <!-- Promo belum dipakai -->
          <div v-if="!appliedPromo" class="flex gap-2">
            <input
              v-model="promoInput"
              type="text"
              placeholder="Masukkan kode promo"
              class="flex-1 bg-secondary-light rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/40 transition uppercase"
              :disabled="isCheckingPromo"
              @keyup.enter="handleCheckPromo"
            />
            <button
              @click="handleCheckPromo"
              :disabled="isCheckingPromo || !promoInput.trim()"
              class="px-4 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2 shrink-0"
            >
              <i v-if="isCheckingPromo" class="pi pi-spin pi-spinner text-xs"></i>
              <span v-else>Pakai</span>
            </button>
          </div>

          <!-- Error promo -->
          <div
            v-if="promoError && !appliedPromo"
            class="mt-2 flex items-center gap-2 text-xs text-red-500"
          >
            <i class="pi pi-times-circle text-[10px]"></i>
            {{ promoError }}
          </div>

          <!-- Promo berhasil diterapkan -->
          <div
            v-if="appliedPromo"
            class="flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0"
              >
                <i class="pi pi-check text-success text-sm"></i>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-green-700 uppercase tracking-wide">
                  {{ appliedPromo.promo_code }}
                </p>
                <p class="text-xs text-green-600 mt-0.5">
                  <template v-if="appliedPromo.type === 'discount_percent'">
                    Diskon {{ parseFloat(appliedPromo.value) }}%
                  </template>
                  <template v-else>
                    Potongan Rp {{ parseFloat(appliedPromo.value).toLocaleString('id-ID') }}
                  </template>
                </p>
                <p class="text-xs font-semibold text-success mt-0.5">
                  Hemat Rp {{ discountAmount.toLocaleString('id-ID') }}
                </p>
              </div>
            </div>
            <button
              @click="removePromo"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-green-400 hover:bg-green-100 hover:text-green-600 transition-colors shrink-0"
            >
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Price Summary -->
        <div class="bg-white rounded-2xl shadow-sm border border-secondary p-4 mb-4">
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-text-light">Subtotal</span>
            <span class="text-sm font-medium text-text">
              Rp {{ cartStore.totalPrice.toLocaleString('id-ID') }}
            </span>
          </div>

          <div
            v-if="appliedPromo"
            class="flex justify-between items-center py-2 border-t border-secondary"
          >
            <span class="text-sm text-green-600 flex items-center gap-1.5">
              <i class="pi pi-tag text-[11px]"></i>
              Diskon ({{ appliedPromo.promo_code }})
            </span>
            <span class="text-sm font-semibold text-success">
              − Rp {{ discountAmount.toLocaleString('id-ID') }}
            </span>
          </div>

          <div class="flex justify-between items-center py-2 border-t border-secondary">
            <span class="text-sm text-text-light">Pajak & Layanan</span>
            <span class="text-sm font-medium text-text-light">Termasuk</span>
          </div>
          <div class="flex justify-between items-center pt-3 mt-2 border-t-2 border-primary/20">
            <span class="text-base font-bold text-text">Total</span>
            <div class="text-right">
              <!-- Harga coret jika ada diskon -->
              <p v-if="appliedPromo" class="text-xs text-text-light line-through">
                Rp {{ cartStore.totalPrice.toLocaleString('id-ID') }}
              </p>
              <span class="text-xl font-bold text-primary">
                Rp {{ finalPrice.toLocaleString('id-ID') }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Bottom Order Button -->
    <div
      v-if="!cartStore.isEmpty && !orderSuccess && !showManualPayment"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 z-40"
    >
      <div class="max-w-3xl mx-auto">
        <button
          @click="handleOrder"
          :disabled="isOrdering || !isCustomerValid"
          class="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
        >
          <template v-if="isOrdering">
            <i class="pi pi-spin pi-spinner"></i>
            Memproses Pesanan...
          </template>
          <template v-else>
            <i class="pi pi-send"></i>
            Pesan Sekarang — Rp {{ finalPrice.toLocaleString('id-ID') }}
          </template>
        </button>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :visible="showPaymentModal"
      :is-loading="isOrdering"
      @select="handlePaymentSelect"
      @close="showPaymentModal = false"
    />
  </div>
</template>
