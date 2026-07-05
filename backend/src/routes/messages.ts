import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.monitoringMessage.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
