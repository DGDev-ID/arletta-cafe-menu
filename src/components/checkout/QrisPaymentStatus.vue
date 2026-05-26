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
const isDownloading = ref(false)
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

function formatRupiah(value: number | string) {
  try {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num)
  } catch {
    return String(value)
  }
}

async function generateQR() {
  const token = props.transaction.snap_token
  if (!token) return
  try {
    qrDataUrl.value = await QRCode.toDataURL(token, {
      width: 400,
      margin: 2,
      color: { dark: '#3b1f0e', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
  } catch {
    // fallback silent
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
    // silent fail
  }
}

function stopPolling() {
  isPolling.value = false
  if (intervalId) clearInterval(intervalId)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Render canvas pada 2× lalu ekspor → teks tajam & tidak gepeng
function createHiDpiCanvas(
  w: number,
  h: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; dpr: number } {
  const dpr = 2
  const canvas = document.createElement('canvas')
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  return { canvas, ctx, dpr }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Logo QRIS digambar manual — bebas CORS
function drawQrisLogo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.translate(x, y)

  const S = 22 // ukuran kotak outer
  const g = 3 // gap
  const sq = 6 // inner square

  // Outer border
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, S, S)

  // Pojok kiri atas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(g, g, sq, sq)
  // Pojok kanan atas
  ctx.fillRect(S - g - sq, g, sq, sq)
  // Pojok kiri bawah
  ctx.fillRect(g, S - g - sq, sq, sq)
  // Center dot
  ctx.fillRect(S / 2 - 2, S / 2 - 2, 5, 5)

  // Teks QRIS
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px Georgia, serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText('QRIS', S + 8, S / 2)

  ctx.restore()
}

async function downloadQR() {
  if (!qrDataUrl.value || isDownloading.value) return
  isDownloading.value = true

  try {
    // Ukuran logis (CSS px) → mobile portrait
    const W = 390
    const H = 844

    const { canvas, ctx } = createHiDpiCanvas(W, H)

    // ── Background cream muda ─────────────────────────────
    ctx.fillStyle = '#fdf8f3'
    ctx.fillRect(0, 0, W, H)

    // Pola titik-titik dekoratif samar (tekstur)
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.fillStyle = '#5c3317'
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 7; col++) {
        ctx.beginPath()
        ctx.arc(28 + col * 56, 28 + row * 72, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ctx.restore()

    // ── Header coklat ─────────────────────────────────────
    const headerH = 96
    const headerGrad = ctx.createLinearGradient(0, 0, W, headerH)
    headerGrad.addColorStop(0, '#3b1f0e')
    headerGrad.addColorStop(1, '#5c3317')
    ctx.fillStyle = headerGrad
    roundRect(ctx, 0, 0, W, headerH + 16, 0)
    ctx.fill()

    // Garis aksen bawah header
    const accentGrad = ctx.createLinearGradient(0, 0, W, 0)
    accentGrad.addColorStop(0, '#c8a06a')
    accentGrad.addColorStop(0.5, '#e8c88a')
    accentGrad.addColorStop(1, '#c8a06a')
    ctx.fillStyle = accentGrad
    ctx.fillRect(0, headerH, W, 2.5)

    // Logo QRIS di header (kiri)
    drawQrisLogo(ctx, 24, 36)

    // Nama cafe (kanan header)
    ctx.fillStyle = '#e8c88a'
    ctx.font = 'bold 13px Georgia, serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    // Truncate cafe name jika terlalu panjang
    const cafeName = props.transaction.cafe_name.toUpperCase()
    ctx.fillText(cafeName, W - 24, 46)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '12px Georgia, serif'
    ctx.fillText(`Meja ${props.transaction.table_name}`, W - 24, 66)

    // ── Nominal ───────────────────────────────────────────
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    ctx.fillStyle = '#8b6340'
    ctx.font = '500 12px Georgia, serif'
    ctx.fillText('TOTAL PEMBAYARAN', W / 2, 130)

    ctx.fillStyle = '#3b1f0e'
    ctx.font = 'bold 40px Georgia, serif'
    ctx.fillText(`Rp ${formatRupiah(props.transaction.total_price)}`, W / 2, 178)

    // Nama pelanggan
    ctx.fillStyle = '#8b6340'
    ctx.font = '13px Georgia, serif'
    // add slight top padding to customer name
    ctx.fillText(`${props.transaction.cust_name || 'Pelanggan'}`, W / 2, 208)

    // Divider tipis
    ctx.strokeStyle = 'rgba(139,99,64,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 214)
    ctx.lineTo(W - 40, 214)
    ctx.stroke()

    // ── QR Card ───────────────────────────────────────────
    const cardX = 24
    const cardY = 226
    const cardW = W - 48
    const cardH = 340

    // Shadow
    ctx.save()
    ctx.shadowColor = 'rgba(91,51,23,0.18)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 8
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, cardX, cardY, cardW, cardH, 18)
    ctx.fill()
    ctx.restore()

    // Card fill
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, cardX, cardY, cardW, cardH, 18)
    ctx.fill()

    // QR image — center dalam card
    const qrImg = await loadImage(qrDataUrl.value)
    const qrSize = 262
    const qrX = (W - qrSize) / 2
    const qrY = cardY + 24
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // Label bawah dalam card
    ctx.fillStyle = '#b0916e'
    ctx.font = '11px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('Scan dengan e-wallet atau mobile banking', W / 2, cardY + cardH - 16)

    // ── Info transaksi ────────────────────────────────────
    const infoStartY = cardY + cardH + 24
    const colL = 40
    const colR = W - 40
    const lineH = 28

    const rows: { label: string; value: string; bold?: boolean }[] = [
      { label: 'Subtotal', value: `Rp ${formatRupiah(props.transaction.price)}` },
      { label: 'Biaya Layanan', value: `Rp ${formatRupiah(props.transaction.fee)}` },
    ]

    ctx.textBaseline = 'alphabetic'
    rows.forEach((row, i) => {
      const y = infoStartY + i * lineH

      ctx.textAlign = 'left'
      ctx.fillStyle = '#8b6340'
      ctx.font = '13px Georgia, serif'
      ctx.fillText(row.label, colL, y)

      ctx.textAlign = 'right'
      ctx.fillStyle = '#3b1f0e'
      ctx.font = '13px Georgia, serif'
      ctx.fillText(row.value, colR, y)
    })

    // Divider sebelum total
    const divY = infoStartY + rows.length * lineH + 8
    ctx.strokeStyle = 'rgba(139,99,64,0.25)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 5])
    ctx.beginPath()
    ctx.moveTo(colL, divY)
    ctx.lineTo(colR, divY)
    ctx.stroke()
    ctx.setLineDash([])

    // Total
    const totalY = divY + 28
    ctx.textAlign = 'left'
    ctx.fillStyle = '#5c3317'
    ctx.font = 'bold 16px Georgia, serif'
    ctx.fillText('Total', colL, totalY)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#5c3317'
    ctx.font = 'bold 16px Georgia, serif'
    ctx.fillText(`Rp ${formatRupiah(props.transaction.total_price)}`, colR, totalY)

    // ── Footer ────────────────────────────────────────────
    const footerH = 52
    const footerY = H - footerH

    const footerGrad = ctx.createLinearGradient(0, footerY, 0, H)
    footerGrad.addColorStop(0, '#3b1f0e')
    footerGrad.addColorStop(1, '#2a1208')
    ctx.fillStyle = footerGrad
    ctx.fillRect(0, footerY, W, footerH)

    ctx.fillStyle = accentGrad
    ctx.fillRect(0, footerY, W, 2)

    const now = new Date()
    const formatted = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })

    ctx.fillStyle = 'rgba(232,200,138,0.85)'
    ctx.font = '11px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Diunduh pada ${formatted}`, W / 2, footerY + footerH / 2)

    // ── Download ──────────────────────────────────────────
    const link = document.createElement('a')
    link.download = `QRIS-${props.transaction.transaction_id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    isDownloading.value = false
  }
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
          {{
            status === 'pending'
              ? 'Scan QR code untuk membayar'
              : status === 'success'
                ? 'Terima kasih!'
                : 'Mohon tunggu sebentar'
          }}
        </p>
      </div>
      <div v-if="isPolling" class="ml-auto shrink-0">
        <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
      </div>
    </div>

    <!-- QR Code -->
    <div
      class="bg-linear-to-b from-slate-50 to-white rounded-xl p-6 text-center mb-4 border border-secondary"
    >
      <div class="flex justify-center mb-4">
        <div v-if="qrDataUrl" class="bg-white p-3 rounded-2xl shadow-md inline-block">
          <img :src="qrDataUrl" alt="QR Code Pembayaran QRIS" class="w-56 h-56 sm:w-64 sm:h-64" />
        </div>
        <div
          v-else
          class="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-secondary flex items-center justify-center"
        >
          <i class="pi pi-spin pi-spinner text-primary text-2xl"></i>
        </div>
      </div>

      <p class="text-xs text-text-light mb-4">
        Scan QR code menggunakan aplikasi e-wallet atau mobile banking
      </p>

      <!-- Tombol Download -->
      <button
        @click="downloadQR"
        :disabled="!qrDataUrl || isDownloading"
        class="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i
          :class="isDownloading ? 'pi pi-spin pi-spinner' : 'pi pi-download'"
          class="text-base"
        ></i>
        <span>{{ isDownloading ? 'Menyiapkan...' : 'Download QR Code' }}</span>
      </button>
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
        <span class="font-bold text-primary text-base">
          Rp {{ formatRupiah(transaction.total_price) }}
        </span>
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
