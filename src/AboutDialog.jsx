// src/AboutDialog.jsx
// In-app "readme": explains what the map shows, where the data comes from,
// and how to read it. Shown automatically on first visit.


import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Link,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'primary.dark' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" component="div">
        {children}
      </Typography>
    </Box>
  );
}

function AboutDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <PublicIcon color="primary" />
          <Typography variant="h5">Waste &amp; Equity in Massachusetts</Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Who gets their trash picked up, and who has to pay for it themselves?
          This map explores how municipal waste and recycling services line up
          with race and wealth across all 351 Massachusetts cities and towns.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Section title="How to read the map">
          Each municipality is shaded by the metric selected in the top bar.
          Try switching between <strong>Property wealth</strong> or{' '}
          <strong>Residents of color</strong> and <strong>Trash coverage</strong>{' '}
          to compare where services are provided against who lives there. Hover
          over any town for a quick value, and click it to open a detailed
          profile: demographics, service coverage, program rules, and fees.
          Gray towns have no data, often because they did not respond to the
          state survey.
        </Section>

        <Section title="Why it matters">
          Municipal curbside pickup is a service most residents take for
          granted, but in many towns only a fraction of households are covered.
          Where the municipal program stops, residents must contract private
          haulers, drive to transfer stations, or pay per-bag fees. Those costs
          weigh heaviest on lower-income communities. Mapping coverage next to
          demographic and wealth data makes those gaps visible.
        </Section>

        <Section title="Data sources">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              <strong>Waste services:</strong>{' '}
              <Link
                href="https://www.mass.gov/lists/recycling-solid-waste-data-for-massachusetts-cities-towns"
                target="_blank"
                rel="noopener"
              >
                MassDEP Municipal Solid Waste &amp; Recycling Survey
              </Link>{' '}
              (2023 program year)
            </li>
            <li>
              <strong>Demographics:</strong> U.S. Census Bureau, American
              Community Survey 2018–2022 five-year estimates
            </li>
            <li>
              <strong>Income &amp; property value:</strong> Massachusetts
              Department of Revenue (DOR income per capita and equalized
              valuation per capita)
            </li>
            <li>
              <strong>Boundaries:</strong> MassGIS municipal boundaries
            </li>
          </ul>
        </Section>

        <Section title="Caveats">
          Survey responses are self-reported and some municipalities did not
          report at all. Coverage counts reflect only <em>municipal</em>{' '}
          programs; condo associations and private-hauler arrangements are not
          captured. Demographic percentages are survey estimates with margins
          of error, especially in small towns.
        </Section>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose} variant="contained" disableElevation>
          Explore the map
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AboutDialog;
