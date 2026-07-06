import { Server } from 'socket.io';
import axios from 'axios';
import prisma from '../db';
import { processExternalThreat } from '../services/aggregatorService';

export async function startOpenSourceScraper(io: Server) {
  console.log('Starting OpenSource Scraper (NOTAM, OpenSky, DSNS)');

  // Poll OpenSky network for civil aviation over Ukraine
  setInterval(async () => {
    try {
      await pollOpenSky(io);
    } catch (e) {
      console.error('OpenSky polling failed', e);
    }
  }, 120000); // Every 2 mins
}

async function pollOpenSky(io: Server) {
  // Bounding box for Ukraine approx
  const lamin = 44.3;
  const lomin = 22.1;
  const lamax = 52.3;
  const lomax = 40.2;
  
  const res = await axios.get(`https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`, { timeout: 10000 });
  
  if (res.data && res.data.states) {
      // Process civil aviation and broadcast to frontend
      const flights = res.data.states.map((state: any) => ({
          callsign: state[1] ? state[1].trim() : 'UNKNOWN',
          country: state[2],
          lng: state[5],
          lat: state[6],
          altitude: state[7],
          velocity: state[9] ? state[9] * 3.6 : 0, // m/s to km/h
          heading: state[10],
          type: 'CIVIL_AIRCRAFT'
      }));
      io.emit('monitoring:civil_flights', flights);
  }
}
