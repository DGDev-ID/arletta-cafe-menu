<script setup lang="ts">
const instagramPosts = [
  {
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    alt: 'Latte art',
    likes: '2.4K',
  },
  {
    src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    alt: 'Cafe vibes',
    likes: '3.1K',
  },
  {
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    alt: 'Plating art',
    likes: '1.8K',
  },
  {
    src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    alt: 'Morning coffee',
    likes: '4.2K',
  },
  {
    src: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&q=80',
    alt: 'Interior corner',
    likes: '2.9K',
  },
  {
    src: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400&q=80',
    alt: 'Cozy spot',
    likes: '1.5K',
  },
]
</script>

<template>
  <section class="relative overflow-hidden bg-cream py-24 md:py-32">
    <!-- Decorative top line -->
    <div
      class="bg-linear-to-r from-transparent via-gold/30 to-transparent absolute top-0 right-0 left-0 h-px"
    ></div>

    <div class="mx-auto max-w-7xl px-6">
      <!-- Header CTA -->
      <div class="fade-in mb-14 text-center">
        <div
          class="mb-5 inline-flex items-center gap-3 rounded-full border border-gold/20 bg-white px-6 py-3 shadow-sm"
        >
          <i class="pi pi-instagram text-xl text-brown-700"></i>
          <span class="text-sm font-semibold tracking-wider text-brown-600 uppercase">
            On Instagram
          </span>
        </div>

        <h2 class="font-heading text-brown-800 text-4xl font-bold md:text-5xl lg:text-6xl">
          Follow Us
        </h2>
        <a
          href="https://instagram.com/arletta.coffee"
          target="_blank"
          rel="noopener noreferrer"
          class="font-heading mt-2 inline-block text-3xl font-bold text-gold italic transition-all duration-300 hover:text-gold-light md:text-4xl"
        >
          @arletta.coffee
        </a>
        <p class="text-brown-500 mx-auto mt-4 max-w-md text-base">
          Get daily inspiration, behind-the-scenes brews, and mouth-watering food shots. Join our
          community!
        </p>
      </div>

      <!-- Instagram Grid -->
      <div class="fade-in grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        <a
          v-for="(post, idx) in instagramPosts"
          :key="idx"
          href="https://instagram.com/arletta.coffee"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative aspect-square overflow-hidden rounded-2xl"
        >
          <img
            :src="post.src"
            :alt="post.alt"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <!-- Hover overlay -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center bg-brown-900/0 transition-all duration-500 group-hover:bg-brown-900/60"
          >
            <i
              class="pi pi-heart-fill mb-1 text-xl text-white opacity-0 transition-all delay-100 duration-300 group-hover:opacity-100"
            ></i>
            <span
              class="text-sm font-semibold text-white opacity-0 transition-all delay-150 duration-300 group-hover:opacity-100"
            >
              {{ post.likes }}
            </span>
          </div>
        </a>
      </div>

      <!-- Bottom CTA button -->
      <div class="fade-in mt-10 text-center">
        <a
          href="https://instagram.com/arletta.coffee"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-3 rounded-full border-2 border-brown-800 px-8 py-4 text-sm font-semibold tracking-wider text-brown-800 uppercase transition-all duration-300 hover:bg-brown-800 hover:text-white hover:shadow-lg"
        >
          <i
            class="pi pi-instagram text-base transition-transform duration-300 group-hover:scale-110"
          ></i>
          Follow @arletta.coffee
          <i
            class="pi pi-arrow-up-right text-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          ></i>
        </a>
      </div>
    </div>
  </section>
</template>
