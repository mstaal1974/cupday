# Cupday

A responsive, mobile-first guide to the 3 November 2026 race analyses for Flemington, Randwick, Doomben and Gold Coast Poly.

## Run

```sh
npm start
```

Open port 3000 in your web browser. Requires Python 3; no application dependencies or build step. Any static web host can serve `index.html`, `style.css`, `app.js`, `icon.svg`, and `data.json`.

## Features

- 37 races with ranked selections, source analysis and document scratchings.
- 24 highlighted best bets with the author's confidence ratings.
- Quinellas, trifectas, Melbourne Cup first four, and four venue quaddies.
- Local-device shortlist; no account or betting integration.
- Flexi calculator using $1 per combination; race-summary and best-bet alternatives preserved separately.

Times are as supplied, labelled AEDT (Victoria/NSW) and AEST (Queensland). Data is transcribed from the user's four DOCX documents; it is not a live racing feed and has not been independently verified. No odds, results, or scratchings refresh automatically. Confidence scores are source ratings, not probabilities.

## Validate

`npm test` checks the complete dataset and, when Playwright is available, runs mobile browser interaction checks against the running server.
