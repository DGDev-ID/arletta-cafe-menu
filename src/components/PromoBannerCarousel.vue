<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { PromoBannerItem } from '@/types/api'

const props = defineProps<{
  banners: PromoBannerItem[]
}>()

const currentIndex = ref(0)
const isTransitioning = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)
let autoSlideTimer: ReturnType<typeof setInterval> | null = null

const totalBanners = computed(() => props.banners.length)
const isMultiple = computed(() => totalBanners.value > 1)

function goTo(index: number) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentIndex.value = ((index % totalBanners.value) + totalBanners.value) % totalBanners.value
  setTimeout(() => {
    isTransitioning.value = false
  }, 500)
}

function next() {
  goTo(currentIndex.value + 1)
}

function prev() {
  goTo(currentIndex.value - 1)
}

function startAutoSlide() {
  stopAutoSlide()
  if (!isMultiple.value) return
  autoSlideTimer = setInterval(next, 5000)
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
    autoSlideTimer = null
  }
}

// Touch events for mobile swipe
function onTouchStart(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  touchStartX.value = touch.clientX
  stopAutoSlide()
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  touchEndX.value = touch.clientX
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      next()
    } else {
      prev()
    }
  }
  startAutoSlide()
}

onMounted(() => {
  startAutoSlide()
})

onUnmounted(() => {
  stopAutoSlide()
})

// Restart auto-slide when banners change
watch(() => props.banners, () => {
  currentIndex.value = 0
  startAutoSlide()
})
</script>

<template>
  <!-- Single banner -->
  <div v-if="totalBanners === 1" class="w-full">
    <div class="rounded-xl shadow-md overflow-hidden">
      <img
        :src="banners[0]?.image_url"
        :alt="banners[0]?.title"
        class="w-full h-[180px] sm:h-[220px] object-cover"
        loading="lazy"
      />
    </div>
  </div>

  <!-- Carousel for multiple banners -->
  <div
    v-else-if="totalBanners > 1"
    class="relative w-full"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Slides Container -->
    <div class="rounded-xl shadow-md overflow-hidden">
      <div
        class="flex transition-transform duration-500 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="w-full flex-shrink-0"
        >
          <img
            :src="banner.image_url"
            :alt="banner.title"
            class="w-full h-[180px] sm:h-[220px] object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <!-- Previous Button -->
    <button
      @click="prev"
      class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors duration-200 z-10"
      aria-label="Previous banner"
    >
      <i class="pi pi-chevron-left text-xs"></i>
    </button>

    <!-- Next Button -->
    <button
      @click="next"
      class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors duration-200 z-10"
      aria-label="Next banner"
    >
      <i class="pi pi-chevron-right text-xs"></i>
    </button>

    <!-- Indicator Dots -->
    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
      <button
        v-for="(_, index) in banners"
        :key="index"
        @click="goTo(index)"
        class="rounded-full transition-all duration-300"
        :class="
          currentIndex === index
            ? 'w-6 h-2 bg-white'
            : 'w-2 h-2 bg-white/50 hover:bg-white/70'
        "
        :aria-label="`Go to banner ${index + 1}`"
      />
    </div>
  </div>
</template>
