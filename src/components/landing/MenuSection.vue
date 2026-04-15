<script setup lang="ts">
import { ref } from 'vue'

const categories = ['All', 'Coffee', 'Non-Coffee', 'Food', 'Pastry']
const activeCategory = ref('All')

const menuItems = [
  // ── Coffee ──────────────────────────────────────────────────
  {
    name: 'Arletta Signature Latte',
    category: 'Coffee',
    price: 'Rp 42.000',
    badge: 'Best Seller',
    description:
      'Espresso shot bertemu susu segar yang disteam sempurna, dipadukan sirup karamel artisan buatan kami. Lembut, manis, dan penuh karakter.',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80',
  },
  {
    name: 'Espresso Tonic',
    category: 'Coffee',
    price: 'Rp 38.000',
    badge: 'Trending',
    description:
      'Perpaduan double shot espresso yang bold di atas air tonik dingin berbuih. Refreshing dengan karakter pahit yang balance.',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500&q=80',
  },
  {
    name: 'Brown Sugar Oat Latte',
    category: 'Coffee',
    price: 'Rp 45.000',
    badge: null,
    description:
      'Oat milk creamy dengan gula aren lokal asli Jawa Barat, diberi sentuhan cinnamon dan espresso ristretto. Pilihan terbaik untuk hari yang hangat.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80',
  },
  {
    name: 'Cold Brew Float',
    category: 'Coffee',
    price: 'Rp 48.000',
    badge: null,
    description:
      'Cold brew steeping 18 jam dipadukan satu scoop es krim vanilla premium. Minuman kopi yang sekaligus jadi dessert favorit.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80',
  },
  // ── Non-Coffee ───────────────────────────────────────────────
  {
    name: 'Matcha Latte',
    category: 'Non-Coffee',
    price: 'Rp 38.000',
    badge: 'Best Seller',
    description:
      'Matcha ceremonial grade dari Uji, Jepang, dikocok dengan air panas lalu dicampur susu segar. Earthy, creamy, dan menenangkan jiwa.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80',
  },
  {
    name: 'Strawberry Yakult Float',
    category: 'Non-Coffee',
    price: 'Rp 36.000',
    badge: 'Favorit',
    description:
      'Minuman soda segar dengan puree stroberi asli dan Yakult yang menyegarkan, diberi topping es krim vanilla. Fun, fruity, dan instagramable!',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80',
  },
  {
    name: 'Taro Milk Tea',
    category: 'Non-Coffee',
    price: 'Rp 35.000',
    badge: null,
    description:
      'Teh susu creamy dengan pasta talas premium yang lembut dan manis alami. Disajikan dengan boba original yang kenyal.',
    image: 'https://images.unsplash.com/photo-1561128290-4b13c04a0b6f?w=500&q=80',
  },
  // ── Food ─────────────────────────────────────────────────────
  {
    name: 'Truffle Mushroom Toast',
    category: 'Food',
    price: 'Rp 58.000',
    badge: "Chef's Pick",
    description:
      'Sourdough roti artisan panggang dengan sautéed mixed mushroom, minyak truffle, ricotta whipped, dan telur poached. Brunch terbaik untuk memulai hari.',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80',
  },
  {
    name: 'Eggs Benedict',
    category: 'Food',
    price: 'Rp 62.000',
    badge: null,
    description:
      'Dua telur poached di atas ham smoked premium dan English muffin yang dipanggang, disiram hollandaise sauce yang creamy dan kaya.',
    image: 'https://images.unsplash.com/photo-1608039829572-9b5bba1ee9ac?w=500&q=80',
  },
  {
    name: 'Arletta Chicken Sandwich',
    category: 'Food',
    price: 'Rp 55.000',
    badge: null,
    description:
      'Brioche bun toasted berisi ayam crispy marinasi rempah, selada segar, tomat, dan aioli homemade. Gigit pertama langsung jatuh cinta.',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80',
  },
  // ── Pastry ───────────────────────────────────────────────────
  {
    name: 'Butter Croissant',
    category: 'Pastry',
    price: 'Rp 32.000',
    badge: 'Freshly Baked',
    description:
      'Croissant laminasi 72 jam dengan mentega grade A asal Perancis. Lapisan tipis yang renyah di luar, lembut dan buttery di dalam.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=500&q=80',
  },
  {
    name: 'Tiramisu Jar',
    category: 'Pastry',
    price: 'Rp 45.000',
    badge: 'Favorit',
    description:
      'Ladyfinger direndam espresso kuat, berlapis mascarpone cream yang kaya, dengan taburan cokelat bubuk. Klasik Italia dalam toples cantik.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80',
  },
]

const filteredItems = ref(menuItems)

function filterMenu(cat: string) {
  activeCategory.value = cat
  filteredItems.value =
    cat === 'All' ? menuItems : menuItems.filter((item) => item.category === cat)
}
</script>

<template>
  <section id="menu" class="bg-brown-50 py-24 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <!-- Header -->
      <div class="fade-in mb-16 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          Our Selections
        </span>
        <h2 class="font-heading text-brown-800 mt-3 text-4xl font-bold md:text-5xl">
          Featured Menu
        </h2>
        <div class="bg-gold mx-auto mt-4 h-1 w-16 rounded-full"></div>
        <p class="text-brown-500 mx-auto mt-5 max-w-xl text-base">
          Each item is made fresh daily, using the finest ingredients for an unforgettable tasting
          experience.
        </p>
      </div>

      <!-- Category Filter -->
      <div class="fade-in mb-12 flex flex-wrap justify-center gap-3">
        <button
          v-for="cat in categories"
          :key="cat"
          class="rounded-full px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300"
          :class="
            activeCategory === cat
              ? 'bg-brown-800 text-white shadow-lg'
              : 'bg-white text-brown-600 hover:bg-brown-100 shadow-sm'
          "
          @click="filterMenu(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Menu List -->
      <div class="grid gap-4 md:grid-cols-2">
        <transition-group
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-for="item in filteredItems"
            :key="item.name"
            class="group flex items-start gap-5 rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <!-- Image -->
            <div class="relative shrink-0 overflow-hidden rounded-xl">
              <img
                :src="item.image"
                :alt="item.name"
                class="h-28 w-28 object-cover transition-transform duration-500 group-hover:scale-105 md:h-32 md:w-32"
              />
              <!-- Badge -->
              <span
                v-if="item.badge"
                class="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold tracking-wide text-brown-900 shadow"
              >
                {{ item.badge }}
              </span>
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1 py-1">
              <!-- Category pill -->
              <span
                class="text-brown-400 mb-1 inline-block text-[11px] font-semibold tracking-widest uppercase"
              >
                {{ item.category }}
              </span>

              <!-- Name + Price row -->
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-heading text-brown-800 text-lg font-bold leading-tight">
                  {{ item.name }}
                </h3>
                <span class="shrink-0 text-base font-bold text-gold">
                  {{ item.price }}
                </span>
              </div>

              <!-- Divider -->
              <div class="bg-brown-100 my-2.5 h-px w-full"></div>

              <!-- Description -->
              <p class="text-brown-500 line-clamp-3 text-sm leading-relaxed">
                {{ item.description }}
              </p>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </section>
</template>
