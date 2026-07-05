import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch('https://alerts.com.ua/api/states', {
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
    
    // Transform alerts.com.ua array format to match Map.tsx expectations
    const statesMap: Record<string, any> = {};
    if (data.states && Array.isArray(data.states)) {
      data.states.forEach((s: any) => {
        statesMap[s.name] = { alertnow: s.alert };
      });
    }
    
    return NextResponse.json({ states: statesMap });
  } catch (error: any) {
    console.error('Error fetching alerts via Next.js API proxy:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
