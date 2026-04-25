<script setup lang="ts">
defineProps<{
  visible: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'select', type: 'manual' | 'qr'): void
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')"></div>

      <!-- Modal -->
      <div
        class="relative bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 z-10"
      >
        <h3 class="text-lg font-bold text-text mb-1">Pilih Metode Pembayaran</h3>
        <p class="text-xs text-text-light mb-6">Pilih cara pembayaran yang kamu inginkan</p>

        <div class="flex flex-col gap-3">
          <!-- Cash -->
          <button
            @click="emit('select', 'manual')"
            :disabled="isLoading"
            class="flex items-center gap-4 p-4 rounded-xl border-2 border-secondary hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div
              class="w-11 h-11 rounded-xl bg-secondary-light flex items-center justify-center shrink-0"
            >
              <i class="pi pi-wallet text-xl text-primary"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-text">Cash / Manual</p>
              <p class="text-xs text-text-light mt-0.5">Bayar langsung ke kasir</p>
            </div>
            <i v-if="isLoading" class="pi pi-spinner pi-spin text-primary ml-auto"></i>
            <i v-else class="pi pi-chevron-right text-text-light ml-auto text-xs"></i>
          </button>

          <!-- QRIS -->
          <!--
          <button
            @click="emit('select', 'qr')"
            :disabled="isLoading"
            class="flex items-center gap-4 p-4 rounded-xl border-2 border-secondary hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div
              class="w-11 h-11 rounded-xl bg-secondary-light flex items-center justify-center shrink-0"
            >
              <i class="pi pi-qrcode text-xl text-primary"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-text">QRIS</p>
              <p class="text-xs text-text-light mt-0.5">Bayar via aplikasi e-wallet / bank</p>
            </div>
            <i v-if="isLoading" class="pi pi-spinner pi-spin text-primary ml-auto"></i>
            <i v-else class="pi pi-chevron-right text-text-light ml-auto text-xs"></i>
          </button>
          -->
        </div>

        <button
          @click="emit('close')"
          class="mt-4 w-full py-2.5 text-sm text-text-light hover:text-text transition-colors duration-200"
        >
          Batal
        </button>
      </div>
    </div>
  </Teleport>
</template>
