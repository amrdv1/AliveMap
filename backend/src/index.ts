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
    const response = await fetch('https://ubilling.net.ua/aerialalerts/');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to proxy alerts:', error);
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
});
