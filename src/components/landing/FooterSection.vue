<script setup lang="ts">
const currentYear = new Date().getFullYear()

const quickLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Menu', href: '#menu' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Stores', href: '#stores' },
  { name: 'Contact', href: '#contact' },
]

const hours = [
  { day: 'Monday — Friday', time: '08.00 — 22.00' },
  { day: 'Saturday — Sunday', time: '07.00 — 23.00' },
  { day: 'Public Holiday', time: '09.00 — 21.00' },
]

const socialLinks = [
  { icon: 'pi pi-instagram', href: '#', label: 'Instagram' },
  { icon: 'pi pi-facebook', href: '#', label: 'Facebook' },
  { icon: 'pi pi-twitter', href: '#', label: 'Twitter' },
  { icon: 'pi pi-whatsapp', href: '#', label: 'WhatsApp' },
]

function scrollTo(href: string) {
  const el = document.querySelector(href)
  el?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <footer class="bg-brown-900 pt-16 pb-8">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <div class="mb-4 flex items-center gap-2">
            <i class="pi pi-star-fill text-gold text-lg"></i>
            <span class="font-heading text-xl font-bold text-white">
              Arletta<span class="text-gold">.</span>
            </span>
          </div>
          <p class="mb-6 text-sm leading-relaxed text-white/50">
            Crafting memorable moments through exceptional coffee and culinary experiences since
            2024.
          </p>
          <div class="flex gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-brown-900"
            >
              <i :class="social.icon" class="text-xs"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="mb-5 text-sm font-semibold tracking-wider text-white uppercase">
            Quick Links
          </h4>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.name">
              <a
                :href="link.href"
                class="text-sm text-white/50 transition-colors duration-300 hover:text-gold"
                @click.prevent="scrollTo(link.href)"
              >
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Opening Hours -->
        <div>
          <h4 class="mb-5 text-sm font-semibold tracking-wider text-white uppercase">
            Opening Hours
          </h4>
          <ul class="space-y-3">
            <li v-for="h in hours" :key="h.day">
              <p class="text-sm text-white/70">{{ h.day }}</p>
              <p class="text-sm text-gold">{{ h.time }}</p>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="mb-5 text-sm font-semibold tracking-wider text-white uppercase">
            Stay Updated
          </h4>
          <p class="mb-4 text-sm text-white/50">
            Subscribe to get updates about new menu items and special promotions.
          </p>
          <form class="flex gap-2" @submit.prevent>
            <input
              type="email"
              placeholder="Your email"
              class="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors duration-300 focus:border-gold"
            />
            <button
              type="submit"
              class="rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-brown-900 transition-all duration-300 hover:bg-gold-light"
            >
              <i class="pi pi-send text-xs"></i>
            </button>
          </form>
        </div>
      </div>

      <!-- Divider -->
      <div class="mb-8 h-px bg-white/10"></div>

      <!-- Copyright -->
      <div class="flex flex-col items-center justify-between gap-4 text-center md:flex-row">
        <p class="text-sm text-white/40">
          &copy; {{ currentYear }} Arletta Cafe & Eatery. All rights reserved.
        </p>
        <p class="text-xs text-white/30">
          Crafted with <i class="pi pi-heart-fill text-gold mx-1 text-[10px]"></i> in Bandung
        </p>
      </div>
    </div>
  </footer>
</template>
