<script setup lang="ts">
const features = [
  {
    icon: 'pi pi-heart-fill',
    title: 'Crafted with Passion',
    description:
      'Every cup is brewed with carefully selected premium beans from local Indonesian farms.',
  },
  {
    icon: 'pi pi-sun',
    title: 'Warm Atmosphere',
    description:
      'A cozy space designed for comfort — perfect for work, meetings, or simply unwinding.',
  },
  {
    icon: 'pi pi-sparkles',
    title: 'Artisan Quality',
    description:
      'From our kitchen to your table, every dish is made fresh with the finest ingredients.',
  },
]
</script>

<template>
  <section id="about" class="bg-cream py-24 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <!-- Section Header -->
      <div class="fade-in mb-20 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] text-gold uppercase"> Our Story </span>
        <h2 class="font-heading text-brown-800 mt-3 text-4xl font-bold md:text-5xl">
          About Arletta
        </h2>
        <div class="bg-gold mx-auto mt-4 h-1 w-16 rounded-full"></div>
      </div>

      <!-- Two-column layout -->
      <div class="grid items-center gap-16 lg:grid-cols-2">
        <!-- Image -->
        <div class="fade-in-left relative">
          <div class="overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80"
              alt="Arletta Cafe interior"
              class="h-125 w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <!-- Floating card -->
          <div
            class="bg-brown-800 absolute -bottom-6 -right-4 rounded-xl p-5 text-white shadow-xl md:-right-8"
          >
            <div class="font-heading text-3xl font-bold text-gold">2+</div>
            <div class="text-sm text-white/70">Years of Excellence</div>
          </div>
        </div>

        <!-- Text -->
        <div class="fade-in-right">
          <h3 class="font-heading text-brown-800 mb-6 text-3xl font-bold">
            A Place Where Coffee
            <span class="text-gold">Meets Community</span>
          </h3>
          <p class="text-brown-600 mb-4 leading-relaxed">
            Born from a simple dream — to create a space where great coffee and delicious food bring
            people together. Arletta Cafe & Eatery is more than just a coffee shop; it's a gathering
            place for friends, families, and creators.
          </p>
          <p class="text-brown-600 mb-8 leading-relaxed">
            We source our beans directly from Indonesian highlands, roast them in-house, and serve
            each cup with care. Our kitchen crafts everything from hearty brunch plates to delicate
            pastries — all made fresh daily.
          </p>

          <!-- Features -->
          <div class="space-y-5">
            <div v-for="feature in features" :key="feature.title" class="flex items-start gap-4">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/15"
              >
                <i :class="feature.icon" class="text-gold text-lg"></i>
              </div>
              <div>
                <h4 class="text-brown-800 mb-1 font-semibold">{{ feature.title }}</h4>
                <p class="text-brown-500 text-sm leading-relaxed">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
