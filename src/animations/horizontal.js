// Horizontal tracks moved by the page scroll ("Was ist Natura 2000?", "Was gibt es zu entdecken?").
// A track registers its tween here; text.js asks horizontalScrollFor() so that text inside a
// track starts when it comes in from the right (the tween becomes its containerAnimation).

import { gsap } from 'gsap'
import { TEXT_START_X_SHARE } from './config.js'

const tracks = new Map()
// Text timelines in a track still waiting for their turn: shown at once if the track stops being
// horizontal (the screen narrowed to mobile), so nothing stays hidden
const waiting = new Set()

export const registerTrack = (track, tween) => tracks.set(track, tween)

export const unregisterTrack = (track) => {
  tracks.delete(track)
  waiting.forEach((tl) => {
    if (track.contains(tl.revealElement)) {
      tl.progress(1)
      waiting.delete(tl)
    }
  })
}

// The track tween for text that comes in from the right; null for text outside tracks and for
// text already on screen before its track moves, which uses the vertical trigger
export const horizontalScrollFor = (el) => {
  for (const [track, tween] of tracks) {
    if (!track.contains(el)) continue
    const startLeft = el.getBoundingClientRect().left - gsap.getProperty(track, 'x')
    return startLeft < window.innerWidth * TEXT_START_X_SHARE ? null : tween
  }
  return null
}

export const waitInTrack = (tl, el) => {
  tl.revealElement = el
  waiting.add(tl)
}
export const doneInTrack = (tl) => waiting.delete(tl)
