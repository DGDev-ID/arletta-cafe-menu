import { computed } from 'vue'
import { useCafeStore } from '@/stores/cafe'

/**
 * Composable untuk mengakses info cafe & table dari store.
 *
 * URL format: ?cafe_id=CAFE-001&table_id=1
 * Data difetch oleh route guard, disimpan di cafe store.
 */
export function useLocation() {
  const cafeStore = useCafeStore()

  const cafeName = computed(() => cafeStore.cafe?.name ?? null)
  const cafeAddress = computed(() => cafeStore.cafe?.address ?? null)
  const tableName = computed(() => cafeStore.table?.name ?? null)
  const tableDescription = computed(() => cafeStore.table?.description ?? null)

  const locationLabel = computed(() => tableName.value)
  const locationIcon = computed(() => 'pi pi-building')

  const deliveryMessage = computed(() => {
    return 'Silakan tunggu, pesanan akan diantar ke mejamu'
  })

  return {
    cafeName,
    cafeAddress,
    tableName,
    tableDescription,
    locationLabel,
    locationIcon,
    deliveryMessage,
  }
}
