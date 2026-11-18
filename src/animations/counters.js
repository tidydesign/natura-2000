// Number counters: "19,4%" → [1][9],[4]%
// Every digit becomes a column: a window one line tall over a strip of digits that runs from 0 to
// the digit. Columns further right pass more digits (like a real counter going up); commas, dots
// and signs stay put.
// Geom has no tabular figures, so every column gets one fixed width, that of the widest digit,
// and the digits sit at its right edge: nothing is cut and nothing shifts while counting.
// Narrow final digits (a "1") would leave gaps, so towards the end of the count every column and
// sign slides (--settle, in em) to where it would sit with natural widths; a centred number
// stays centred, a left-aligned one keeps its left edge.

import { gsap } from 'gsap'
import { COUNTER, prefersReducedMotion } from './config.js'
import { playWhenReached, revealDelayOf, revealTriggerOf } from './discover.js'

const COUNTERS = '.fact-card__value, .stat__value'

// Digits a column passes: `loops` full 0–9 rounds, then 0 up to its own digit
const stripDigits = (digit, loops) => {
  const digits = []
  for (let i = 0; i < loops; i += 1) for (let d = 0; d <= 9; d += 1) digits.push(d)
  for (let d = 0; d <= digit; d += 1) digits.push(d)
  return digits
}

// Measured once the web font is in, in em, so it follows the font size across breakpoints:
// - the widest digit, as the column width (--counter-digit-width on the counter)
// - each column's and sign's final slide to natural spacing (data-settle, used at the end)
const measureCounter = (el) => {
  const fontSize = parseFloat(getComputedStyle(el).fontSize)
  const probe = document.createElement('span')
  probe.className = 'counter__probe'
  el.append(probe)
  const widths = []
  for (let d = 0; d <= 9; d += 1) {
    probe.textContent = String(d)
    widths.push(probe.getBoundingClientRect().width / fontSize)
  }
  probe.remove()
  const column = Math.max(...widths)
  el.style.setProperty('--counter-digit-width', `${column}em`)

  const items = [...el.querySelectorAll('.counter > *')]
  const parts = items.map((item) => {
    const digit = item.dataset.digit
    return digit === undefined
      ? { item, now: item.getBoundingClientRect().width / fontSize, natural: null, isDigit: false }
      : { item, now: column, natural: widths[Number(digit)], isDigit: true }
  })
  parts.forEach((part) => {
    if (!part.isDigit) part.natural = part.now
  })
  // A centred number stays centred: the whole row moves by half of what it loses in width
  const lost = parts.reduce((sum, p) => sum + p.now - p.natural, 0)
  const centred = getComputedStyle(el).textAlign === 'center'
  let now = 0
  let natural = 0
  parts.forEach((part) => {
    // A digit's glyph sits at its column's right edge
    const glyphNow = now + (part.isDigit ? part.now - part.natural : 0)
    const settle = natural - glyphNow + (centred ? lost / 2 : 0)
    part.item.dataset.settle = `${settle.toFixed(4)}em`
    now += part.now
    natural += part.natural
  })
}

const buildCounter = (el) => {
  const text = el.textContent.trim()
  const digitCount = (text.match(/\d/g) || []).length
  el.setAttribute('aria-label', text)
  el.textContent = ''

  const inner = document.createElement('span')
  inner.className = 'counter'
  inner.setAttribute('aria-hidden', 'true')

  const strips = []
  let index = 0
  for (const ch of text) {
    if (!/\d/.test(ch)) {
      const sign = document.createElement('span')
      sign.className = 'counter__sign'
      sign.textContent = ch
      inner.append(sign)
      continue
    }
    // Rightmost column: most loops; each column to the left one fewer
    const fromRight = digitCount - 1 - index
    const loops = Math.max(0, COUNTER.maxLoops - fromRight)
    index += 1

    const column = document.createElement('span')
    column.className = 'counter__digit'
    column.dataset.digit = ch
    const strip = document.createElement('span')
    strip.className = 'counter__strip'
    stripDigits(Number(ch), loops).forEach((d) => {
      const item = document.createElement('span')
      item.textContent = d
      strip.append(item)
    })
    column.append(strip)
    inner.append(column)
    strips.push(strip)
  }
  el.append(inner)
  return { strips, parts: [...inner.children] }
}

// The strip moves up until its last digit (the value) sits in the window; near the end every
// column and sign slides to natural spacing
const counterTimeline = ({ strips, parts }) => {
  const tl = gsap.timeline()
  strips.forEach((strip, i) => {
    const steps = strip.children.length - 1
    tl.fromTo(
      strip,
      { yPercent: 0 },
      { yPercent: (-100 * steps) / strip.children.length, duration: COUNTER.duration, ease: COUNTER.ease },
      i * COUNTER.stagger,
    )
  })
  tl.fromTo(
    parts,
    { '--settle': '0em' },
    {
      '--settle': (i, part) => part.dataset.settle || '0em',
      duration: COUNTER.settle.duration,
      ease: COUNTER.settle.ease,
    },
    tl.duration() * COUNTER.settle.at,
  )
  return tl
}

// Hero counters join the hero intro (`heroIntro` at `heroAt`); the others play when reached
export function initCounters({ heroIntro, heroAt } = {}) {
  if (prefersReducedMotion()) return
  const counters = [...document.querySelectorAll(COUNTERS)]

  counters.forEach((el) => {
    const tl = counterTimeline(buildCounter(el))
    if (heroIntro && el.closest('.hero')) {
      heroIntro.add(tl, heroAt)
      return
    }
    tl.pause()
    // A block can hold its counter back and start it from its own trigger (the stat columns)
    playWhenReached(tl, revealTriggerOf(el), revealDelayOf(el))
  })

  // The hero intro also waits for the fonts, so the widths are set before any count starts
  document.fonts.ready.then(() => counters.forEach(measureCounter))
}
