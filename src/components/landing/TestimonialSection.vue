<script setup lang="ts">
import { ref, computed } from 'vue'

const testimonials = [
  {
    name: 'Anisa Putri',
    role: '',
    text: '"Arletta Cafe punya suasana yang paling enak se-Bandung! Caramel macchiato-nya divine banget, dan avocado toast selalu fresh. Udah jadi tempat favorit gua untuk brunch."',
    avatar: 'https://i.pravatar.cc/150?img=47&u=anisa',
    rating: 5,
  },
  {
    name: 'Budi Santoso',
    role: '',
    text: '"Setiap pagi gua datang ke sini buat minum espresso. Barista-nya benar-benar tahu gimana cara bikin kopi yang enak, dan suasananya warm banget buat kerja atau ngopi santai."',
    avatar: 'https://i.pravatar.cc/150?img=42&u=budi',
    rating: 5,
  },
  {
    name: 'Clara Wijaya',
    role: '',
    text: '"Desain interiornya stunning — kayu-kayuan hangat, pencahayaannya soft, dan tanaman-tanaman gantung yang cantik. Ini cafe paling aesthetic yang pernah gua kunjungi!"',
    avatar: 'https://i.pravatar.cc/150?img=49&u=clara',
    rating: 5,
  },
]

const currentIndex = ref(0)

const current = computed(() => testimonials[currentIndex.value]!)

function next() {
  currentIndex.value = (currentIndex.value + 1) % testimonials.length
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + testimonials.length) % testimonials.length
}
</script>

<template>
  <section class="bg-brown-800 relative overflow-hidden py-24 md:py-32">
    <!-- Decorative elements -->
    <div
      class="absolute left-0 top-0 h-32 w-32 rounded-full bg-gold/5 -translate-x-1/2 -translate-y-1/2"
    ></div>
    <div
      class="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-gold/5 translate-x-1/2 translate-y-1/2"
    ></div>

    <div class="mx-auto max-w-5xl px-6">
      <!-- Header -->
      <div class="fade-in mb-16 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          Testimonials
        </span>
        <h2 class="font-heading mt-3 text-4xl font-bold text-white md:text-5xl">What People Say</h2>
        <div class="bg-gold mx-auto mt-4 h-1 w-16 rounded-full"></div>
      </div>

      <!-- Testimonial Card -->
      <div class="fade-in relative">
        <div class="overflow-hidden">
          <transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 translate-x-8"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition-all duration-300 ease-in absolute inset-0"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-8"
            mode="out-in"
          >
            <div
              :key="currentIndex"
              class="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm md:p-12"
            >
              <!-- Stars -->
              <div class="mb-6 flex justify-center gap-1">
                <i
                  v-for="n in current.rating"
                  :key="n"
                  class="pi pi-star-fill text-gold text-lg"
                ></i>
              </div>
              <!-- Quote -->
              <p class="font-heading mb-8 text-lg leading-relaxed text-white/90 italic md:text-xl">
                {{ current.text }}
              </p>
              <!-- Avatar & Name -->
              <div class="flex flex-col items-center">
                <img
                  :src="current.avatar"
                  :alt="current.name"
                  class="mb-3 h-14 w-14 rounded-full border-2 border-gold object-cover"
                />
                <h4 class="font-semibold text-white">{{ current.name }}</h4>
              </div>
            </div>
          </transition>
        </div>

        <!-- Navigation -->
        <div class="mt-8 flex items-center justify-center gap-4">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300 hover:border-gold hover:bg-gold hover:text-brown-900"
            @click="prev"
            aria-label="Previous testimonial"
          >
            <i class="pi pi-chevron-left text-sm"></i>
          </button>
          <!-- Dots -->
          <div class="flex gap-2">
            <button
              v-for="(_, idx) in testimonials"
              :key="idx"
              class="h-2 rounded-full transition-all duration-300"
              :class="idx === currentIndex ? 'w-6 bg-gold' : 'w-2 bg-white/30'"
              @click="currentIndex = idx"
              :aria-label="`Go to testimonial ${idx + 1}`"
            ></button>
          </div>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300 hover:border-gold hover:bg-gold hover:text-brown-900"
            @click="next"
            aria-label="Next testimonial"
          >
            <i class="pi pi-chevron-right text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
