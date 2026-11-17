// All animation timings and easings live here (mirrored in tokens.css for CSS transitions).

import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

// Default easing: cubic-bezier(.16, 1, .3, 1)
export const EASE_OUT = CustomEase.create('ease-out-expo', '0.16, 1, 0.3, 1')

export const DURATION = {
  fast: 0.4,
  base: 0.5,
  slow: 0.7,
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches

// Header (src/components/header.js, CSS in header.css, --header-* / --logo-* in tokens.css).
// After `scrolledAfter` px of scroll the white bar fades in (base) and the logo collapses
// into its text (slow); the logo graphics fade out faster (fast).
// Nav links: underline in and out left to right (fast). Brand buttons: colour change (200 ms)
export const HEADER = {
  scrolledAfter: 8,
  bgDuration: DURATION.base,
  logoCollapseDuration: DURATION.slow,
  logoGraphicsDuration: DURATION.fast,
  linkUnderlineDuration: DURATION.fast,
  buttonDuration: 0.2,
}
