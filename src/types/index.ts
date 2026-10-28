export interface Participant {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export type GameMode = 'lucky' | 'penalty';

export interface PenaltyItem {
  id: string;
  text: string;
}

export interface WinnerRecord {
  id: string;
  round: number;
  name: string;
  penalty?: string | null;
  mode: GameMode;
  timestamp: string; // ISO string for robust serialization
  color: string;
}

export interface ParticipantStat {
  name: string;
  color: string;
  count: number;
  percentage: number;
  penalties: string[];
  lastWonAt?: string;
}

export interface PresetList {
  title: string;
  emoji: string;
  names: string[];
}
