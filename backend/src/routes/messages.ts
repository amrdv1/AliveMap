import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const messages = await prisma.monitoringMessage.findMany({
      where: { 
        timestamp: { gte: sixHoursAgo },
        channelName: {
          notIn: ['air_alert_ua', 'ukraine_alarm_bot', 'Офіційні Тривоги']
        },
        // Only return messages with movement tags
        NOT: {
          OR: [
            { tags: { has: 'SUMMARY' } },
            { tags: { has: 'INFO' } },
            { tags: { has: 'ALERT' } },
            { tags: { has: 'PPO' } },
          ]
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 500
    });
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
