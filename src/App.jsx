// src/App.js

import React, { useState, useEffect } from 'react';
import MassachusettsMap from './MassachusettsMap';
import PopulationChart from './PopulationChart';
import WasteManagementInfo from './WasteManagementInfo';
import * as XLSX from 'xlsx';
import './App.css';
console.log('help')
function App() {
  const [excelData, setExcelData] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  // Fetch and parse the Excel data
  useEffect(() => {
    fetch('/consolidated_data.xlsx')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        setExcelData(data);
      })
      .catch(error => console.error('Error fetching Excel data:', error));
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
      // If no data is found, set data to null
      setSelectedMunicipality({ feature, data: null });
    }
  };

  return (
    <div className="App">
      <MassachusettsMap onMunicipalityClick={handleMunicipalityClick} />
      {selectedMunicipality && (
        <div className="info-panel">
          {selectedMunicipality.data ? (
            <>
              <PopulationChart data={selectedMunicipality.data} />
              <WasteManagementInfo data={selectedMunicipality.data} />
            </>
          ) : (
            <h2>No data available for {selectedMunicipality.feature.properties.massgis_name}</h2>
          )}
        </div>
      )}
    </div>
  );
}

export default App;