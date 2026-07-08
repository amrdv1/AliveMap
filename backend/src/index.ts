import 'dotenv/config'; // Trigger restart 2
import './logCatcher';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initSocket } from './socket';
import authRoutes from './routes/auth';
import reportRoutes from './routes/reports';
import threatRoutes from './routes/threats';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';
import internalRoutes from './routes/internal';

import { startAlertsWorker } from './workers/alertsWorker';
import { startMapaWorker } from './workers/mapaWorker';
import { startBotWorker } from './workers/botWorker';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(helmet());
app.use(express.json());

const io = initSocket(server);
app.set('io', io);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/threats', threatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/internal', internalRoutes);

import { searchCities } from './services/geocoder';
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    const limit = parseInt(req.query.limit as string) || 10;
    const results = await searchCities(q, limit);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const response = await fetch('https://siren.pp.ua/api/v3/alerts');
    const data = await response.json();
    const formattedStates: Record<string, any> = {};
    if (Array.isArray(data)) {
        data.forEach((region: any) => {
            const airAlert = region.activeAlerts?.find((a: any) => a.type === 'AIR');
            if (airAlert) {
                formattedStates[region.regionName] = { 
                    alertnow: true,
                    regionType: region.regionType,
                    lastUpdate: airAlert.lastUpdate || region.lastUpdate
                };
            }
        });
        
        // Inject permanent alerts based on official data
        formattedStates['Автономна Республіка Крим'] = {
            alertnow: true,
            regionType: 'State',
            lastUpdate: '2022-12-11T00:22:00.000Z'
        };
        formattedStates['Луганська область'] = {
            alertnow: true,
            regionType: 'State',
            lastUpdate: '2022-04-04T19:45:00.000Z'
        };
    }
    res.json(formattedStates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

import prisma from './db';

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start remaining background workers
  startAlertsWorker(io);
  startMapaWorker(io); // Selective Mapa.ua integration
  startBotWorker(); // Telegram Notification Bot
  
  // Auto-archive stale targets based on type
  setInterval(async () => {
    try {
      const now = Date.now();
      const fortyFiveMinsAgo = new Date(now - 45 * 60 * 1000);
      const fifteenMinsAgo = new Date(now - 15 * 60 * 1000);

      // Fetch all active threats with their latest location
      const activeThreats = await prisma.threatObject.findMany({
        where: { status: 'ACTIVE' },
        include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
      });

      const idsToArchive: string[] = [];
      
      for (const t of activeThreats) {
        if (t.locations.length === 0) {
            idsToArchive.push(t.id);
            continue;
        }
        
        const latestTime = t.locations[0].time.getTime();
        const isMissile = ['MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'ZIRCON', 'KH101', 'ISKANDER', 'KINZHAL', 'KALIBR'].includes(t.type);
        
        const ageInMs = now - latestTime;
        if (isMissile && ageInMs > 15 * 60 * 1000) {
            idsToArchive.push(t.id);
        } else if (!isMissile && ageInMs > 45 * 60 * 1000) {
            idsToArchive.push(t.id);
        }
      }

      if (idsToArchive.length > 0) {
        await prisma.threatObject.updateMany({
            where: { id: { in: idsToArchive } },
            data: { status: 'ARCHIVED' }
        });
        console.log(`[Archiver] Archived ${idsToArchive.length} stale targets based on real event time.`);
        io.emit('threats:refresh');
      }
    } catch (e) {
      console.error('[Archiver] Error:', e);
    }
  }, 60000); // Every 1 minute

  // Cleanup old monitoring messages (>24h) and archived threats (>6h)
  setInterval(async () => {
    try {
      const fortyMinsAgo = new Date(Date.now() - 40 * 60 * 1000);
      const deletedMsgs = await prisma.monitoringMessage.deleteMany({
        where: { timestamp: { lt: fortyMinsAgo } }
      });
      if (deletedMsgs.count > 0) {
        console.log(`[Cleanup] Deleted ${deletedMsgs.count} old monitoring messages.`);
      }

      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const deletedThreats = await prisma.threatObject.deleteMany({
        where: { status: 'ARCHIVED', updatedAt: { lt: sixHoursAgo } }
      });
      if (deletedThreats.count > 0) {
        console.log(`[Cleanup] Deleted ${deletedThreats.count} old archived threats.`);
      }
    } catch (e) {
      console.error('[Cleanup] Error:', e);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
});

// --- GRACEFUL SHUTDOWN ---
// Required for Railway Zero-Downtime Deploys to release resources cleanly
async function gracefulShutdown(signal: string) {
    console.log(`\n[Server] Received ${signal}, starting graceful shutdown...`);
    
    // Stop other services if needed
    console.log("Disconnecting Prisma...");
    
    // Close Express Server
    server.close(() => {
        console.log("[Server] HTTP server closed.");
        process.exit(0);
    });

    // Fallback if connections hang
    setTimeout(() => {
        console.error("[Server] Forcefully shutting down after 10s.");
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
