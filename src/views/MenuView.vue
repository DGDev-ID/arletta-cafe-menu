<script setup lang="ts">
// removed unused Inertia import (not used in this app)
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCafeStore } from '@/stores/cafe'
import { useCartStore } from '@/stores/cart'
import { useLocation } from '@/composables/useLocation'
import { createOpenBill } from '@/services/api'
import { useToast } from 'primevue/usetoast'
import type { Menu, MenuCategory } from '@/types/api'
import MenuCard from '@/components/MenuCard.vue'

const cafeStore = useCafeStore()
const cartStore = useCartStore()
const { cafeName, locationLabel, locationIcon } = useLocation()
const router = useRouter()
const route = useRoute()
const toast = useToast()

// ── Open Bill Modal ─────────────────────────────────────────────
const showOrderTypeModal = ref(false)
const openBillCustomerName = ref('')
const isCreatingOpenBill = ref(false)
const openBillNameError = ref('')

// Logika inisialisasi: dijalankan saat data cafe sudah siap
onMounted(() => {
  initOpenBillFlow()
})

// Juga watch jika data baru saja selesai di-fetch (router guard async)
watch(() => cafeStore.isLoaded, (loaded) => {
  if (loaded) initOpenBillFlow()
}, { immediate: true })

function initOpenBillFlow() {
  if (!cafeStore.isLoaded) return

  const isOpenBill = cafeStore.isOpenBillTable

  if (!isOpenBill) {
    // Meja biasa — flow normal, tidak perlu apa-apa
    cartStore.clearOpenBillMode()
    return
  }

  const activeTrx = cafeStore.activeTransaction

  if (activeTrx) {
    // Sudah ada open bill aktif — langsung masuk mode open bill
    enterOpenBillMode(activeTrx)
  } else {
    // Meja open bill tapi belum ada transaksi — tampilkan modal pilih jenis order
    showOrderTypeModal.value = true
  }
}

function enterOpenBillMode(trx: NonNullable<typeof cafeStore.activeTransaction>) {
  const locked = trx.details.map((d) => ({
    id: d.id,
    menu_id: d.menu_id,
    name: d.menu_name,
    price: d.price,
    quantity: d.amount,
    description: d.description,
    isLocked: true as const,
  }))
  cartStore.setOpenBillMode(locked)
}

function handleChooseNormal() {
  showOrderTypeModal.value = false
  cartStore.clearOpenBillMode()
}

async function handleChooseOpenBill() {
  openBillNameError.value = ''
  if (!openBillCustomerName.value.trim()) {
    openBillNameError.value = 'Nama pelanggan wajib diisi'
    return
  }

  isCreatingOpenBill.value = true
  try {
    const res = await createOpenBill({
      cafe_table_id: cafeStore.table!.id,
      cust_name: openBillCustomerName.value.trim(),
    })

    if (!res.success) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.message, life: 3000 })
      return
    }

    cafeStore.setActiveTransaction(res.data)
    enterOpenBillMode(res.data)
    showOrderTypeModal.value = false

    toast.add({
      severity: 'success',
      summary: 'Open Bill Dibuat',
      detail: `Selamat datang, ${openBillCustomerName.value.trim()}!`,
      life: 3000,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal membuat open bill'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 })
  } finally {
    isCreatingOpenBill.value = false
  }
}

// ── Menu & Category (sama seperti sebelumnya) ───────────────────
const activeCategory = ref<number | null>(null)
const searchQuery = ref<string>('')

watch(
  () => cafeStore.topCategories,
  (cats) => {
    const first = cats[0]
    if (first !== undefined && activeCategory.value === null) {
      activeCategory.value = first.id
    }
  },
  { immediate: true },
)

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())
const isSearching = computed(() => normalizedQuery.value.length > 0)

const searchResults = computed(() => {
  if (!isSearching.value) return []
  const q = normalizedQuery.value
  return cafeStore.allMenus.filter(
    (item) => item.name.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q),
  )
})

const activeCat = computed<MenuCategory | undefined>(() =>
  cafeStore.topCategories.find((c) => c.id === activeCategory.value),
)

const subcategoryGroups = computed(() => {
  const cat = activeCat.value
  if (!cat) return []
  const groups: { label: string; items: Menu[] }[] = []
  if (cat.children?.length) {
    for (const child of cat.children) {
      const available = child.menus.filter((m) => m.status === 'available')
      if (available.length > 0) groups.push({ label: child.name, items: available })
    }
  }
  const directMenus = cat.menus.filter((m) => m.status === 'available')
  if (directMenus.length > 0) groups.push({ label: 'Lainnya', items: directMenus })
  return groups
})

const totalItemsInCategory = computed(() =>
  subcategoryGroups.value.reduce((n, g) => n + g.items.length, 0),
)

function selectCategory(catId: number) {
  activeCategory.value = catId
  searchQuery.value = ''
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-bg">

    <!-- ── Modal Pilih Jenis Order ── -->
    <Transition name="modal-fade">
      <div
        v-if="showOrderTypeModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <!-- Sheet -->
        <div class="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden">
          <!-- Handle bar (mobile) -->
          <div class="flex justify-center pt-3 pb-1 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-secondary" />
          </div>

          <div class="px-6 pt-4 pb-8">
            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <i class="pi pi-list text-primary text-2xl"></i>
              </div>
            </div>

            <h2 class="text-xl font-bold text-text text-center mb-1">Pilih Jenis Order</h2>
            <p class="text-sm text-text-light text-center mb-6">
              Meja ini mendukung Open Bill. Pilih cara pemesananmu.
            </p>

            <!-- Pilihan kartu -->
            <div class="flex flex-col gap-3 mb-6">
              <!-- Open Bill -->
              <div class="border-2 border-primary rounded-2xl p-4">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <i class="pi pi-receipt text-primary"></i>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-text text-sm">Open Bill</p>
                    <p class="text-xs text-text-light mt-0.5">
                      Tambah pesanan berkali-kali. Pembayaran di akhir melalui kasir.
                    </p>
                  </div>
                </div>

                <!-- Input nama untuk open bill -->
                <div class="mt-3">
                  <input
                    v-model="openBillCustomerName"
                    type="text"
                    placeholder="Nama pelanggan"
                    class="w-full bg-secondary-light rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/40 transition"
                    @keyup.enter="handleChooseOpenBill"
                  />
                  <p v-if="openBillNameError" class="text-xs text-red-500 mt-1.5">
                    {{ openBillNameError }}
                  </p>
                </div>

                <button
                  @click="handleChooseOpenBill"
                  :disabled="isCreatingOpenBill"
                  class="mt-3 w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <i v-if="isCreatingOpenBill" class="pi pi-spin pi-spinner text-xs"></i>
                  <template v-else>
                    <i class="pi pi-check text-xs"></i>
                    Mulai Open Bill
                  </template>
                </button>
              </div>

              <!-- Transaksi Normal -->
              <button
                @click="handleChooseNormal"
                class="w-full border border-secondary rounded-2xl p-4 text-left hover:bg-secondary-light transition-colors duration-200 flex items-start gap-3"
              >
                <div class="w-10 h-10 rounded-xl bg-secondary-light flex items-center justify-center shrink-0 mt-0.5">
                  <i class="pi pi-shopping-cart text-text-light"></i>
                </div>
                <div>
                  <p class="font-semibold text-text text-sm">Transaksi Normal</p>
                  <p class="text-xs text-text-light mt-0.5">
                    Pesan sekali dan bayar langsung (tunai atau QRIS).
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Open Bill Badge (indicator di halaman menu) ── -->
    <div
      v-if="cartStore.isOpenBillMode && cafeStore.activeTransaction"
      class="fixed top-0 left-0 right-0 z-30 bg-primary text-white text-center text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2"
    >
      <i class="pi pi-receipt text-[10px]"></i>
      Open Bill aktif — {{ cafeStore.activeTransaction.cust_name ?? 'Pelanggan' }}
      <span class="opacity-70">· Pembayaran di kasir</span>
    </div>

    <!-- Hero Banner -->
    <div
      class="relative h-48 sm:h-56 md:h-64 overflow-hidden"
      :class="{ 'mt-8': cartStore.isOpenBillMode }"
    >
      <img
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop&crop=center"
        alt="Arletta Cafe"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      <div class="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <h2 class="text-2xl sm:text-3xl font-bold mb-1 drop-shadow-lg">Selamat Datang!</h2>
        <p class="text-white/80 text-sm sm:text-base drop-shadow-md">
          Pilih menu favoritmu dan pesan langsung dari mejamu
        </p>
        <div class="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <div
            v-if="cafeName"
            class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm"
          >
            <i class="pi pi-map-marker text-accent-light text-[10px]"></i>
            <span class="font-medium">{{ cafeName }}</span>
          </div>
          <div
            v-if="locationLabel"
            class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm"
          >
            <i :class="locationIcon" class="text-accent-light text-[10px]"></i>
            <span class="font-semibold">{{ locationLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="max-w-5xl mx-auto px-4 -mt-5 relative z-10">
      <div class="bg-white rounded-2xl shadow-md p-2">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            v-for="cat in cafeStore.topCategories"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0"
            :class="
              activeCategory === cat.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-secondary-light text-text-light hover:bg-secondary'
            "
          >
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="max-w-5xl mx-auto px-4 mt-3 relative z-10">
      <div class="relative">
        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-sm pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama menu..."
          class="w-full bg-white rounded-xl shadow-sm border border-secondary pl-10 pr-10 py-3 text-sm text-text placeholder:text-text-light/60 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors duration-200"
        />
        <button
          v-if="isSearching"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-secondary hover:bg-accent hover:text-white text-text-light transition-colors duration-200"
        >
          <i class="pi pi-times text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Menu Content -->
    <div class="max-w-5xl mx-auto px-4 py-6 pb-24">
      <template v-if="isSearching">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-sm font-semibold text-text">
            Hasil pencarian: <span class="text-primary">"{{ searchQuery.trim() }}"</span>
          </h3>
          <span class="text-xs text-text-light bg-secondary px-2.5 py-1 rounded-full">
            {{ searchResults.length }} item
          </span>
        </div>
        <div
          v-if="searchResults.length > 0"
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <MenuCard
            v-for="(item, index) in searchResults"
            :key="item.id"
            :item="item"
            class="animate-slide-up"
            :style="{ animationDelay: `${index * 0.04}s`, opacity: 0 }"
          />
        </div>
        <div v-else class="text-center py-16">
          <i class="pi pi-search text-4xl text-accent mb-3 block"></i>
          <p class="font-semibold text-text mb-1">Menu tidak ditemukan</p>
          <p class="text-sm text-text-light">Coba kata kunci lain</p>
        </div>
      </template>

      <template v-else-if="activeCat">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-text">{{ activeCat.name }}</h3>
          <span class="text-xs text-text-light bg-secondary px-2.5 py-1 rounded-full">
            {{ totalItemsInCategory }} item
          </span>
        </div>
        <div
          v-for="(group, gIdx) in subcategoryGroups"
          :key="group.label"
          :class="{ 'mt-7': gIdx > 0 }"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="h-px flex-1 bg-secondary"></div>
            <span class="text-xs font-semibold text-text-light uppercase tracking-wider px-2">
              {{ group.label }}
            </span>
            <div class="h-px flex-1 bg-secondary"></div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <MenuCard
              v-for="(item, index) in group.items"
              :key="item.id"
              :item="item"
              class="animate-slide-up"
              :style="{ animationDelay: `${(gIdx * 4 + index) * 0.05}s`, opacity: 0 }"
            />
          </div>
        </div>
        <div v-if="totalItemsInCategory === 0" class="text-center py-12 text-text-light">
          <i class="pi pi-inbox text-4xl mb-3 block text-accent"></i>
          <p class="font-medium">Tidak ada menu di kategori ini</p>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-16 text-text-light">
          <i class="pi pi-spin pi-spinner text-3xl mb-3 block text-primary"></i>
          <p class="font-medium">Memuat menu...</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>