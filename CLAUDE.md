# CLAUDE.md

Guidance for AI assistants working on this repository.

## What this is

A single-page React dashboard mapping waste-management disparities across
Massachusetts municipalities. A Leaflet choropleth of all 351 towns is colored
by a user-selected metric (wealth, income, demographics, or service coverage);
clicking a town opens a detail panel.

## Commands

```bash
npm install
npm run dev      # vite dev server (default http://localhost:5173)
npm run build    # production build to dist/
npm run lint     # eslint
```

There are no automated tests. Verify changes with `npm run build` and by
loading the dev server.

## Architecture

```
src/
  main.jsx             Entry; mounts App inside MUI ThemeProvider
  theme.js             MUI theme (palette, Inter/Source Serif type)
  App.jsx              State owner: data fetch, metric selection, drawer,
                       about dialog. Builds lookup Map + scale domains.
  metrics.js           ★ Metric definitions + data helpers. Add new
                       choropleth metrics here (value/format/colors).
  MassachusettsMap.jsx Leaflet choropleth, hover tooltips, legend overlay
  SidePanel.jsx        Municipality detail panel (demographics donut,
                       coverage bars, program details)
  AboutDialog.jsx      In-app readme / methodology dialog
public/
  consolidated_data.xlsx      354 rows, 135 cols — all municipality data
  mass-municipalities.geojson 18 MB MassGIS boundaries
```

## Data model & gotchas

- **Join key:** spreadsheet `Municipality` ↔ GeoJSON `properties.massgis_name`,
  compared UPPERCASE. `buildLookup()` in `metrics.js` builds a Map for O(1)
  lookups — never `Array.find` per feature.
- **Missing data sentinel:** the string `- - DID NOT REPORT - -` appears in
  many cells. Use `toNumber()` / `cleanText()` / `didNotReportSurvey()` from
  `metrics.js`; never parse cells directly.
- **Column names are messy:** they contain question marks, periods, and
  mojibake (e.g. `Yard Waste # of Weeks¬† Drop-off Center is Open to
  Residents`). Copy them exactly; verify against the sheet with a quick node
  script before referencing a new column. (`What is the Annual Fee?` does NOT
  exist — it was a bug in an earlier version.)
- **Demographics columns** are ACS: `totpop`, `nhwhi_p` (% non-Hispanic
  white), `nhaa_p` (Black), `nhas_p` (Asian), `lat_p` (Hispanic/Latino),
  `nhmlt_p`, `nhoth_p`. `_me`/`_mep` suffixes are margins of error.
- **Wealth columns:** `EQV Per Capita` (property value), `DOR Income Per
  Capita`.
- `public/consolidated_data1.xlsx` is a vestigial 3-column file; not used.

## Performance notes

- The GeoJSON is 18 MB with detailed polygons. The `<GeoJSON>` layer is keyed
  on `metricId` so it only remounts on metric change; selection highlighting
  is done in place via a `name -> layer` ref map (`layersRef`). Don't add
  state that forces a remount per click.
- Color-scale domains use the 5th–95th percentile (`computeDomains`) to keep
  outliers (e.g. resort towns) from flattening the scale.

## Conventions

- MUI `sx` styling for components; plain CSS only for Leaflet overlays
  (`MassachusettsMap.css`).
- Formatting via the `Intl.NumberFormat` helpers exported from `metrics.js`.
- Missing values render as "No data" / "Not reported" — never `NaN`, `$NaN`,
  or `undefined` in the UI.
