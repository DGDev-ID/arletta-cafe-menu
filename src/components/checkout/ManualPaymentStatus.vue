<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import QRCode from 'qrcode'
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
const qrDataUrl = ref<string>('')
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

function formatRupiah(value: number) {
  try {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
  } catch {
    return String(value)
  }
}

async function generateQR() {
  if (!props.transaction.qr_code) return
  try {
    qrDataUrl.value = await QRCode.toDataURL(props.transaction.qr_code, {
      width: 200,
      margin: 2,
      color: {
        dark: '#5a3d2b',
        light: '#faf7f4',
      },
    })
  } catch {
    // fallback ke teks saja
  }
}

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
  generateQR()
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
          {{ status === 'pending' ? 'Tunjukkan QR code ke kasir' : 'Mohon tunggu sebentar' }}
        </p>
      </div>
      <div v-if="isPolling" class="ml-auto shrink-0">
        <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
      </div>
    </div>

    <!-- QR Code -->
    <div class="bg-secondary-light rounded-xl p-4 text-center mb-5">
      <p class="text-xs text-text-light mb-3">Kode Unik Pembayaran</p>
      <!-- <div class="flex justify-center mb-3">
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QR Code Pembayaran"
          class="w-44 h-44 rounded-xl"
        />
        <div v-else class="w-44 h-44 rounded-xl bg-secondary flex items-center justify-center">
          <i class="pi pi-spin pi-spinner text-primary text-2xl"></i>
        </div>
      </div> -->
      <p class="text-xs font-mono font-bold text-primary tracking-wider break-all">
        {{ transaction.qr_code }}
      </p>
      <p class="text-xs text-text-light mt-2">
        Silahkan datang ke kasir untuk melakukan pembayaran
      </p>
    </div>

    <!-- Detail Transaksi -->
    <div class="flex flex-col gap-2 mb-4">
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Cafe</span>
        <span class="font-medium text-text">{{ transaction.cafe_name }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Nama Pelanggan</span>
        <span class="font-medium text-text">{{ transaction.cust_name || '-' }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Meja</span>
        <span class="font-medium text-text">{{ transaction.table_name }}</span>
      </div>
        <div class="flex justify-between text-sm">
          <span class="text-text-light">Subtotal</span>
          <span class="font-medium text-text">Rp {{ formatRupiah(transaction.price) }}</span>
        </div>
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Biaya Layanan</span>
        <span class="font-medium text-text">Rp {{ formatRupiah(transaction.fee) }}</span>
      </div>
      <div class="flex justify-between text-sm pt-2 border-t border-secondary">
        <span class="font-bold text-text">Total</span>
        <span class="font-bold text-primary text-base">Rp {{ formatRupiah(transaction.total_price) }}</span>
      </div>
    </div>

    <!-- Detail Pesanan -->
    <div class="pt-4 border-t border-secondary">
      <p class="text-xs font-semibold text-text-light mb-2">Detail Pesanan</p>
      <div class="flex flex-col gap-1.5">
        <div
          v-for="(detail, i) in transaction.details"
          :key="i"
          class="flex justify-between text-xs"
        >
          <span class="text-text">{{ detail.amount }}x {{ detail.menu_name }}</span>
          <span class="text-text-light">Rp {{ formatRupiah(detail.price) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
