<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Menu, SelectedVariant } from '@/types/api'
import { useCartStore } from '@/stores/cart'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{ item: Menu }>()

const cartStore = useCartStore()
const toast = useToast()
const isLoading = ref(false)

// Variant selection state
const showVariantModal = ref(false)
const selectedVariants = ref<Record<number, number>>({}) // material_id -> variant_id

const price = computed(() => parseFloat(props.item.price))
const hasSelectableMaterials = computed(
  () => (props.item.selectable_materials?.length ?? 0) > 0,
)

// Cek apakah item ini (tanpa variant, untuk menu normal) ada di cart
const cartItem = computed(() =>
  cartStore.items.find(
    (ci) => ci.id === props.item.id && (!ci.selected_variants || ci.selected_variants.length === 0),
  ),
)
const inCart = computed(() => !hasSelectableMaterials.value && !!cartItem.value)
const quantity = computed(() => cartItem.value?.quantity ?? 0)

const placeholderImage =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'

// Validasi: semua selectable material sudah dipilih variantnya
const allVariantsSelected = computed(() => {
  if (!props.item.selectable_materials) return true
  return props.item.selectable_materials.every((sm) => selectedVariants.value[sm.material_id])
})

function buildSelectedVariantsPayload(): SelectedVariant[] {
  return Object.entries(selectedVariants.value).map(([materialId, variantId]) => ({
    material_id: Number(materialId),
    variant_id: variantId,
  }))
}

function openVariantModal() {
  selectedVariants.value = {}
  showVariantModal.value = true
}

function closeVariantModal() {
  showVariantModal.value = false
  selectedVariants.value = {}
}

async function confirmVariantAndAdd() {
  if (!allVariantsSelected.value) return
  isLoading.value = true
  showVariantModal.value = false
  try {
    const payload = buildSelectedVariantsPayload()
    const result = await cartStore.checkAndAdd(props.item, payload)
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Ditambahkan!',
        detail: `${props.item.name} ditambahkan ke keranjang`,
        life: 2000,
      })
    } else {
      toast.add({ severity: 'warn', summary: 'Tidak Tersedia', detail: result.message || 'Stok tidak mencukupi', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan, coba lagi', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function handleAdd() {
  if (isLoading.value) return
  if (hasSelectableMaterials.value) {
    openVariantModal()
    return
  }
  isLoading.value = true
  try {
    const result = await cartStore.checkAndAdd(props.item)
    if (result.success) {
      toast.add({ severity: 'success', summary: 'Ditambahkan!', detail: `${props.item.name} ditambahkan ke keranjang`, life: 2000 })
    } else {
      toast.add({ severity: 'warn', summary: 'Tidak Tersedia', detail: result.message || 'Stok tidak mencukupi', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan, coba lagi', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function handleIncrease() {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const result = await cartStore.checkAndIncrease(props.item)
    if (!result.success) {
      toast.add({ severity: 'warn', summary: 'Tidak Tersedia', detail: result.message || 'Stok tidak mencukupi', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan, coba lagi', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function handleDecrease() {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await cartStore.checkAndDecrease(props.item)
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan, coba lagi', life: 3000 })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
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
      <!-- Badge selectable -->
      <span
        v-if="hasSelectableMaterials"
        class="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
      >
        Pilih Variant
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

        <!-- Quantity controls — hanya untuk menu normal (non-selectable) -->
        <div v-if="inCart && !hasSelectableMaterials" class="flex items-center gap-1.5">
          <button
            @click="handleDecrease"
            :disabled="isLoading"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent hover:text-white text-text transition-colors duration-200 shrink-0 disabled:opacity-50"
          >
            <i v-if="!isLoading" :class="quantity === 1 ? 'pi pi-trash' : 'pi pi-minus'" class="text-xs"></i>
            <i v-else class="pi pi-spinner pi-spin text-xs"></i>
          </button>
          <span class="text-sm font-bold text-text w-6 text-center shrink-0">{{ quantity }}</span>
          <button
            @click="handleIncrease"
            :disabled="isLoading"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors duration-200 shrink-0 disabled:opacity-50"
          >
            <i v-if="!isLoading" class="pi pi-plus text-xs"></i>
            <i v-else class="pi pi-spinner pi-spin text-xs"></i>
          </button>
        </div>

        <!-- Add button -->
        <button
          v-else
          @click="handleAdd"
          :disabled="item.status !== 'available' || isLoading"
          class="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-xl transition-all duration-200 active:scale-95"
        >
          <i v-if="!isLoading" class="pi pi-plus text-xs"></i>
          <i v-else class="pi pi-spinner pi-spin text-xs"></i>
          {{ isLoading ? 'Checking...' : (hasSelectableMaterials ? 'Pilih & Tambah' : 'Tambah') }}
        </button>
      </div>
    </div>
    <!-- Variant Selection Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showVariantModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="closeVariantModal"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeVariantModal" />
        <div class="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden">
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-secondary" />
          </div>

          <div class="px-6 pt-4 pb-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-text">{{ item.name }}</h3>
                <p class="text-sm text-text-light">Pilih preferensi bahan</p>
              </div>
              <button
                @click="closeVariantModal"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-accent hover:text-white text-text-light transition-colors"
              >
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>

            <!-- Selectable Materials -->
            <div class="space-y-5 max-h-80 overflow-y-auto pr-1">
              <div
                v-for="sm in item.selectable_materials"
                :key="sm.material_id"
              >
                <p class="text-sm font-semibold text-text mb-2">
                  Pilih {{ sm.material_name }}
                  <span class="text-red-500">*</span>
                </p>
                <div class="grid grid-cols-1 gap-2">
                  <label
                    v-for="variant in sm.variants"
                    :key="variant.id"
                    :class="[
                      'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all duration-150',
                      Number(variant.stock) <= 0
                        ? 'opacity-40 cursor-not-allowed border-secondary bg-secondary/30'
                        : selectedVariants[sm.material_id] === variant.id
                          ? 'border-primary bg-primary/5'
                          : 'border-secondary hover:border-primary/40',
                    ]"
                  >
                    <input
                      type="radio"
                      :name="`material-${sm.material_id}`"
                      :value="variant.id"
                      v-model="selectedVariants[sm.material_id]"
                      :disabled="Number(variant.stock) <= 0"
                      class="accent-primary"
                    />
                    <div class="flex-1">
                      <span class="text-sm font-medium text-text">{{ variant.name }}</span>
                      <span
                        v-if="Number(variant.stock) <= 0"
                        class="ml-2 text-xs text-red-400 font-medium"
                      >Habis</span>
                    </div>
                    <i
                      v-if="selectedVariants[sm.material_id] === variant.id"
                      class="pi pi-check text-primary text-xs"
                    ></i>
                  </label>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 flex gap-3">
              <button
                @click="closeVariantModal"
                class="flex-1 border border-secondary rounded-xl py-3 text-sm font-medium text-text-light hover:bg-secondary transition-colors"
              >
                Batal
              </button>
              <button
                @click="confirmVariantAndAdd"
                :disabled="!allVariantsSelected || isLoading"
                class="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <i v-if="isLoading" class="pi pi-spin pi-spinner text-xs"></i>
                <i v-else class="pi pi-shopping-cart text-xs"></i>
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>