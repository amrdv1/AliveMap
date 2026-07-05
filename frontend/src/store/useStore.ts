import { create } from 'zustand';

export type ReportType = 'DRONE' | 'MISSILE' | 'CRUISE_MISSILE' | 'BALLISTIC_MISSILE' | 'KAB' | 'AIRCRAFT' | 'ALERT';
export type ReportStatus = 'ACTIVE' | 'ARCHIVED';

export interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  time: string;
}

export interface ThreatObject {
  id: string;
  type: ReportType;
  status: ReportStatus;
  speed?: number | null;
  course?: number | null;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  locations: ThreatLocation[];
}

interface AppState {
  threats: ThreatObject[];
  filters: {
    types: ReportType[];
    minConfidence: number;
    showArchived: boolean;
  };
  setThreats: (threats: ThreatObject[]) => void;
  updateThreat: (threat: ThreatObject) => void;
  setFilter: (key: keyof AppState['filters'], value: any) => void;
}

export const useStore = create<AppState>((set) => ({
  threats: [],
  filters: {
    types: ['DRONE', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'KAB', 'AIRCRAFT', 'ALERT'],
    minConfidence: 0,
    showArchived: false,
  },
  setThreats: (threats) => set({ threats }),
  updateThreat: (updatedThreat) => set((state) => {
    const exists = state.threats.some(t => t.id === updatedThreat.id);
    if (exists) {
      return { threats: state.threats.map((t) => t.id === updatedThreat.id ? updatedThreat : t) };
    }
    return { threats: [updatedThreat, ...state.threats] };
  }),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  }))
}));
