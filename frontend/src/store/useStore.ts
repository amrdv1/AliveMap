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

export interface MonitoringMessage {
  id: string;
  text: string;
  channelName: string;
  timestamp: string;
  tags: string[];
}

export type AlertsData = Record<string, any>;

export interface AppState {
  threats: ThreatObject[];
  alerts: AlertsData;
  messages: MonitoringMessage[];
  filters: {
    types: ReportType[];
    showArchived: boolean;
    minConfidence: number;
  };
  isAboutOpen: boolean;
  setThreats: (threats: ThreatObject[]) => void;
  updateThreat: (threat: ThreatObject) => void;
  setAlerts: (alerts: AlertsData) => void;
  setMessages: (messages: MonitoringMessage[]) => void;
  addMessage: (message: MonitoringMessage) => void;
  setFilter: (key: keyof AppState['filters'], value: any) => void;
  setAboutOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  threats: [],
  alerts: {},
  messages: [],
  isAboutOpen: false,
  filters: {
    types: ['DRONE', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'KAB', 'AIRCRAFT', 'ALERT'],
    showArchived: false,
    minConfidence: 0.5,
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
  setAlerts: (alerts) => set({ alerts }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [message, ...state.messages].slice(0, 50) })),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  setAboutOpen: (isAboutOpen) => set({ isAboutOpen })
}));
