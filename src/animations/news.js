// "Neues aus dem Netz", when reached:
// - the head's 1px line grows from the left (as in "Drei Wege ins Netz")
// - the news cards rise from below and fade in, NEWS.cardStep s apart; every card starts the same
//   distance lower: NEWS.cardFromShare of the big card's height. Desktop: the cards sit in one
//   row and start together from the row, one step apart; their text follows its card
//   (data-reveal-trigger / data-reveal-delay, read by text.js). Mobile: each card when reached.
// - the newsletter field rises by its own height and fades in

import { gsap } from 'gsap'
import { NEWS, prefersReducedMotion } from './config.js'
import { playWhenReached } from './discover.js'

export function initNews() {
  const section = document.querySelector('.news')
  if (!section) return
  const head = section.querySelector('.section-head')
  const list = section.querySelector('.news__list')
  const cards = [...section.querySelectorAll('.news__card')]
  const bigCard = section.querySelector('.news__card--wide') || cards[0]
  const form = section.querySelector('.newsletter__form')
  const desktop = window.matchMedia('(min-width: 480px)').matches

  // Text inside a card waits for its card
  if (desktop && list) {
    list.dataset.revealTrigger = 'row'
    cards.forEach((card, i) => {
      card.dataset.revealDelay = String(i * NEWS.cardStep)
    })
  } else {
    cards.forEach((card) => {
      card.dataset.revealTrigger = 'card'
    })
  }
  if (prefersReducedMotion()) return

  if (head) {
    const line = gsap.timeline({ paused: true })
    line.fromTo(head, { '--line-progress': 0 }, { '--line-progress': 1, ...NEWS.line, lazy: false })
    playWhenReached(line, head)
  }

  cards.forEach((card, i) => {
    const tl = gsap.timeline({ paused: true })
    tl.from(card, { y: () => bigCard.offsetHeight * NEWS.cardFromShare, opacity: 0, ...NEWS.rise, lazy: false })
    if (desktop && list) playWhenReached(tl, list, i * NEWS.cardStep)
    else playWhenReached(tl, card)
  })

  if (form) {
    const tl = gsap.timeline({ paused: true })
    tl.from(form, { y: () => form.offsetHeight, opacity: 0, ...NEWS.rise, lazy: false })
    playWhenReached(tl, form)
  }
}
