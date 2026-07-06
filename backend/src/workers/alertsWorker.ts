import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { sendAlertNotification } from './botWorker';

const prisma = new PrismaClient();

export async function startAlertsWorker(io: Server) {
    let source = await prisma.source.findFirst({ where: { name: 'Official Alerts' } });
    if (!source) {
      source = await prisma.source.create({
        data: {
          name: 'Official Alerts',
          type: 'API'
        }
      });
    }

    console.log("Official Alerts Worker started...");

    let previousStates: Record<string, boolean> = {};
    let isFirstRun = true;

    let isFetching = false;

    const fetchAlerts = async () => {
        if (isFetching) return;
        isFetching = true;
        try {
            const ALERTS_API_URL = 'https://siren.pp.ua/api/v3/alerts';
            const { data } = await axios.get(ALERTS_API_URL, { timeout: 10000 });
            
            const formattedStates: Record<string, { alertnow: boolean, regionType?: string, lastUpdate?: string }> = {};
            const currentActiveRegions: Record<string, boolean> = {};

            if (Array.isArray(data)) {
                data.forEach((region: any) => {
                    const airAlert = region.activeAlerts?.find((a: any) => a.type === 'AIR');
                    if (airAlert) {
                        formattedStates[region.regionName] = { 
                            alertnow: true,
                            regionType: region.regionType,
                            lastUpdate: airAlert.lastUpdate || region.lastUpdate
                        };
                        currentActiveRegions[region.regionName] = true;
                    }
                });
                
                // Inject permanent alerts based on official data
                formattedStates['Автономна Республіка Крим'] = {
                    alertnow: true,
                    regionType: 'State',
                    lastUpdate: '2022-12-11T00:22:00.000Z'
                };
                currentActiveRegions['Автономна Республіка Крим'] = true;

                formattedStates['Луганська область'] = {
                    alertnow: true,
                    regionType: 'State',
                    lastUpdate: '2022-04-04T19:45:00.000Z'
                };
                currentActiveRegions['Луганська область'] = true;
                
                // Compare with previous states
                if (!isFirstRun) {
                  const allRegions = new Set([...Object.keys(previousStates), ...Object.keys(currentActiveRegions)]);
                  
                  for (const region of allRegions) {
                    const wasActive = previousStates[region];
                    const isNowActive = currentActiveRegions[region];

                    if (!wasActive && isNowActive) {
                      // Alert Started — send to Telegram bot only
                      await sendAlertNotification(region, true);

                    } else if (wasActive && !isNowActive) {
                      // Alert Cleared — send to Telegram bot only
                      await sendAlertNotification(region, false);

                      // Also archive threats in this region
                      const regionCoords = getRegionCenter(region);
                      if (regionCoords) {
                         // Import archiveThreatsNear dynamically or at the top
                         const { archiveThreatsNear } = require('./aggregatorService');
                         await archiveThreatsNear(regionCoords.lat, regionCoords.lng, 150, io);
                      }
                    }
                  }
                }

                previousStates = currentActiveRegions;
                isFirstRun = false;

                io.emit('alerts:sync', formattedStates);
            }
        } catch (error) {
            console.error("Error polling official alerts API (can be ignored if network is down)");
        } finally {
            isFetching = false;
        }
    };

    // Poll open API for active alerts map every 5 seconds
    fetchAlerts();
    setInterval(fetchAlerts, 5000);
}

// Rough centers for Ukrainian regions
function getRegionCenter(region: string): {lat: number, lng: number} | null {
  const map: Record<string, {lat: number, lng: number}> = {
    "київська": {lat: 50.25, lng: 30.5},
    "м. київ": {lat: 50.45, lng: 30.52},
    "одеська": {lat: 46.48, lng: 30.73},
    "дніпропетровська": {lat: 48.46, lng: 35.04},
    "харківська": {lat: 50.0, lng: 36.23},
    "львівська": {lat: 49.83, lng: 24.02},
    "миколаївська": {lat: 46.97, lng: 31.99},
    "запорізька": {lat: 47.83, lng: 35.13},
    "херсонська": {lat: 46.63, lng: 32.61},
    "чернігівська": {lat: 51.49, lng: 31.28},
    "сумська": {lat: 50.9, lng: 34.79},
    "полтавська": {lat: 49.58, lng: 34.55},
    "черкаська": {lat: 49.44, lng: 32.05},
    "вінницька": {lat: 49.23, lng: 28.46},
    "житомирська": {lat: 50.25, lng: 28.65},
    "кіровоградська": {lat: 48.5, lng: 32.26},
    "хмельницька": {lat: 49.42, lng: 26.98},
    "чернівецька": {lat: 48.29, lng: 25.93},
    "івано-франківська": {lat: 48.92, lng: 24.7},
    "тернопільська": {lat: 49.55, lng: 25.59},
    "волинська": {lat: 50.74, lng: 25.32},
    "рівненська": {lat: 50.61, lng: 26.25},
    "закарпатська": {lat: 48.62, lng: 22.28},
    "донецька": {lat: 48.01, lng: 37.8},
    "луганська": {lat: 48.57, lng: 39.3},
    "крим": {lat: 45.3, lng: 34.4},
    "севастополь": {lat: 44.6, lng: 33.5}
  };
  const lower = region.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) return v;
  }
  return null;
}

