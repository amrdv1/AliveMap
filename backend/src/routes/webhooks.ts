import express from 'express';
import prisma from '../db';
import { getIO } from '../socket';
import { processExternalThreat } from '../services/aggregatorService';

const router = express.Router();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-super-secret-key';

// Middleware to protect webhook routes
const verifyWebhook = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized webhook call' });
  }
  next();
};

router.post('/telegram', verifyWebhook, async (req, res) => {
  const { text, channelName, timestamp, tags, parsedThreat } = req.body;
  const io = getIO();

  try {
    // 1. Ensure source exists
    let source = await prisma.source.findFirst({ where: { name: 'Telegram Webhook' } });
    if (!source) {
      source = await prisma.source.create({ data: { name: 'Telegram Webhook', type: 'API' } });
    }

    // 2. Save raw message
    await prisma.monitoringMessage.create({
      data: {
        text,
        channelName,
        timestamp: new Date(timestamp),
        tags
      }
    });

    io.emit('monitoring:new_message', { 
      text, channelName, timestamp: new Date(timestamp), tags 
    });

    // 3. Process Threat if parsed
    if (parsedThreat && parsedThreat.lat !== null && parsedThreat.lng !== null) {
      const savedThreat = await processExternalThreat(
        null, // Telegram doesn't provide external IDs like MAPA does
        parsedThreat.type,
        parsedThreat.lat,
        parsedThreat.lng,
        new Date(timestamp),
        source.id,
        null, // speed
        parsedThreat.direction, // course/direction
        parsedThreat.confidence / 100 // Prisma expects 0-1.0
      );

      // WebSockets emit is handled by aggregator/services or you can emit here if needed
      io.emit('threat:update', savedThreat);
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
