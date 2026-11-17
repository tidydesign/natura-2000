// "Art des Monats" on desktop: the section is one screen tall below the header, its frame
// 32px in from every side. Once the section sits centred in the screen area below the header
// (its top at the header), the frame opens to the whole screen by itself: the inset and the
// corner radius run to 0 (CSS variables, see species.css). Scrolling back up past that point
// closes it again. The content keeps its distances to the frame's edges; the card keeps its
// width, the title block stretches.
// Mobile and reduced motion: the plain layout.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SPECIES_EXPAND } from './config.js'

gsap.registerPlugin(ScrollTrigger)

export function initSpecies() {
  const section = document.querySelector('.species')
  if (!section) return
  const header = document.querySelector('.header')
  const headerHeight = () => (header ? header.offsetHeight : 0)

  gsap.matchMedia().add('(min-width: 480px) and (prefers-reduced-motion: no-preference)', () => {
    const open = gsap.to(section, {
      '--species-inset': '0px',
      '--species-radius': '0px',
      duration: SPECIES_EXPAND.duration,
      ease: SPECIES_EXPAND.ease,
      paused: true,
    })

    ScrollTrigger.create({
      trigger: section,
      start: () => `top top+=${headerHeight()}`,
      end: 'max',
      invalidateOnRefresh: true,
      onEnter: () => open.play(),
      onLeaveBack: () => open.reverse(),
    })

    return () => open.revert()
  })
}
