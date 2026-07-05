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

import { startAlertsWorker } from './workers/alertsWorker';
import { startMapaWorker } from './workers/mapaWorker';
import { startTelegramWorker } from './workers/telegramWorker';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(helmet());
app.use(express.json());

const io = initSocket(server);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/threats', threatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

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
  startMapaWorker(io); // Re-enabled mapa.ua as background layer
  startTelegramWorker(io); // Integrated telegram parser
  
  // Auto-archive stale targets (no updates in 15 mins)
  setInterval(async () => {
    try {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      const updated = await prisma.threatObject.updateMany({
        where: {
          status: 'ACTIVE',
          updatedAt: { lt: fifteenMinsAgo }
        },
        data: { status: 'ARCHIVED' }
      });
      if (updated.count > 0) {
        console.log(`[Archiver] Archived ${updated.count} stale targets.`);
        // Ask all clients to refetch to clear their states
        io.emit('threats:refresh');
      }
    } catch (e) {
      console.error('[Archiver] Error:', e);
    }
  }, 60000); // Check every 1 minute
});
