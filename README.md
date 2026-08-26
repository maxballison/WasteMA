# Waste & Equity in Massachusetts

An interactive dashboard exploring how municipal waste and recycling services
line up with race and wealth across all 351 Massachusetts cities and towns.

Who gets curbside trash pickup — and who has to pay for it themselves? In many
Massachusetts towns only a fraction of households are covered by the municipal
program. Where coverage stops, residents must contract private haulers, drive
to transfer stations, or pay per-bag fees — costs that weigh heaviest on
lower-income communities. This map makes those gaps visible.

## Features

- **Choropleth map** of every MA municipality, switchable between five metrics:
  - Property wealth per capita (equalized valuation, EQV)
  - Income per capita (DOR)
  - Residents of color (%) — ACS 2018–2022
  - Trash service coverage (%) — households served by the municipal program
  - Recycling service coverage (%)
- **Hover tooltips** with the current metric value per town
- **Detail panel** on click: demographics donut, service-coverage bars, program
  rules (enforcement, compost bins, mattress/textile collection), fees, and
  disposal tonnage
- **About dialog** explaining data sources and how to read the map (shown on
  first visit)
- Color-scale domains are computed from the 5th–95th percentile of the data so
  outlier towns don't wash out the map

## Data sources

| Data | Source |
| --- | --- |
| Waste services | [MassDEP Municipal Solid Waste & Recycling Survey](https://www.mass.gov/lists/recycling-solid-waste-data-for-massachusetts-cities-towns) (2023 program year) |
| Demographics | U.S. Census Bureau, ACS 2018–2022 five-year estimates |
| Income & property value | Massachusetts DOR (income per capita, EQV per capita) |
| Boundaries | MassGIS municipal boundaries |

All data is consolidated into `public/consolidated_data.xlsx` (354 rows, one
per municipality) and joined to `public/mass-municipalities.geojson` by
upper-cased municipality name.

### Caveats

- Survey responses are self-reported; some municipalities did not report at
  all (shown in gray / flagged in the panel).
- Coverage counts reflect only *municipal* programs — condo associations and
  private-hauler arrangements are not captured.
- Demographic percentages are estimates with margins of error, especially in
  small towns.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build to dist/
npm run lint     # eslint
npm run deploy   # publish dist/ to GitHub Pages
```

## Stack

React 18 + Vite, Leaflet / react-leaflet (map), MUI (UI), Recharts (charts),
chroma-js (color scales), SheetJS (Excel parsing).
