import { Router, Request, Response } from 'express';
import prisma from '../db';
import { getIO } from '../socket';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { time: 'desc' },
      take: 100
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const report = await prisma.report.create({ data });
    
    // Broadcast to all clients
    getIO().emit('report:new', report);
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
