import { HEADER } from '../animations/config.js'

// Adds .is-scrolled to the header once the page leaves the very top.
// The white bar and the logo collapse are CSS transitions on that class (header.css).
export function initHeader() {
  const header = document.querySelector('.header')
  if (!header) return

  let scrolled = null

  // Cheap: touches the DOM only when the state flips
  const update = () => {
    const next = window.scrollY > HEADER.scrolledAfter
    if (next === scrolled) return
    scrolled = next
    header.classList.toggle('is-scrolled', next)
  }

  window.addEventListener('scroll', update, { passive: true })
  update()
}
