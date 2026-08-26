// src/App.jsx

import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  MenuItem,
  Select,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MassachusettsMap from './MassachusettsMap';
import SidePanel from './SidePanel';
import AboutDialog from './AboutDialog';
import { METRIC_LIST, DEFAULT_METRIC, buildLookup, computeDomains } from './metrics';
import './App.css';

const DRAWER_WIDTH = 440;
const ABOUT_SEEN_KEY = 'wastema-about-seen';

function App() {
  const [rows, setRows] = useState([]);
  const [metricId, setMetricId] = useState(DEFAULT_METRIC);
  const [selected, setSelected] = useState(null); // { feature, data }
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(
    () => !localStorage.getItem(ABOUT_SEEN_KEY)
  );
  const compact = useMediaQuery('(max-width: 1100px)');

  // Fetch and parse the Excel data once.
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + '/consolidated_data.xlsx')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        setRows(XLSX.utils.sheet_to_json(sheet));
      })
      .catch((error) => console.error('Error fetching Excel data:', error));
  }, []);

  // Derived, memoized structures: O(1) name lookup + color-scale domains.
  const lookup = useMemo(() => buildLookup(rows), [rows]);
  const domains = useMemo(() => computeDomains(rows), [rows]);

  const handleMunicipalityClick = (feature) => {
    const name = String(feature.properties.massgis_name || '').toUpperCase();
    setSelected({ feature, data: lookup.get(name) ?? null });
    setDrawerOpen(true);
  };

  const handleCloseAbout = () => {
    localStorage.setItem(ABOUT_SEEN_KEY, '1');
    setAboutOpen(false);
  };

  const handleClosePanel = () => {
    setDrawerOpen(false);
    setSelected(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'divider', zIndex: 1201 }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ mr: 'auto', minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ lineHeight: 1.2 }}>
              Waste &amp; Equity in Massachusetts
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Municipal waste services, race, and wealth
            </Typography>
          </Box>

          {compact ? (
            <Select
              size="small"
              value={metricId}
              onChange={(e) => setMetricId(e.target.value)}
              sx={{ minWidth: 190 }}
              aria-label="Map metric"
            >
              {METRIC_LIST.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.shortLabel}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={metricId}
              onChange={(e, value) => value && setMetricId(value)}
              aria-label="Map metric"
            >
              {METRIC_LIST.map((m) => (
                <ToggleButton
                  key={m.id}
                  value={m.id}
                  sx={{ textTransform: 'none', px: 1.5, fontWeight: 600 }}
                >
                  {m.shortLabel}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          <Button
            startIcon={<InfoOutlinedIcon />}
            onClick={() => setAboutOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
          >
            About
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MassachusettsMap
            lookup={lookup}
            metricId={metricId}
            domains={domains}
            onMunicipalityClick={handleMunicipalityClick}
            selectedName={
              drawerOpen && selected
                ? selected.feature.properties.massgis_name
                : null
            }
          />
        </Box>

        <Drawer
          anchor="right"
          variant="persistent"
          open={drawerOpen}
          onClose={handleClosePanel}
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              maxWidth: '100vw',
              position: 'relative',
              border: 'none',
              borderLeft: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <SidePanel selected={selected} onClose={handleClosePanel} />
        </Drawer>
      </Box>

      <AboutDialog open={aboutOpen} onClose={handleCloseAbout} />
    </Box>
  );
}

export default App;
