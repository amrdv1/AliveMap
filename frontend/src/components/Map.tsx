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
    
    let imgUrl = '/icons/drone.png';
    let arrowColor = '#ffff00';
    if (isMissile) { imgUrl = '/icons/missile.png'; arrowColor = '#ff0000'; }
    if (isBallistic) { imgUrl = '/icons/ballistic.png'; arrowColor = '#ff8800'; }
    if (isKab) { imgUrl = '/icons/kab.png'; arrowColor = '#aa00ff'; }
    if (isAircraft) { imgUrl = '/icons/aircraft.png'; arrowColor = '#0088ff'; }
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="transform: rotate(${rot}deg); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; position: relative;">
          <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: contain;" />
          <div style="position: absolute; top: -8px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid ${arrowColor};"></div>
        </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
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
    <MapContainer 
      center={[48.3794, 31.1656]} 
      zoom={6} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
              <Polyline positions={pathPositions} pathOptions={{ color: 'red', weight: 2, opacity: 0.5 }} />
            )}
            {predictedPath.length > 0 && (
              <Polyline positions={predictedPath} pathOptions={{ color: 'orange', weight: 2, dashArray: '5, 5' }} />
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
  );
}
