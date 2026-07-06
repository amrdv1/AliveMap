"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore, ThreatObject } from '../store/useStore';
import { socket } from '../lib/socket';
import { THREAT_SVGS, THREAT_COLORS } from './ThreatIcon';

// Maptiler / Carto Dark Matter style for free
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// --- Heatmap Layer Style ---
const heatmapLayer = {
  id: 'threat-heat',
  type: 'heatmap',
  source: 'threats',
  maxzoom: 9,
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 1, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
  }
} as any;

const ThreatMarker = ({ threat }: { threat: ThreatObject }) => {
  const loc = threat.locations[0];
  if (!loc) return null;

  const isThreat = Object.keys(THREAT_SVGS).includes(threat.type);
  const rot = threat.course || 0;
  
  let svgIcon = THREAT_SVGS[threat.type as keyof typeof THREAT_SVGS] || THREAT_SVGS['DRONE'];
  let ringColor = THREAT_COLORS[threat.type as keyof typeof THREAT_COLORS] || '#ffffff';

  return (
    <Marker longitude={loc.lng} latitude={loc.lat} anchor="center">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {threat.quantity && threat.quantity > 1 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded px-1 z-20 border border-red-900 shadow-[0_0_5px_#ef4444]">
            x{threat.quantity}
          </div>
        )}
        <div className="radar-pulse" style={{ '--ring-color': ringColor + '40' } as any}></div>
        <div 
          style={{ transform: `rotate(${rot}deg)`, filter: `drop-shadow(0 0 4px ${ringColor})` }} 
          className="z-10 w-6 h-6 text-white"
          dangerouslySetInnerHTML={{ __html: svgIcon }}
        />
      </div>
    </Marker>
  );
};

export default function UkraineMap() {
  const { setAlerts, threats, setThreats } = useStore();
  const [geoData, setGeoData] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    fetch('/ukraine_regions.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((e) => console.error("Failed to load regions", e));
  }, []);

  const heatmapData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: threats.filter(t => t.locations.length > 0).map(t => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [t.locations[0].lng, t.locations[0].lat] },
        properties: { mag: t.confidence || 1.0 }
      }))
    };
  }, [threats]);

  return (
    <div className="w-full h-full relative">
        <Map
          initialViewState={{
            longitude: 31.1656,
            latitude: 48.3794,
            zoom: 5.5,
            pitch: 45 // 3D pitch!
          }}
          mapStyle={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />
          
          {/* GeoJSON Regions */}
          {geoData && (
            <Source id="regions" type="geojson" data={geoData}>
              <Layer 
                id="regions-line" 
                type="line" 
                paint={{ 'line-color': '#4b5563', 'line-width': 1, 'line-opacity': 0.5 }} 
              />
            </Source>
          )}

          {/* Heatmap Toggle */}
          {showHeatmap && (
            <Source id="threats-heat" type="geojson" data={heatmapData as any}>
              <Layer {...heatmapLayer} />
            </Source>
          )}

          {/* Threats */}
          {threats.map(t => (
            <ThreatMarker key={t.id} threat={t} />
          ))}

        </Map>

        {/* Heatmap Control Button */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-4 py-2 rounded font-bold shadow-lg transition-colors ${showHeatmap ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
          >
            {showHeatmap ? '🔥 Heatmap On' : '🔥 Heatmap Off'}
          </button>
        </div>
    </div>
  );
}
