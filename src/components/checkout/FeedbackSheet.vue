<script setup lang="ts">
import { ref, computed } from 'vue'
import { submitFeedback } from '@/services/api'

const props = defineProps<{
  transactionId: number
  customerName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted'): void
}>()

const selectedRating = ref(0)
const hoveredRating = ref(0)
const comment = ref('')
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const displayRating = computed(() => hoveredRating.value || selectedRating.value)

const ratingLabels: Record<number, string> = {
  1: 'Sangat Buruk 😞',
  2: 'Kurang Memuaskan 😕',
  3: 'Cukup 😊',
  4: 'Bagus! 😄',
  5: 'Luar Biasa! 🤩',
}

async function handleSubmit() {
  if (selectedRating.value === 0) return
  isSubmitting.value = true
  submitError.value = ''

  try {
    const res = await submitFeedback({
      transaction_id: props.transactionId,
      rating: selectedRating.value,
      comment: comment.value.trim() || null,
    })

    if (res.success) {
      submitSuccess.value = true
      setTimeout(() => emit('submitted'), 2000)
    } else {
      submitError.value = res.message || 'Gagal mengirim ulasan.'
    }
  } catch {
    submitError.value = 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      @click="emit('close')"
    />
  </Transition>

  <!-- Bottom Sheet -->
  <Transition name="slide-up">
    <div class="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
      <div class="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
        <!-- Handle Bar -->
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <!-- Success State -->
        <div v-if="submitSuccess" class="px-6 py-10 text-center">
          <div class="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-check-circle text-4xl text-green-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Terima Kasih! 🙏</h3>
          <p class="text-sm text-gray-500">Ulasan Anda sangat berarti bagi kami untuk terus berkembang.</p>
        </div>

        <!-- Form State -->
        <div v-else class="px-6 pb-8">
          <!-- Header -->
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Bagikan Pengalaman Anda</h3>
              <p class="text-xs text-gray-400 mt-0.5">
                <span v-if="customerName">Halo, {{ customerName }}! </span>Opsional — bisa dilewati
              </p>
            </div>
            <button
              @click="emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>

          <!-- Star Rating -->
          <div class="mb-4">
            <p class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Rating Keseluruhan</p>
            <div class="flex items-center gap-2 justify-center mb-2">
              <button
                v-for="star in 5"
                :key="star"
                @mouseenter="hoveredRating = star"
                @mouseleave="hoveredRating = 0"
                @click="selectedRating = star"
                class="transition-transform active:scale-90 focus:outline-none"
                :class="star <= displayRating ? 'scale-110' : 'scale-100'"
              >
                <i
                  class="pi pi-star-fill text-4xl transition-colors duration-150"
                  :class="star <= displayRating ? 'text-amber-400' : 'text-gray-200'"
                />
              </button>
            </div>

            <!-- Rating Label -->
            <div class="h-6 text-center">
              <Transition name="fade-quick">
                <p
                  v-if="displayRating > 0"
                  :key="displayRating"
                  class="text-sm font-medium text-amber-600"
                >
                  {{ ratingLabels[displayRating] }}
                </p>
              </Transition>
            </div>
          </div>

          <!-- Comment -->
          <div class="mb-5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Komentar (Opsional)
            </label>
            <textarea
              v-model="comment"
              placeholder="Ceritakan pengalaman Anda memesan di sini..."
              rows="3"
              maxlength="500"
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none transition"
            />
            <p class="text-right text-xs text-gray-400 mt-1">{{ comment.length }}/500</p>
          </div>

          <!-- Error -->
          <div v-if="submitError" class="mb-4 flex items-center gap-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            <i class="pi pi-exclamation-circle shrink-0" />
            {{ submitError }}
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="emit('close')"
              class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Lewati
            </button>
            <button
              @click="handleSubmit"
              :disabled="selectedRating === 0 || isSubmitting"
              class="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
              :class="selectedRating > 0 && !isSubmitting
                ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-md shadow-amber-200'
                : 'bg-gray-300 cursor-not-allowed'"
            >
              <i v-if="isSubmitting" class="pi pi-spin pi-spinner text-xs" />
              <i v-else class="pi pi-send text-xs" />
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Ulasan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-leave-active {
  transition: transform 0.25s ease-in;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-quick-enter-active,
.fade-quick-leave-active {
  transition: opacity 0.15s ease;
}
.fade-quick-enter-from,
.fade-quick-leave-to {
  opacity: 0;
}
</style>
