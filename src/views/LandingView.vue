<script setup lang="ts">
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import { useLandingPage } from '@/composables/useLandingPage'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import AboutSection from '@/components/landing/AboutSection.vue'
import MenuSection from '@/components/landing/MenuSection.vue'
import GallerySection from '@/components/landing/GallerySection.vue'
import StoreSection from '@/components/landing/StoreSection.vue'
import TestimonialSection from '@/components/landing/TestimonialSection.vue'
import InstagramSection from '@/components/landing/InstagramSection.vue'
import ContactSection from '@/components/landing/ContactSection.vue'
import FooterSection from '@/components/landing/FooterSection.vue'

useScrollAnimation()

const { menus, gallery, allCafe, isLoading } = useLandingPage()
</script>

<template>
  <div class="min-h-screen">
    <LandingNavbar />
    <HeroSection />
    <AboutSection />
    <MenuSection :menus="menus" :is-loading="isLoading" />
    <GallerySection :gallery="gallery" :is-loading="isLoading" />
    <StoreSection :stores="allCafe" :is-loading="isLoading" />
    <!-- <TestimonialSection /> -->
    <!-- <InstagramSection /> -->
    <ContactSection />
    <FooterSection />
  </div>
</template>
