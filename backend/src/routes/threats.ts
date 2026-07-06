import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const threats = await prisma.threatObject.findMany({
      where: { 
        status: 'ACTIVE',
        updatedAt: { gte: twoHoursAgo }
      },
      include: {
        locations: {
          orderBy: { time: 'desc' },
          take: 50 // get recent trajectory points
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 200
    });
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', async (req: Request, res: Response) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const threats = await prisma.threatObject.findMany({
      where: { 
        updatedAt: { gte: twentyFourHoursAgo }
      },
      include: {
        locations: {
          orderBy: { time: 'asc' }
        }
      },
      orderBy: { updatedAt: 'asc' },
      take: 1000 // Limit for safety
    });
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
