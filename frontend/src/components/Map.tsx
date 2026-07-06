"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore, ThreatObject } from '../store/useStore';
import { socket } from '../lib/socket';
import { THREAT_SVGS, THREAT_COLORS } from './ThreatIcon';
import { Flame } from 'lucide-react';

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

const ThreatMarker = ({ threat, onClick }: { threat: ThreatObject, onClick: (t: ThreatObject) => void }) => {
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
          onClick={() => onClick(threat)}
          style={{ transform: `rotate(${rot}deg)`, filter: `drop-shadow(0 0 4px ${ringColor})` }} 
          className="z-10 w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform"
          dangerouslySetInnerHTML={{ __html: svgIcon }}
        />
      </div>
    </Marker>
  );
};

export default function UkraineMap() {
  const { alerts, threats, mapMode, is3D, showHeatmap, setIs3D } = useStore();
  const [geoData, setGeoData] = useState<any>(null); // Districts
  const [geoDataStates, setGeoDataStates] = useState<any>(null); // States
  const mapRef = React.useRef<any>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  useEffect(() => {
    fetch('/ukraine-districts.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((e) => console.error("Failed to load district regions", e));
      
    fetch('/ukraine_regions.geojson')
      .then((res) => res.json())
      .then((data) => setGeoDataStates(data))
      .catch((e) => console.error("Failed to load state regions", e));
  }, []);

  // Compute active alert region names
  const activeAlertRegionNames = useMemo(() => {
    const active = new Set<string>();
    for (const [uaName, alertObj] of Object.entries(alerts || {})) {
      if (alertObj && alertObj.alertnow) {
        // District names matching geojson "rayon" property (or region if it's an oblast)
        active.add(uaName);
      }
    }
    return active;
  }, [alerts]);

  const mapGeoData = useMemo(() => {
      if (!geoData) return null;
      return {
          ...geoData,
          features: geoData.features.map((f: any) => {
              const rayon = f.properties.rayon;
              const hasAlert = activeAlertRegionNames.has(rayon) ? 1 : 0;
              return { ...f, properties: { ...f.properties, hasAlert } };
          })
      };
  }, [geoData, activeAlertRegionNames]);

  const mapGeoDataStates = useMemo(() => {
      if (!geoDataStates) return null;
      return {
          ...geoDataStates,
          features: geoDataStates.features.map((f: any) => {
              const region = f.properties.region; // e.g. "Київська"
              // Match "Київська область" or "м. Київ" or exactly
              let hasAlert = 0;
              for (const a of activeAlertRegionNames) {
                 if (a.includes(region)) {
                    hasAlert = 1;
                    break;
                 }
                 if (region === 'Київ' && a === 'м. Київ') hasAlert = 1;
              }
              return { ...f, properties: { ...f.properties, hasAlert } };
          })
      };
  }, [geoDataStates, activeAlertRegionNames]);

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

  const handleThreatClick = (t: ThreatObject) => {
    setIs3D(true);
    mapRef.current?.flyTo({
      center: [t.locations[0].lng, t.locations[0].lat],
      zoom: 8,
      pitch: 45,
      duration: 1500
    });
  };

  const onHover = useCallback((event: any) => {
    const { features, lngLat } = event;
    const hoveredFeature = features && features[0];

    if (hoveredFeature && hoveredFeature.properties) {
      const regionName = hoveredFeature.properties.rayon || hoveredFeature.properties.region;
      if (regionName) {
        setHoverInfo({
          feature: hoveredFeature,
          lngLat: [lngLat.lng, lngLat.lat]
        });
        return;
      }
    }
    setHoverInfo(null);
  }, []);

  const getAlertInfo = (feature: any) => {
    if (!feature) return null;
    const regionName = feature.properties.rayon || feature.properties.region;
    if (!regionName) return null;
    
    const matchedAlertKey = Object.keys(alerts).find(k => {
      return k.includes(regionName) || (regionName === 'Київ' && k === 'м. Київ');
    });

    if (matchedAlertKey && alerts[matchedAlertKey] && alerts[matchedAlertKey].alertnow) {
      const alertObj = alerts[matchedAlertKey];
      let durationStr = '';
      let startStr = '';
      if (alertObj.lastUpdate) {
        const start = new Date(alertObj.lastUpdate);
        startStr = start.toLocaleTimeString('uk-UA');
        const diffMs = Date.now() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        durationStr = hours > 0 ? `${hours} год ${mins} хв` : `${mins} хв`;
      }
      return { active: true, name: matchedAlertKey, durationStr, startStr };
    }
    
    let defaultName = regionName;
    if (feature.properties.region) defaultName += " область";
    if (defaultName === 'Київ область') defaultName = 'м. Київ';
    
    return { active: false, name: defaultName };
  };

  return (
    <div className="w-full h-full relative">
        <Map
          ref={mapRef}
          interactiveLayerIds={['regions-states-fill', 'regions-districts-fill']}
          onMouseMove={onHover}
          onMouseLeave={() => setHoverInfo(null)}
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
          
          {/* State level alarms */}
          {mapGeoDataStates && (
            <Source id="regions-states" type="geojson" data={mapGeoDataStates}>
              <Layer 
                id="regions-states-fill" 
                type="fill" 
                paint={{ 
                    'fill-color': [
                        'case',
                        ['==', ['get', 'hasAlert'], 1],
                        'rgba(239, 68, 68, 0.4)', // Red with opacity
                        'rgba(0, 0, 0, 0)'
                    ],
                    'fill-outline-color': 'rgba(239, 68, 68, 0.8)'
                }} 
              />
            </Source>
          )}

          {/* District level alarms */}
          {mapGeoData && (
            <Source id="regions-districts" type="geojson" data={mapGeoData}>
              <Layer 
                id="regions-districts-fill" 
                type="fill" 
                paint={{ 
                    'fill-color': [
                        'case',
                        ['==', ['get', 'hasAlert'], 1],
                        'rgba(239, 68, 68, 0.4)', // Red with opacity
                        'rgba(0, 0, 0, 0)'
                    ],
                    'fill-outline-color': 'rgba(239, 68, 68, 0.4)'
                }} 
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
            <ThreatMarker key={t.id} threat={t} onClick={handleThreatClick} />
          ))}

          {/* Hover Popup */}
          {hoverInfo && (() => {
            const alertInfo = getAlertInfo(hoverInfo.feature);
            if (!alertInfo) return null;
            
            return (
              <Popup
                longitude={hoverInfo.lngLat[0]}
                latitude={hoverInfo.lngLat[1]}
                closeButton={false}
                closeOnClick={false}
                anchor="bottom"
                offset={10}
                className="custom-popup"
              >
                <div className="font-sans text-sm p-1 min-w-[150px]">
                  <div className="font-bold text-lg mb-1">{alertInfo.name}</div>
                  <div style={{ color: alertInfo.active ? '#ef4444' : '#9ca3af', fontWeight: alertInfo.active ? 'bold' : 'normal' }}>
                    {alertInfo.active ? '🚨 ПОВІТРЯНА ТРИВОГА' : '✅ Немає тривоги'}
                  </div>
                  
                  {alertInfo.active && alertInfo.durationStr && (
                    <>
                      <div style={{ marginTop: '8px', color: '#d1d5db' }}>
                        Триває: <span style={{ color: 'white', fontFamily: 'monospace' }}>{alertInfo.durationStr}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        Початок: {alertInfo.startStr}
                      </div>
                    </>
                  )}
                </div>
              </Popup>
            );
          })()}

        </Map>
    </div>
  );
}
