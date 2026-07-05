import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

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

    const fetchAlerts = async () => {
        try {
            const ALERTS_API_URL = 'https://ubilling.net.ua/aerialalerts/';
            const { data } = await axios.get(ALERTS_API_URL, { timeout: 10000 });
            if (data && data.states) {
                const formattedStates: Record<string, { alertnow: boolean }> = {};
                for (const [region, alertData] of Object.entries(data.states)) {
                    // ubilling returns an object { alertnow: true/false, changed: ... }
                    if ((alertData as any)?.alertnow === true) {
                        formattedStates[region] = { alertnow: true };
                    }
                }
                io.emit('alerts:sync', formattedStates);
            }
        } catch (error) {
            console.error("Error polling official alerts API (can be ignored if network is down)");
        }
    };

    // Poll ubilling.net.ua open API for active alerts map every 5 seconds
    fetchAlerts();
    setInterval(fetchAlerts, 5000);
}
