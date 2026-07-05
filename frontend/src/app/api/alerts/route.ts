import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Use allorigins to bypass IP blocks when deployed on cloud platforms like Railway
    const res = await fetch('https://api.allorigins.win/raw?url=https://ubilling.net.ua/aerialalerts/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ALIVEMAP/1.0)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch alerts: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Transform ubilling format to match Map.tsx expectations
    const statesMap: Record<string, any> = {};
    if (data.states) {
      for (const [regionName, alertData] of Object.entries(data.states)) {
        statesMap[regionName] = { alertnow: (alertData as any)?.alertnow === true };
      }
    }
    
    return NextResponse.json({ states: statesMap });
  } catch (error: any) {
    console.error('Error fetching alerts via Next.js API proxy:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
