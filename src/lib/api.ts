import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

// ============================================
// CAPTURES API
// ============================================

export type Capture = Tables['captures']['Row'];
export type CaptureInsert = Tables['captures']['Insert'];

export const capturesApi = {
  async getAll(limit = 50) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getToday() {
    const userId = await getCurrentUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getUnprocessed() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', userId)
      .eq('processed', false)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(capture: CaptureInsert) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('captures')
      .insert({ ...capture, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Capture>) {
    const userId = await getCurrentUserId();
    const { user_id, ...safeUpdates } = updates;
    const { data, error } = await supabase
      .from('captures')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('captures')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Real-time subscription
  subscribe(callback: (payload: any) => void) {
    return supabase
      .channel('captures')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'captures' 
      }, callback)
      .subscribe();
  }
};

// ============================================
// DECISIONS API
// ============================================

export type Decision = Tables['decisions']['Row'];
export type DecisionInsert = Tables['decisions']['Insert'];

export const decisionsApi = {
  async getAll() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getActiveLoops() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active-loop')
      .order('mention_count', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getLocked() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'locked')
      .order('locked_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getDeferred() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'deferred')
      .order('deferred_until', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(decision: DecisionInsert) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .insert({ ...decision, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async lock(id: string, selectedOption: string, reasoning: string, nextStep: string) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .update({
        status: 'locked',
        selected_option: selectedOption,
        reasoning,
        next_step: nextStep,
        locked_at: new Date().toISOString(),
        execution_status: 'not-started',
        execution_progress: 0
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async defer(id: string, deferUntil: Date) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .update({
        status: 'deferred',
        deferred_until: deferUntil.toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async dismiss(id: string) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .update({ status: 'dismissed' })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProgress(id: string, progress: number, status: 'not-started' | 'in-progress' | 'completed') {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('decisions')
      .update({
        execution_progress: progress,
        execution_status: status
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async incrementMention(id: string) {
    const userId = await getCurrentUserId();
    const { data: current } = await supabase
      .from('decisions')
      .select('mention_count')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    const { data, error } = await supabase
      .from('decisions')
      .update({
        mention_count: (current?.mention_count || 0) + 1,
        last_mentioned: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// PRIORITIES API
// ============================================

export type Priority = Tables['priorities']['Row'];
export type PriorityInsert = Tables['priorities']['Insert'];

export const prioritiesApi = {
  async getForWeek(weekOf: Date) {
    const userId = await getCurrentUserId();
    const monday = getMonday(weekOf);

    const { data, error } = await supabase
      .from('priorities')
      .select('*')
      .eq('user_id', userId)
      .eq('week_of', monday.toISOString().split('T')[0])
      .order('importance', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getCurrentWeek() {
    return this.getForWeek(new Date());
  },

  async create(priority: PriorityInsert) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('priorities')
      .insert({ ...priority, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Priority>) {
    const userId = await getCurrentUserId();
    const { user_id, ...safeUpdates } = updates;
    const { data, error } = await supabase
      .from('priorities')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateActualTime(id: string, actualTime: number) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('priorities')
      .update({ actual_time: actualTime })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// FOUNDER CONTEXT API
// ============================================

export type FounderContext = Tables['founder_context']['Row'];

export const founderContextApi = {
  async get() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('founder_context')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
    return data;
  },

  async upsert(context: Partial<FounderContext>) {
    const userId = await getCurrentUserId();

    // Calculate runway
    const runway = calculateRunway(
      context.cash_reserves || 0,
      context.monthly_burn_rate || 0,
      context.monthly_revenue || 0
    );

    // Calculate alive status
    const aliveStatus = getAliveStatus(
      runway,
      context.weekly_growth_rate || 0,
      context.weekly_growth_target || 5
    );

    const { data, error } = await supabase
      .from('founder_context')
      .upsert({
        user_id: userId,
        ...context,
        runway_days: runway,
        default_alive_status: aliveStatus
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// WEEKLY RITUALS API
// ============================================

export type WeeklyRitual = Tables['weekly_rituals']['Row'];

export const weeklyRitualsApi = {
  async getCurrentWeek() {
    const userId = await getCurrentUserId();
    const monday = getMonday(new Date());

    const { data, error } = await supabase
      .from('weekly_rituals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_of', monday.toISOString().split('T')[0])
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async startRitual() {
    const userId = await getCurrentUserId();

    const monday = getMonday(new Date());
    
    const { data, error } = await supabase
      .from('weekly_rituals')
      .upsert({
        user_id: userId,
        week_of: monday.toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async completeSection(section: 'decisions_reviewed' | 'priorities_set' | 'execution_committed') {
    const userId = await getCurrentUserId();
    const monday = getMonday(new Date());
    
    const updates: any = { [section]: true };
    
    // If all sections complete, mark as completed
    if (section === 'execution_committed') {
      updates.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('weekly_rituals')
      .update(updates)
      .eq('week_of', monday.toISOString().split('T')[0])
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// WEEKLY RECAPS API
// ============================================

export type WeeklyRecap = Tables['weekly_recaps']['Row'];

export const weeklyRecapsApi = {
  async getForWeek(weekOf: Date) {
    const monday = getMonday(weekOf);
    
    const { data, error } = await supabase
      .from('weekly_recaps')
      .select('*')
      .eq('week_of', monday.toISOString().split('T')[0])
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async markViewed(id: string) {
    const { data, error } = await supabase
      .from('weekly_recaps')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// INTEGRATIONS API
// ============================================

export type Integration = Tables['integrations']['Row'];

export const integrationsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('integrations')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async get(type: Integration['type']) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', type)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async connect(type: Integration['type'], tokens: { accessToken: string; refreshToken?: string; expiresAt?: Date }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        type,
        connected: true,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expires_at: tokens.expiresAt?.toISOString(),
        last_synced: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async disconnect(type: Integration['type']) {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        connected: false,
        access_token: null,
        refresh_token: null,
        token_expires_at: null
      })
      .eq('type', type)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateLastSynced(type: Integration['type']) {
    const { data, error } = await supabase
      .from('integrations')
      .update({ last_synced: new Date().toISOString() })
      .eq('type', type)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateRunway(cash: number, burn: number, revenue: number): number {
  const netBurn = burn - revenue;
  if (netBurn <= 0) return 365;
  return Math.round(cash / netBurn * 30);
}

function getAliveStatus(runway: number, growthRate: number, target: number): 'alive' | 'dead' | 'uncertain' {
  if (runway > 180) return 'alive';
  if (runway < 60 && growthRate < target * 0.5) return 'dead';
  return 'uncertain';
}

