import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch('https://siren.pp.ua/api/v3/alerts', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch alerts: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    const statesMap: Record<string, any> = {};
    if (Array.isArray(data)) {
      data.forEach((region: any) => {
        const airAlert = region.activeAlerts?.find((a: any) => a.type === 'AIR');
        if (airAlert) {
          statesMap[region.regionName] = { 
            alertnow: true,
            regionType: region.regionType, // 'State' | 'District' | 'Community'
            lastUpdate: airAlert.lastUpdate || region.lastUpdate
          };
        }
      });
    }
    
    return NextResponse.json({ states: statesMap });
  } catch (error: any) {
    console.error('Error fetching alerts via Next.js API proxy:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
