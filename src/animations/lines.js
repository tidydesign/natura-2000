// 1px lines (pseudo-elements scaled by --line-progress) that grow from the left once reached.
// Inside a horizontal track ("Was ist Natura 2000?" on desktop) a line starts when it comes in
// from the right, like the text there; elsewhere when it rises into view.
// "Drei Wege ins Netz" and "Neues aus dem Netz" grow their lines with their own blocks.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LINES, TEXT_START_X, prefersReducedMotion } from './config.js'
import { playWhenReached } from './discover.js'
import { horizontalScrollFor } from './horizontal.js'

gsap.registerPlugin(ScrollTrigger)

export function initLines() {
  if (prefersReducedMotion()) return
  document.querySelectorAll(LINES.selector).forEach((el) => {
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(el, { '--line-progress': 0 }, { '--line-progress': 1, duration: LINES.duration, ease: LINES.ease, lazy: false })
    const containerAnimation = horizontalScrollFor(el)
    if (containerAnimation) {
      ScrollTrigger.create({ trigger: el, containerAnimation, start: TEXT_START_X, once: true, onEnter: () => tl.play() })
    } else {
      playWhenReached(tl, el)
    }
  })
}
