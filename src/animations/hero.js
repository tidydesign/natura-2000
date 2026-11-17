// Hero photo and fact cards.
// On load (part of the hero intro timeline from text.js): the photo rises from 20% of its height
// below and fades in, then the cards, 100 ms apart, each from 20% of its own height.
// On scroll (scrubbed), from the page top until the photo has gone under the header:
// - the image moves from top-aligned to bottom-aligned in its frame, if it is taller than the frame
// - the cards drift down so that at the end their gap to the photo's bottom equals their starting
//   gap to its top
// The intro moves the frame and each card; the scroll moves the image and the cards' wrapper,
// so the two never fight over one transform.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO_CARDS, HERO_INTRO, HERO_MEDIA, HERO_SCROLL, prefersReducedMotion } from './config.js'

gsap.registerPlugin(ScrollTrigger)

// Resolves once the hero photo is decoded, or after `imageTimeout`, whichever comes first
export const heroImageReady = () => {
  const image = document.querySelector('.hero__image')
  if (!image) return Promise.resolve()
  const decoded = image.decode().catch(() => {})
  const timeout = new Promise((resolve) => {
    setTimeout(resolve, HERO_INTRO.imageTimeout * 1000)
  })
  return Promise.race([decoded, timeout])
}

// lazy: false: the start state (hidden, lower) applies right away, not on the next frame,
// so the photo and the cards never show before their intro
const addIntro = (heroIntro, media, cards) => {
  heroIntro.from(
    media,
    {
      yPercent: HERO_MEDIA.fromYPercent,
      opacity: 0,
      duration: HERO_MEDIA.duration,
      ease: HERO_MEDIA.ease,
      lazy: false,
    },
    HERO_INTRO.media,
  )
  heroIntro.from(
    cards,
    {
      yPercent: HERO_CARDS.fromYPercent,
      opacity: 0,
      duration: HERO_CARDS.duration,
      ease: HERO_CARDS.ease,
      stagger: HERO_INTRO.cardStep,
      lazy: false,
    },
    HERO_INTRO.cards,
  )
}

const addScroll = (hero, media, image, facts) => {
  const header = document.querySelector('.header')
  const headerHeight = () => (header ? header.offsetHeight : 0)

  // Spare height of the image over its frame (0 when the frame is taller: no parallax)
  const spare = () => Math.max(0, image.offsetHeight - media.offsetHeight)
  // Cards end as far above the photo's bottom as they start below its top
  const drift = () => media.offsetHeight - facts.offsetHeight - 2 * facts.offsetTop

  gsap
    .timeline({
      scrollTrigger: {
        trigger: hero,
        start: 0,
        // The photo's bottom (the hero's bottom) passes under the header
        end: () => `bottom top+=${headerHeight()}`,
        scrub: HERO_SCROLL.scrub,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(image, { y: 0 }, { y: () => -spare(), ease: 'none' }, 0)
    .fromTo(facts, { y: 0 }, { y: () => Math.max(0, drift()), ease: 'none' }, 0)
}

// `heroIntro`: the hero timeline from initTextReveals()
export function initHeroMedia(heroIntro) {
  const hero = document.querySelector('.hero')
  if (!hero || prefersReducedMotion()) return
  const media = hero.querySelector('.hero__media')
  const image = hero.querySelector('.hero__image')
  const facts = hero.querySelector('.hero__facts')
  const cards = [...hero.querySelectorAll('.fact-card')]
  if (!media || !image || !facts) return

  if (heroIntro) addIntro(heroIntro, media, cards)
  addScroll(hero, media, image, facts)

  // The image height is known once it has loaded
  if (!image.complete) image.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
}
