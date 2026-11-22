# Dad Joke Generator 👨😂

Fresh dad jokes on tap — 40+ groan-worthy classics, with a Groan-o-Meter to judge them.

## Features

- 40+ dad jokes bundled in `js/data.js` — the deck shuffles so no repeats until you've heard them all
- New joke button (Space works too) and one-tap copy button
- Groan-o-Meter: rate each joke **Groan / Chuckle / Legendary** — one rating per joke
- Running tally saved in `localStorage`, plus a total "jokes told" counter
- Reset button to clear the Groan-o-Meter

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no dependencies except Google Fonts. Just open `index.html` or serve the folder.

## Deploy

Any static host works — GitHub Pages, Netlify, Vercel: publish this folder as-is.
