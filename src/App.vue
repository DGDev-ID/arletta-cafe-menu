<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import Toast from 'primevue/toast'
</script>

<template>
  <div class="font-sans text-text bg-bg min-h-screen">
    <NavBar />
    <Toast position="top-center" />
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
