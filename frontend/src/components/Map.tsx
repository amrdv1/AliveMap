"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON, Polyline } from 'react-leaflet';
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

const getIcon = (type: string, direction: number | undefined) => {
  const isDrone = type === 'DRONE';
  const isMissile = type === 'MISSILE' || type === 'CRUISE_MISSILE';
  const isBallistic = type === 'BALLISTIC_MISSILE';
  const isKab = type === 'KAB';
  const isAircraft = type === 'AIRCRAFT';
  
  if (isDrone || isMissile || isBallistic || isKab || isAircraft) {
    const rot = direction || 0;
    
    let svgIcon = '';
    let colorClass = 'text-red-500';
    let ringColor = 'rgba(239, 68, 68, 0.5)';
    
    if (isDrone) {
      svgIcon = `<div class="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent border-b-red-500"></div>`;
    } else if (isMissile) {
      svgIcon = `<div class="w-2 h-5 bg-red-500 relative before:content-[''] before:absolute before:-top-1.5 before:left-0 before:w-0 before:h-0 before:border-l-[4px] before:border-r-[4px] before:border-b-[6px] before:border-l-transparent before:border-r-transparent before:border-b-red-500"></div>`;
    } else if (isBallistic) {
      svgIcon = `<div class="w-2.5 h-6 bg-orange-500 relative before:content-[''] before:absolute before:-top-2 before:left-0 before:w-0 before:h-0 before:border-l-[5px] before:border-r-[5px] before:border-b-[8px] before:border-l-transparent before:border-r-transparent before:border-b-orange-500"></div>`;
      ringColor = 'rgba(249, 115, 22, 0.5)';
    } else if (isKab) {
      svgIcon = `<div class="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent border-b-purple-500"></div>`;
      ringColor = 'rgba(168, 85, 247, 0.5)';
    } else if (isAircraft) {
      svgIcon = `<div class="w-6 h-6 bg-blue-500" style="clip-path: polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%)"></div>`;
      ringColor = 'rgba(59, 130, 246, 0.5)';
    }
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
               <div class="radar-pulse" style="--ring-color: ${ringColor}"></div>
               <div style="transform: rotate(${rot}deg); z-index: 10; filter: drop-shadow(0 0 8px ${ringColor});">
                 ${svgIcon}
               </div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }
  
  const colors: Record<string, string> = {
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
  "АР Крим": "Crimea",
  "м. Севастополь": "Sevastopol"
};

export default function Map() {
  const { threats, filters, updateThreat, setThreats } = useStore();
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, any>>({});
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    fetch('/ukraine.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);
    
    const fetchThreats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/threats`);
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

    socket.on('alerts:sync', (data) => {
      setAlerts(data);
    });

    return () => {
      socket.disconnect();
      socket.off('threat:update');
      socket.off('alerts:sync');
    };
  }, [setThreats, updateThreat]);

  if (!mounted) return <div className="w-full h-full bg-[#05070A] animate-pulse" />;

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const filteredThreats = threats.filter((t) => 
    filters.types.includes(t.type) &&
    t.confidence >= filters.minConfidence &&
    (filters.showArchived ? true : t.status === 'ACTIVE') &&
    new Date(t.updatedAt) >= twoHoursAgo &&
    t.locations && t.locations.length > 0
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: #050a14 !important; }
        .radar-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 0 0 var(--ring-color);
          animation: pulse-ring 2s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        @keyframes pulse-ring {
          to {
            box-shadow: 0 0 0 40px rgba(255, 0, 0, 0);
          }
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #0a0f18;
          color: white;
          border: 1px solid #1f2937;
          border-radius: 8px;
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
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomControl position="bottomright" />
        
        {filteredThreats.map((threat) => {
          const currentLoc = threat.locations[0];
          if (!currentLoc) return null;
          
          const pathPositions: [number, number][] = threat.locations.map(l => [l.lat, l.lng]);
          
          let predictedPath: [number, number][] = [];
          if (threat.speed && threat.course) {
            const lat1 = currentLoc.lat;
            const lon1 = currentLoc.lng;
            const d = (threat.speed / 60) * 10; 
            const R = 6371; 
            const brng = threat.course * Math.PI / 180;
            const lat1Rad = lat1 * Math.PI / 180;
            const lon1Rad = lon1 * Math.PI / 180;
            
            const lat2Rad = Math.asin(Math.sin(lat1Rad)*Math.cos(d/R) + Math.cos(lat1Rad)*Math.sin(d/R)*Math.cos(brng));
            const lon2Rad = lon1Rad + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1Rad), Math.cos(d/R)-Math.sin(lat1Rad)*Math.sin(lat2Rad));
            
            predictedPath = [[lat1, lon1], [lat2Rad * 180 / Math.PI, lon2Rad * 180 / Math.PI]];
          }
          
          return (
            <div key={threat.id}>
              {pathPositions.length > 1 && (
                <Polyline positions={pathPositions} pathOptions={{ color: '#e63946', weight: 2, opacity: 0.8, dashArray: '5, 10' }} />
              )}
              {predictedPath.length > 0 && (
                <Polyline positions={predictedPath} pathOptions={{ color: '#ffb703', weight: 2, dashArray: '4, 8', opacity: 0.6 }} />
              )}
            <Marker 
              position={[currentLoc.lat, currentLoc.lng]}
              icon={getIcon(threat.type, threat.course)}
            >
              <Popup className="custom-popup">
                <div className="font-sans">
                  <div className="font-bold text-lg mb-1">{threat.type}</div>
                  <div className="text-sm opacity-80 mb-2">Confidence: {(threat.confidence * 100).toFixed(0)}%</div>
                  {threat.speed && <div className="text-sm">Speed: {threat.speed.toFixed(0)} km/h</div>}
                  {threat.course && <div className="text-sm">Course: {threat.course.toFixed(0)}°</div>}
                  <div className="text-xs opacity-50 mt-2">
                    Updated: {new Date(currentLoc.time).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}

      {geoData && (
        <GeoJSON 
          data={geoData}
          style={(feature) => {
            const regionName = feature?.properties?.name;
            const isActive = Object.keys(alerts).some(
              (alertRegion) => 
                alerts[alertRegion]?.alertnow === true && 
                REGION_NAME_MAP[alertRegion] === regionName
            );
            
            return {
              color: isActive ? '#ef4444' : '#6b7280',
              weight: isActive ? 2 : 1.5,
              fillColor: isActive ? '#ef4444' : '#374151',
              fillOpacity: isActive ? 0.35 : 0.15,
            };
          }}
        />
      )}
    </MapContainer>
    </>
  );
}
