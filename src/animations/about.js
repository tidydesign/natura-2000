// "Was ist Natura 2000?" on desktop (frame "Desktop - Home Page 01"): rows of text + photo.
// - While the first row rises into view, the intro text moves from the bottom of its photo up to
//   its place, arriving as the photo reaches its stop; then it scrolls away with the page.
// - Photos: each stops 32px below the header (the stop line); the next one comes up over it and
//   stops there too, covering it fully. Step texts 01–03 come up with their photos and stop
//   stacked: 01 32px below the header, each next one 32px below the one before.
// - Once the last photo covers the one before, everything lets go and scrolls on together; the
//   button sits at the bottom of the last photo.
// Pins without spacing: the layout and the page height stay as they are.
// Mobile and reduced motion: the plain list from about.css.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initAbout() {
  const section = document.querySelector('.about')
  if (!section) return
  const rows = [...section.querySelectorAll('.about__row')]
  const intro = section.querySelector('.about__intro')
  const figures = rows.map((row) => row.querySelector('.about__figure'))
  const steps = [...section.querySelectorAll('.about__step')]
  const lastFigure = figures.at(-1)
  if (!rows.length || !lastFigure) return

  const header = document.querySelector('.header')
  const headerHeight = () => (header ? header.offsetHeight : 0)
  // Distance from the header to the stop line, and between stacked steps (--about-stick-gap)
  const gap = () => parseFloat(getComputedStyle(section).getPropertyValue('--about-stick-gap')) || 0
  const stopLine = () => headerHeight() + gap()
  // Everything lets go when the last photo reaches the stop line
  const end = () => `top top+=${stopLine()}`

  gsap.matchMedia().add('(min-width: 480px) and (prefers-reduced-motion: no-preference)', () => {
    // Intro text: from the bottom of the first photo up to its place
    if (intro) {
      gsap.fromTo(
        intro,
        { y: () => Math.max(0, rows[0].offsetHeight - intro.offsetHeight) },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: rows[0],
            start: 'top bottom',
            end: () => `top top+=${stopLine()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )
    }

    // Photos stop on the stop line until the last one arrives (the last one only passes through)
    figures.slice(0, -1).forEach((figure) => {
      ScrollTrigger.create({
        trigger: figure,
        start: () => `top top+=${stopLine()}`,
        endTrigger: lastFigure,
        end,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })
    })

    // Step texts stack under the header: 01 on the stop line, each next one a step lower
    steps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: () => `top top+=${stopLine() + i * (step.offsetHeight + gap())}`,
        endTrigger: lastFigure,
        end,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })
    })
  })
}
