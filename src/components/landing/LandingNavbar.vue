<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Menu', href: '#menu' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Stores', href: '#stores' },
  { name: 'Contact', href: '#contact' },
]

function handleScroll() {
  scrolled.value = window.scrollY > 50
}

function scrollTo(href: string) {
  mobileMenuOpen.value = false
  const el = document.querySelector(href)
  el?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="scrolled ? 'bg-brown-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6">
      <!-- Logo -->
      <a href="#home" class="flex items-center gap-3" @click.prevent="scrollTo('#home')">
        <img src="/logo-cafe.png" alt="Arletta Cafe" class="w-10 h-10 rounded-lg object-cover" />
        <span class="font-heading text-2xl font-bold tracking-wide text-white">
          Arletta<span class="text-gold">.</span>
        </span>
      </a>

      <!-- Desktop Menu -->
      <ul class="hidden items-center gap-8 md:flex">
        <li v-for="link in navLinks" :key="link.name">
          <a
            :href="link.href"
            class="relative text-sm font-medium tracking-wider text-white/80 uppercase transition-colors duration-300 hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            @click.prevent="scrollTo(link.href)"
          >
            {{ link.name }}
          </a>
        </li>
      </ul>

      <!-- Mobile Toggle -->
      <button
        class="relative z-50 text-white md:hidden"
        @click="mobileMenuOpen = !mobileMenuOpen"
        aria-label="Toggle menu"
      >
        <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-xl"></i>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="mobileMenuOpen"
        class="bg-brown-900/95 absolute inset-x-0 top-full backdrop-blur-md md:hidden"
      >
        <ul class="flex flex-col items-center gap-6 py-8">
          <li v-for="link in navLinks" :key="link.name">
            <a
              :href="link.href"
              class="text-base font-medium tracking-wider text-white/90 uppercase transition-colors duration-300 hover:text-gold"
              @click.prevent="scrollTo(link.href)"
            >
              {{ link.name }}
            </a>
          </li>
        </ul>
      </div>
    </transition>
  </nav>
</template>
