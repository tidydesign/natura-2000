// Text reveals:
// - H1 and H2 come in letter by letter (letters rise half a line and fade in, line after line)
// - other text comes in line by line: each line rises one line height from transparent
// Scroll-triggered, once. The hero runs on page load as one timeline (see initHeroIntro).

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import {
  HEADING_LETTERS,
  HERO_INTRO,
  TEXT_LINES,
  TEXT_START,
  TEXT_START_X,
  TITLE_LETTERS,
  prefersReducedMotion,
} from './config.js'
import { heroImageReady } from './hero.js'
import { doneInTrack, horizontalScrollFor, waitInTrack } from './horizontal.js'
import { revealDelayOf, revealTriggerOf } from './discover.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Headings split into letters
const HEADINGS = 'main h1, main h2'

// Text split into lines
const LINE_TEXT = [
  '.hero__lead',
  '.hero__caption',
  '.eyebrow',
  '.section-head__lead',
  '.about__text',
  '.about__number',
  '.about__step-title',
  '.card__stat',
  '.card__title',
  '.card__text',
  '.card__date',
  '.stat__title',
  '.stat__text',
  '.habitat__title',
  '.species-card__title',
  '.species-card__latin',
  '.species-card__lead',
  '.species-card__text',
  '.species-card__fact dt',
  '.species-card__fact dd',
  '.newsletter__lead',
  '.footer__text',
  '.footer__big-link',
  '.footer__muted',
].join(', ')

// One-line rows that rise as a whole (not split)
const BLOCKS = '.tags'

const lineHeightOf = (el) => parseFloat(getComputedStyle(el).lineHeight)

// Letters of each line rise and fade in turn; the next line starts once the previous one is
// `nextLineAt` through
const lettersTimeline = (lines, lineHeight, { fromY, duration, stagger, nextLineAt, ease }) => {
  const tl = gsap.timeline()
  let start = 0
  lines.forEach((chars) => {
    if (!chars.length) return
    tl.from(chars, { y: fromY * lineHeight, opacity: 0, duration, ease, stagger }, start)
    start += (duration + stagger * (chars.length - 1)) * nextLineAt
  })
  return tl
}

const linesTimeline = (lines, lineHeight, { fromY, duration, stagger, ease }) =>
  gsap.timeline().from(lines, { y: fromY * lineHeight, opacity: 0, duration, ease, stagger })

// Split a heading into lines of letters. Re-split on resize (autoSplit): SplitText reverts the
// old animation and keeps its progress on the new one
const splitLetters = (el, vars, play) =>
  SplitText.create(el, {
    type: 'lines, words, chars',
    linesClass: 'split-line',
    charsClass: 'split-char',
    autoSplit: true,
    onSplit(self) {
      gsap.set(el, { autoAlpha: 1 })
      const lines = self.lines.map((line) => [...line.querySelectorAll('.split-char')])
      return play(lettersTimeline(lines, lineHeightOf(el), vars))
    },
  })

const splitLines = (el, play) =>
  SplitText.create(el, {
    type: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit(self) {
      gsap.set(el, { autoAlpha: 1 })
      return play(linesTimeline(self.lines, lineHeightOf(el), TEXT_LINES))
    },
  })

// Paused until the element is reached, then played once. `end: 'max'` keeps the trigger active
// below its start, so text above the screen (a reload halfway down the page) plays at once.
// Inside the horizontal track (desktop) the element is reached when it comes in from the right.
// A re-split on resize replaces the element's trigger
const triggers = new WeakMap()
const onReach = (el) => (tl) => {
  tl.pause()
  triggers.get(el)?.kill()
  const containerAnimation = horizontalScrollFor(el)
  if (containerAnimation) waitInTrack(tl, el)
  // A block can hold its text back (data-reveal-delay, e.g. the stat columns)
  const delay = revealDelayOf(el)
  const play = () => {
    doneInTrack(tl)
    if (delay) gsap.delayedCall(delay, () => tl.play())
    else tl.play()
  }
  triggers.set(
    el,
    containerAnimation
      ? ScrollTrigger.create({ trigger: el, containerAnimation, start: TEXT_START_X, once: true, onEnter: play })
      : ScrollTrigger.create({ trigger: revealTriggerOf(el), start: TEXT_START, end: 'max', once: true, onEnter: play }),
  )
  return tl
}

// Hero: title letters, then the lead and the caption, on page load
const initHero = (hero, master) => {
  const title = hero.querySelector('.hero__title')
  const lead = hero.querySelector('.hero__lead')
  const caption = hero.querySelector('.hero__caption')
  const at = (time) => (tl) => {
    master.add(tl, time)
    return tl
  }
  if (title) splitLetters(title, TITLE_LETTERS, at(0))
  if (lead) splitLines(lead, at(HERO_INTRO.lead))
  if (caption) splitLines(caption, at(HERO_INTRO.caption))
}

// Hide the targets straight away (no flash of the final text), then split and animate once the
// fonts are in, since the line breaks depend on them. Returns the hero timeline, so other hero
// parts (the counters) can join it
export function initTextReveals() {
  const hero = document.querySelector('.hero')
  const heroTexts = hero ? [...hero.querySelectorAll('.hero__title, .hero__lead, .hero__caption')] : []
  const headings = [...document.querySelectorAll(HEADINGS)].filter((el) => !heroTexts.includes(el))
  const lines = [...document.querySelectorAll(LINE_TEXT)].filter((el) => !heroTexts.includes(el))
  const blocks = [...document.querySelectorAll(BLOCKS)]

  const master = gsap.timeline({ paused: true, delay: HERO_INTRO.delay })
  if (prefersReducedMotion()) return master

  gsap.set([...heroTexts, ...headings, ...lines, ...blocks], { autoAlpha: 0 })

  document.fonts.ready.then(() => {
    if (hero) initHero(hero, master)
    headings.forEach((el) => splitLetters(el, HEADING_LETTERS, onReach(el)))
    lines.forEach((el) => splitLines(el, onReach(el)))
    blocks.forEach((el) => {
      gsap.set(el, { autoAlpha: 1 })
      onReach(el)(linesTimeline(el, lineHeightOf(el), TEXT_LINES))
    })
    // The hero photo rises in as part of this timeline: wait until it can be shown
    heroImageReady().then(() => master.play())
  })

  return master
}
