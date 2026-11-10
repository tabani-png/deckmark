# Fonts

Loaded when the user asks for other faces, when a DECK.md or client brand names faces, or on a confidential (offline) build. A catalog theme has already named its faces; do not read this to second-guess it.

## The rule

Two families per deck (Floor 7): a display face for titles and the cover, a body face for everything else, or one family for both. `--font-figures` may name a third face for numbers only (a tabular sans beside a serif body). Every face goes through the tokens (`--font-display`, `--font-body`, `--font-figures`); no `font-family` past the token block (decklint `literal-font`).

## Pairings that read as finance

| Register | Display | Body | Figures |
| --- | --- | --- | --- |
| Strategy firm | a grotesk at 700 (IBM Plex Sans, Albert Sans, Public Sans) | the same family at 400 | the same, tabular |
| Bulge bracket, banking book | a sober serif (Source Serif 4, Newsreader, Spectral) or system Georgia | a grotesk (Arial, IBM Plex Sans, Public Sans) | the grotesk, tabular |
| Asset manager, LP letter | a transitional serif (Newsreader, Literata, EB Garamond) | a humanist sans (Source Sans 3, Figtree, Hanken Grotesk) | the sans, tabular |
| Dashboard, board readout | a grotesk (Inter Tight, Archivo, Onest) | the same family | a tabular sans or IBM Plex Mono for code-like figures |
| Public-sector report | a plain grotesk (Public Sans, Arial) | the same family | the same, tabular |
| Editorial, investor letter | a high-contrast serif (Libre Bodoni, Gloock) for titles only | a text serif (Source Serif 4, Literata) | a tabular sans |

Pick the face on a real title set at deck size, not on its name. Free faces only (Google Fonts or a system face) unless the user confirms a licence for a foundry face.

## Faces that need a reason

Every model reaches for these first: Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Raleway, Playfair Display, Merriweather. A deck may still use one when the client's brand names it or the user asks; the Picks block says why.

## System stacks and offline builds

Confidential material renders offline (`.deckmark/preflight.json` `"confidential": true`, or `scaffold --offline`): no Google Fonts request at all, and each font token keeps only its system fallbacks. Every theme's tokens therefore end in a system stack of the same build:

- Grotesk: `"Helvetica Neue", Arial, system-ui, sans-serif`
- Humanist sans: `"Segoe UI", "Gill Sans", Calibri, sans-serif`
- Serif: `Georgia, "Times New Roman", serif`
- Transitional serif: `Charter, "Iowan Old Style", Georgia, serif`
- Mono: `ui-monospace, Menlo, Consolas, monospace`

Check the offline render too: a fallback with wider figures can push a table cell over its column (decklint `overflow`). CI installs Georgia and Arial so classic themes measure the same on Linux as on macOS.

## Loading

- Only the weights the deck uses (400 and 700 by default; `--gf-load` in a theme names extra axes such as a light display cut).
- `display=swap`; render.mjs waits for `document.fonts.ready` (up to 5 seconds) before measuring or shooting, so the lint measures the real face.
- Never synthesise bold or italic (`font-synthesis: none` in base.css); a title in italic loads the italic.

## Client faces

A client brand that names its own face (a brand guide, a DECK.md, the font list in their PDF's properties) is used only if the file is supplied and licensed for this use; otherwise take the closest free face of the same class, name the substitution in the Picks block, and keep the client's face first in the token so it applies where installed.
