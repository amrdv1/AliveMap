"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore, ThreatObject } from '../store/useStore';
import { socket } from '../lib/socket';
import { THREAT_SVGS, THREAT_COLORS } from './ThreatIcon';

// Maptiler / Carto Dark Matter style for free
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256
    }
  },
  layers: [{
    id: 'satellite',
    type: 'raster',
    source: 'satellite'
  }]
};

const REGION_NAME_MAP: Record<string, string> = {
  "Київська область": "Kiev",
  "м. Київ": "Kiev City",
  "Одеська область": "Odessa",
  "Дніпропетровська область": "Dnipropetrovs'k",
  "Харківська область": "Kharkiv",
  "Львівська область": "L'viv",
  "Миколаївська область": "Mykolayiv",
  "Запорізька область": "Zaporizhzhya",
  "Херсонська область": "Kherson",
  "Чернігівська область": "Chernihiv",
  "Сумська область": "Sumy",
  "Полтавська область": "Poltava",
  "Черкаська область": "Cherkasy",
  "Вінницька область": "Vinnytsya",
  "Житомирська область": "Zhytomyr",
  "Кіровоградська область": "Kirovohrad",
  "Хмельницька область": "Khmel'nyts'kyy",
  "Чернівецька область": "Chernivtsi",
  "Івано-Франківська область": "Ivano-Frankivs'k",
  "Закарпатська область": "Transcarpathia",
  "Волинська область": "Volyn",
  "Рівненська область": "Rivne",
  "Тернопільська область": "Ternopil'",
  "Донецька область": "Donets'k",
  "Луганська область": "Luhans'k",
  "Автономна Республіка Крим": "Crimea",
  "м. Севастополь": "Sevastopol"
};

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
  const { alerts, threats, setThreats } = useStore();
  const [geoData, setGeoData] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapMode, setMapMode] = useState<'dark'|'satellite'>('dark');
  const [is3D, setIs3D] = useState(true);

  useEffect(() => {
    fetch('/ukraine.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((e) => console.error("Failed to load regions", e));
  }, []);

  // Compute active alert region names
  const activeAlertRegionNames = useMemo(() => {
    const active = new Set<string>();
    for (const [uaName, alertObj] of Object.entries(alerts || {})) {
      if (alertObj && alertObj.alertnow) {
        const enName = REGION_NAME_MAP[uaName];
        if (enName) active.add(enName);
      }
    }
    return active;
  }, [alerts]);

  const mapGeoData = useMemo(() => {
      if (!geoData) return null;
      return {
          ...geoData,
          features: geoData.features.map((f: any) => ({
              ...f,
              properties: {
                  ...f.properties,
                  hasAlert: activeAlertRegionNames.has(f.properties.name) ? 1 : 0
              }
          }))
      };
  }, [geoData, activeAlertRegionNames]);

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
            pitch: is3D ? 45 : 0
          }}
          mapStyle={mapMode === 'dark' ? DARK_STYLE : SATELLITE_STYLE as any}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />
          
          {/* GeoJSON Regions */}
          {mapGeoData && (
            <Source id="regions" type="geojson" data={mapGeoData}>
              <Layer 
                id="regions-fill" 
                type="fill" 
                paint={{ 
                    'fill-color': [
                        'case',
                        ['==', ['get', 'hasAlert'], 1],
                        'rgba(239, 68, 68, 0.3)', // Red with opacity
                        'rgba(0, 0, 0, 0)'
                    ],
                }} 
              />
              <Layer 
                id="regions-line" 
                type="line" 
                paint={{ 'line-color': '#ef4444', 'line-width': ['case', ['==', ['get', 'hasAlert'], 1], 2, 1], 'line-opacity': 0.5 }} 
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

        {/* Heatmap & View Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button 
            onClick={() => setMapMode(mapMode === 'dark' ? 'satellite' : 'dark')}
            className="px-4 py-2 rounded font-bold shadow-lg transition-colors bg-gray-800 text-gray-300 border border-gray-700"
          >
            {mapMode === 'dark' ? '🛰️ Satellite' : '🌑 Dark Map'}
          </button>
          <button 
            onClick={() => setIs3D(!is3D)}
            className="px-4 py-2 rounded font-bold shadow-lg transition-colors bg-gray-800 text-gray-300 border border-gray-700"
          >
            {is3D ? '🧊 2D View' : '🧊 3D View'}
          </button>
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
