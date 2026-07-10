import express from 'express';
import prisma from '../db';
import { extractWithAI } from '../services/aiParser';
import { geocodeLocation } from '../services/geocoder';
import { processExternalThreat } from '../services/aggregatorService';

const router = express.Router();

const MOVEMENT_TYPES = new Set([
  'DRONE', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 
  'AIRCRAFT', 'KAB', 'ZIRCON', 'KH101', 'ISKANDER', 
  'KINZHAL', 'KALIBR', 'FPV', 'RECON', 'UNKNOWN'
]);

router.post('/telegram-message', async (req, res) => {
    try {
        // DEPRECATED: We now use Neptun API directly for both threats and feed messages.
        // This endpoint is disabled to prevent duplicate hallucinated targets.
        return res.json({ success: true, message: "Endpoint disabled, using Neptun API." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
