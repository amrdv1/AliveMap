import axios from 'axios';

class AlertsService {
  private activeRegions = new Set<string>();
  private lastUpdate = 0;

  constructor() {
    this.pollAlerts();
    // Poll every 30 seconds
    setInterval(() => this.pollAlerts(), 30 * 1000);
  }

  private async pollAlerts() {
    try {
      const response = await axios.get('https://siren.pp.ua/api/v3/alerts', { timeout: 10000 });
      const data = response.data;
      
      const newActive = new Set<string>();
      if (Array.isArray(data)) {
        data.forEach((region: any) => {
          const hasAirAlert = region.activeAlerts?.some((a: any) => a.type === 'AIR');
          if (hasAirAlert) {
            newActive.add(region.regionName);
          }
        });
      }
      this.activeRegions = newActive;
      this.lastUpdate = Date.now();
    } catch (e) {
      console.error('[AlertsService] Failed to fetch alerts:', e);
    }
  }

  public getActiveRegions(): Set<string> {
    return this.activeRegions;
  }

  public isRegionActive(regionName: string): boolean {
    if (this.activeRegions.has(regionName)) return true;
    
    const baseName = regionName.replace(/(ська|цький|ська|область|район|громада|м\.\s*)/gi, '').trim();
    if (baseName.length < 3) return false;

    for (const active of this.activeRegions) {
        if (active.includes(baseName) || baseName.includes(active)) {
            return true;
        }
    }
    
    return false;
  }
}

export const alertsService = new AlertsService();
