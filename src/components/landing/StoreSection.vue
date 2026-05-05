<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LandingCafe } from '@/types/api'

const props = defineProps<{
  stores: LandingCafe[]
  isLoading: boolean
}>()

const activeStore = ref<LandingCafe | null>(null)
const showMap = ref(false)

// Set default saat data tersedia
watch(
  () => props.stores,
  (val) => {
    if (val.length > 0 && !activeStore.value) {
      activeStore.value = val[0]!
    }
  },
  { immediate: true },
)

function selectStore(store: LandingCafe) {
  activeStore.value = store
  showMap.value = true
}

/** Google Maps embed dari koordinat "lat,lng" */
function buildMapSrc(coordinate: string | null, name: string): string {
  if (!coordinate) return ''
  const [lat, lng] = coordinate.split(',').map((s) => s.trim())
  const label = encodeURIComponent(name)
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=16&output=embed&t=m&iwloc=B&markers=label:${label}%7C${lat},${lng}`
}

const mapSrc = computed(() =>
  activeStore.value ? buildMapSrc(activeStore.value.address_coordinate, activeStore.value.name) : '',
)
</script>

<template>
  <section id="stores" class="bg-brown-50 py-24 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <!-- Header -->
      <div class="fade-in mb-16 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          Find Us Near You
        </span>
        <h2 class="font-heading text-brown-800 mt-3 text-4xl font-bold md:text-5xl">Our Stores</h2>
        <div class="bg-gold mx-auto mt-4 h-1 w-16 rounded-full"></div>
        <p class="text-brown-500 mx-auto mt-5 max-w-xl text-base">
          Visit any of our branches across Bandung. Each location offers the same premium Arletta
          experience with its own unique charm.
        </p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="grid gap-10 lg:grid-cols-5">
        <div class="space-y-4 lg:col-span-2">
          <div v-for="i in 3" :key="i" class="animate-pulse rounded-2xl bg-white p-5">
            <div class="flex items-start gap-4">
              <div class="h-20 w-20 shrink-0 rounded-xl bg-brown-100"></div>
              <div class="flex-1 space-y-2">
                <div class="h-5 w-3/4 rounded bg-brown-100"></div>
                <div class="h-3 w-full rounded bg-brown-100"></div>
                <div class="h-3 w-1/2 rounded bg-brown-100"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-3">
          <div class="animate-pulse rounded-2xl bg-brown-100" style="height: 510px"></div>
        </div>
      </div>

      <div v-else-if="activeStore" class="grid gap-10 lg:grid-cols-5">
        <!-- Store cards (left side) -->
        <div class="space-y-4 lg:col-span-2">
          <button
            v-for="store in stores"
            :key="store.id"
            class="group w-full rounded-2xl border-2 p-5 text-left transition-all duration-300"
            :class="
              activeStore.id === store.id
                ? 'border-gold bg-white shadow-lg shadow-gold/10'
                : 'border-transparent bg-white/60 hover:border-brown-200 hover:bg-white hover:shadow-md'
            "
            @click="selectStore(store)"
          >
            <div class="flex items-start gap-4">
              <!-- Store image thumbnail -->
              <img
                :src="store.img_url ?? 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&q=80'"
                :alt="store.name"
                class="h-20 w-20 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <h3 class="text-brown-800 text-lg font-bold">{{ store.name }}</h3>
                </div>
                <p class="text-brown-500 mb-2 text-sm leading-snug">
                  <i class="pi pi-map-marker text-gold mr-1 text-xs"></i>
                  {{ store.address }}
                </p>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brown-400">
                  <span v-if="store.phone_number">
                    <i class="pi pi-phone text-gold mr-1 text-[10px]"></i>
                    {{ store.phone_number }}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <!-- Map area (right side) -->
        <div class="lg:col-span-3">
          <div class="fade-in-right sticky top-24 overflow-hidden rounded-2xl shadow-xl">
            <!-- Store hero image + map toggle -->
            <div class="relative">
              <transition
                enter-active-class="transition-all duration-500 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-300 ease-in absolute inset-0"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
                mode="out-in"
              >
                <!-- Map view -->
                <iframe
                  v-if="showMap && mapSrc"
                  :key="'map-' + activeStore.id"
                  :src="mapSrc"
                  width="100%"
                  height="460"
                  style="border: 0"
                  allowfullscreen
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  :title="activeStore.name + ' location'"
                  class="w-full"
                ></iframe>

                <!-- No coordinate fallback -->
                <div
                  v-else-if="showMap && !mapSrc"
                  :key="'no-map-' + activeStore.id"
                  class="flex h-[460px] items-center justify-center bg-brown-100 text-brown-400"
                >
                  <div class="text-center">
                    <i class="pi pi-map text-4xl mb-3 block"></i>
                    <p class="text-sm">Koordinat belum tersedia</p>
                  </div>
                </div>

                <!-- Image view -->
                <div v-else :key="'img-' + activeStore.id" class="relative">
                  <img
                    :src="activeStore.img_url ?? 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80'"
                    :alt="activeStore.name"
                    class="h-115 w-full object-cover"
                  />
                  <div
                    class="absolute inset-0 bg-linear-to-t from-brown-900/70 via-transparent to-transparent"
                  ></div>
                  <div class="absolute bottom-0 left-0 right-0 p-8">
                    <h3 class="font-heading mb-1 text-2xl font-bold text-white">
                      {{ activeStore.name }}
                    </h3>
                    <p class="text-sm text-white/70">{{ activeStore.address }}</p>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Toggle bar -->
            <div class="bg-brown-800 flex items-center justify-between px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20">
                  <i class="pi pi-map-marker text-gold text-sm"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">{{ activeStore.name }}</p>
                  <p class="text-xs text-white/50">{{ activeStore.address }}</p>
                </div>
              </div>
              <button
                class="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:border-gold hover:bg-gold hover:text-brown-900"
                @click="showMap = !showMap"
              >
                <i :class="showMap ? 'pi pi-image' : 'pi pi-map'" class="text-xs"></i>
                {{ showMap ? 'View Photo' : 'View Map' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="py-16 text-center text-brown-400">
        Belum ada data cabang.
      </div>
    </div>
  </section>
</template>
