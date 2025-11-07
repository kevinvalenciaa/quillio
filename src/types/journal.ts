export interface JournalEntry {
  id: string;
  content: string;
  timestamp: number;
  type: 'user' | 'ai';
}

export interface AIConfig {
  apiKey: string;
  enabled: boolean;
}
