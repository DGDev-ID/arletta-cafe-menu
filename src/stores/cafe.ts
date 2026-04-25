import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/services/api'
import type { ApiResponse, Cafe, CafeTable, MenuCategory, Menu } from '@/types/api'

function normalizeCategories(cats: MenuCategory[]): MenuCategory[] {
  return cats.map((cat) => ({
    ...cat,
    children: normalizeCategories(
      Array.isArray(cat.children)
        ? cat.children
        : Object.values(cat.children ?? {}),
    ),
  }))
}

export const useCafeStore = defineStore('cafe', () => {
  const cafe = ref<Cafe | null>(null)
  const table = ref<CafeTable | null>(null)
  const menuCategories = ref<MenuCategory[]>([])
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const topCategories = computed(() => {
    return menuCategories.value.filter((c) => c.parent_id === null)
  })

  const allMenus = computed<Menu[]>(() => {
    const result: Menu[] = []
    function collect(cats: MenuCategory[]) {
      for (const cat of cats) {
        for (const menu of cat.menus) {
          if (menu.status === 'available') {
            result.push(menu)
          }
        }
        if (cat.children?.length) {
          collect(cat.children)
        }
      }
    }
    collect(menuCategories.value)
    return result
  })

  async function fetchCafeData(cafeId: string, tableId: string) {
    isLoading.value = true
    error.value = null

    try {
      const res = await apiFetch<ApiResponse>('/get-menu-cafe-table', {
        cafe_id: cafeId,
        table_id: tableId,
      })

      cafe.value = res.data.cafe
      table.value = res.data.table
      menuCategories.value = normalizeCategories(res.data.menu_categories) // ← ditambahkan
      isLoaded.value = true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    cafe,
    table,
    menuCategories,
    isLoaded,
    isLoading,
    error,
    topCategories,
    allMenus,
    fetchCafeData,
  }
})