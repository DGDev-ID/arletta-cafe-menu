<script setup lang="ts">
function scrollTo(href: string) {
  const el = document.querySelector(href)
  el?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="home" class="relative flex min-h-screen items-center justify-center overflow-hidden">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style="
        background-image: url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80');
      "
    >
      <div class="bg-brown-900/65 absolute inset-0"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-4xl px-6 text-center">
      <!-- Badge -->
      <div
        class="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/10 px-5 py-2 backdrop-blur-sm"
      >
        <i class="pi pi-star-fill text-gold text-xs"></i>
        <span class="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Est. 2024 · Premium Coffee & Eatery
        </span>
        <i class="pi pi-star-fill text-gold text-xs"></i>
      </div>

      <!-- Main Heading -->
      <h1
        class="font-heading mb-6 text-5xl leading-tight font-bold text-white md:text-7xl lg:text-8xl"
      >
        Where Every Sip
        <br />
        <span class="text-gold italic">Tells a Story</span>
      </h1>

      <!-- Subtitle -->
      <p class="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
        Discover a world of handcrafted beverages and artisan bites, served in a warm and inviting
        atmosphere. Arletta Cafe & Eatery — your everyday escape.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href="#menu"
          class="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold tracking-wider text-brown-900 uppercase transition-all duration-300 hover:bg-gold-light hover:shadow-lg hover:shadow-gold/25"
          @click.prevent="scrollTo('#menu')"
        >
          <i class="pi pi-book text-sm transition-transform duration-300 group-hover:rotate-6"></i>
          Explore Menu
        </a>
        <a
          href="#contact"
          class="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-semibold tracking-wider text-white uppercase transition-all duration-300 hover:border-gold hover:bg-white/10 hover:text-gold"
          @click.prevent="scrollTo('#contact')"
        >
          <i class="pi pi-map-marker text-sm"></i>
          Visit Us
        </a>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <i class="pi pi-chevron-down text-xl text-white/50"></i>
    </div>
  </section>
</template>
