// "Drei Wege ins Netz": blocks rise into place and their 1px lines grow from the left when
// reached. The head rises DISCOVER.headFromY px; each stat column rises DISCOVER.statFromY px,
// DISCOVER.blockStep s after the column before it. The same step is passed to the column's text
// and counter (data-reveal-delay, read by text.js and counters.js), so a column comes in as one.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DISCOVER, HABITATS_SCROLL, TEXT_START, prefersReducedMotion } from './config.js'
import { registerTrack, unregisterTrack } from './horizontal.js'

gsap.registerPlugin(ScrollTrigger)

// Plays `tl` `delay` s after `trigger` is reached (a paused timeline's own delay would be skipped)
export const playWhenReached = (tl, trigger, delay = 0) =>
  ScrollTrigger.create({
    trigger,
    start: TEXT_START,
    end: 'max',
    once: true,
    onEnter: () => (delay ? gsap.delayedCall(delay, () => tl.play()) : tl.play()),
  })

// Rise + line, played once when `trigger` is reached
const blockIn = (block, line, fromY, trigger, delay) => {
  const tl = gsap.timeline({ paused: true })
  tl.from(block, { y: fromY, ...DISCOVER.rise, lazy: false }, 0)
  if (line) tl.fromTo(line, { '--line-progress': 0 }, { '--line-progress': 1, ...DISCOVER.line, lazy: false }, 0)
  playWhenReached(tl, trigger, delay)
}

const clamp01 = gsap.utils.clamp(0, 1)

// "Was gibt es zu entdecken?" on desktop: the block is pinned in the middle of the screen below
// the header; the page scroll moves the cards left 1:1, over the title, until the last card
// meets the right page margin. The title fades out while the first card crosses it: fully there
// when the card reaches its right edge, gone when it reaches its left edge.
const initHabitats = (section) => {
  const block = section.querySelector('.discover__habitats')
  const title = block?.querySelector('.discover__title')
  const slider = block?.querySelector('.discover__slider')
  const firstCard = slider?.querySelector('.habitat')
  if (!title || !firstCard) return

  const header = document.querySelector('.header')
  const headerHeight = () => (header ? header.offsetHeight : 0)
  const middle = () => headerHeight() + (window.innerHeight - headerHeight()) / 2

  gsap.matchMedia().add('(min-width: 480px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('discover--horizontal')

    const lastCard = [...slider.querySelectorAll('.habitat')].at(-1)
    const gutter = () => parseFloat(getComputedStyle(section).paddingRight) || 0
    // Until the last card's right edge meets the right page margin
    const distance = () => {
      const right = lastCard.getBoundingClientRect().right - gsap.getProperty(slider, 'x')
      return Math.max(0, right - (section.clientWidth - gutter()))
    }

    // Title edges and the first card's start, relative to the page, measured on refresh
    let layout = null
    const measure = () => {
      const titleBox = title.getBoundingClientRect()
      layout = {
        titleLeft: titleBox.left,
        titleRight: titleBox.right,
        cardLeft: firstCard.getBoundingClientRect().left - gsap.getProperty(slider, 'x'),
      }
    }
    const setOpacity = gsap.quickSetter(title, 'opacity')
    const render = () => {
      if (!layout) return
      const cardLeft = layout.cardLeft + gsap.getProperty(slider, 'x')
      setOpacity(clamp01((cardLeft - layout.titleLeft) / (layout.titleRight - layout.titleLeft)))
    }

    const tween = gsap.to(slider, {
      x: () => -distance(),
      ease: 'none',
      onUpdate: render,
      scrollTrigger: {
        trigger: block,
        start: () => `center ${middle()}px`,
        end: () => `+=${distance()}`,
        pin: true,
        // The block's parent (.discover) is flex, where GSAP leaves the spacing off by default:
        // without it the next section would scroll up over the pinned cards
        pinSpacing: true,
        scrub: HABITATS_SCROLL.scrub,
        invalidateOnRefresh: true,
        onRefresh: () => {
          measure()
          render()
        },
      },
    })
    registerTrack(slider, tween)
    measure()
    render()

    return () => {
      section.classList.remove('discover--horizontal')
      gsap.set(title, { clearProps: 'opacity' })
      unregisterTrack(slider)
      layout = null
    }
  })
}

export function initDiscover() {
  const section = document.querySelector('.discover')
  if (!section) return
  const stats = [...section.querySelectorAll('.stat')]
  const row = section.querySelector('.discover__stats')
  // Column delays, also for the text and counters inside; all of them start from the row
  // (it does not move), not from their own shifted places
  stats.forEach((stat, i) => {
    stat.dataset.revealDelay = String(i * DISCOVER.blockStep)
  })
  if (row) row.dataset.revealTrigger = 'row'
  if (prefersReducedMotion()) return

  const head = section.querySelector('.section-head')
  if (head) blockIn(head, head, DISCOVER.headFromY, head, 0)

  stats.forEach((stat, i) => {
    blockIn(stat, stat.querySelector('.stat__value'), DISCOVER.statFromY, row, i * DISCOVER.blockStep)
  })

  initHabitats(section)
}

// Delay (s) set on an element's block, for text and counters inside it
export const revealDelayOf = (el) => parseFloat(el.closest('[data-reveal-delay]')?.dataset.revealDelay) || 0

// The element that starts an element's reveal: its block's trigger if it has one, else itself
export const revealTriggerOf = (el) => el.closest('[data-reveal-trigger]') || el
