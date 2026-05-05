import { onMounted, onUnmounted } from 'vue'

export function useScrollAnimation() {
  let observer: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null

  function observeElements() {
    const elements = document.querySelectorAll('.fade-in:not(.visible), .fade-in-left:not(.visible), .fade-in-right:not(.visible)')
    elements.forEach((el) => observer?.observe(el))
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    observeElements()

    // Watch for newly added fade-in elements (e.g. rendered after API data loads)
    mutationObserver = new MutationObserver(() => {
      observeElements()
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    observer?.disconnect()
    mutationObserver?.disconnect()
  })
}
