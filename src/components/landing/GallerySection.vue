<script setup lang="ts">
const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80',
    alt: 'Cafe interior',
    span: 'col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    alt: 'Latte art',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    alt: 'Food plating',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
    alt: 'Coffee beans',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&q=80',
    alt: 'Cafe corner',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80',
    alt: 'Barista at work',
    span: 'col-span-2',
  },
]
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

      <!-- Gallery Grid -->
      <div class="fade-in grid auto-rows-[250px] grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="(img, idx) in galleryImages"
          :key="idx"
          :class="['group relative cursor-pointer overflow-hidden rounded-2xl', img.span]"
        >
          <img
            :src="img.src"
            :alt="img.alt"
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
      </div>
    </div>
  </section>
</template>
