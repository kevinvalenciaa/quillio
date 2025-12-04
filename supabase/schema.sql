-- ============================================
-- QUILLIO DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FOUNDER CONTEXT TABLE
-- ============================================
CREATE TABLE public.founder_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cash_reserves NUMERIC DEFAULT 0,
  monthly_burn_rate NUMERIC DEFAULT 0,
  monthly_revenue NUMERIC DEFAULT 0,
  runway_days INTEGER DEFAULT 0,
  weekly_growth_rate NUMERIC DEFAULT 0,
  weekly_growth_target NUMERIC DEFAULT 5,
  team_size INTEGER DEFAULT 1,
  quarterly_goals TEXT[] DEFAULT '{}',
  default_alive_status TEXT DEFAULT 'uncertain' CHECK (default_alive_status IN ('alive', 'dead', 'uncertain')),
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'integrated', 'mixed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.founder_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own context" ON public.founder_context
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 3. CAPTURES TABLE
-- ============================================
CREATE TABLE public.captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('voice', 'text', 'slack', 'email', 'browser', 'shortcut')),
  category TEXT DEFAULT 'uncategorized' CHECK (category IN ('decision', 'concern', 'idea', 'progress', 'uncategorized')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('time-sensitive', 'normal')),
  tags TEXT[] DEFAULT '{}',
  processed BOOLEAN DEFAULT FALSE,
  linked_decision_id UUID,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own captures" ON public.captures
  FOR ALL USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_captures_user_created ON public.captures(user_id, created_at DESC);
CREATE INDEX idx_captures_processed ON public.captures(user_id, processed);

-- ============================================
-- 4. DECISIONS TABLE
-- ============================================
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active-loop' CHECK (status IN ('active-loop', 'locked', 'deferred', 'dismissed')),
  mention_count INTEGER DEFAULT 1,
  first_mentioned TIMESTAMPTZ DEFAULT NOW(),
  last_mentioned TIMESTAMPTZ DEFAULT NOW(),
  options JSONB DEFAULT '[]',
  selected_option TEXT,
  reasoning TEXT,
  next_step TEXT,
  locked_at TIMESTAMPTZ,
  deferred_until TIMESTAMPTZ,
  execution_status TEXT CHECK (execution_status IN ('not-started', 'in-progress', 'completed')),
  execution_progress INTEGER DEFAULT 0 CHECK (execution_progress >= 0 AND execution_progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own decisions" ON public.decisions
  FOR ALL USING (auth.uid() = user_id);

-- Index for active loops
CREATE INDEX idx_decisions_status ON public.decisions(user_id, status);

-- ============================================
-- 5. DECISION-CAPTURES JUNCTION TABLE
-- ============================================
CREATE TABLE public.decision_captures (
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  capture_id UUID NOT NULL REFERENCES public.captures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (decision_id, capture_id)
);

ALTER TABLE public.decision_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own decision captures" ON public.decision_captures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.decisions WHERE id = decision_id AND user_id = auth.uid())
  );

-- ============================================
-- 6. PRIORITIES TABLE
-- ============================================
CREATE TABLE public.priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('business', 'leadership', 'personal')),
  importance INTEGER DEFAULT 50 CHECK (importance >= 0 AND importance <= 100),
  week_of DATE NOT NULL,
  allocated_time INTEGER DEFAULT 0 CHECK (allocated_time >= 0 AND allocated_time <= 100),
  actual_time INTEGER CHECK (actual_time >= 0 AND actual_time <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'on-track', 'behind', 'missed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own priorities" ON public.priorities
  FOR ALL USING (auth.uid() = user_id);

-- Index for weekly queries
CREATE INDEX idx_priorities_week ON public.priorities(user_id, week_of);

-- ============================================
-- 7. WEEKLY RITUALS TABLE
-- ============================================
CREATE TABLE public.weekly_rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  decisions_reviewed BOOLEAN DEFAULT FALSE,
  priorities_set BOOLEAN DEFAULT FALSE,
  execution_committed BOOLEAN DEFAULT FALSE,
  calendar_blocks_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_of)
);

ALTER TABLE public.weekly_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rituals" ON public.weekly_rituals
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 8. WEEKLY RECAPS TABLE
-- ============================================
CREATE TABLE public.weekly_recaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  time_allocation JSONB DEFAULT '{}',
  priority_gap INTEGER DEFAULT 0,
  runway_at_start INTEGER DEFAULT 0,
  runway_at_end INTEGER DEFAULT 0,
  decisions_locked INTEGER DEFAULT 0,
  decisions_deferred INTEGER DEFAULT 0,
  loops_remaining INTEGER DEFAULT 0,
  insights TEXT[] DEFAULT '{}',
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_of)
);

ALTER TABLE public.weekly_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recaps" ON public.weekly_recaps
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 9. INTEGRATIONS TABLE
-- ============================================
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('slack', 'google-calendar', 'stripe', 'linear', 'notion', 'quickbooks', 'xero')),
  connected BOOLEAN DEFAULT FALSE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 10. CALENDAR BLOCKS TABLE
-- ============================================
CREATE TABLE public.calendar_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  priority_id UUID REFERENCES public.priorities(id) ON DELETE SET NULL,
  external_event_id TEXT,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  protected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar blocks" ON public.calendar_blocks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 11. NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monday_reminder_enabled BOOLEAN DEFAULT TRUE,
  monday_reminder_time TIME DEFAULT '09:00',
  friday_reminder_enabled BOOLEAN DEFAULT TRUE,
  friday_reminder_time TIME DEFAULT '16:00',
  decision_loop_alerts BOOLEAN DEFAULT TRUE,
  time_sensitive_captures BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 12. HELPER FUNCTIONS
-- ============================================

-- Function to calculate runway
CREATE OR REPLACE FUNCTION calculate_runway(
  cash NUMERIC,
  burn NUMERIC,
  revenue NUMERIC
) RETURNS INTEGER AS $$
BEGIN
  IF burn - revenue <= 0 THEN
    RETURN 365; -- Default alive
  END IF;
  RETURN ROUND(cash / (burn - revenue) * 30)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get Monday of a week
CREATE OR REPLACE FUNCTION get_week_start(d DATE)
RETURNS DATE AS $$
BEGIN
  RETURN d - (EXTRACT(ISODOW FROM d)::INTEGER - 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 13. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_founder_context_updated_at BEFORE UPDATE ON public.founder_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_captures_updated_at BEFORE UPDATE ON public.captures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_priorities_updated_at BEFORE UPDATE ON public.priorities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_weekly_rituals_updated_at BEFORE UPDATE ON public.weekly_rituals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- DONE! Your schema is ready.
-- ============================================

