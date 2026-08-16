import { ref, onMounted, onUnmounted } from 'vue'

const isOrderingDisabled = ref(false)
let intervalId: number | null = null
let subscribers = 0

function checkTime() {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()

  // 23:45 - 23:59 (hour 23, min >= 45)
  // 00:00 - 00:15 (hour 0, min <= 15)
  if ((hour === 23 && minute >= 45) || (hour === 0 && minute <= 15)) {
    isOrderingDisabled.value = true
  } else {
    isOrderingDisabled.value = false
  }
}

export function useOrderTimeLimit() {
  onMounted(() => {
    if (subscribers === 0) {
      checkTime()
      intervalId = window.setInterval(checkTime, 30000) // check every 30 seconds
    }
    subscribers++
  })

  onUnmounted(() => {
    subscribers--
    if (subscribers === 0 && intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
  })

  // Return function in case we need to trigger manually, but ref is enough
  return { isOrderingDisabled, checkTime }
}
