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

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + '/mass-municipalities.geojson')
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error('Error fetching GeoJSON data:', error));
  }, []);

  // Function to get the color based on the percentage of non-white population
  const getFillColor = (municipalityName) => {
    const municipalityData = excelData.find(
      (item) => item.Municipality.toUpperCase() === municipalityName.toUpperCase()
    );

    if (municipalityData && municipalityData.nhwhi_p !== undefined) {
      const whitePercentage = parseFloat(municipalityData.nhwhi_p);
      if (isNaN(whitePercentage)) {
        return '#ccc'; // Default color if data is invalid
      }
      const nonWhitePercentage = 100 - whitePercentage; // Calculate non-white percentage
      return getColor(nonWhitePercentage);
    } else {
      return '#ccc'; // Default color if data is missing
    }
  };

  // Function to map percentage to a color
  const getColor = (d) => {
    // Create a chroma scale from light to dark
    const scale = chroma.scale(['#dcf0fb', '#081d58']).domain([0, 100]);
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
      const legend = L.control({ position: 'bottomleft' });

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');

        // Create a gradient bar
        div.innerHTML = `
          <div class="legend-title">Percentage of Non-White Population</div>
          <div class="legend-bar"></div>
          <div class="legend-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        `;
        return div;
      };

      legend.addTo(map);

      // Cleanup function to remove legend on component unmount
      return () => {
        legend.remove();
      };
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