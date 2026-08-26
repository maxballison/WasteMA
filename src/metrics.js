// src/metrics.js
// Metric definitions for the choropleth, plus shared data helpers.
// Each metric knows how to extract its value from a spreadsheet row,
// how to format it for display, and which color ramp to use.

import chroma from 'chroma-js';

export const NOT_REPORTED = '- - DID NOT REPORT - -';

/** Parse a spreadsheet cell into a finite number, or null. */
export function toNumber(value) {
  if (value === undefined || value === null || value === NOT_REPORTED) return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[$,%]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** True when the municipality skipped the MassDEP survey entirely. */
export function didNotReportSurvey(row) {
  return !row || row['Municipal Contact Name'] === NOT_REPORTED;
}

/** "NORTH ADAMS" -> "North Adams" */
export function titleCase(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat('en-US');

export const formatCurrency = (v) => (v === null ? 'No data' : currency.format(v));
export const formatCompactCurrency = (v) => (v === null ? '—' : compactCurrency.format(v));
export const formatInteger = (v) => (v === null ? 'No data' : integer.format(v));
export const formatPercent = (v) => (v === null ? 'No data' : `${Math.round(v)}%`);

function coverage(row, servedKey) {
  const total = toNumber(row['Total Number of Households']);
  const served = toNumber(row[servedKey]);
  if (total === null || served === null || total <= 0) return null;
  return Math.min((served / total) * 100, 100);
}

/**
 * Choropleth metrics. `value(row)` returns a number or null.
 * `domain` is computed at runtime from the data (see computeDomains).
 */
export const METRICS = {
  eqv: {
    id: 'eqv',
    label: 'Property wealth per capita',
    shortLabel: 'Property wealth',
    description: 'Equalized property valuation (EQV) per resident — a proxy for municipal wealth.',
    value: (row) => toNumber(row['EQV Per Capita']),
    format: formatCompactCurrency,
    colors: ['#f0f9e8', '#7bccc4', '#2b8cbe', '#084081'],
  },
  income: {
    id: 'income',
    label: 'Income per capita',
    shortLabel: 'Income',
    description: 'DOR reported income per capita.',
    value: (row) => toNumber(row['DOR Income Per Capita']),
    format: formatCompactCurrency,
    colors: ['#f7fcf5', '#a1d99b', '#31a354', '#00441b'],
  },
  nonwhite: {
    id: 'nonwhite',
    label: 'Residents of color (%)',
    shortLabel: 'Residents of color',
    description:
      'Share of residents who are not non-Hispanic white (ACS 2018–2022 5-year estimates).',
    value: (row) => {
      const white = toNumber(row.nhwhi_p);
      return white === null ? null : Math.max(0, Math.min(100, 100 - white));
    },
    format: formatPercent,
    colors: ['#fff7f3', '#fa9fb5', '#c51b8a', '#49006a'],
  },
  trashCoverage: {
    id: 'trashCoverage',
    label: 'Trash service coverage (%)',
    shortLabel: 'Trash coverage',
    description:
      'Share of households served by the municipal trash program. Low values often mean residents must hire private haulers.',
    value: (row) => coverage(row, 'Households Served by Municipal Trash Program'),
    format: formatPercent,
    colors: ['#fee8c8', '#fdbb84', '#e34a33', '#7f0000'],
    reverse: true, // low coverage = hot color reads as "worse"
  },
  recyclingCoverage: {
    id: 'recyclingCoverage',
    label: 'Recycling service coverage (%)',
    shortLabel: 'Recycling coverage',
    description: 'Share of households served by the municipal recycling program.',
    value: (row) => coverage(row, 'Households Served by Municipal Recycling Program'),
    format: formatPercent,
    colors: ['#fee8c8', '#fdbb84', '#e34a33', '#7f0000'],
    reverse: true,
  },
};

export const DEFAULT_METRIC = 'eqv';
export const METRIC_LIST = Object.values(METRICS);

/**
 * Build a Map keyed by UPPERCASE municipality name for O(1) lookups
 * (the GeoJSON uses upper-case massgis_name values).
 */
export function buildLookup(rows) {
  const lookup = new Map();
  for (const row of rows) {
    if (row.Municipality) lookup.set(String(row.Municipality).toUpperCase(), row);
  }
  return lookup;
}

/**
 * Compute per-metric color domains from the data using the 5th–95th
 * percentiles, so a handful of outliers (e.g. resort towns with huge
 * property values) don't wash out the rest of the state.
 */
export function computeDomains(rows) {
  const domains = {};
  for (const metric of METRIC_LIST) {
    const values = rows
      .map((row) => metric.value(row))
      .filter((v) => v !== null)
      .sort((a, b) => a - b);
    if (values.length === 0) {
      domains[metric.id] = [0, 1];
      continue;
    }
    const q = (p) => values[Math.min(values.length - 1, Math.floor(p * values.length))];
    let lo = q(0.05);
    let hi = q(0.95);
    if (lo === hi) {
      lo = values[0];
      hi = values[values.length - 1] || lo + 1;
    }
    domains[metric.id] = [lo, hi];
  }
  return domains;
}

/** Build a chroma color scale for a metric over its computed domain. */
export function makeScale(metric, domain) {
  const colors = metric.reverse ? [...metric.colors].reverse() : metric.colors;
  // chroma scales clamp out-of-domain values by default
  return chroma.scale(colors).domain(domain);
}
