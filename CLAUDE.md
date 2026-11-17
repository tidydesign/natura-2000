# Проект: Natura 2000

## Стек
- Vite + vanilla JS, без фреймворков
- Анимации: GSAP (+ ScrollTrigger), плавный скролл: Lenis
- Стили: чистый CSS, без Tailwind и препроцессоров
- Деплой: GitHub (tidydesign/natura-2000) → Vercel, автодеплой при push в main

## Структура
- index.html — разметка
- src/main.js — подключение стилей и инициализация
- src/styles/ — tokens.css (переменные), base.css, секции отдельными файлами
- src/animations/ — config.js (все тайминги и easing), smooth-scroll.js (Lenis + ScrollTrigger), анимации секций
- src/components/ — интерактив компонентов (hover и т. п.)
- src/assets/ — шрифты, логотипы и иконки (svg из Figma); public/ — файлы как есть
- src/images/<страница>/ — фото, которые готовит пользователь, каждое в двух размерах: name.jpg и name@2x.jpg (подключать через srcset 1x/2x)
- src/styles/components.css — общие блоки (eyebrow, button, link-icon, section-head, card, fact-card, tags); секции главной — отдельными файлами
- Размеры и отступы секций — тоже в tokens.css (блок «Sections»), в стилях секций только переменные
- vite.config.js — многостраничная сборка: новые страницы добавлять в build.rollupOptions.input

## Figma
- Для этого проекта использовать MCP-сервер `figma-masaaki` (тот же аккаунт Figma, что у masaaki-hasegawa), а не общий `figma`

## Дизайн-токены
- Цвета, шрифты и отступы берём из Figma Variables и кладём в CSS custom properties в tokens.css
- В файле Figma нет Variables: значения в tokens.css сняты со слоёв. Если в Figma появятся Variables, сверить с ними
- В стилях секций использовать только переменные, никаких захардкоженных значений

## Responsive
- Mobile-first, media queries через min-width
- Только два диапазона: Mobile <480px и Desktop ≥480px
- Брейкпоинт (min-width): 480px
- Фреймы Figma — визуализация типичного экрана внутри диапазона, а не границы
- Fluid-размеры (clamp) там, где дизайн это допускает

## Разметка
- Семантический HTML (header, main, section, nav, footer)
- Классы по BEM, названия на английском

## Анимации
- Анимировать только transform и opacity
- Easing по умолчанию: cubic-bezier(.16, 1, .3, 1), длительность 400–700 мс
- Обязательно учитывать prefers-reduced-motion
- Все тайминги и easing — в src/animations/config.js (и зеркально в tokens.css для CSS-переходов)

## Порядок работы
1. Сначала статичная вёрстка секции, без анимаций
2. Затем responsive
3. Затем анимации
- Делай одну секцию за раз и показывай результат
- После каждой завершённой секции предлагай git commit с понятным сообщением
- Не ставь новые зависимости без моего согласия
- Если макет неоднозначен, спроси, а не угадывай
