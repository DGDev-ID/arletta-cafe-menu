<script setup lang="ts">
import type { LandingGallery } from '@/types/api'

defineProps<{
  gallery: LandingGallery[]
  isLoading: boolean
}>()
</script>

<template>
  <section id="gallery" class="bg-cream py-24 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <!-- Header -->
      <div class="fade-in mb-16 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          Captured Moments
        </span>
        <h2 class="font-heading text-brown-800 mt-3 text-4xl font-bold md:text-5xl">Our Gallery</h2>
        <div class="bg-gold mx-auto mt-4 h-1 w-16 rounded-full"></div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="fade-in grid auto-rows-[250px] grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="i in 7"
          :key="i"
          class="animate-pulse rounded-2xl bg-brown-100"
          :class="i === 1 ? 'col-span-2 row-span-2' : i >= 6 ? 'col-span-2' : ''"
        ></div>
      </div>

      <!-- Gallery Grid -->
      <div v-else class="fade-in grid auto-rows-[250px] grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="(img, idx) in gallery"
          :key="img.id"
          :class="[
            'group relative cursor-pointer overflow-hidden rounded-2xl',
            idx === 0 ? 'col-span-2 row-span-2' : idx >= gallery.length - 2 ? 'col-span-2' : '',
          ]"
        >
          <img
            :src="img.img_url"
            :alt="'Gallery ' + (idx + 1)"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <!-- Overlay -->
          <div
            class="absolute inset-0 flex items-center justify-center bg-brown-900/0 transition-all duration-500 group-hover:bg-brown-900/50"
          >
            <i
              class="pi pi-search-plus text-2xl text-white opacity-0 transition-all duration-500 group-hover:opacity-100"
            ></i>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="gallery.length === 0"
          class="col-span-4 py-16 text-center text-brown-400"
        >
          Belum ada foto galeri.
        </div>
      </div>
    </div>
  </section>
</template>
