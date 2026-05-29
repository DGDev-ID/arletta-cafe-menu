<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LandingMenuItem } from '@/types/api'

const props = defineProps<{
  menus: LandingMenuItem[]
  isLoading: boolean
}>()

// Hanya kategori induk (parent_id === null), deduplicate by id
const parentCategories = computed(() => {
  const seen = new Set<number>()
  const result: { id: number; name: string }[] = []
  for (const m of props.menus) {
    const cat = m.category
    if (cat && cat.parent_id === null && !seen.has(cat.id)) {
      seen.add(cat.id)
      result.push({ id: cat.id, name: cat.name })
    }
  }
  return result
})

const activeCategory = ref<number | null>(null)

// Set default ke kategori pertama saat data tersedia
watch(
  parentCategories,
  (cats) => {
    if (cats.length > 0 && activeCategory.value === null) {
      activeCategory.value = cats[0]!.id
    }
  },
  { immediate: true },
)

const filteredItems = computed(() => {
  if (activeCategory.value === null) return props.menus
  return props.menus.filter((m) => {
    if (!m.category) return false
    // Cocok jika kategori menu adalah parent yang dipilih,
    // atau kategori menu adalah child dari parent yang dipilih
    return m.category.id === activeCategory.value || m.category.parent_id === activeCategory.value
  })
})

function formatPrice(price: string) {
  const num = parseFloat(price)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}
</script>

<template>
  <section id="menu" class="bg-brown-50 py-24 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <!-- Header -->
      <div class="fade-in mb-16 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          Our Selections
        </span>
        <h2 class="font-heading text-brown-800 mt-3 text-4xl font-bold md:text-5xl">
          Featured Menu
        </h2>
        <div class="bg-gold mx-auto mt-4 h-1 w-16 rounded-full"></div>
        <p class="text-brown-500 mx-auto mt-5 max-w-xl text-base">
          Each item is made fresh daily, using the finest ingredients for an unforgettable tasting
          experience.
        </p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="grid gap-4 md:grid-cols-2">
        <div
          v-for="i in 6"
          :key="i"
          class="flex items-start gap-5 rounded-2xl bg-white p-5 shadow-sm animate-pulse"
        >
          <div class="h-28 w-28 shrink-0 rounded-xl bg-brown-100 md:h-32 md:w-32"></div>
          <div class="flex-1 space-y-3 py-1">
            <div class="h-3 w-1/4 rounded bg-brown-100"></div>
            <div class="h-5 w-3/4 rounded bg-brown-100"></div>
            <div class="h-px w-full bg-brown-100"></div>
            <div class="space-y-2">
              <div class="h-3 w-full rounded bg-brown-100"></div>
              <div class="h-3 w-5/6 rounded bg-brown-100"></div>
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Category Filter -->
        <div class="mb-12 flex flex-wrap justify-center gap-3 animate-fade-in">
          <button
            v-for="cat in parentCategories"
            :key="cat.id"
            class="rounded-full px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300"
            :class="
              activeCategory === cat.id
                ? 'bg-brown-800 text-white shadow-lg'
                : 'bg-white text-brown-600 hover:bg-brown-100 shadow-sm'
            "
            @click="activeCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Menu List -->
        <div class="grid gap-4 md:grid-cols-2">
          <transition-group
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="group flex items-start gap-5 rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <!-- Image -->
              <div class="relative shrink-0 overflow-hidden rounded-xl">
                <img
                  :src="
                    item.img_url ??
                    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80'
                  "
                  :alt="item.name"
                  class="h-28 w-28 object-cover transition-transform duration-500 group-hover:scale-105 md:h-32 md:w-32"
                />
                <!-- Promo badge -->
                <span
                  v-if="item.promo"
                  class="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold tracking-wide text-brown-900 shadow"
                >
                  Promo
                </span>
              </div>

              <!-- Content -->
              <div class="min-w-0 flex-1 py-1">
                <!-- Category pill -->
                <span
                  class="text-brown-400 mb-1 inline-block text-[11px] font-semibold tracking-widest uppercase"
                >
                  {{ item.category?.name ?? '—' }}
                </span>

                <!-- Name + Price row -->
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-heading text-brown-800 text-lg font-bold leading-tight">
                    {{ item.name }}
                  </h3>
                  <span class="shrink-0 text-base font-bold text-gold">
                    {{ formatPrice(item.price) }}
                  </span>
                </div>

                <!-- Divider -->
                <div class="bg-brown-100 my-2.5 h-px w-full"></div>

                <!-- Description -->
                <p class="text-brown-500 line-clamp-3 text-sm leading-relaxed">
                  {{ item.description || 'Tidak ada deskripsi.' }}
                </p>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- Empty state -->
        <div v-if="filteredItems.length === 0" class="py-16 text-center text-brown-400">
          Tidak ada menu untuk kategori ini.
        </div>
      </template>
    </div>
  </section>
</template>
