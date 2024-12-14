// src/App.js

import React, { useState, useEffect } from 'react';
import MassachusettsMap from './MassachusettsMap';
import PopulationChart from './PopulationChart';
import WasteManagementInfo from './WasteManagementInfo';
import * as XLSX from 'xlsx';
import './App.css';

import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  Box,
  CssBaseline,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function App() {
  const [excelData, setExcelData] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch and parse the Excel data
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + '/consolidated_data.xlsx')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        setExcelData(data);
      })
      .catch((error) => console.error('Error fetching Excel data:', error));
  }, []);

  // Handle municipality selection
  const handleMunicipalityClick = (feature) => {
    const municipalityName = feature.properties.massgis_name;
    const municipalityData = excelData.find(
      (item) => item.Municipality.toUpperCase() === municipalityName.toUpperCase()
    );

    if (municipalityData) {
      setSelectedMunicipality({ feature, data: municipalityData });
    } else {
      setSelectedMunicipality({ feature, data: null });
    }
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <div className="App">
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: 'white', color: 'black' }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            Massachusetts Waste Management Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <MassachusettsMap
        onMunicipalityClick={handleMunicipalityClick}
        excelData={excelData} // Pass excelData to the map
      />

      <Drawer
        anchor="right"
        variant="persistent"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{ '& .MuiDrawer-paper': { width: 600 } }}
      >
        <Box sx={{ padding: 2 }}>
          <IconButton onClick={handleDrawerClose} sx={{ float: 'right' }}>
            <CloseIcon />
          </IconButton>
          {selectedMunicipality && (
            <div className="info-panel">
              {selectedMunicipality.data ? (
                <>
                  <PopulationChart data={selectedMunicipality.data} />
                  <WasteManagementInfo data={selectedMunicipality.data} />
                </>
              ) : (
                <Typography variant="h6">
                  No data available for{' '}
                  {selectedMunicipality.feature.properties.massgis_name}
                </Typography>
              )}
            </div>
          )}
        </Box>
      </Drawer>
    </div>
  );
}

export default App;