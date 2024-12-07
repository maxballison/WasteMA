// src/components/MassachusettsMap.js

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MassachusettsMap.css'; // Optional CSS for styling

function MassachusettsMap({ onMunicipalityClick }) {
  const [geoData, setGeoData] = useState(null);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch('/mass-municipalities.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error fetching GeoJSON data:', error));
  }, []);

  // Default style for GeoJSON features
  const defaultStyle = {
    weight: 1,
    color: '#666',
    fillColor: '#ccc',
    fillOpacity: 0.7,
  };

  // Highlight style on hover or click
  const highlightStyle = {
    weight: 2,
    color: '#000',
    fillColor: '#555',
    fillOpacity: 0.9,
  };

  // Event handlers for each feature
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        onMunicipalityClick(feature);
      },
      mouseover: () => {
        layer.setStyle(highlightStyle);
      },
      mouseout: () => {
        layer.setStyle(defaultStyle);
      },
    });
  };

  return (
    <MapContainer
      center={[42.4072, -71.3824]}
      zoom={8}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {geoData && (
        <GeoJSON
          data={geoData}
          style={defaultStyle}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
}

export default MassachusettsMap;