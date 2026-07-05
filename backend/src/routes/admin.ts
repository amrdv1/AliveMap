import express from 'express';
import prisma from '../db';

const router = express.Router();

// Fetch all threats (active and archived)
router.get('/threats', async (req, res) => {
  try {
    const threats = await prisma.threatObject.findMany({
      orderBy: { createdAt: 'desc' },
      include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
    });
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

// Manual create
router.post('/threats', async (req, res) => {
  const { type, lat, lng, speed, course, confidence, status } = req.body;
  try {
    const source = await prisma.source.findFirst({ where: { name: 'Manual' } }) 
      || await prisma.source.create({ data: { name: 'Manual', type: 'MANUAL' } });

    const threat = await prisma.threatObject.create({
      data: {
        type,
        status: status || 'ACTIVE',
        speed,
        course,
        confidence: confidence || 1.0,
        locations: {
          create: {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            sourceId: source.id
          }
        }
      },
      include: { locations: { orderBy: { time: 'desc' } } }
    });

    // Log the change
    await prisma.changeLog.create({
      data: {
        userId: 'admin', // Placeholder for actual user ID from token
        entity: 'ThreatObject',
        entityId: threat.id,
        action: 'CREATE',
        newData: JSON.stringify(threat)
      }
    });

    res.json(threat);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manual update
router.put('/threats/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    const oldThreat = await prisma.threatObject.findUnique({ where: { id } });
    if (!oldThreat) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.threatObject.update({
      where: { id },
      data,
      include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
    });

    await prisma.changeLog.create({
      data: {
        userId: 'admin',
        entity: 'ThreatObject',
        entityId: id,
        action: 'UPDATE',
        oldData: JSON.stringify(oldThreat),
        newData: JSON.stringify(updated)
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manual delete
router.delete('/threats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.threatObject.delete({ where: { id } });
    
    await prisma.changeLog.create({
      data: {
        userId: 'admin',
        entity: 'ThreatObject',
        entityId: id,
        action: 'DELETE'
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all threats and reports (Temporary wipe endpoint)
router.delete('/threats/clear/all', async (req, res) => {
  try {
    // Delete all threat objects (cascades to ThreatLocation)
    await prisma.threatObject.deleteMany({});
    // Delete all legacy reports
    await prisma.report.deleteMany({});
    res.json({ success: true, message: 'All targets wiped from DB' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get API Logs
router.get('/api-logs', async (req, res) => {
  try {
    const logs = await prisma.apiLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { source: true }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get Change Logs
router.get('/change-logs', async (req, res) => {
  try {
    const logs = await prisma.changeLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { email: true } } }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;
