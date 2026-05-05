import { ref, onMounted } from 'vue'
import { getLandingPage } from '@/services/api'
import type { LandingMenuItem, LandingGallery, LandingCafe } from '@/types/api'

export function useLandingPage() {
  const menus = ref<LandingMenuItem[]>([])
  const gallery = ref<LandingGallery[]>([])
  const allCafe = ref<LandingCafe[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function fetchLandingPage() {
    try {
      isLoading.value = true
      error.value = null
      const res = await getLandingPage()
      if (res.success) {
        menus.value = res.data.menus
        gallery.value = res.data.gallery
        allCafe.value = res.data.all_cafe
      } else {
        error.value = res.message
      }
    } catch (err) {
      error.value = 'Gagal memuat data halaman.'
      console.error('[useLandingPage]', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(fetchLandingPage)

  return { menus, gallery, allCafe, isLoading, error }
}
