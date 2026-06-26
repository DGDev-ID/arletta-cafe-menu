import { ref, onMounted } from 'vue'
import { getPromoBanners } from '@/services/api'
import type { PromoBannerItem } from '@/types/api'

export function usePromoBanners() {
  const banners = ref<PromoBannerItem[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function fetchBanners() {
    try {
      isLoading.value = true
      error.value = null
      const res = await getPromoBanners()
      if (res.success) {
        banners.value = res.data
      } else {
        error.value = res.message
      }
    } catch (err) {
      error.value = 'Gagal memuat banner promo.'
      console.error('[usePromoBanners]', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(fetchBanners)

  return { banners, isLoading, error }
}
