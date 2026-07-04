"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
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

export default function Map() {
  const { reports, filters, addReport } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    socket.connect();

    socket.on('report:new', (report) => {
      addReport(report);
    });

    return () => {
      socket.disconnect();
      socket.off('report:new');
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
    </MapContainer>
  );
}
