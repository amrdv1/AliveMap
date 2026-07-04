"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle } from 'react-leaflet';
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

// Custom animated icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color};" class="w-4 h-4 rounded-full shadow-[0_0_15px_${color}] animate-pulse border-2 border-white"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const icons = {
  DRONE: createCustomIcon('#3b82f6'),
  MISSILE: createCustomIcon('#ef4444'),
  AIRCRAFT: createCustomIcon('#eab308'),
  ALERT: createCustomIcon('#a855f7'),
};

const REGION_COORDS: Record<string, [number, number]> = {
  "Київська область": [50.4501, 30.5234],
  "м. Київ": [50.4501, 30.5234],
  "Одеська область": [46.4825, 30.7233],
  "Дніпропетровська область": [48.4647, 35.0462],
  "Харківська область": [50.0000, 36.2304],
  "Львівська область": [49.8397, 24.0297],
  "Миколаївська область": [46.9750, 31.9946],
  "Запорізька область": [47.8388, 35.1396],
  "Херсонська область": [46.6354, 32.6169],
  "Чернігівська область": [51.4982, 31.2893],
  "Сумська область": [50.9077, 34.7981],
  "Полтавська область": [49.5883, 34.5514],
  "Черкаська область": [49.4444, 32.0598],
  "Вінницька область": [49.2331, 28.4682],
  "Житомирська область": [50.2547, 28.6587],
  "Кіровоградська область": [48.5079, 32.2623],
  "Хмельницька область": [49.4230, 26.9871],
  "Чернівецька область": [48.2915, 25.9352],
  "Івано-Франківська область": [48.9226, 24.7111],
  "Тернопільська область": [49.5535, 25.5948],
  "Волинська область": [50.7472, 25.3254],
  "Рівненська область": [50.6199, 26.2516],
  "Закарпатська область": [48.6208, 22.2879],
};

export default function Map() {
  const { reports, filters, addReport } = useStore();
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
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
          icon={icons[report.type as keyof typeof icons]}
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

      {Object.keys(alerts).map(region => {
        if (REGION_COORDS[region]) {
          return (
            <Circle 
              key={region} 
              center={REGION_COORDS[region]} 
              radius={70000} 
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1 }}
            />
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
