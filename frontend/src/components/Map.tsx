"use client";

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON, Polyline, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore, ThreatObject } from '../store/useStore';
import { socket } from '../lib/socket';

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

import { THREAT_SVGS, THREAT_COLORS } from './ThreatIcon';

const getIcon = (type: string, direction: number | null | undefined, confidence: number = 1.0, quantity: number = 1) => {
  const isThreat = Object.keys(THREAT_SVGS).includes(type);
  const opacity = 1.0; // User requested not to hide low confidence targets
  
  if (isThreat) {
    const rot = direction || 0;
    
    let svgIcon = THREAT_SVGS[type as keyof typeof THREAT_SVGS] || THREAT_SVGS['DRONE'];
    let ringColor = THREAT_COLORS[type as keyof typeof THREAT_COLORS] || '#ffffff';
    
    // Add opacity to ring color for the pulse
    ringColor = ringColor + '40'; // 25% opacity hex for softer pulse
    
    const quantityBadge = quantity > 1 
      ? `<div style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; border-radius: 4px; padding: 1px 4px; z-index: 20; border: 1px solid #7f1d1d; box-shadow: 0 0 5px #ef4444;">x${quantity}</div>` 
      : '';

    const confPercent = Math.round(confidence * 100);
    const confBadge = confPercent < 100 
      ? `<div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #1f2937; color: #9ca3af; font-size: 9px; font-weight: bold; border-radius: 4px; padding: 1px 3px; z-index: 20; border: 1px solid #374151;">${confPercent}%</div>`
      : '';

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; opacity: ${opacity};">
               ${quantityBadge}
               ${confBadge}
               <div class="radar-pulse" style="--ring-color: ${ringColor}"></div>
               <div style="transform: rotate(${rot}deg); z-index: 10; width: 24px; height: 24px; color: #ffffff; filter: drop-shadow(0 0 4px ${THREAT_COLORS[type as keyof typeof THREAT_COLORS]});">
                 ${svgIcon}
               </div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }
  
  const colors: Record<string, string> = {
    DRONE: '#f97316',
    MISSILE: '#ef4444',
    CRUISE_MISSILE: '#dc2626',
    KH101: '#ea580c',
    KALIBR: '#f43f5e',
    BALLISTIC_MISSILE: '#991b1b',
    ISKANDER: '#d946ef',
    KINZHAL: '#dc2626',
    ZIRCON: '#ff0000',
    KAB: '#f59e0b',
    AIRCRAFT: '#eab308',
    ALERT: '#a855f7',
  };
  const color = colors[type] || '#ffffff';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color};" class="w-4 h-4 rounded-full shadow-[0_0_15px_${color}] animate-pulse border-2 border-white"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
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
  "Тернопільська область": "Ternopil'",
  "Волинська область": "Volyn",
  "Рівненська область": "Rivne",
  "Закарпатська область": "Transcarpathia",
  "Донецька область": "Donets'k",
  "Луганська область": "Luhans'k",
  "Автономна Республіка Крим": "Crimea",
  "м. Севастополь": "Sevastopol"
};

const AnimatedMarker = React.memo(({ threat, getIcon }: { threat: any, getIcon: any }) => {
  const markerRef = useRef<any>(null);
  const currentLoc = threat.locations[0];

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000; // seconds elapsed
      lastTime = now;

      const timeSinceUpdate = (now - new Date(currentLoc.time).getTime()) / 1000;
      if (threat.speed != null && threat.course != null && timeSinceUpdate < 3600 && markerRef.current) {
        const currentPos = markerRef.current.getLatLng();
        const R = 6371; // Earth radius in km
        const d = (threat.speed / 3600) * dt; // Distance traveled in km during dt
        const brng = threat.course * Math.PI / 180;
        const lat1 = currentPos.lat * Math.PI / 180;
        const lon1 = currentPos.lng * Math.PI / 180;

        const lat2 = Math.asin(Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng));
        const lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

        markerRef.current.setLatLng([lat2 * 180 / Math.PI, lon2 * 180 / Math.PI]);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [threat.speed, threat.course]);

  // Sync position with server when a new location arrives
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([currentLoc.lat, currentLoc.lng]);
    }
  }, [currentLoc.lat, currentLoc.lng, currentLoc.time]);

  const pathPositions: [number, number][] = threat.locations.map((l: any) => [l.lat, l.lng]);
  let predictedPath: [number, number][] = [];
  
  const hasTarget = threat.targetLat != null && threat.targetLng != null;

  if (hasTarget) {
    predictedPath = [[currentLoc.lat, currentLoc.lng], [threat.targetLat!, threat.targetLng!]];
  } else if (threat.course !== null && threat.course !== undefined) {
    const lat1 = currentLoc.lat;
    const lon1 = currentLoc.lng;
    const d = 50; // Fixed 50km visual vector
    const R = 6371; 
    const brng = threat.course * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lon1Rad = lon1 * Math.PI / 180;
    
    const lat2Rad = Math.asin(Math.sin(lat1Rad)*Math.cos(d/R) + Math.cos(lat1Rad)*Math.sin(d/R)*Math.cos(brng));
    const lon2Rad = lon1Rad + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1Rad), Math.cos(d/R)-Math.sin(lat1Rad)*Math.sin(lat2Rad));
    
    predictedPath = [[lat1, lon1], [lat2Rad * 180 / Math.PI, lon2Rad * 180 / Math.PI]];
  }

const translateType = (type: string) => {
  switch(type) {
    case 'DRONE': return 'Шахед / БПЛА';
    case 'CRUISE_MISSILE': return 'Крилата Ракета';
    case 'KH101': return 'Крилата Ракета (Х-101/555)';
    case 'KALIBR': return 'Крилата Ракета (Калібр)';
    case 'BALLISTIC_MISSILE': return 'Балістика';
    case 'ISKANDER': return 'Балістика (Іскандер)';
    case 'KINZHAL': return 'Аеробалістична (Кинджал)';
    case 'MISSILE': return 'Ракета';
    case 'AIRCRAFT': return 'Тактична Авіація';
    case 'KAB': return 'КАБ / ФАБ';
    case 'ZIRCON': return 'Гіперзвукова (Циркон)';
    case 'RECON': return 'Розвідник';
    case 'PPO': return 'ППО';
    default: return type;
  }
};

  return (
    <>
      {pathPositions.length > 1 && (
        <Polyline positions={pathPositions} pathOptions={{ color: '#ef4444', weight: 1, opacity: 0.3, dashArray: '4' }} />
      )}

      {predictedPath.length > 0 && (
        <Polyline positions={predictedPath} pathOptions={{ color: '#ef4444', weight: 1.5, opacity: 0.6, dashArray: '6, 6' }} />
      )}

      {hasTarget && (
        <Marker position={[threat.targetLat!, threat.targetLng!]} icon={L.divIcon({
          className: 'target-marker',
          html: `<div style="width: 16px; height: 16px; border: 2px solid #ef4444; border-radius: 50%; opacity: 0.5; display: flex; align-items: center; justify-content: center;"><div style="width: 4px; height: 4px; background: #ef4444; border-radius: 50%;"></div></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })}>
          <Popup className="custom-popup">
            <div className="font-sans text-sm font-bold text-red-500 text-center">Ціль: {threat.targetName}</div>
          </Popup>
        </Marker>
      )}

      <Marker ref={markerRef} position={[currentLoc.lat, currentLoc.lng]} icon={getIcon(threat.type, threat.course, threat.confidence, threat.quantity)}>
        <Popup className="custom-popup">
          <div className="font-sans">
            <div className="font-bold text-lg mb-1">{translateType(threat.type)} {threat.quantity > 1 ? `(x${threat.quantity})` : ''}</div>
            <div className="text-sm opacity-80 mb-2">Імовірність: {(threat.confidence * 100).toFixed(0)}%</div>
            {threat.targetName && <div className="text-sm text-red-500 font-bold mb-1">Ціль: {threat.targetName}</div>}
            {threat.speed && <div className="text-sm">Швидкість: {threat.speed.toFixed(0)} км/год</div>}
            {threat.course && <div className="text-sm">Курс: {threat.course.toFixed(0)}°</div>}
            <div className="text-xs opacity-50 mt-2">
              Оновлено: {new Date(currentLoc.time).toLocaleTimeString()}
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}, (prevProps, nextProps) => {
  const p = prevProps.threat;
  const n = nextProps.threat;
  return p.id === n.id &&
         p.locations[0]?.time === n.locations[0]?.time &&
         p.speed === n.speed &&
         p.course === n.course &&
         p.targetLat === n.targetLat &&
         p.targetLng === n.targetLng &&
         p.confidence === n.confidence &&
         p.quantity === n.quantity &&
         p.status === n.status;
});

export default function Map() {
  const threats = useStore(state => state.threats);
  const filters = useStore(state => state.filters);
  const alerts = useStore(state => state.alerts);
  const updateThreat = useStore(state => state.updateThreat);
  const setThreats = useStore(state => state.setThreats);
  const setAlerts = useStore(state => state.setAlerts);

  const [mounted, setMounted] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [geoDataDistricts, setGeoDataDistricts] = useState<any>(null);
  const [geoBorder, setGeoBorder] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    fetch('/ukraine-border.geojson')
      .then(res => res.json())
      .then(data => setGeoBorder(data))
      .catch(console.error);

    fetch('/ukraine.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);

    fetch('/ukraine-districts.geojson?v=4')
      .then(res => res.json())
      .then(data => setGeoDataDistricts(data))
      .catch(console.error);
    
    const fetchThreats = async () => {
      try {
        const res = await fetch('/api/threats');
        const data = await res.json();
        setThreats(data);
      } catch (e) {
        console.error('Failed to fetch threats', e);
      }
    };
    fetchThreats();

    socket.connect();

    socket.on('threat:update', (threat: ThreatObject) => {
      updateThreat(threat);
    });

    socket.on('threats:refresh', () => {
      fetchThreats();
    });

    socket.on('monitoring:new_message', (message: any) => {
      useStore.getState().addMessage(message);
    });

    socket.on('alerts:sync', (states: any) => {
      setAlerts(states);
    });

    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        if (data && data.states) {
          setAlerts(data.states);
        }
      } catch (e) {
        console.error('Failed to fetch alerts', e);
      }
    };
    
    fetchAlerts();

    return () => {
      socket.disconnect();
      socket.off('threat:update');
      socket.off('monitoring:new_message');
      socket.off('alerts:sync');
      socket.off('threats:refresh');
    };
  }, [setThreats, updateThreat]);

  if (!mounted) return <div className="w-full h-full bg-[#05070A] animate-pulse" />;

  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const filteredThreats = threats.filter((t) => 
    filters.types.includes(t.type) &&
    t.confidence >= filters.minConfidence &&
    (filters.showArchived ? true : t.status === 'ACTIVE') &&
    new Date(t.updatedAt) >= thirtyMinsAgo &&
    t.locations && t.locations.length > 0
  );

  const bindPopupToFeature = (feature: any, layer: any, regionNameKey: string, isDistrict: boolean) => {
    const regionName = feature.properties[regionNameKey];
    
    // Find matching alert
    const matchedAlertKey = Object.keys(alerts).find(alertRegion => {
      if (isDistrict) {
        return alerts[alertRegion]?.alertnow === true && (alerts[alertRegion]?.regionType === 'District' || alertRegion === 'м. Київ') && alertRegion === regionName;
      } else {
        return alerts[alertRegion]?.alertnow === true && REGION_NAME_MAP[alertRegion] === regionName;
      }
    });

    const alertInfo = matchedAlertKey ? alerts[matchedAlertKey] : null;
    let popupContent = `<div class="font-sans text-sm p-1">
      <div class="font-bold text-lg mb-1">${matchedAlertKey || regionName}</div>
      <div style="color: ${alertInfo ? '#ef4444' : '#9ca3af'}; font-weight: ${alertInfo ? 'bold' : 'normal'}">
        ${alertInfo ? '🚨 ПОВІТРЯНА ТРИВОГА' : '✅ Немає тривоги'}
      </div>
    `;

    if (alertInfo && alertInfo.lastUpdate) {
      const start = new Date(alertInfo.lastUpdate);
      const diffMs = Date.now() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      
      const durationStr = hours > 0 ? `${hours} год ${mins} хв` : `${mins} хв`;
      popupContent += `<div style="margin-top: 8px; color: #d1d5db;">Триває: <span style="color: white; font-family: monospace;">${durationStr}</span></div>`;
      popupContent += `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Початок: ${start.toLocaleTimeString('uk-UA')}</div>`;
    }

    popupContent += `</div>`;
    layer.bindPopup(popupContent, { className: 'custom-popup' });

    // Hover effect
    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: alertInfo ? 0.8 : 0.3, weight: alertInfo ? 3 : 2, color: alertInfo ? '#f87171' : '#9ca3af' });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ 
          color: alertInfo ? '#ef4444' : (isDistrict ? 'transparent' : '#4b5563'),
          weight: alertInfo ? 2 : (isDistrict ? 0 : 1),
          fillOpacity: alertInfo ? (isDistrict ? 0.6 : 0.45) : (isDistrict ? 0 : 0.05) 
        });
      }
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: #000 !important; }
        .radar-pulse {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: var(--ring-color);
          animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
          pointer-events: none;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          100% {
            transform: scale(3.5);
            opacity: 0;
          }
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #0a0f18;
          color: white;
          border: 1px solid #1f2937;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }
        .custom-popup .leaflet-popup-tip {
          background: #0a0f18;
        }
      `}} />
      <MapContainer 
        center={[48.3794, 31.1656]} 
        zoom={6} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
        preferCanvas={true}
        wheelPxPerZoomLevel={120}
      >
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="ALIVEMAP Dark">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <ZoomControl position="bottomright" />

        {filteredThreats.flatMap((threat) => {
          return [<AnimatedMarker key={threat.id} threat={threat} getIcon={getIcon} />];
        })}

      {/* Base Map State Outlines (subtle internal borders) */}
      {geoData && (
        <GeoJSON 
          data={geoData}
          style={() => ({
            color: 'rgba(255, 255, 255, 0.15)',
            weight: 1,
            fillColor: 'transparent',
            fillOpacity: 0,
            interactive: false
          })}
        />
      )}

      {/* Main Country Border Outline (Thick Green) */}
      {geoBorder && (
        <GeoJSON 
          data={geoBorder}
          style={() => ({
            color: '#22c55e', // Bright green as requested
            weight: 3.5, // Thick outline
            fillColor: 'transparent',
            fillOpacity: 0,
            interactive: false
          })}
        />
      )}

      {/* State level alarms */}
      {geoData && (
        <GeoJSON 
          key={`geojson-states-${JSON.stringify(alerts)}`}
          data={geoData}
          onEachFeature={(f, l) => bindPopupToFeature(f, l, 'name', false)}
          style={(feature) => {
            const regionName = feature?.properties?.name;
            const isActive = Object.keys(alerts).some(
              (alertRegion) => 
                alerts[alertRegion]?.alertnow === true && 
                REGION_NAME_MAP[alertRegion] === regionName
            );
            
            return {
              color: isActive ? '#ff4d4f' : 'transparent',
              weight: isActive ? 1.5 : 0,
              fillColor: isActive ? '#ef4444' : 'transparent',
              fillOpacity: isActive ? 0.2 : 0, // Lower opacity for comfortable viewing
            };
          }}
        />
      )}

      {/* District level alarms */}
      {geoDataDistricts && (
        <GeoJSON 
          key={`geojson-districts-${JSON.stringify(alerts)}`}
          data={geoDataDistricts}
          onEachFeature={(f, l) => bindPopupToFeature(f, l, 'rayon', true)}
          style={(feature) => {
            const rayonName = feature?.properties?.rayon;
            const isActive = Object.keys(alerts).some(
              (alertRegion) => 
                alerts[alertRegion]?.alertnow === true && 
                (alerts[alertRegion]?.regionType === 'District' || alertRegion === 'м. Київ') &&
                alertRegion === rayonName
            );
            
            return {
              color: isActive ? '#ff6b6b' : 'transparent',
              weight: isActive ? 1.5 : 0,
              fillColor: isActive ? '#ef4444' : 'transparent',
              fillOpacity: isActive ? 0.15 : 0,
            };
          }}
        />
      )}
    </MapContainer>
    </>
  );
}
