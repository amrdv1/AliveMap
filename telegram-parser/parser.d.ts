export interface ParsedThreat {
    type: 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'ALERT';
    lat: number | null;
    lng: number | null;
    confidence: number;
    direction?: number;
}
export declare function parseTelegramText(text: string): ParsedThreat;
//# sourceMappingURL=parser.d.ts.map