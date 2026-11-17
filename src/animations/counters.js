// Number counters: "19,4%" → [1][9],[4]%
// Every digit becomes a column: a window one line tall over a strip of digits that runs from 0 to
// the digit. Columns further right pass more digits (like a real counter going up); commas, dots
// and signs stay put.
// Geom has no tabular figures, so every column gets one fixed width, that of the widest digit,
// and the digits sit at its right edge: nothing is cut and nothing shifts while counting.

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

// Width of the widest digit in the counter's own font, as a CSS variable on the counter.
// Measured once the web font is in. Same ratio at every size, so one measure is enough
const setDigitWidth = (el) => {
  const probe = document.createElement('span')
  probe.className = 'counter__probe'
  el.append(probe)
  let max = 0
  for (let d = 0; d <= 9; d += 1) {
    probe.textContent = String(d)
    max = Math.max(max, probe.getBoundingClientRect().width)
  }
  probe.remove()
  // In em, so it follows the font size across breakpoints
  const fontSize = parseFloat(getComputedStyle(el).fontSize)
  el.style.setProperty('--counter-digit-width', `${max / fontSize}em`)
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
  return strips
}

// The strip moves up until its last digit (the value) sits in the window
const counterTimeline = (strips) => {
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
  document.fonts.ready.then(() => counters.forEach(setDigitWidth))
}
