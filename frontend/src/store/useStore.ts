import { create } from 'zustand';

export type ReportType = 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'ALERT';
export type ReportStatus = 'ACTIVE' | 'ARCHIVED';

export interface Report {
  id: string;
  type: ReportType;
  lat: number;
  lng: number;
  direction?: number;
  speed?: number;
  time: string;
  status: ReportStatus;
  confidence: number;
  sourceId?: string;
  createdAt: string;
}

interface AppState {
  reports: Report[];
  filters: {
    types: ReportType[];
    minConfidence: number;
    showArchived: boolean;
  };
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  updateReport: (report: Report) => void;
  setFilter: (key: keyof AppState['filters'], value: any) => void;
}

export const useStore = create<AppState>((set) => ({
  reports: [],
  filters: {
    types: ['DRONE', 'MISSILE', 'AIRCRAFT', 'ALERT'],
    minConfidence: 0,
    showArchived: false,
  },
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  updateReport: (updatedReport) => set((state) => ({
    reports: state.reports.map((r) => r.id === updatedReport.id ? updatedReport : r)
  })),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  }))
}));
