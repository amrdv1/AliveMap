import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const messages = await prisma.monitoringMessage.findMany({
      where: { 
        timestamp: { gte: thirtyMinsAgo }
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
