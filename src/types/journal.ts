export interface JournalEntry {
  id: string;
  content: string;
  timestamp: number;
  type: 'user' | 'ai' | 'suggestion';
  tags?: string[];
  canvasId?: string;
}

export interface AIConfig {
  apiKey: string;
  enabled: boolean;
}

export interface UserPreferences {
  thinkingStyle: 'journal' | 'overthink' | 'patterns';
  inputMethods: {
    handwriting: boolean;
    voice: boolean;
    typing: boolean;
  };
  privacyLevel: 'device' | 'balanced' | 'cloud';
  hasCompletedOnboarding: boolean;
}

export interface CanvasSession {
  id: string;
  title: string;
  createdAt: number;
  lastModified: number;
  elements: CanvasElement[];
  summary?: string;
  nextStep?: string;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'handwriting' | 'voice' | 'group';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface Pattern {
  topic: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'mixed';
  firstMention: number;
  lastMention: number;
}
