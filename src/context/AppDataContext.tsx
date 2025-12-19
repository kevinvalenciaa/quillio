import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  capturesApi, 
  decisionsApi, 
  prioritiesApi, 
  founderContextApi,
  type Capture as DBCapture,
  type Decision as DBDecision,
  type Priority as DBPriority,
  type FounderContext as DBFounderContext
} from '@/lib/api';

// ============================================
// TYPES
// ============================================

export interface Capture {
  id: string;
  content: string;
  timestamp: number;
  source: 'voice' | 'text' | 'slack' | 'email' | 'browser' | 'shortcut';
  category: 'decision' | 'concern' | 'idea' | 'progress' | 'uncategorized';
  urgency: 'time-sensitive' | 'normal';
  tags: string[];
  processed: boolean;
  linkedDecisionId?: string;
  audioUrl?: string;
}

export interface Decision {
  id: string;
  title: string;
  status: 'active-loop' | 'locked' | 'deferred' | 'dismissed';
  createdAt: number;
  updatedAt: number;
  mentionCount: number;
  firstMentioned: number;
  lastMentioned: number;
  associatedCaptureIds: string[];
  options: { id: string; label: string; selected: boolean }[];
  selectedOption?: string;
  reasoning?: string;
  nextStep?: string;
  lockedAt?: number;
  deferredUntil?: number;
  executionStatus?: 'not-started' | 'in-progress' | 'completed';
  executionProgress?: number;
}

export interface Priority {
  id: string;
  content: string;
  category: 'business' | 'leadership' | 'personal';
  importance: number;
  weekOf: string;
  allocatedTime: number;
  actualTime?: number;
  status: 'pending' | 'on-track' | 'behind' | 'missed' | 'completed';
}

export interface FounderContext {
  cashReserves: number;
  monthlyBurnRate: number;
  monthlyRevenue: number;
  runway: number;
  weeklyGrowthRate: number;
  weeklyGrowthTarget: number;
  teamSize: number;
  quarterlyGoals: string[];
  defaultAliveStatus: 'alive' | 'dead' | 'uncertain';
  lastUpdated: number;
  dataSource: 'manual' | 'integrated' | 'mixed';
}

interface AppDataContextType {
  // Data
  captures: Capture[];
  decisions: Decision[];
  priorities: Priority[];
  founderContext: FounderContext;
  
  // Loading states
  loading: boolean;
  
  // Actions
  addCapture: (content: string, source: Capture['source'], audioUrl?: string) => Promise<Capture | null>;
  lockDecision: (id: string, option: string, reasoning: string, nextStep: string) => Promise<void>;
  deferDecision: (id: string, until: number) => Promise<void>;
  setPriorities: (priorities: Priority[]) => Promise<void>;
  setFounderContext: (context: Partial<FounderContext>) => Promise<void>;
  refreshData: () => Promise<void>;
  detectDecisionLoops: () => Promise<Decision[]>;
  
  // Computed
  activeLoops: Decision[];
  lockedDecisions: Decision[];
  deferredDecisions: Decision[];
  todayCaptures: Capture[];
}

const AppDataContext = createContext<AppDataContextType | null>(null);

// ============================================
// CONVERTERS (DB <-> App)
// ============================================

function dbCaptureToApp(db: DBCapture): Capture {
  return {
    id: db.id,
    content: db.content,
    timestamp: new Date(db.created_at).getTime(),
    source: db.source,
    category: db.category,
    urgency: db.urgency,
    tags: db.tags || [],
    processed: db.processed,
    linkedDecisionId: db.linked_decision_id || undefined,
    audioUrl: db.audio_url || undefined,
  };
}

function dbDecisionToApp(db: DBDecision): Decision {
  const options = Array.isArray(db.options) 
    ? db.options.map((o: any) => ({ id: o.id, label: o.label, selected: o.selected || false }))
    : [];
  
  return {
    id: db.id,
    title: db.title,
    status: db.status,
    createdAt: new Date(db.created_at).getTime(),
    updatedAt: new Date(db.updated_at).getTime(),
    mentionCount: db.mention_count,
    firstMentioned: new Date(db.first_mentioned).getTime(),
    lastMentioned: new Date(db.last_mentioned).getTime(),
    associatedCaptureIds: [],
    options,
    selectedOption: db.selected_option || undefined,
    reasoning: db.reasoning || undefined,
    nextStep: db.next_step || undefined,
    lockedAt: db.locked_at ? new Date(db.locked_at).getTime() : undefined,
    deferredUntil: db.deferred_until ? new Date(db.deferred_until).getTime() : undefined,
    executionStatus: db.execution_status || undefined,
    executionProgress: db.execution_progress || undefined,
  };
}

function dbPriorityToApp(db: DBPriority): Priority {
  return {
    id: db.id,
    content: db.content,
    category: db.category,
    importance: db.importance,
    weekOf: db.week_of,
    allocatedTime: db.allocated_time,
    actualTime: db.actual_time || undefined,
    status: db.status,
  };
}

function dbContextToApp(db: DBFounderContext): FounderContext {
  return {
    cashReserves: db.cash_reserves,
    monthlyBurnRate: db.monthly_burn_rate,
    monthlyRevenue: db.monthly_revenue,
    runway: db.runway_days,
    weeklyGrowthRate: db.weekly_growth_rate,
    weeklyGrowthTarget: db.weekly_growth_target,
    teamSize: db.team_size,
    quarterlyGoals: db.quarterly_goals || [],
    defaultAliveStatus: db.default_alive_status,
    lastUpdated: new Date(db.updated_at).getTime(),
    dataSource: db.data_source,
  };
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultFounderContext: FounderContext = {
  cashReserves: 0,
  monthlyBurnRate: 0,
  monthlyRevenue: 0,
  runway: 0,
  weeklyGrowthRate: 0,
  weeklyGrowthTarget: 5,
  teamSize: 1,
  quarterlyGoals: [],
  defaultAliveStatus: 'uncertain',
  lastUpdated: Date.now(),
  dataSource: 'manual',
};

// ============================================
// PROVIDER
// ============================================

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [priorities, setPrioritiesState] = useState<Priority[]>([]);
  const [founderContext, setFounderContextState] = useState<FounderContext>(defaultFounderContext);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const refreshData = useCallback(async () => {
    if (!user) {
      setCaptures([]);
      setDecisions([]);
      setPrioritiesState([]);
      setFounderContextState(defaultFounderContext);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [capturesData, decisionsData, prioritiesData, contextData] = await Promise.all([
        capturesApi.getAll(100),
        decisionsApi.getAll(),
        prioritiesApi.getCurrentWeek(),
        founderContextApi.get(),
      ]);

      setCaptures((capturesData || []).map(dbCaptureToApp));
      setDecisions((decisionsData || []).map(dbDecisionToApp));
      setPrioritiesState((prioritiesData || []).map(dbPriorityToApp));
      
      if (contextData) {
        setFounderContextState(dbContextToApp(contextData));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to captures changes
    const capturesChannel = supabase
      .channel('captures-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'captures', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCapture = dbCaptureToApp(payload.new as DBCapture);
            setCaptures(prev => [newCapture, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = dbCaptureToApp(payload.new as DBCapture);
            setCaptures(prev => prev.map(c => c.id === updated.id ? updated : c));
          } else if (payload.eventType === 'DELETE') {
            setCaptures(prev => prev.filter(c => c.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    // Subscribe to decisions changes
    const decisionsChannel = supabase
      .channel('decisions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newDecision = dbDecisionToApp(payload.new as DBDecision);
            setDecisions(prev => [newDecision, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = dbDecisionToApp(payload.new as DBDecision);
            setDecisions(prev => prev.map(d => d.id === updated.id ? updated : d));
          } else if (payload.eventType === 'DELETE') {
            setDecisions(prev => prev.filter(d => d.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      capturesChannel.unsubscribe();
      decisionsChannel.unsubscribe();
    };
  }, [user]);

  // Actions
  const addCapture = async (content: string, source: Capture['source'], audioUrl?: string): Promise<Capture | null> => {
    if (!user) {
      console.error('addCapture: No user logged in');
      return null;
    }
    
    console.log('addCapture: Creating capture', { userId: user.id, content: content.slice(0, 50), source });
    
    try {
      const created = await capturesApi.create({
        user_id: user.id,
        content,
        source,
        audio_url: audioUrl,
      });
      
      console.log('addCapture: Successfully created', created);
      
      const newCapture = dbCaptureToApp(created);
      
      // Update state immediately (real-time subscription will also fire, but that's OK - we dedupe by id)
      setCaptures(prev => {
        // Check if capture already exists (from real-time)
        if (prev.some(c => c.id === newCapture.id)) {
          return prev;
        }
        return [newCapture, ...prev];
      });
      
      // After every 5th capture, check for decision loops
      const captureCount = captures.length + 1;
      if (captureCount % 5 === 0) {
        console.log('Checking for decision loops...');
        // Run loop detection in background (don't await)
        detectDecisionLoopsInternal().catch(console.error);
      }
      
      return newCapture;
    } catch (error) {
      console.error('Error creating capture:', error);
      return null;
    }
  };
  
  // Internal loop detection (to avoid circular dependency)
  const detectDecisionLoopsInternal = async (): Promise<Decision[]> => {
    if (!user) return [];
    
    // Get captures from last 14 days
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const recentCaptures = captures.filter(c => c.timestamp >= twoWeeksAgo);
    
    if (recentCaptures.length < 3) return [];
    
    // Extract key phrases from captures
    const keywordGroups = extractKeywordGroups(recentCaptures);
    
    // Find groups mentioned 3+ times
    const potentialLoops = keywordGroups.filter(group => group.count >= 3);
    
    // Create decisions for new loops
    const newDecisions: Decision[] = [];
    
    for (const loop of potentialLoops) {
      const existingSimilar = decisions.find(d => 
        d.status === 'active-loop' && 
        d.title.toLowerCase().includes(loop.keyword.toLowerCase())
      );
      
      if (!existingSimilar) {
        try {
          const created = await decisionsApi.create({
            user_id: user.id,
            title: `Decision needed: ${loop.keyword}`,
            status: 'active-loop',
            mention_count: loop.count,
            first_mentioned: new Date(loop.firstMentioned).toISOString(),
            last_mentioned: new Date(loop.lastMentioned).toISOString(),
            options: [],
          });
          
          const newDecision = dbDecisionToApp(created);
          newDecisions.push(newDecision);
          setDecisions(prev => [newDecision, ...prev]);
        } catch (error) {
          console.error('Error creating decision loop:', error);
        }
      }
    }
    
    return newDecisions;
  };

  const lockDecision = async (id: string, option: string, reasoning: string, nextStep: string) => {
    try {
      await decisionsApi.lock(id, option, reasoning, nextStep);
      // Real-time will handle state update
    } catch (error) {
      console.error('Error locking decision:', error);
    }
  };

  const deferDecision = async (id: string, until: number) => {
    try {
      await decisionsApi.defer(id, new Date(until));
      // Real-time will handle state update
    } catch (error) {
      console.error('Error deferring decision:', error);
    }
  };

  const setPriorities = async (newPriorities: Priority[]) => {
    if (!user) return;

    try {
      const monday = getMonday(new Date());
      const weekOf = monday.toISOString().split('T')[0];

      await prioritiesApi.deleteForWeek(user.id, monday);

      for (const priority of newPriorities) {
        await prioritiesApi.create({
          user_id: user.id,
          content: priority.content,
          category: priority.category,
          importance: priority.importance,
          week_of: weekOf,
          allocated_time: priority.allocatedTime,
        });
      }
      
      await refreshData();
    } catch (error) {
      console.error('Error setting priorities:', error);
    }
  };

  const setFounderContext = async (context: Partial<FounderContext>) => {
    try {
      await founderContextApi.upsert({
        cash_reserves: context.cashReserves,
        monthly_burn_rate: context.monthlyBurnRate,
        monthly_revenue: context.monthlyRevenue,
        weekly_growth_rate: context.weeklyGrowthRate,
        weekly_growth_target: context.weeklyGrowthTarget,
        team_size: context.teamSize,
        quarterly_goals: context.quarterlyGoals,
        data_source: context.dataSource,
      });
      
      setFounderContextState(prev => ({ ...prev, ...context, lastUpdated: Date.now() }));
    } catch (error) {
      console.error('Error updating founder context:', error);
    }
  };

  // Decision Loop Detection (public API)
  const detectDecisionLoops = async (): Promise<Decision[]> => {
    return detectDecisionLoopsInternal();
  };

  // Computed values
  const activeLoops = decisions.filter(d => d.status === 'active-loop');
  const lockedDecisions = decisions.filter(d => d.status === 'locked');
  const deferredDecisions = decisions.filter(d => d.status === 'deferred');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCaptures = captures.filter(c => c.timestamp >= today.getTime());

  const value: AppDataContextType = {
    captures,
    decisions,
    priorities,
    founderContext,
    loading,
    addCapture,
    lockDecision,
    deferDecision,
    setPriorities,
    setFounderContext,
    refreshData,
    detectDecisionLoops,
    activeLoops,
    lockedDecisions,
    deferredDecisions,
    todayCaptures,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

// ============================================
// HELPERS
// ============================================

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Common keywords to ignore when detecting decision loops
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
  'its', 'our', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'any',
  'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
  'now', 'here', 'there', 'then', 'once', 'about', 'after', 'before', 'into',
  'through', 'during', 'under', 'again', 'further', 'if', 'because', 'until',
  'while', 'although', 'though', 'since', 'unless', 'whether', 'need', 'think',
  'thinking', 'want', 'going', 'get', 'got', 'make', 'made', 'still', 'maybe',
  'really', 'actually', 'probably', 'something', 'anything', 'everything',
]);

// Keywords that indicate a decision is being considered
const DECISION_INDICATORS = [
  'should', 'whether', 'decide', 'decision', 'choice', 'option', 'options',
  'vs', 'versus', 'or', 'either', 'alternative', 'considering', 'debating',
  'wondering', 'unsure', 'uncertain', 'pricing', 'hire', 'hiring', 'strategy',
  'pivot', 'launch', 'ship', 'build', 'buy', 'invest', 'focus', 'prioritize',
];

interface KeywordGroup {
  keyword: string;
  count: number;
  captures: string[];
  firstMentioned: number;
  lastMentioned: number;
}

function extractKeywordGroups(captures: Capture[]): KeywordGroup[] {
  const keywordMap = new Map<string, KeywordGroup>();
  
  for (const capture of captures) {
    // Extract significant phrases (2-4 word combinations)
    const words = capture.content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    
    // Check if this capture contains decision indicators
    const hasDecisionIndicator = DECISION_INDICATORS.some(indicator => 
      capture.content.toLowerCase().includes(indicator)
    );
    
    if (!hasDecisionIndicator && capture.category !== 'decision') {
      continue; // Skip captures that don't seem to be about decisions
    }
    
    // Create 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase2 = `${words[i]} ${words[i + 1]}`;
      const phrase3 = i < words.length - 2 ? `${words[i]} ${words[i + 1]} ${words[i + 2]}` : null;
      
      // Add 2-word phrase
      if (phrase2.length > 5) {
        const existing = keywordMap.get(phrase2);
        if (existing) {
          existing.count++;
          existing.captures.push(capture.id);
          existing.lastMentioned = Math.max(existing.lastMentioned, capture.timestamp);
        } else {
          keywordMap.set(phrase2, {
            keyword: phrase2,
            count: 1,
            captures: [capture.id],
            firstMentioned: capture.timestamp,
            lastMentioned: capture.timestamp,
          });
        }
      }
      
      // Add 3-word phrase
      if (phrase3 && phrase3.length > 8) {
        const existing = keywordMap.get(phrase3);
        if (existing) {
          existing.count++;
          existing.captures.push(capture.id);
          existing.lastMentioned = Math.max(existing.lastMentioned, capture.timestamp);
        } else {
          keywordMap.set(phrase3, {
            keyword: phrase3,
            count: 1,
            captures: [capture.id],
            firstMentioned: capture.timestamp,
            lastMentioned: capture.timestamp,
          });
        }
      }
    }
    
    // Also check for single important keywords
    for (const word of words) {
      if (DECISION_INDICATORS.includes(word) || word.length > 6) {
        const existing = keywordMap.get(word);
        if (existing) {
          existing.count++;
          if (!existing.captures.includes(capture.id)) {
            existing.captures.push(capture.id);
          }
          existing.lastMentioned = Math.max(existing.lastMentioned, capture.timestamp);
        } else {
          keywordMap.set(word, {
            keyword: word,
            count: 1,
            captures: [capture.id],
            firstMentioned: capture.timestamp,
            lastMentioned: capture.timestamp,
          });
        }
      }
    }
  }
  
  // Return groups sorted by count, filtered to unique captures
  return Array.from(keywordMap.values())
    .filter(group => {
      // Only return groups with 3+ unique captures mentioning this topic
      const uniqueCaptures = new Set(group.captures);
      return uniqueCaptures.size >= 3;
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Limit to top 10 potential loops
}
