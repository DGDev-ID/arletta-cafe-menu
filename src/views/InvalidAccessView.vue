<script setup lang="ts">
// Halaman ini ditampilkan ketika parameter branch/table/room tidak valid
</script>

<template>
  <div class="min-h-screen bg-bg flex items-center justify-center p-6">
    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
      <!-- Icon -->
      <div
        class="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <i class="pi pi-qrcode text-4xl text-accent"></i>
      </div>

      <!-- Title -->
      <h2 class="text-xl font-bold text-text mb-2">Akses Tidak Valid</h2>

      <!-- Description -->
      <p class="text-sm text-text-light leading-relaxed mb-6">
        Halaman ini hanya bisa diakses melalui QR code yang tersedia di meja cafe atau kamar hotel.
      </p>

      <!-- Instruction -->
      <div class="bg-secondary-light rounded-xl p-4 mb-6 text-left">
        <p class="text-xs font-semibold text-text mb-2 flex items-center gap-1.5">
          <i class="pi pi-info-circle text-primary"></i>
          Cara memesan:
        </p>
        <ol class="text-xs text-text-light space-y-1.5 list-decimal list-inside">
          <li>
            Scan QR code yang ada di <strong>meja cafe</strong> atau <strong>kamar hotel</strong>
          </li>
          <li>Menu akan terbuka otomatis</li>
          <li>Pilih menu dan checkout</li>
        </ol>
      </div>

      <!-- Visual hint -->
      <div class="flex items-center justify-center gap-3 text-text-light text-xs">
        <div class="flex items-center gap-1">
          <i class="pi pi-building text-primary text-sm"></i>
          <span>Meja Cafe</span>
        </div>
        <span class="text-secondary">atau</span>
        <div class="flex items-center gap-1">
          <i class="pi pi-inbox text-primary text-sm"></i>
          <span>Kamar Hotel</span>
        </div>
      </div>
    </div>
  </div>
</template>
