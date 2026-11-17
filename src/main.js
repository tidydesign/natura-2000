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
import { initTextReveals } from './animations/text.js'
import { initCounters } from './animations/counters.js'
import { initHeroMedia } from './animations/hero.js'
import { initAbout } from './animations/about.js'
import { HERO_INTRO } from './animations/config.js'

initSmoothScroll()
initHeader()
initAbout()
const heroIntro = initTextReveals()
initHeroMedia(heroIntro)
initCounters({ heroIntro, heroAt: HERO_INTRO.counters })
