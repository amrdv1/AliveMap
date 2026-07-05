"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { socket } from '../lib/socket';

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

const getIcon = (type: string, direction?: number | null) => {
  const isDrone = type === 'DRONE';
  const isMissile = type === 'MISSILE';
  
  if (isDrone || isMissile) {
    const rot = direction || 0;
    const imgUrl = isDrone ? '/icons/drone.png' : '/icons/missile.png';
    const shadowColor = isDrone ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
    const arrowColor = isDrone ? '#ffff00' : '#ff0000';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="transform: rotate(${rot}deg); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; position: relative;">
          <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 8px ${shadowColor}); mix-blend-mode: screen;" />
          <div style="position: absolute; top: -12px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 12px solid ${arrowColor}; filter: drop-shadow(0 0 5px ${arrowColor})"></div>
        </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
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
  const { reports, filters, addReport, setReports } = useStore();
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, string>>({});
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    fetch('/ukraine.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);
    
    // Fetch initial active reports
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/reports`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch(console.error);

    socket.connect();

    socket.on('report:new', (report) => {
      addReport(report);
    });

    socket.on('alerts:sync', (data) => {
      setAlerts(data);
    });

    return () => {
      socket.disconnect();
      socket.off('report:new');
      socket.off('alerts:sync');
    };
  }, [addReport]);

  if (!mounted) return <div className="w-full h-full bg-[#05070A] animate-pulse" />;

  const filteredReports = reports.filter((r) => 
    filters.types.includes(r.type) &&
    r.confidence >= filters.minConfidence &&
    (filters.showArchived ? true : r.status === 'ACTIVE')
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
      
      {filteredReports.map((report) => (
        <Marker 
          key={report.id} 
          position={[report.lat, report.lng]}
          icon={getIcon(report.type, report.direction)}
        >
          <Popup className="dark-popup">
            <div className="p-2 bg-[#0a0f18] text-white rounded shadow-lg border border-gray-800">
              <h3 className="font-bold text-lg mb-1">{report.type}</h3>
              <p className="text-sm text-gray-400">Time: {new Date(report.time).toLocaleTimeString()}</p>
              <p className="text-sm text-gray-400">Confidence: {report.confidence}%</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {geoData && (
        <GeoJSON 
          data={geoData}
          style={(feature) => {
            const regionName = feature?.properties?.name;
            const isActive = Object.keys(alerts).some(
              alertRegion => REGION_NAME_MAP[alertRegion] === regionName
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
