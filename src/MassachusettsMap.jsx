// src/MassachusettsMap.js

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MassachusettsMap.css';
import { useTheme } from '@mui/material/styles';
import L from 'leaflet';
import chroma from 'chroma-js';

function MassachusettsMap({ onMunicipalityClick, excelData }) {
  const [geoData, setGeoData] = useState(null);
  const theme = useTheme();

  // Fixed income domain bounds
  const minIncome = 0;
  const maxIncome = 300000;

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + '/mass-municipalities.geojson')
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error('Error fetching GeoJSON data:', error));
  }, []);

  // Function to get the color based on "DOR Income Per Capita"
  const getFillColor = (municipalityName) => {
    if (!excelData) return '#ccc';

    const municipalityData = excelData.find(
      (item) => item.Municipality.toUpperCase() === municipalityName.toUpperCase()
    );

    if (municipalityData && municipalityData['EQV Per Capita'] !== undefined) {
      const incomePerCapita = parseFloat(municipalityData['EQV Per Capita']);
      if (isNaN(incomePerCapita)) {
        return '#ccc'; // Default color if data is invalid
      }
      return getColor(incomePerCapita);
    } else {
      return '#ccc'; // Default color if data is missing
    }
  };

  // Function to map income per capita to a color
  const getColor = (d) => {
    // Create a chroma scale from a light blue to a dark blue using a fixed domain
    const scale = chroma.scale(['#dcf0fb', '#081d58']).domain([minIncome, maxIncome]);
    return scale(d).hex();
  };

  // Style function for GeoJSON features
  const style = (feature) => {
    const municipalityName = feature.properties.massgis_name;
    return {
      weight: 1,
      color: '#666',
      fillColor: getFillColor(municipalityName),
      fillOpacity: 0.7,
    };
  };

  // Event handlers for each feature
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        onMunicipalityClick(feature);
      },
      mouseover: () => {
        const originalFillColor = getFillColor(feature.properties.massgis_name);
        const hoverFillColor = chroma(originalFillColor).brighten(0.5).hex();

        layer.setStyle({
          weight: 2,
          color: 'white',
          fillColor: hoverFillColor,
          fillOpacity: 0.9,
        });
        layer.bringToFront();
      },
      mouseout: () => {
        layer.setStyle(style(feature));
      },
    });
  };

  // Legend Component
  function Legend() {
    const map = useMap();

    useEffect(() => {
      if (map) {
        const legend = L.control({ position: 'bottomleft' });

        legend.onAdd = () => {
          const div = L.DomUtil.create('div', 'info legend');

          // Define intermediate value for midpoint
          const midIncome = (minIncome + maxIncome) / 2;

          div.innerHTML = `
            <div class="legend-title">EQV Per Capita</div>
            <div class="legend-bar"></div>
            <div class="legend-labels">
              <span>${Math.round(minIncome)}</span>
              <span>${Math.round(midIncome)}</span>
              <span>${Math.round(maxIncome)}</span>
            </div>
          `;
          return div;
        };

        legend.addTo(map);

        // Cleanup function to remove legend on component unmount
        return () => {
          legend.remove();
        };
      }
    }, [map]);

    return null;
  }

  return (
    <MapContainer
      center={[42.4072, -71.3824]}
      zoom={8}
      style={{ height: 'calc(100vh - 64px)', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {geoData && (
        <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
      )}
      <Legend />
    </MapContainer>
  );
}

export default MassachusettsMap;