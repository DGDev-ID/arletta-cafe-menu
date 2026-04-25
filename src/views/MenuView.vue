<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCafeStore } from '@/stores/cafe'
import type { Menu, MenuCategory } from '@/types/api'
import MenuCard from '@/components/MenuCard.vue'
import { useLocation } from '@/composables/useLocation'

const cafeStore = useCafeStore()
const { cafeName, locationLabel, locationIcon } = useLocation()

const activeCategory = ref<number | null>(null)
const searchQuery = ref<string>('')

// Auto-select first category when data loads
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

// Normalized search string
const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())
const isSearching = computed(() => normalizedQuery.value.length > 0)

// Search across all available menus (FE-only)
const searchResults = computed(() => {
  if (!isSearching.value) return []
  const q = normalizedQuery.value
  return cafeStore.allMenus.filter(
    (item) => item.name.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q),
  )
})

// Active top-level category object
const activeCat = computed<MenuCategory | undefined>(() => {
  return cafeStore.topCategories.find((c) => c.id === activeCategory.value)
})

// Build subcategory groups for the active category
// - children[] of the category become subcategory headers
// - menus[] directly on the parent category go to "Lainnya" group
const subcategoryGroups = computed(() => {
  const cat = activeCat.value
  if (!cat) return []

  const groups: { label: string; items: Menu[] }[] = []

  // Children subcategories first
  if (cat.children?.length) {
    for (const child of cat.children) {
      const available = child.menus.filter((m) => m.status === 'available')
      if (available.length > 0) {
        groups.push({ label: child.name, items: available })
      }
    }
  }

  // Direct menus on parent → "Lainnya"
  const directMenus = cat.menus.filter((m) => m.status === 'available')
  if (directMenus.length > 0) {
    groups.push({ label: 'Lainnya', items: directMenus })
  }

  return groups
})

// Total items in active category
const totalItemsInCategory = computed(() => {
  return subcategoryGroups.value.reduce((n, g) => n + g.items.length, 0)
})

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
    <!-- Hero Banner with Image -->
    <div class="relative h-48 sm:h-56 md:h-64 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop&crop=center"
        alt="Arletta Cafe"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
      <div
        class="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
      >
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

    <!-- Category Filter — horizontal scroll -->
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
        <i
          class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-sm pointer-events-none"
        ></i>
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
      <!-- Search Results -->
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

      <!-- Active category view — grouped by subcategory -->
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
          <!-- Subcategory Title -->
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

      <!-- Loading / empty fallback -->
      <template v-else>
        <div class="text-center py-16 text-text-light">
          <i class="pi pi-spin pi-spinner text-3xl mb-3 block text-primary"></i>
          <p class="font-medium">Memuat menu...</p>
        </div>
      </template>
    </div>
  </div>
</template>
