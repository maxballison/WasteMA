// src/SidePanel.jsx
// Detail panel shown when a municipality is clicked: header, key stats,
// demographics donut, service-coverage bars, and structured program details.


import {
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import {
  NOT_REPORTED,
  toNumber,
  didNotReportSurvey,
  titleCase,
  formatCurrency,
  formatInteger,
} from './metrics';

const RACE_COLORS = {
  White: '#94a3b8',
  Black: '#7c3aed',
  Asian: '#0ea5e9',
  'Hispanic/Latino': '#f59e0b',
  Multiracial: '#10b981',
  Other: '#f43f5e',
};

function cleanText(value) {
  if (value === undefined || value === null || value === NOT_REPORTED || value === '') {
    return null;
  }
  return String(value);
}

function yesNo(value) {
  const v = cleanText(value);
  if (v === null) return null;
  return v.trim().toLowerCase() === 'yes';
}

/* ---------- small building blocks ---------- */

function StatCard({ label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, flex: 1, minWidth: 0, borderRadius: 2.5, bgcolor: '#f8fafc' }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.3 }} noWrap>
        {value}
      </Typography>
    </Paper>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
      {children}
    </Typography>
  );
}

function CoverageBar({ label, served, total }) {
  const pct = total > 0 && served !== null ? Math.min((served / total) * 100, 100) : null;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pct === null
            ? 'No data'
            : `${Math.round(pct)}% · ${formatInteger(served)} of ${formatInteger(total)} households`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct ?? 0}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: '#e2e8f0',
          '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: 'primary.main' },
        }}
      />
    </Box>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        py: 0.9,
        borderBottom: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
        {value ?? 'Not reported'}
      </Typography>
    </Box>
  );
}

function BoolChip({ label, value }) {
  if (value === null) return null;
  return (
    <Chip
      size="small"
      label={label}
      color={value ? 'primary' : 'default'}
      variant={value ? 'filled' : 'outlined'}
      sx={{ fontWeight: 600 }}
    />
  );
}

/* ---------- demographics donut ---------- */

function DemographicsChart({ row }) {
  const entries = [
    { name: 'White', value: toNumber(row.nhwhi_p) },
    { name: 'Black', value: toNumber(row.nhaa_p) },
    { name: 'Asian', value: toNumber(row.nhas_p) },
    { name: 'Hispanic/Latino', value: toNumber(row.lat_p) },
    { name: 'Multiracial', value: toNumber(row.nhmlt_p) },
    { name: 'Other', value: toNumber(row.nhoth_p) },
  ].filter((e) => e.value !== null && e.value > 0.05);

  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No demographic data available.
      </Typography>
    );
  }

  const totalPop = toNumber(row.totpop);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entries}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
              animationDuration={500}
            >
              {entries.map((entry) => (
                <Cell key={entry.name} fill={RACE_COLORS[entry.name]} />
              ))}
            </Pie>
            <ChartTooltip formatter={(v) => `${v.toFixed(1)}%`} />
          </PieChart>
        </ResponsiveContainer>
        {totalPop !== null && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1 }}>
              {Intl.NumberFormat('en-US', { notation: 'compact' }).format(totalPop)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              residents
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1 }}>
        {entries.map((entry) => (
          <Box
            key={entry.name}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '3px',
                bgcolor: RACE_COLORS[entry.name],
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {entry.name}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {entry.value.toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ---------- main panel ---------- */

function SidePanel({ selected, onClose }) {
  if (!selected) return null;

  const { feature, data: row } = selected;
  const name = titleCase(feature.properties.massgis_name);

  if (!row) {
    return (
      <Box sx={{ p: 3 }}>
        <PanelHeader name={name} county={null} onClose={onClose} />
        <Alert severity="info" sx={{ mt: 2 }}>
          No data is available for {name} in this dataset.
        </Alert>
      </Box>
    );
  }

  const county = cleanText(row.County);
  const noSurvey = didNotReportSurvey(row);

  const totalHouseholds = toNumber(row['Total Number of Households']);
  const trashServed = toNumber(row['Households Served by Municipal Trash Program']);
  const recyclingServed = toNumber(row['Households Served by Municipal Recycling Program']);

  const tipFee = toNumber(row['Tip Fee as of 1/1/2024']);
  const tonnage = toNumber(row['Trash Disposal Tonnage']);
  const tonsPerHousehold =
    tonnage !== null && trashServed !== null && trashServed > 0
      ? (tonnage / trashServed).toFixed(2)
      : null;

  return (
    <Box sx={{ p: 3, pb: 5 }}>
      <PanelHeader name={name} county={county} onClose={onClose} />

      {/* Key stats */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, mb: 3 }}>
        <StatCard
          label="Property value / capita"
          value={formatCurrency(toNumber(row['EQV Per Capita']))}
        />
        <StatCard
          label="Income / capita"
          value={formatCurrency(toNumber(row['DOR Income Per Capita']))}
        />
      </Stack>

      {/* Demographics */}
      <SectionTitle>Who lives here</SectionTitle>
      <DemographicsChart row={row} />
      <Divider sx={{ my: 3 }} />

      {/* Waste services */}
      <SectionTitle>Municipal waste services</SectionTitle>
      {noSurvey ? (
        <Alert severity="warning" variant="outlined">
          {name} did not report to the MassDEP municipal waste survey, so no
          service information is available. Residents here may rely on private
          haulers or drop-off arrangements not captured in this data.
        </Alert>
      ) : (
        <>
          <CoverageBar
            label="Trash program"
            served={trashServed}
            total={totalHouseholds ?? 0}
          />
          <CoverageBar
            label="Recycling program"
            served={recyclingServed}
            total={totalHouseholds ?? 0}
          />

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ my: 2 }}>
            <BoolChip label="Trash limits enforced" value={yesNo(row['Enforced Trash Limits at Curb'])} />
            <BoolChip label="Mandatory recycling" value={yesNo(row['Enforced Mandatory Recycling'])} />
            <BoolChip label="Compost bins" value={yesNo(row['Compost Bin Distribution Program'])} />
            <BoolChip label="Swap shop" value={yesNo(row['Swap-Shop'])} />
            <BoolChip label="Mattress collection" value={yesNo(row['Mattress Collection'])} />
            <BoolChip label="Textile collection" value={yesNo(row['Textile Collection'])} />
          </Stack>

          <DetailRow label="Trash service" value={cleanText(row['Trash Service Type'])} />
          <DetailRow label="Recycling service" value={cleanText(row['Recycling Service Type'])} />
          <DetailRow
            label="Recycling frequency"
            value={cleanText(row['Recycling Collection Frequency'])}
          />
          <DetailRow
            label="Funded by property tax"
            value={
              yesNo(row['Solid Waste Program Funded by Property Tax?']) === null
                ? null
                : yesNo(row['Solid Waste Program Funded by Property Tax?'])
                ? 'Yes'
                : 'No'
            }
          />
          <DetailRow
            label="Disposal tip fee (2024)"
            value={tipFee !== null ? `${formatCurrency(tipFee)} / ton` : null}
          />
          <DetailRow
            label="Bulky waste fee"
            value={
              yesNo(row['Fee for Bulky Waste?']) === null
                ? null
                : yesNo(row['Fee for Bulky Waste?'])
                ? 'Yes'
                : 'No'
            }
          />
          <DetailRow
            label="Curbside yard waste"
            value={
              toNumber(row['Yard Waste # of Weeks Collected Curbside']) !== null
                ? `${toNumber(row['Yard Waste # of Weeks Collected Curbside'])} weeks / yr`
                : null
            }
          />
          <DetailRow
            label="Trash disposed (2023)"
            value={tonnage !== null ? `${formatInteger(Math.round(tonnage))} tons` : null}
          />
          <DetailRow
            label="Tons per served household"
            value={tonsPerHousehold}
          />

          {cleanText(row['Municipal Contact Name']) && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Municipal contact: {cleanText(row['Municipal Contact Name'])}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}

function PanelHeader({ name, county, onClose }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Box sx={{ flex: 1 }}>
        {county && (
          <Typography variant="overline" color="text.secondary">
            {titleCase(county)} County
          </Typography>
        )}
        <Typography variant="h5" sx={{ lineHeight: 1.15 }}>
          {name}
        </Typography>
      </Box>
      <IconButton onClick={onClose} aria-label="Close panel" size="small">
        <CloseIcon />
      </IconButton>
    </Box>
  );
}

export default SidePanel;
