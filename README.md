# College Apps

Standalone PWA for tracking Sasha's college application research — same
configuration as [school-tracker-pwa](https://github.com/ravirajpat-org/school-tracker-pwa):
static HTML/CSS/vanilla JS, no framework, no build step, `docs/` served
directly via GitHub Pages.

Unlike school-tracker-pwa, there's no scraper/backend and no live data
source — every card is static content baked into `docs/index.html`,
updated by hand (or by asking Claude) as research happens.

## Structure

Four tabs:
- **In State** — Texas schools (in-state tuition)
- **Out of State** — non-Texas US schools, direct freshman admission
- **3+2** — US-only combined-plan dual-degree programs (Columbia Combined
  Plan, and a landscape scan of other sponsor schools)
- **International** — direct-entry international universities, plus
  US-degree programs built around an international partner university

## Local preview

```bash
cd docs
python3 -m http.server 8000
```
Open `http://localhost:8000` and enter the family password (same one used
for school-tracker-pwa).

## Editing content

There's no data pipeline — add/edit cards directly in `docs/index.html`
under the relevant `<div id="...-panel">`, following the existing
`.card` / `.tutoring-table` / `.tutoring-note` markup patterns from
school-tracker-pwa's `styles.css` (copied here as-is).
