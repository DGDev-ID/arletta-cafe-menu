<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getTransactionStatus } from '@/services/api'
import type { TransactionResponse } from '@/types/api'

const props = defineProps<{
  transaction: TransactionResponse
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

type PaymentStatus = 'pending' | 'in_order' | 'success' | 'failed'

const status = ref<PaymentStatus>('pending')
const isPolling = ref(true)
let intervalId: ReturnType<typeof setInterval> | null = null

const statusConfig = computed(() => {
  const map: Record<PaymentStatus, { label: string; icon: string; color: string; bg: string }> = {
    pending: {
      label: 'Menunggu Pembayaran',
      icon: 'pi pi-clock',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    in_order: {
      label: 'Sedang Diproses',
      icon: 'pi pi-spin pi-spinner',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    success: {
      label: 'Pembayaran Berhasil',
      icon: 'pi pi-check-circle',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    failed: {
      label: 'Pembayaran Gagal',
      icon: 'pi pi-times-circle',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  }
  return map[status.value]
})

async function pollStatus() {
  try {
    const res = await getTransactionStatus(props.transaction.transaction_id)
    if (res.success) {
      status.value = res.data as PaymentStatus
      if (res.data === 'success') {
        stopPolling()
        setTimeout(() => emit('success'), 1500)
      }
      if (res.data === 'failed') {
        stopPolling()
      }
    }
  } catch {
    // silent fail, keep polling
  }
}

function stopPolling() {
  isPolling.value = false
  if (intervalId) clearInterval(intervalId)
}

onMounted(() => {
  pollStatus()
  intervalId = setInterval(pollStatus, 3000)
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-secondary p-5 mb-4">
    <!-- Status Badge -->
    <div :class="[statusConfig.bg, 'rounded-xl p-4 flex items-center gap-3 mb-5']">
      <i :class="[statusConfig.icon, statusConfig.color, 'text-2xl']"></i>
      <div>
        <p :class="[statusConfig.color, 'font-semibold text-sm']">{{ statusConfig.label }}</p>
        <p class="text-xs text-text-light mt-0.5">
          {{ status === 'pending' ? 'Tunjukkan kode unik ke kasir' : 'Mohon tunggu sebentar' }}
        </p>
      </div>
      <div v-if="isPolling" class="ml-auto">
        <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
      </div>
    </div>

    <!-- Kode Unik -->
    <div class="bg-secondary-light rounded-xl p-4 text-center mb-4">
      <p class="text-xs text-text-light mb-1">Kode Unik Pembayaran</p>
      <p class="text-3xl font-bold text-primary tracking-widest">{{ transaction.qr_code }}</p>
      <p class="text-xs text-text-light mt-2">Tunjukkan kode ini ke kasir untuk konfirmasi</p>
    </div>

    <!-- Detail Transaksi -->
    <div class="flex flex-col gap-2">
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Cafe</span>
        <span class="font-medium text-text">{{ transaction.cafe_name }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Meja</span>
        <span class="font-medium text-text">{{ transaction.table_name }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Subtotal</span>
        <span class="font-medium text-text">Rp {{ transaction.price.toLocaleString('id-ID') }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Biaya Layanan</span>
        <span class="font-medium text-text">Rp {{ transaction.fee.toLocaleString('id-ID') }}</span>
      </div>
      <div class="flex justify-between text-sm pt-2 border-t border-secondary">
        <span class="font-bold text-text">Total</span>
        <span class="font-bold text-primary text-base">Rp {{ transaction.total_price.toLocaleString('id-ID') }}</span>
      </div>
    </div>

    <!-- Items -->
    <div class="mt-4 pt-4 border-t border-secondary">
      <p class="text-xs font-semibold text-text-light mb-2">Detail Pesanan</p>
      <div class="flex flex-col gap-1.5">
        <div
          v-for="(detail, i) in transaction.details"
          :key="i"
          class="flex justify-between text-xs"
        >
          <span class="text-text">{{ detail.amount }}x {{ detail.menu_name }}</span>
          <span class="text-text-light">Rp {{ detail.price.toLocaleString('id-ID') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>