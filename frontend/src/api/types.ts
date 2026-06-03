export type FloodLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
}

export interface Flood {
  id: string;
  level: FloodLevel;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface FloodsResponse {
  items: Flood[];
  lastUpdatedAt: string | null;
}

export interface Signal {
  id: string;
  emoji: string;
  title: string;
  description: string;
  photos: string[];
  lat: number;
  lng: number;
  createdAt: string;
  expiresAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
}

export const FLOOD_LEVEL_LABEL: Record<FloodLevel, string> = {
  LOW: 'Pouca água no local',
  MEDIUM: 'Alagamento de até 1 metro',
  HIGH: 'Muita água no local',
};

export const FLOOD_LEVEL_INTENSITY: Record<FloodLevel, number> = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 1.0,
};
