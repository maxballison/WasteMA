// src/MassachusettsMap.jsx
// Leaflet choropleth of Massachusetts municipalities. Colors are driven by
// the currently-selected metric; hovering shows a tooltip, clicking opens
// the detail panel. The selected town's outline is drawn on its own
// non-interactive pane above the choropleth, so it can never be covered by
// (or interfere with) hover events on neighboring polygons.

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MassachusettsMap.css';
import { METRICS, makeScale, titleCase } from './metrics';

const NO_DATA_COLOR = '#e2e8f0';

function Legend({ metric, domain }) {
  const colors = metric.reverse ? [...metric.colors].reverse() : metric.colors;
  const gradient = `linear-gradient(to right, ${colors.join(', ')})`;
  const [lo, hi] = domain;
  const mid = (lo + hi) / 2;

  return (
    <div className="map-legend">
      <div className="map-legend-title">{metric.label}</div>
      <div className="map-legend-bar" style={{ background: gradient }} />
      <div className="map-legend-labels">
        <span>{metric.format(lo)}</span>
        <span>{metric.format(mid)}</span>
        <span>{metric.format(hi)}</span>
      </div>
      <div className="map-legend-nodata">
        <span className="map-legend-swatch" /> No data
      </div>
    </div>
  );
}

function MassachusettsMap({ lookup, metricId, domains, onMunicipalityClick, selectedName }) {
  const [geoData, setGeoData] = useState(null);

  const metric = METRICS[metricId];
  const domain = domains?.[metricId] ?? [0, 1];
  const scale = useMemo(
    () => makeScale(METRICS[metricId], domains?.[metricId] ?? [0, 1]),
    [metricId, domains]
  );

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + '/mass-municipalities.geojson')
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error('Error fetching GeoJSON data:', error));
  }, []);

  const getRow = (feature) =>
    lookup?.get(String(feature.properties.massgis_name || '').toUpperCase()) ?? null;

  const getFillColor = (feature) => {
    const row = getRow(feature);
    const value = row ? metric.value(row) : null;
    return value === null ? NO_DATA_COLOR : scale(value).hex();
  };

  const style = (feature) => ({
    weight: 0.8,
    color: '#94a3b8',
    fillColor: getFillColor(feature),
    fillOpacity: 0.82,
  });

  const onEachFeature = (feature, layer) => {
    const name = String(feature.properties.massgis_name || '').toUpperCase();
    const row = getRow(feature);
    const value = row ? metric.value(row) : null;

    layer.bindTooltip(
      `<div class="muni-tooltip"><strong>${titleCase(name)}</strong><br/>${
        metric.shortLabel
      }: ${metric.format(value)}</div>`,
      { sticky: true, direction: 'top', opacity: 1 }
    );

    layer.on({
      click: () => onMunicipalityClick(feature),
      mouseover: () => {
        layer.setStyle({ weight: 2, color: '#334155', fillOpacity: 0.95 });
      },
      mouseout: () => {
        layer.setStyle(style(feature));
      },
    });
  };

  // The selected municipality's geometry, rendered as a separate outline.
  const selectedFeature = useMemo(() => {
    if (!geoData || !selectedName) return null;
    return (
      geoData.features.find(
        (f) =>
          String(f.properties.massgis_name || '').toUpperCase() ===
          selectedName.toUpperCase()
      ) ?? null
    );
  }, [geoData, selectedName]);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[42.16, -71.72]}
        zoom={9}
        zoomSnap={0.5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          // Remount only when the metric (or data availability) changes, so
          // styles and tooltips are rebuilt against the new metric.
          <GeoJSON
            key={`${metricId}-${lookup ? lookup.size : 0}`}
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
        {/* Selection outline: own pane above the choropleth (overlayPane is
            z-index 400), non-interactive so all mouse events pass through. */}
        <Pane name="selection-outline" style={{ zIndex: 450 }}>
          {selectedFeature && (
            <GeoJSON
              key={selectedName}
              data={selectedFeature}
              interactive={false}
              style={{ weight: 3, color: '#0f172a', fill: false }}
            />
          )}
        </Pane>
      </MapContainer>
      <Legend metric={metric} domain={domain} />
    </div>
  );
}

export default MassachusettsMap;
