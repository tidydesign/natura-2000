// "Was ist Natura 2000?" on desktop (frame "Desktop - Concept 01 - Screen 02"; the frame is the
// start state of the track).
// - While the section rises into view, the intro text moves from the bottom of the first photo
//   up to its place in the design, arriving as the section pins.
// - Pinned under the header, the page scroll moves the track left 1:1, until the last photo is
//   centred on screen.
// - Each photo moves under its frame (the image is wider than the frame): frame coming in at the
//   screen's right edge → image at the frame's left; frame centred → image centred; frame leaving
//   at the left edge → image at the frame's right.
// - Steps 01–03, by the same measure of their place on screen: their gap to the photo on their
//   left runs from 150% of the design's gap (coming in) to 50% (leaving).
// Mobile and reduced motion: no pin, the plain layout from about.css.
// The track tween is registered in horizontal.js, so text inside starts as it comes in from the
// right.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ABOUT_SCROLL } from './config.js'
import { registerTrack, unregisterTrack } from './horizontal.js'

gsap.registerPlugin(ScrollTrigger)

const clamp01 = gsap.utils.clamp(0, 1)

export function initAbout() {
  const section = document.querySelector('.about')
  const track = section?.querySelector('.about__track')
  if (!track) return

  const header = document.querySelector('.header')
  const headerHeight = () => (header ? header.offsetHeight : 0)
  const intro = track.querySelector('.about__intro')
  const firstFigure = track.querySelector('.about__figure')
  const figures = [...track.querySelectorAll('.about__figure')]
  const steps = [...track.querySelectorAll('.about__step')]

  gsap.matchMedia().add('(min-width: 480px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('about--horizontal')

    // Positions relative to the track at x = 0, measured on every refresh (resize, fonts, images)
    let layout = null
    const measure = () => {
      const trackLeft = track.getBoundingClientRect().left - gsap.getProperty(track, 'x')
      const leftOf = (el) => el.getBoundingClientRect().left - trackLeft - gsap.getProperty(el, 'x')
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      layout = {
        screen: section.clientWidth,
        figures: figures.map((figure) => {
          const image = figure.querySelector('.about__image')
          return {
            left: leftOf(figure),
            width: figure.offsetWidth,
            spare: Math.max(0, image.offsetWidth - figure.offsetWidth),
            setX: gsap.quickSetter(image, 'x', 'px'),
          }
        }),
        steps: steps.map((step) => ({
          left: leftOf(step),
          width: step.offsetWidth,
          gap,
          setX: gsap.quickSetter(step, 'x', 'px'),
        })),
      }
    }

    // 0: the element's left edge at the screen's right edge; 1: its right edge at the left edge
    const passage = ({ left, width }, x) => clamp01((layout.screen - (left + x)) / (layout.screen + width))

    const render = () => {
      if (!layout) return
      const x = gsap.getProperty(track, 'x')
      layout.figures.forEach((figure) => figure.setX(-figure.spare * passage(figure, x)))
      // Gap to the photo on the left: 150% → 50% of the design's gap, i.e. +50% → −50%
      layout.steps.forEach((step) => step.setX(step.gap * (0.5 - passage(step, x))))
    }

    // The track stops with the last photo centred on screen
    const distance = () => {
      if (!layout) measure()
      const last = layout.figures.at(-1)
      return Math.max(0, last.left + last.width / 2 - layout.screen / 2)
    }

    // Intro text: from the photo's bottom up to its place, while the section rises in
    gsap.fromTo(
      intro,
      { y: () => Math.max(0, firstFigure.offsetHeight - intro.offsetHeight) },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: () => `top top+=${headerHeight()}`,
          scrub: ABOUT_SCROLL.scrub,
          invalidateOnRefresh: true,
        },
      },
    )

    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      onUpdate: render,
      scrollTrigger: {
        trigger: section,
        start: () => `top top+=${headerHeight()}`,
        end: () => `+=${distance()}`,
        pin: true,
        scrub: ABOUT_SCROLL.scrub,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          layout = null
        },
        onRefresh: () => {
          measure()
          render()
        },
      },
    })

    registerTrack(track, horizontal)
    measure()
    render()

    return () => {
      section.classList.remove('about--horizontal')
      gsap.set([intro, ...steps, ...figures.map((f) => f.querySelector('.about__image'))], { clearProps: 'transform' })
      unregisterTrack(track)
      layout = null
    }
  })
}
