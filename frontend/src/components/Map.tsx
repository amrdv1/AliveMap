"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore, ThreatObject } from '../store/useStore';
import { socket } from '../lib/socket';
import { THREAT_SVGS, THREAT_COLORS } from './ThreatIcon';
import { Flame, X } from 'lucide-react';
import * as turf from '@turf/turf';

export const getCourseText = (course: number) => {
  if (course >= 337.5 || course < 22.5) return 'Північний';
  if (course >= 22.5 && course < 67.5) return 'Північно-східний';
  if (course >= 67.5 && course < 112.5) return 'Східний';
  if (course >= 112.5 && course < 157.5) return 'Південно-східний';
  if (course >= 157.5 && course < 202.5) return 'Південний';
  if (course >= 202.5 && course < 247.5) return 'Південно-західний';
  if (course >= 247.5 && course < 292.5) return 'Західний';
  return 'Північно-західний';
};
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

const ThreatMarker = ({ threat, onClick, isSelected, onClosePopup }: { threat: ThreatObject, onClick: (t: ThreatObject) => void, isSelected: boolean, onClosePopup: () => void }) => {
  const [currentLoc, setCurrentLoc] = useState<{lng: number, lat: number} | null>(null);

  useEffect(() => {
    const loc = threat.locations[0];
    if (!loc) {
      if (threat.targetLat && threat.targetLng) {
        setCurrentLoc({ lng: threat.targetLng, lat: threat.targetLat });
      } else {
        setCurrentLoc(null);
      }
      return;
    }

    let speedKmh = threat.speed;
    let bearing = threat.course;

    if (!speedKmh) {
        speedKmh = ['DRONE', 'RECON', 'MOLNIYA', 'DECOY', 'FPV'].includes(threat.type) ? 150 : 800;
    }

    // Always prioritize bearing towards the target if we have one
    if (threat.targetLat && threat.targetLng) {
        bearing = turf.bearing(turf.point([loc.lng, loc.lat]), turf.point([threat.targetLng, threat.targetLat]));
        if (bearing < 0) bearing += 360;
    } else if (bearing == null || bearing === undefined) {
        bearing = 0; // default north
    }

    const startPt = turf.point([loc.lng, loc.lat]);
    const startTime = new Date(loc.time).getTime();

    const updatePosition = () => {
       const now = Date.now();
       const elapsedHours = (now - startTime) / (1000 * 60 * 60);
       
       // Stop extrapolating if more than 1 hour passed without updates (might be dead/archived/stale)
       if (elapsedHours > 1) {
           setCurrentLoc({ lng: loc.lng, lat: loc.lat });
           return;
       }

       const distance = speedKmh * Math.max(0, elapsedHours);
       const dest = turf.destination(startPt, distance, bearing, { units: 'kilometers' });
       const newLng = dest.geometry.coordinates[0];
       const newLat = dest.geometry.coordinates[1];

       // Stop extrapolating if target has reached or passed its destination
       if (threat.targetLat && threat.targetLng) {
         const distToTarget = turf.distance(
           turf.point([loc.lng, loc.lat]),
           turf.point([threat.targetLng, threat.targetLat]),
           { units: 'kilometers' }
         );
         if (distance >= distToTarget) {
           // Target has arrived at destination — clamp to target position
           setCurrentLoc({ lng: threat.targetLng, lat: threat.targetLat });
           return;
         }
       }

       setCurrentLoc({ lng: newLng, lat: newLat });
    };

    updatePosition();
    const interval = setInterval(updatePosition, 1000); // update every 1 second

    return () => clearInterval(interval);
  }, [threat]);

  if (!currentLoc) return null;
  const loc = currentLoc;

  const isThreat = Object.keys(THREAT_SVGS).includes(threat.type);
  const rot = threat.course || 0;
  
  let svgIcon = THREAT_SVGS[threat.type as keyof typeof THREAT_SVGS] || THREAT_SVGS['DRONE'];
  let ringColor = THREAT_COLORS[threat.type as keyof typeof THREAT_COLORS] || '#ffffff';

  return (
    <Marker  
       longitude={currentLoc?.lng || loc.lng} 
       latitude={currentLoc?.lat || loc.lat} 
       anchor="center"
       onClick={(e) => {
         e.originalEvent.stopPropagation();
         onClick(threat);
       }}
    >
      <div className="relative w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
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

      {isSelected && (
        <Popup
           longitude={currentLoc?.lng || loc.lng}
           latitude={currentLoc?.lat || loc.lat}
           anchor="bottom"
           onClose={() => {
             onClosePopup();
           }}
           closeButton={false}
           className="custom-threat-popup z-50"
           maxWidth="350px"
           offset={15}
        >
           <div className="bg-[#1a1a1a] text-white p-4 rounded-xl border border-white/10 shadow-2xl relative w-[320px]">
              <button onClick={(e) => { e.stopPropagation(); onClosePopup(); }} className="absolute top-3 right-3 text-white/50 hover:text-white transition">
                 <X size={18} />
              </button>
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: THREAT_COLORS[threat.type as keyof typeof THREAT_COLORS] || '#4A90E2' }}>
                    <div className="w-6 h-6 text-white" dangerouslySetInnerHTML={{ __html: THREAT_SVGS[threat.type as keyof typeof THREAT_SVGS] || THREAT_SVGS['DRONE'] }} />
                 </div>
                 <div>
                    <div className="font-bold text-[15px]">
                       {(() => {
                         const dict: Record<string, string> = {
                           'DRONE': 'Ударний БпЛА (Шахед)',
                           'FPV': 'FPV / Ланцет',
                           'CRUISE_MISSILE': 'Крилата Ракета',
                           'KH101': 'Крилата Ракета (Х-101/555)',
                           'KALIBR': 'Крилата Ракета (Калібр)',
                           'BALLISTIC_MISSILE': 'Балістична Ракета',
                           'ISKANDER': 'Балістика (Іскандер)',
                           'KINZHAL': 'Аеробалістична (Кинджал)',
                           'MISSILE': 'Ракета',
                           'AIRCRAFT': 'Ворожа Авіація',
                           'KAB': 'Керована Авіабомба',
                           'RECON': 'Розвідувальний БпЛА',
                           'ZIRCON': 'Гіперзвукова (Циркон)',
                           'UNKNOWN': 'Невідома Повітряна Ціль',
                           'PPO': 'ППО / Вибухи',
                         };
                         return dict[threat.type] || 'Повітряна ціль';
                       })()}
                    </div>
                    <div className="text-xs text-white/60 truncate w-[220px]">
                       {(() => {
                           const clat = currentLoc?.lat || loc.lat;
                           const clng = currentLoc?.lng || loc.lng;
                           const isOver = threat.targetLat && threat.targetLng && (Math.sqrt(Math.pow(clat - threat.targetLat, 2) + Math.pow(clng - threat.targetLng, 2)) < 0.05);
                           if (threat.targetName) return isOver ? `В районі: ${threat.targetName}` : `Напрямок: ${threat.targetName}`;
                           return threat.course != null ? `Курс: ${getCourseText(threat.course)}` : 'Курс невідомий';
                       })()}
                    </div>
                 </div>
              </div>
              <div className="text-[13px] text-white/80 mb-4 leading-relaxed">
                 {threat.quantity > 1 && <span className="font-bold text-red-400">Кількість: ~{threat.quantity} шт. </span>}
                 {(() => {
                         const dict: Record<string, string> = {
                           'DRONE': 'Ударний БпЛА (Шахед)',
                           'FPV': 'FPV / Ланцет',
                           'CRUISE_MISSILE': 'Крилата Ракета',
                           'KH101': 'Крилата Ракета (Х-101/555)',
                           'KALIBR': 'Крилата Ракета (Калібр)',
                           'BALLISTIC_MISSILE': 'Балістична Ракета',
                           'ISKANDER': 'Балістика (Іскандер)',
                           'KINZHAL': 'Аеробалістична (Кинджал)',
                           'MISSILE': 'Ракета',
                           'AIRCRAFT': 'Ворожа Авіація',
                           'KAB': 'Керована Авіабомба',
                           'RECON': 'Розвідувальний БпЛА',
                           'ZIRCON': 'Гіперзвукова (Циркон)',
                           'UNKNOWN': 'Невідома Повітряна Ціль',
                           'PPO': 'ППО / Вибухи',
                         };
                         return dict[threat.type] || 'Повітряна ціль';
                 })()} 
                 {(() => {
                     const clat = currentLoc?.lat || loc.lat;
                     const clng = currentLoc?.lng || loc.lng;
                     const isOver = threat.targetLat && threat.targetLng && (Math.sqrt(Math.pow(clat - threat.targetLat, 2) + Math.pow(clng - threat.targetLng, 2)) < 0.05);
                     if (threat.targetName) return isOver ? ` (в районі: ${threat.targetName})` : ` (напрямок: ${threat.targetName})`;
                     return threat.course != null ? `, курс ${getCourseText(threat.course).toLowerCase()}` : '';
                 })()}.
                 <br/>
                 Підтверджень: {Math.max(1, Math.round(threat.confidence * 5) - 1)}.
                 {threat.speed ? ` Швидкість: ${Math.round(threat.speed)} км/год.` : ''}
              </div>
              <div className="text-[12px] text-orange-400/90 mb-4 flex items-center gap-2">
                 ⚠️ Розташування приблизне
              </div>
              <div className="flex items-center gap-2">
                 <div className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                    threat.confidence >= 0.8 ? 'bg-green-500/20 text-green-400' : 
                    threat.confidence >= 0.6 ? 'bg-orange-500/20 text-orange-400' : 
                    'bg-red-500/20 text-red-400'
                 }`}>
                    Достовірність: {threat.confidence >= 0.8 ? 'Висока' : threat.confidence >= 0.6 ? 'Середня' : 'Низька'}
                 </div>
              </div>
           </div>
        </Popup>
      )}
    </Marker>
  );
};

export default function UkraineMap() {
  const { alerts, threats, explosions, filters, mapMode, is3D, showHeatmap, setIs3D, flyToLocation, setFlyToLocation, selectedThreat, setSelectedThreat } = useStore();
  const [geoData, setGeoData] = useState<any>(null); // Districts
  const [geoDataStates, setGeoDataStates] = useState<any>(null); // States
  const mapRef = React.useRef<any>(null);
  const [clickedRegion, setClickedRegion] = useState<any>(null);
  const [hoveredRegion, setHoveredRegion] = useState<any>(null);
  
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

  useEffect(() => {
    if (flyToLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToLocation.lng, flyToLocation.lat],
        zoom: 8,
        duration: 1500,
        essential: true
      });
      const timer = setTimeout(() => setFlyToLocation(null), 1600);
      return () => clearTimeout(timer);
    }
  }, [flyToLocation, setFlyToLocation]);

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

  const filteredThreats = useMemo(() => {
    if (filters.types.length === 0) return []; // If no filters, show nothing, or maybe show everything? User expects to uncheck to hide. So if empty, show nothing.
    return threats.filter(t => filters.types.includes(t.type));
  }, [threats, filters.types]);

  const handleThreatClick = (t: ThreatObject) => {
    setSelectedThreat(t);
    setIs3D(true);
    mapRef.current?.flyTo({
      center: [t.locations[0].lng, t.locations[0].lat],
      zoom: 8,
      pitch: 45,
      essential: true
    });
  };

  const closePopup = () => {
    setSelectedThreat(null);
    setIs3D(false);
    mapRef.current?.flyTo({
      pitch: 0,
      essential: true
    });
  };

  const onMouseMove = useCallback((event: any) => {
    const { features } = event;
    const topFeature = features && features[0];
    if (topFeature && topFeature.properties) {
      setHoveredRegion(topFeature.properties);
    } else {
      setHoveredRegion(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredRegion(null);
  }, []);

  const onRegionClick = useCallback((event: any) => {
    const { features, point, lngLat } = event;
    const topFeature = features && features[0];

    if (topFeature && topFeature.properties) {
      const regionName = topFeature.properties.rayon || topFeature.properties.region;
      if (regionName) {
        setClickedRegion({
          features: features, // Store all intersected features
          x: point.x,
          y: point.y,
          lngLat: lngLat
        });
        return;
      }
    }
    setClickedRegion(null);
  }, []);

  const clickedRegionName = clickedRegion ? (clickedRegion.features.find((f:any) => f.properties.region)?.properties.region || '') : '';
  const clickedRayonName = clickedRegion ? (clickedRegion.features.find((f:any) => f.properties.rayon)?.properties.rayon || '') : '';
  const hoveredRegionName = hoveredRegion?.region || '';
  const hoveredRayonName = hoveredRegion?.rayon || '';

  const getAlertInfo = (featuresList: any[]) => {
    if (!featuresList || featuresList.length === 0) return null;
    
    // 1. Try to find if any of the overlapping features (district or state) has an active alert
    for (const feature of featuresList) {
      let regionName = feature.properties.rayon || feature.properties.region;
      if (!regionName) continue;
      
      const matchedAlertKey = Object.keys(alerts).find(k => {
        return k.includes(regionName) || (regionName === 'Київ' && k === 'м. Київ') || (regionName === 'Крим' && k.includes('Крим'));
      });

      if (matchedAlertKey && alerts[matchedAlertKey] && alerts[matchedAlertKey].alertnow) {
        const alertObj = alerts[matchedAlertKey];
        let durationStr = '';
        let startStr = '';
        if (alertObj.lastUpdate) {
          const start = new Date(alertObj.lastUpdate);
          
          // Format start time with date
          const formatter = new Intl.DateTimeFormat('uk-UA', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
          });
          startStr = formatter.format(start);
          
          const diffMs = Date.now() - start.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          const days = Math.floor(diffMins / (24 * 60));
          const hours = Math.floor((diffMins % (24 * 60)) / 60);
          const mins = diffMins % 60;
          
          if (days > 0) {
            durationStr = `${days} д. ${hours} год ${mins} хв`;
          } else if (hours > 0) {
            durationStr = `${hours} год ${mins} хв`;
          } else {
            durationStr = `${mins} хв`;
          }
        }
        return { active: true, name: matchedAlertKey, durationStr, startStr };
      }
    }
    
    // 2. If no active alert, return the name of the top-most feature
    const topFeature = featuresList[0];
    let defaultName = topFeature.properties.rayon || topFeature.properties.region;
    if (topFeature.properties.region) defaultName += " область";
    if (defaultName === 'Київ область') defaultName = 'м. Київ';
    if (defaultName === 'Крим область') defaultName = 'Автономна Республіка Крим';
    if (defaultName === 'Севастополь область') defaultName = 'м. Севастополь';
    
    return { active: false, name: defaultName };
  };

  return (
    <div className="w-full h-full relative">
        <Map
          ref={mapRef}
          interactiveLayerIds={['regions-states-fill', 'regions-districts-fill']}
          onClick={onRegionClick}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
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
                        ['case', 
                            ['==', ['get', 'region'], clickedRegionName], 'rgba(239, 68, 68, 0.65)', 
                            ['==', ['get', 'region'], hoveredRegionName], 'rgba(239, 68, 68, 0.55)', 
                            'rgba(239, 68, 68, 0.45)'
                        ],
                        ['==', ['get', 'region'], clickedRegionName], 'rgba(255, 255, 255, 0.08)',
                        ['==', ['get', 'region'], hoveredRegionName], 'rgba(255, 255, 255, 0.05)',
                        'rgba(0, 0, 0, 0)'
                    ],
                    'fill-outline-color': [
                        'case',
                        ['==', ['get', 'hasAlert'], 1],
                        ['case', 
                            ['==', ['get', 'region'], clickedRegionName], 'rgba(255, 255, 255, 0.9)', 
                            ['==', ['get', 'region'], hoveredRegionName], 'rgba(255, 255, 255, 0.8)', 
                            'rgba(239, 68, 68, 0.6)'
                        ],
                        ['case', 
                            ['==', ['get', 'region'], clickedRegionName], 'rgba(255, 255, 255, 0.9)', 
                            ['==', ['get', 'region'], hoveredRegionName], 'rgba(255, 255, 255, 0.6)', 
                            'rgba(255, 255, 255, 0.15)'
                        ]
                    ]
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
                        ['case', 
                            ['==', ['get', 'rayon'], clickedRayonName], 'rgba(239, 68, 68, 0.65)', 
                            ['==', ['get', 'rayon'], hoveredRayonName], 'rgba(239, 68, 68, 0.55)', 
                            'rgba(239, 68, 68, 0.45)'
                        ],
                        ['==', ['get', 'rayon'], clickedRayonName], 'rgba(255, 255, 255, 0.08)',
                        ['==', ['get', 'rayon'], hoveredRayonName], 'rgba(255, 255, 255, 0.05)',
                        'rgba(0, 0, 0, 0)'
                    ],
                    'fill-outline-color': [
                        'case',
                        ['==', ['get', 'hasAlert'], 1],
                        ['case', 
                            ['==', ['get', 'rayon'], clickedRayonName], 'rgba(255, 255, 255, 0.9)', 
                            ['==', ['get', 'rayon'], hoveredRayonName], 'rgba(255, 255, 255, 0.8)', 
                            'rgba(239, 68, 68, 0.6)'
                        ],
                        ['case', 
                            ['==', ['get', 'rayon'], clickedRayonName], 'rgba(255, 255, 255, 0.9)', 
                            ['==', ['get', 'rayon'], hoveredRayonName], 'rgba(255, 255, 255, 0.6)', 
                            'rgba(255, 255, 255, 0.12)'
                        ]
                    ]
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
          {filteredThreats.map(t => (
            <ThreatMarker 
               key={t.id} 
               threat={t} 
               onClick={handleThreatClick} 
               isSelected={selectedThreat?.id === t.id}
               onClosePopup={closePopup}
            />
          ))}

          {explosions.map(exp => (
            <Marker key={exp.id} longitude={exp.lng} latitude={exp.lat} anchor="center">
              <div className="relative flex items-center justify-center w-[50px] h-[50px]">
                <div className="absolute inset-0 bg-orange-600/30 rounded-full border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,1)] animate-ping" style={{ animationDuration: '1.5s' }}></div>
                <span className="text-3xl z-10 relative">💥</span>
              </div>
            </Marker>
          ))}



          {/* Click Custom Popup */}
          {clickedRegion && (() => {
            const alertInfo = getAlertInfo(clickedRegion.features);
            if (!alertInfo) return null;
            
            return (
              <Popup
                longitude={clickedRegion.lngLat.lng}
                latitude={clickedRegion.lngLat.lat}
                anchor="bottom"
                onClose={() => setClickedRegion(null)}
                closeButton={false}
                closeOnClick={false}
                className="custom-threat-popup z-[100]"
                maxWidth="260px"
                offset={10}
              >
                <div className="bg-[#1a1a1a] text-white p-4 rounded-xl border border-white/10 shadow-2xl relative w-[240px]">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      e.nativeEvent.stopImmediatePropagation(); 
                      setClickedRegion(null); 
                    }} 
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    className="absolute top-3 right-3 text-white/50 hover:text-white transition z-[110] p-1"
                  >
                     <X size={16} />
                  </button>
                  <div className="font-bold text-lg mb-1 drop-shadow-md pr-6 leading-tight">{alertInfo.name}</div>
                  <div className={alertInfo.active ? 'text-red-500 font-bold text-sm mb-2' : 'text-gray-400 font-medium text-sm mb-2'}>
                    {alertInfo.active ? '🚨 ПОВІТРЯНА ТРИВОГА' : '✅ Немає тривоги'}
                  </div>
                  
                  {alertInfo.active && alertInfo.durationStr && (
                    <div className="mt-3 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      <div className="text-gray-300 text-xs flex items-center justify-between mb-1.5">
                        <span>Триває:</span>
                        <span className="text-white font-mono font-bold bg-black/40 px-2 py-0.5 rounded">{alertInfo.durationStr}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 flex justify-between">
                        <span>Початок:</span>
                        <span>{alertInfo.startStr}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            );
          })()}
        </Map>
        
        {/* CSS Override for Maplibre popup background */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-threat-popup .maplibregl-popup-content {
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .custom-threat-popup .maplibregl-popup-tip {
            border-top-color: #1a1a1a !important;
          }
        `}} />


      </div>
  );
}
