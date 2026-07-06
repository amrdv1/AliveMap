import axios from 'axios';

interface GeocodeResult {
  lat: number;
  lng: number;
}

// Simple in-memory cache to respect Nominatim limits and speed up lookups
const cache = new Map<string, GeocodeResult>();

// Keep track of last request time to enforce 1 second rate limit
let lastRequestTime = 0;

export async function geocodeLocation(locationName: string): Promise<GeocodeResult | null> {
  const query = `${locationName.trim()}`;
  
  if (cache.has(query)) {
    const cached = cache.get(query);
    if (cached?.lat === 0 && cached?.lng === 0) return null; // 0,0 is our "not found" marker
    return cached || null;
  }

  // Rate limiting for Nominatim (1 req/sec)
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLast));
  }
  
  lastRequestTime = Date.now();

  try {
    // Append ", Україна" to restrict results to Ukraine for accuracy
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Україна')}&format=json&limit=1`;
    
    // Nominatim strictly requires a valid User-Agent
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'AliveMap-Target-Parser/1.0 (alivemap@example.com)'
      }
    });

    const data = response.data as any[];
    
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      
      const result = { lat, lng };
      cache.set(query, result);
      console.log(`[Geocoder] Found: ${query} -> [${lat}, ${lng}]`);
      return result;
    }

    // Cache null result to avoid retrying failed lookups over and over
    cache.set(query, { lat: 0, lng: 0 }); // Use 0,0 as a flag for not found
    return null;
  } catch (error) {
    console.error(`[Geocoder] Request failed for ${query}`, error);
    return null;
  }
}
