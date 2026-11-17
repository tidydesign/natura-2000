// "Von Europa bis vor deine Tür"
// - The title holds in the middle of the screen (the part below the header) while the cards
//   scroll past over it, and lets go once the button at the end of the section is
//   REGIONS_TITLE.gapToButton px below it; from there both scroll on together. Pinned without
//   spacing, so the section keeps its height and layout.
// - Background maps (frame "Maps"), matched to the cards by name: each is centred level with its
//   card and moves with parallax against it, REGIONS_MAPS.parallax of its own height in all, so
//   it lags behind the page like something further away. Level with the card when the card is
//   in the middle of the screen.
// - A blurred circle in every map stays in the middle of the screen; the map shape is its mask,
//   so the glow shows wherever a map passes the middle.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REGIONS_MAPS, REGIONS_TITLE, prefersReducedMotion } from './config.js'

gsap.registerPlugin(ScrollTrigger)

const initTitle = (section, middle) => {
  const title = section.querySelector('.regions__title')
  const button = section.querySelector('.regions__button')
  if (!title || !button) return

  ScrollTrigger.create({
    trigger: title,
    start: () => `center ${middle()}px`,
    endTrigger: button,
    end: () => `top ${middle() + title.offsetHeight / 2 + REGIONS_TITLE.gapToButton}px`,
    pin: true,
    pinSpacing: false,
    invalidateOnRefresh: true,
  })
}

const initMaps = (section, middle) => {
  const maps = [...section.querySelectorAll('.regions-map')]
    .map((map) => ({
      map,
      glow: map.querySelector('.regions-map__glow'),
      card: section.querySelector(`.regions__card--${map.dataset.card}`),
    }))
    .filter(({ glow, card }) => glow && card)
  if (!maps.length) return

  // Current parallax shift of a map in px (the parallax moves it by yPercent)
  const shiftOf = (map, height) => (gsap.getProperty(map, 'yPercent') / 100) * height

  // Page positions (without transforms), refreshed with ScrollTrigger
  let layout = []
  const place = () => {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    layout = maps.map(({ map, glow, card }) => {
      const cardBox = card.getBoundingClientRect()
      const cardCentre = cardBox.top + window.scrollY + cardBox.height / 2
      map.style.top = `${cardCentre - sectionTop - map.offsetHeight / 2}px`
      const box = map.getBoundingClientRect()
      const height = map.offsetHeight
      return {
        map,
        glow,
        left: box.left + window.scrollX,
        top: box.top + window.scrollY - shiftOf(map, height),
        height,
        half: glow.offsetWidth / 2,
        setX: gsap.quickSetter(glow, 'x', 'px'),
        setY: gsap.quickSetter(glow, 'y', 'px'),
      }
    })
  }

  // Glow centre at the middle of the screen, in each map's own coordinates
  const renderGlow = () => {
    const centreX = window.innerWidth / 2
    const centreY = middle()
    layout.forEach(({ map, left, top, height, half, setX, setY }) => {
      setX(centreX - (left - window.scrollX) - half)
      setY(centreY - (top + shiftOf(map, height) - window.scrollY) - half)
    })
  }

  // Parallax: from REGIONS_MAPS.parallax / 2 above the card to as much below it
  if (!prefersReducedMotion()) {
    const half = (REGIONS_MAPS.parallax * 100) / 2
    maps.forEach(({ map, card }) => {
      gsap.fromTo(
        map,
        { yPercent: -half },
        {
          yPercent: half,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    })
  }

  // Keep the glows centred only while the section is on screen
  let active = false
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      active = self.isActive
      if (active) renderGlow()
    },
  })
  gsap.ticker.add(() => {
    if (active) renderGlow()
  })

  ScrollTrigger.addEventListener('refresh', () => {
    place()
    renderGlow()
  })
  place()
  renderGlow()
}

export function initRegions() {
  const section = document.querySelector('.regions')
  if (!section) return

  const header = document.querySelector('.header')
  const headerHeight = () => (header ? header.offsetHeight : 0)
  // Middle of the screen area below the header, in px from the top of the screen
  const middle = () => headerHeight() + (window.innerHeight - headerHeight()) / 2

  initMaps(section, middle)
  initTitle(section, middle)
}
