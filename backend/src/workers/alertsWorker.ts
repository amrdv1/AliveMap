import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export async function startAlertsWorker(io: Server) {
    let source = await prisma.source.findUnique({ where: { name: 'Official Alerts' } });
    if (!source) {
      source = await prisma.source.create({
        data: {
          name: 'Official Alerts',
          type: 'SYSTEM',
          reliability: 100,
          isActive: true
        }
      });
    }

    console.log("Official Alerts Worker started...");

    // Poll ubilling.net.ua open API for active alerts map
    setInterval(async () => {
        try {
            const { data } = await axios.get('https://ubilling.net.ua/aerialalerts/', { timeout: 10000 });
            if (data && data.states) {
                // data.states is an object: { "Київська область": "2023-11-20T...", ... }
                // We broadcast this directly to all clients for real-time region painting
                io.emit('alerts:sync', data.states);
            }
        } catch (error) {
            console.error("Error polling official alerts API (can be ignored if network is down)");
        }
    }, 30000); // every 30 seconds
}
