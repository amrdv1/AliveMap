import fs from 'fs';
import path from 'path';
import { alertsService } from './alertsService';

interface GeocodeResult {
  lat: number;
  lng: number;
  region?: string;
}

let citiesCache: any[] = [];

function loadCities() {
  try {
    const jsonPath = path.join(__dirname, '..', '..', 'cities.json');
    if (fs.existsSync(jsonPath)) {
      citiesCache = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      console.log(`[Geocoder] Loaded ${citiesCache.length} cities into memory.`);
    } else {
      console.warn(`[Geocoder] cities.json not found at ${jsonPath}`);
    }
  } catch (e) {
    console.error('[Geocoder] Failed to load cities.json:', e);
  }
}

// Load on boot
loadCities();

export async function geocodeLocation(locationName: string, dropIfQuiet: boolean = true): Promise<GeocodeResult | null> {
  if (citiesCache.length === 0) return null;

  const query = locationName.trim().toLowerCase();
  if (query.length < 2) return null;

  const matches = citiesCache.filter(c => c.names.includes(query));

  if (matches.length === 0) {
    console.log(`[Geocoder] Not found: ${query}`);
    return null;
  }

  // Sort matches to prioritize regions with active alerts, then by population
  matches.sort((a, b) => {
    const aActive = alertsService.isRegionActive(a.region) ? 1 : 0;
    const bActive = alertsService.isRegionActive(b.region) ? 1 : 0;
    
    if (aActive !== bActive) {
      return bActive - aActive; // Active regions first
    }
    
    return b.pop - a.pop; // Larger cities first
  });

  const bestMatch = matches[0];
  
  if (dropIfQuiet) {
    const isActive = alertsService.isRegionActive(bestMatch.region);
    // If the region has no active alert, we drop it to prevent false positives
    if (!isActive && bestMatch.region !== 'Unknown') {
      console.log(`[Geocoder] Dropped ${query} because ${bestMatch.region} has NO active alert.`);
      return null;
    }
  }

  console.log(`[Geocoder] Found: ${query} -> [${bestMatch.lat}, ${bestMatch.lng}] in ${bestMatch.region}`);
  return { lat: bestMatch.lat, lng: bestMatch.lng, region: bestMatch.region };
}
