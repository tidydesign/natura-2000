import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './config.js'

gsap.registerPlugin(ScrollTrigger)

// Lenis smooth scroll driven by the GSAP ticker, kept in sync with ScrollTrigger
export function initSmoothScroll() {
  if (prefersReducedMotion()) return null

  const lenis = new Lenis()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}
