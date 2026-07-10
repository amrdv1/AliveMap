import { create } from 'zustand';

export type ReportType = 'DRONE' | 'FPV' | 'MISSILE' | 'CRUISE_MISSILE' | 'BALLISTIC_MISSILE' | 'KAB' | 'AIRCRAFT' | 'ALERT' | 'RECON' | 'UNKNOWN' | 'KH101' | 'ISKANDER' | 'KINZHAL' | 'KALIBR' | 'ZIRCON' | 'MOLNIYA' | 'DECOY';

export type ReportStatus = 'ACTIVE' | 'ARCHIVED';

export interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  time: string;
}

export interface ExplosionEvent {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ThreatObject {
  id: string;
  type: ReportType | 'SUMMARY' | 'INFO' | 'ZIRCON' | 'PPO' | 'RECON' | 'ALERT' | 'MOLNIYA' | 'DECOY';
  status: ReportStatus;
  speed?: number | null;
  course?: number | null;
  confidence: number;
  quantity: number;
  targetName?: string | null;
  targetLat?: number | null;
  targetLng?: number | null;
  createdAt: string;
  updatedAt: string;
  locations: ThreatLocation[];
}

export interface MonitoringMessage {
  id: string;
  text: string;
  channelName: string;
  timestamp: string;
  tags: string[];
  lat?: number | null;
  lng?: number | null;
  threatId?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AlertsData = Record<string, any>;

export interface FilterState {
  types: (ReportType | 'SUMMARY' | 'INFO' | 'ZIRCON' | 'PPO' | 'RECON' | 'ALERT' | 'MOLNIYA' | 'DECOY')[];
  minConfidence: number;
  showArchived: boolean;
}

export interface AppState {
  threats: ThreatObject[];
  explosions: ExplosionEvent[];
  alerts: AlertsData;
  messages: MonitoringMessage[];
  filters: FilterState;
  isAboutOpen: boolean;
  activeTab: 'MAP' | 'SUMMARY' | 'MONITORING';
  mapMode: 'dark' | 'satellite';
  is3D: boolean;
  showHeatmap: boolean;
  flyToLocation: { lat: number, lng: number } | null;
  setThreats: (threats: ThreatObject[]) => void;
  updateThreat: (threat: ThreatObject) => void;
  addExplosion: (exp: ExplosionEvent) => void;
  removeExplosion: (id: string) => void;
  setAlerts: (alerts: AlertsData) => void;
  setMessages: (messages: MonitoringMessage[]) => void;
  addMessage: (message: MonitoringMessage) => void;
  cleanupMessages: () => void;
  setFilter: (key: keyof AppState['filters'], value: any) => void;
  setAboutOpen: (open: boolean) => void;
  setActiveTab: (tab: 'MAP' | 'SUMMARY' | 'MONITORING') => void;
  setMapMode: (mode: 'dark' | 'satellite') => void;
  setIs3D: (val: boolean) => void;
  setShowHeatmap: (val: boolean) => void;
  setFlyToLocation: (loc: { lat: number, lng: number } | null) => void;
  selectedThreat: ThreatObject | null;
  setSelectedThreat: (threat: ThreatObject | null) => void;
  selectedThreatId: string | null;
  setSelectedThreatId: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  threats: [],
  explosions: [],
  alerts: {},
  messages: [],
  isAboutOpen: false,
  activeTab: 'MAP',
  mapMode: 'dark',
  is3D: false,
  showHeatmap: false,
  flyToLocation: null,
  selectedThreat: null,
  selectedThreatId: null,
  setSelectedThreat: (threat) => set({ selectedThreat: threat }),
  setSelectedThreatId: (id) => set({ selectedThreatId: id }),
  filters: {
    types: ['DRONE', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'KAB', 'AIRCRAFT', 'ALERT', 'ZIRCON', 'KH101', 'ISKANDER', 'KINZHAL', 'KALIBR', 'PPO', 'RECON', 'FPV', 'UNKNOWN', 'MOLNIYA', 'DECOY'],
    showArchived: false,
    minConfidence: 0.0,
  },
  setThreats: (threats) => set({ threats }),
  updateThreat: (newThreat) => set((state) => {
    const existingIndex = state.threats.findIndex(t => t.id === newThreat.id);
    if (existingIndex >= 0) {
      const newThreats = [...state.threats];
      newThreats[existingIndex] = newThreat;
      return { threats: newThreats };
    }
    return { threats: [...state.threats, newThreat] };
  }),
  addExplosion: (exp) => set((state) => ({ explosions: [...state.explosions, exp] })),
  removeExplosion: (id) => set((state) => ({ explosions: state.explosions.filter(e => e.id !== id) })),
  setAlerts: (alerts) => set({ alerts }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [message, ...state.messages].slice(0, 500) })),
  cleanupMessages: () => set((state) => {
    const threshold = Date.now() - 30 * 60 * 1000;
    return { messages: state.messages.filter(m => new Date(m.timestamp).getTime() >= threshold) };
  }),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  setAboutOpen: (open) => set({ isAboutOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setIs3D: (val) => set({ is3D: val }),
  setShowHeatmap: (val) => set({ showHeatmap: val }),
  setFlyToLocation: (loc) => set({ flyToLocation: loc }),
}));
