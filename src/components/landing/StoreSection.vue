<script setup lang="ts">
import { ref } from 'vue'

const stores = [
  {
    id: 1,
    name: 'Arletta Dago',
    badge: 'Flagship',
    address: 'Jl. Ir. H. Juanda No. 120, Dago, Bandung',
    phone: '+62 812 3456 7890',
    hours: 'Setiap Hari 07.00 — 23.00',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7985379582!2d107.61691!3d-6.88541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e652e8f1c1ef%3A0x9e0e74c6d3e6b7a7!2sDago%2C%20Bandung!5e0!3m2!1sen!2sid!4v1700000000000',
  },
  {
    id: 2,
    name: 'Arletta Braga',
    badge: 'Heritage',
    address: 'Jl. Braga No. 58, Braga, Bandung',
    phone: '+62 813 9876 5432',
    hours: 'Setiap Hari 08.00 — 22.00',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.85!2d107.6097!3d-6.9175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e64c5e1b1b1d%3A0x2e68e64c5e1b1b1d!2sBraga%2C%20Bandung!5e0!3m2!1sen!2sid!4v1700000000001',
  },
  {
    id: 3,
    name: 'Arletta Paskal',
    badge: 'New',
    address: 'Jl. Pasir Kaliki No. 25-27, Paskal, Bandung',
    phone: '+62 814 5678 1234',
    hours: 'Setiap Hari 08.00 — 22.00',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.75!2d107.5938!3d-6.9100!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e60073b0b0b1%3A0x2e68e60073b0b0b1!2sPaskal%2C%20Bandung!5e0!3m2!1sen!2sid!4v1700000000002',
  },
  {
    id: 4,
    name: 'Arletta Setiabudhi',
    badge: 'Cozy',
    address: 'Jl. Dr. Setiabudhi No. 88, Bandung',
    phone: '+62 815 2345 6789',
    hours: 'Setiap Hari 07.30 — 22.30',
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.60!2d107.5900!3d-6.8700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5cc5e5e5e5f%3A0x2e68e5cc5e5e5e5f!2sSetiabudhi%2C%20Bandung!5e0!3m2!1sen!2sid!4v1700000000003',
  },
]

const activeStore = ref(stores[0]!)
const showMap = ref(false)

function selectStore(store: (typeof stores)[number]) {
  activeStore.value = store
  showMap.value = true
}
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

      <div class="grid gap-10 lg:grid-cols-5">
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
                :src="store.image"
                :alt="store.name"
                class="h-20 w-20 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <h3 class="text-brown-800 text-lg font-bold">{{ store.name }}</h3>
                  <span
                    class="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                    :class="
                      activeStore.id === store.id
                        ? 'bg-gold text-brown-900'
                        : 'bg-brown-100 text-brown-500'
                    "
                  >
                    {{ store.badge }}
                  </span>
                </div>
                <p class="text-brown-500 mb-2 text-sm leading-snug">
                  <i class="pi pi-map-marker text-gold mr-1 text-xs"></i>
                  {{ store.address }}
                </p>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brown-400">
                  <span>
                    <i class="pi pi-phone text-gold mr-1 text-[10px]"></i>
                    {{ store.phone }}
                  </span>
                  <span>
                    <i class="pi pi-clock text-gold mr-1 text-[10px]"></i>
                    {{ store.hours }}
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
                  v-if="showMap"
                  :key="'map-' + activeStore.id"
                  :src="activeStore.mapSrc"
                  width="100%"
                  height="460"
                  style="border: 0"
                  allowfullscreen
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  :title="activeStore.name + ' location'"
                  class="w-full"
                ></iframe>

                <!-- Image view -->
                <div v-else :key="'img-' + activeStore.id" class="relative">
                  <img
                    :src="activeStore.image"
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
                  <p class="text-xs text-white/50">{{ activeStore.hours }}</p>
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
    </div>
  </section>
</template>
