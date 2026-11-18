// Hover for buttons and card titles:
// - fill: a circle grows from the button's centre and fills it with the hover colour
//   (.hover-fill, colours per button in CSS: --fill-color, --fill-pressed)
// - roll: the label (or icon) moves up one line and fades out while a copy comes up from below
//   (.roll-host on the element that is hovered, .roll around the content that rolls)
// The copy is aria-hidden, so screen readers read the label once.

const FILL = '.button, .header__link--accent, .header__burger, .newsletter__submit'
// [element that is hovered, element whose content rolls]
const ROLL = [
  ['.button, .header__link--accent, .header__burger, .newsletter__submit', null],
  ['.habitat__link', '.habitat__title'],
]

// Wraps the content of `el`:
// <span.roll><span.roll__item><span.roll__label>…</span></span><span.roll__item--next>copy</span></span>
// The hover moves the items; anything else (the text reveal) works on the label inside, so the
// two never set the same element's opacity
export const rollify = (el) => {
  if (!el || el.querySelector(':scope > .roll')) return
  const roll = document.createElement('span')
  roll.className = 'roll'
  const item = document.createElement('span')
  item.className = 'roll__item'
  const label = document.createElement('span')
  label.className = 'roll__label'
  while (el.firstChild) label.append(el.firstChild)
  item.append(label)
  const next = item.cloneNode(true)
  next.className = 'roll__item roll__item--next'
  next.setAttribute('aria-hidden', 'true')
  roll.append(item, next)
  el.append(roll)
}

export function initButtonHover() {
  document.querySelectorAll(FILL).forEach((el) => el.classList.add('hover-fill'))
  ROLL.forEach(([hosts, target]) => {
    document.querySelectorAll(hosts).forEach((host) => {
      host.classList.add('roll-host')
      rollify(target ? host.querySelector(target) : host)
    })
  })
}
