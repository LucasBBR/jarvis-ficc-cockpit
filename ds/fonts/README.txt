BTG Pactual Design System — fonts/

Primary UI typeface: Inter (variable)
  https://fonts.google.com/specimen/Inter
  Replace InterVariable.woff2 with the real file; until then,
  prototype HTML files load Inter via Google Fonts <link>.

Numeric / mono: IBM Plex Mono (Regular, Medium)
  https://fonts.google.com/specimen/IBM+Plex+Mono
  Files expected: IBMPlexMono-Regular.woff2, IBMPlexMono-Medium.woff2

Substitution flag (see README): BTG Pactual's official institutional
typeface is bespoke and not bundled here. Inter is the closest open
substitute. When the licensed BTG font is available, drop it in this
folder and update the @font-face blocks at the top of
colors_and_type.css.
