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

// --- Text on the page (src/animations/text.js, src/animations/counters.js) ---

// Where scroll-triggered text starts: its top reaches this point of the screen
export const TEXT_START = 'top 85%'

// H1 on page load: letters rise from below and fade in one after another
// (same rhythm as the titles in renkus-heinz)
export const TITLE_LETTERS = {
  // Start offset of each letter, in line heights
  fromY: 0.5,
  // One letter's rise and fade (s)
  duration: 0.5,
  // Delay (s) between neighbouring letters of a line
  stagger: 0.018,
  // The next line starts once the previous line's animation is this far through (0–1)
  nextLineAt: 0.25,
  ease: 'power1.out',
}

// H2: the same, shorter step between letters for the smaller type
export const HEADING_LETTERS = { ...TITLE_LETTERS, stagger: 0.012 }

// Other text: lines rise one line height from transparent, one after another
export const TEXT_LINES = {
  // Start offset, in line heights
  fromY: 1,
  duration: DURATION.slow,
  // Between lines (s)
  stagger: 0.08,
  ease: EASE_OUT,
}

// Hero on page load, in seconds from the start (after the fonts and the hero photo are ready)
export const HERO_INTRO = {
  delay: 0.1,
  lead: 0.35,
  caption: 0.5,
  // Photo rises in, then the fact cards one after another
  media: 0.45,
  cards: 0.55,
  cardStep: 0.1,
  // Counters start with the first card
  counters: 0.55,
  // Longest wait (s) for the hero photo to decode before the intro starts anyway
  imageTimeout: 1.5,
}

// Hero photo and fact cards on load: rise from below and fade in.
// The photo starts 10% of its own height lower, each card 20% of its own height lower
export const HERO_MEDIA = {
  fromYPercent: 10,
  duration: 1.2,
  ease: EASE_OUT,
}

export const HERO_CARDS = {
  fromYPercent: 20,
  duration: 1,
  ease: EASE_OUT,
}

// Hero on scroll (scrubbed), from the top of the page until the photo is gone under the header:
// the photo moves from top-aligned to bottom-aligned in its frame (when it has spare height),
// the cards drift down until their gap to the photo's bottom equals their starting gap to its top
export const HERO_SCROLL = {
  // Tied straight to the scroll (Lenis already smooths it)
  scrub: true,
}

// Number counters: every digit runs under its mask from 0 to its value; commas, dots and
// percent signs stay put. Columns further right pass more digits, like a real counter.
// Every column is as wide as the widest digit, digits right-aligned (Geom has no tabular figures)
export const COUNTER = {
  duration: 2.2,
  // Soft start and soft stop, no jerk at either end
  ease: 'power2.inOut',
  // Most full 0–9 loops a column makes before its digit
  maxLoops: 1,
  // Between columns, left to right (s)
  stagger: 0.06,
  // Slide to natural spacing (a narrow "1" leaves no gap), starting this far into the count
  settle: { at: 0.75, duration: 1.2, ease: EASE_OUT },
}


export const TEXT_START_X_SHARE = 0.85
export const TEXT_START_X = `left ${TEXT_START_X_SHARE * 100}%`

// "Von Europa bis vor deine Tür" (src/animations/regions.js): the title stays in the middle of the
// screen (below the header) while the cards scroll past, until the button at the end of the
// section comes up to `gapToButton` px below it
export const REGIONS_TITLE = {
  gapToButton: 48,
}

// Background maps behind the cards: parallax travel, as a share of the map's own height
// (half above the card, half below)
export const REGIONS_MAPS = {
  parallax: 0.5,
}

// "Drei Wege ins Netz" (src/animations/discover.js), when reached:
// the head rises `headFromY` px, each stat column `statFromY` px, the 1px lines grow from the
// left. Everything in a stat column (rise, line, counter, texts) starts `blockStep` s after the
// column before it
export const DISCOVER = {
  headFromY: 48,
  statFromY: 96,
  blockStep: 0.1,
  rise: { duration: 1, ease: EASE_OUT },
  line: { duration: 1.8, ease: EASE_OUT },
}

// "Was gibt es zu entdecken?" on desktop (src/animations/discover.js): pinned in the middle of
// the screen below the header; the page scroll moves the cards left 1:1 over the title until the
// last card meets the right page margin
export const HABITATS_SCROLL = {
  // Tied straight to the scroll (Lenis already smooths it)
  scrub: true,
}

// "Art des Monats" on desktop (src/animations/species.js): once the section sits centred in the
// screen below the header, its frame opens to the whole screen by itself; scrolling back up
// closes it again
export const SPECIES_EXPAND = {
  duration: 0.9,
  ease: EASE_OUT,
}

// "Neues aus dem Netz" (src/animations/news.js), when reached: the head's 1px line grows from
// the left; the news cards rise from below and fade in, `cardStep` s apart (their text follows),
// all from the same offset: `cardFromShare` of the big card's height; the newsletter field rises
// by its own height and fades in
export const NEWS = {
  cardFromShare: 0.1,
  cardStep: 0.1,
  rise: { duration: 1, ease: EASE_OUT },
  line: { duration: 1.8, ease: EASE_OUT },
}

// 1px lines that grow from the left when reached (src/animations/lines.js), in sections without
// their own block animation ("Was ist Natura 2000?": eyebrow, step numbers on mobile, steps on
// desktop)
export const LINES = {
  selector: '.about__eyebrow, .about__number, .about__step',
  duration: 1.8,
  ease: EASE_OUT,
}
