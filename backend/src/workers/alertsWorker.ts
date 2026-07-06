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

    const fetchAlerts = async () => {
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
                
                // Compare with previous states
                if (!isFirstRun) {
                  const allRegions = new Set([...Object.keys(previousStates), ...Object.keys(currentActiveRegions)]);
                  
                  for (const region of allRegions) {
                    const wasActive = previousStates[region];
                    const isNowActive = currentActiveRegions[region];

                    if (!wasActive && isNowActive) {
                      // Alert Started
                      await sendAlertNotification(region, true);
                      
                      const savedMsg = await prisma.monitoringMessage.create({
                        data: {
                          text: `🔴 **Повітряна тривога**: ${region}`,
                          channelName: 'Офіційні Тривоги',
                          timestamp: new Date(),
                          tags: ['ALERT', region]
                        }
                      });
                      io.emit('monitoring:new_message', savedMsg);

                    } else if (wasActive && !isNowActive) {
                      // Alert Cleared (Відбій)
                      await sendAlertNotification(region, false);

                      const savedMsg = await prisma.monitoringMessage.create({
                        data: {
                          text: `🟢 **Відбій тривоги**: ${region}`,
                          channelName: 'Офіційні Тривоги',
                          timestamp: new Date(),
                          tags: ['CLEAR', region]
                        }
                      });
                      io.emit('monitoring:new_message', savedMsg);
                    }
                  }
                }

                previousStates = currentActiveRegions;
                isFirstRun = false;

                io.emit('alerts:sync', formattedStates);
            }
        } catch (error) {
            console.error("Error polling official alerts API (can be ignored if network is down)");
        }
    };

    // Poll open API for active alerts map every 5 seconds
    fetchAlerts();
    setInterval(fetchAlerts, 5000);
}
