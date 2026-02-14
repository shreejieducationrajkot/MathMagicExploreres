export enum SimulationType {
  MEASUREMENT = 'MEASUREMENT',
  TIME = 'TIME',
  MONEY = 'MONEY',
  DATA = 'DATA',
  PATTERNS = 'PATTERNS',
  HOME = 'HOME'
}

export interface Coin {
  id: string;
  value: number;
  name: string;
  color: string;
  size: number;
}

export interface PatternItem {
  id: string;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'star';
}

export interface DataPoint {
  name: string;
  value: number;
  fill: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
