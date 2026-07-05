"use client";

import { useEffect, useState } from 'react';
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

const getIcon = (type: string, direction: number | null | undefined, confidence: number = 1.0) => {
  const isThreat = Object.keys(THREAT_SVGS).includes(type);
  const opacity = confidence < 0.5 ? 0.3 : 1.0;
  
  if (isThreat) {
    const rot = direction || 0;
    
    let svgIcon = THREAT_SVGS[type as keyof typeof THREAT_SVGS] || THREAT_SVGS['DRONE'];
    let ringColor = THREAT_COLORS[type as keyof typeof THREAT_COLORS] || '#ffffff';
    
    // Add opacity to ring color for the pulse
    ringColor = ringColor + '40'; // 25% opacity hex for softer pulse
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; opacity: ${opacity};">
               <div class="radar-pulse" style="--ring-color: ${ringColor}"></div>
               <div style="transform: rotate(${rot}deg); z-index: 10; width: 20px; height: 20px; color: ${THREAT_COLORS[type as keyof typeof THREAT_COLORS]}; filter: drop-shadow(0 0 8px ${ringColor});">
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
const AnimatedMarker = ({ threat, getIcon }: any) => {
  const currentLoc = threat.locations[0];
  const [pos, setPos] = useState<[number, number]>([currentLoc.lat, currentLoc.lng]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000; // seconds elapsed
      lastTime = now;

      if (threat.speed && threat.course) {
        setPos((prevPos) => {
          const R = 6371; // Earth radius in km
          const d = (threat.speed / 3600) * dt; // Distance traveled in km during dt
          const brng = threat.course * Math.PI / 180;
          const lat1 = prevPos[0] * Math.PI / 180;
          const lon1 = prevPos[1] * Math.PI / 180;

          const lat2 = Math.asin(Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng));
          const lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

          return [lat2 * 180 / Math.PI, lon2 * 180 / Math.PI];
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [threat.speed, threat.course]);

  // Sync position with server when a new location arrives
  useEffect(() => {
    setPos([currentLoc.lat, currentLoc.lng]);
  }, [currentLoc.lat, currentLoc.lng, currentLoc.time]);

  const pathPositions: [number, number][] = threat.locations.map((l: any) => [l.lat, l.lng]);
  let predictedPath: [number, number][] = [];
  
  if (threat.course !== null && threat.course !== undefined) {
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

  return (
    <>
      {pathPositions.length > 1 && (
        <Polyline positions={pathPositions} pathOptions={{ color: '#ef4444', weight: 1, opacity: 0.3, dashArray: '4' }} />
      )}

      <Marker position={pos} icon={getIcon(threat.type, threat.course, threat.confidence)}>
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
    </>
  );
};

export default function Map() {
  const { threats, filters, updateThreat, setThreats } = useStore();
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, any>>({});
  const [geoData, setGeoData] = useState<any>(null);
  const [geoDataDistricts, setGeoDataDistricts] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    fetch('/ukraine.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);

    fetch('/ukraine-districts.geojson')
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
        // Fetch from our Next.js API route which uses allorigins
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
    const alertInterval = setInterval(fetchAlerts, 10000); // Polling every 10s

    return () => {
      socket.disconnect();
      socket.off('threat:update');
      socket.off('monitoring:new_message');
      socket.off('alerts:sync');
      clearInterval(alertInterval);
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
        .leaflet-container { background: #000 !important; }
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

        {filteredThreats.map((threat) => (
          <AnimatedMarker key={threat.id} threat={threat} getIcon={getIcon} />
        ))}

      {/* State level alarms */}
      {geoData && (
        <GeoJSON 
          key={`geojson-states-${Object.keys(alerts).filter(k => alerts[k]?.alertnow && (!alerts[k]?.regionType || alerts[k]?.regionType === 'State')).join('-')}`}
          data={geoData}
          style={(feature) => {
            const regionName = feature?.properties?.name;
            const isActive = Object.keys(alerts).some(
              (alertRegion) => 
                alerts[alertRegion]?.alertnow === true && 
                (!alerts[alertRegion]?.regionType || alerts[alertRegion]?.regionType === 'State') &&
                REGION_NAME_MAP[alertRegion] === regionName
            );
            
            return {
              color: isActive ? '#ef4444' : '#4b5563',
              weight: isActive ? 2 : 1,
              fillColor: isActive ? '#ef4444' : '#000000',
              fillOpacity: isActive ? 0.45 : 0.05,
            };
          }}
        />
      )}

      {/* District level alarms */}
      {geoDataDistricts && (
        <GeoJSON 
          key={`geojson-districts-${Object.keys(alerts).filter(k => alerts[k]?.alertnow && alerts[k]?.regionType === 'District').join('-')}`}
          data={geoDataDistricts}
          style={(feature) => {
            const rayonName = feature?.properties?.rayon;
            const isActive = Object.keys(alerts).some(
              (alertRegion) => 
                alerts[alertRegion]?.alertnow === true && 
                alerts[alertRegion]?.regionType === 'District' &&
                alertRegion === rayonName
            );
            
            return {
              color: isActive ? '#ef4444' : 'transparent',
              weight: isActive ? 2 : 0,
              fillColor: isActive ? '#ef4444' : 'transparent',
              fillOpacity: isActive ? 0.6 : 0,
            };
          }}
        />
      )}
    </MapContainer>
    </>
  );
}
