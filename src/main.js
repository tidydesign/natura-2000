import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/about.css'
import './styles/regions.css'
import './styles/discover.css'
import './styles/species.css'
import './styles/news.css'
import './styles/footer.css'
import './styles/text-motion.css'

import { initSmoothScroll } from './animations/smooth-scroll.js'
import { initHeader } from './components/header.js'
import { initButtonHover } from './components/button-hover.js'
import { initTextReveals } from './animations/text.js'
import { initCounters } from './animations/counters.js'
import { initHeroMedia } from './animations/hero.js'
import { initAbout } from './animations/about.js'
import { initRegions } from './animations/regions.js'
import { initDiscover } from './animations/discover.js'
import { initSpecies } from './animations/species.js'
import { initNews } from './animations/news.js'
import { initLines } from './animations/lines.js'
import { HERO_INTRO } from './animations/config.js'

initSmoothScroll()
initHeader()
// Before the text reveals: it wraps labels and card titles, which text.js then splits
initButtonHover()
initAbout()
initRegions()
initDiscover()
initSpecies()
initNews()
// After the tracks are set up (about.js), so lines inside them follow the horizontal scroll
initLines()
const heroIntro = initTextReveals()
initHeroMedia(heroIntro)
initCounters({ heroIntro, heroAt: HERO_INTRO.counters })
