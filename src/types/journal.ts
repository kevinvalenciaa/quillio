// ============================================
// QUILLIO - FOUNDER EXECUTION ACCOUNTABILITY SYSTEM
// Core Type Definitions
// ============================================

// ============================================
// CAPTURE TYPES
// ============================================

export type CaptureSource = 'voice' | 'text' | 'slack' | 'email' | 'browser' | 'shortcut';
export type CaptureCategory = 'decision' | 'concern' | 'idea' | 'progress' | 'uncategorized';
export type CaptureUrgency = 'time-sensitive' | 'normal';

export interface Capture {
  id: string;
  content: string;
  timestamp: number;
  source: CaptureSource;
  category: CaptureCategory;
  urgency: CaptureUrgency;
  tags: string[];
  processed: boolean;
  linkedDecisionId?: string;
}

// ============================================
// DECISION TYPES
// ============================================

export type DecisionStatus = 'active-loop' | 'locked' | 'deferred' | 'dismissed';

export interface DecisionOption {
  id: string;
  label: string;
  selected: boolean;
}

export interface Decision {
  id: string;
  title: string;
  status: DecisionStatus;
  createdAt: number;
  updatedAt: number;
  lockedAt?: number;
  deferredUntil?: number;
  
  // Context
  mentionCount: number;
  firstMentioned: number;
  lastMentioned: number;
  associatedCaptureIds: string[];
  
  // Resolution (when locked)
  selectedOption?: string;
  reasoning?: string;
  nextStep?: string;
  
  // Options (auto-detected or manual)
  options: DecisionOption[];
  
  // Execution tracking
  executionStatus?: 'not-started' | 'in-progress' | 'completed';
  executionProgress?: number; // 0-100
}

// ============================================
// PRIORITY TYPES
// ============================================

export type PriorityCategory = 'business' | 'leadership' | 'personal';

export interface Priority {
  id: string;
  content: string;
  category: PriorityCategory;
  importance: number; // 0-100
  weekOf: number; // timestamp of Monday
  createdAt: number;
  
  // Execution
  allocatedTime: number; // percentage
  actualTime?: number; // percentage (filled in Friday)
  calendarBlockIds?: string[];
  status: 'pending' | 'on-track' | 'behind' | 'missed' | 'completed';
}

// ============================================
// FOUNDER CONTEXT TYPES
// ============================================

export interface FounderContext {
  // Financial
  cashReserves: number; // in dollars
  monthlyBurnRate: number; // in dollars
  monthlyRevenue: number; // in dollars
  runway: number; // in days (calculated)
  
  // Growth
  weeklyGrowthRate: number; // percentage
  weeklyGrowthTarget: number; // percentage (default 5-7%)
  
  // Team
  teamSize: number;
  
  // Strategic
  quarterlyGoals: string[];
  
  // Status
  defaultAliveStatus: 'alive' | 'dead' | 'uncertain';
  
  // Timestamps
  lastUpdated: number;
  dataSource: 'manual' | 'integrated' | 'mixed';
}

// ============================================
// TIME ALLOCATION TYPES
// ============================================

export type TimeCategory = 'operational' | 'strategic' | 'sales-growth' | 'meetings' | 'admin' | 'other';

export interface TimeAllocation {
  weekOf: number; // timestamp of Monday
  categories: {
    category: TimeCategory;
    percentage: number;
    hours: number;
  }[];
  totalHours: number;
}

// ============================================
// WEEKLY RITUAL TYPES
// ============================================

export interface WeeklyRitual {
  id: string;
  weekOf: number; // timestamp of Monday
  completedAt?: number;
  
  // Section completions
  decisionsReviewed: boolean;
  prioritiesSet: boolean;
  executionCommitted: boolean;
  
  // Data snapshots
  decisionsLockedIds: string[];
  priorityIds: string[];
  calendarBlocksCreated: number;
}

export interface WeeklyRecap {
  id: string;
  weekOf: number;
  generatedAt: number;
  viewedAt?: number;
  
  // Time allocation analysis
  timeAllocation: TimeAllocation;
  priorityGap: number; // percentage gap between stated vs actual
  
  // Runway analysis
  runwayAtStart: number;
  runwayAtEnd: number;
  runwayChange: number;
  
  // Decision analysis
  decisionsLocked: number;
  decisionsDeferred: number;
  loopsRemaining: number;
  
  // Insights
  insights: string[];
}

// ============================================
// INTEGRATION TYPES
// ============================================

export type IntegrationType = 'slack' | 'google-calendar' | 'stripe' | 'linear' | 'notion' | 'quickbooks' | 'xero';

export interface Integration {
  type: IntegrationType;
  connected: boolean;
  lastSynced?: number;
  authToken?: string;
  settings: Record<string, unknown>;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationSettings {
  mondayRitualReminder: {
    enabled: boolean;
    time: string; // "09:00"
  };
  fridayRecapReminder: {
    enabled: boolean;
    time: string; // "16:00"
  };
  decisionLoopAlerts: boolean;
  timeSensitiveCaptures: boolean;
}

// ============================================
// USER PREFERENCES (Extended)
// ============================================

export interface UserPreferences {
  // Onboarding
  hasCompletedOnboarding: boolean;
  hasCompletedContextSetup: boolean;
  
  // Capture preferences
  enabledCaptureSurfaces: CaptureSource[];
  keyboardShortcut: string; // e.g., "Cmd+Shift+C"
  
  // Privacy
  privacyLevel: 'device' | 'balanced' | 'cloud';
  dataRetention: '1-year' | '2-years' | 'forever';
  
  // Display
  theme: 'dark' | 'light' | 'system';
}

// ============================================
// APP STATE
// ============================================

export interface AppState {
  captures: Capture[];
  decisions: Decision[];
  priorities: Priority[];
  founderContext: FounderContext;
  integrations: Integration[];
  weeklyRituals: WeeklyRitual[];
  weeklyRecaps: WeeklyRecap[];
  preferences: UserPreferences;
  notifications: NotificationSettings;
}

// ============================================
// LEGACY TYPES (for backward compatibility)
// ============================================

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
