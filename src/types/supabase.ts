export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      founder_context: {
        Row: {
          id: string
          user_id: string
          cash_reserves: number
          monthly_burn_rate: number
          monthly_revenue: number
          runway_days: number
          weekly_growth_rate: number
          weekly_growth_target: number
          team_size: number
          quarterly_goals: string[]
          default_alive_status: 'alive' | 'dead' | 'uncertain'
          data_source: 'manual' | 'integrated' | 'mixed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cash_reserves?: number
          monthly_burn_rate?: number
          monthly_revenue?: number
          runway_days?: number
          weekly_growth_rate?: number
          weekly_growth_target?: number
          team_size?: number
          quarterly_goals?: string[]
          default_alive_status?: 'alive' | 'dead' | 'uncertain'
          data_source?: 'manual' | 'integrated' | 'mixed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          cash_reserves?: number
          monthly_burn_rate?: number
          monthly_revenue?: number
          runway_days?: number
          weekly_growth_rate?: number
          weekly_growth_target?: number
          team_size?: number
          quarterly_goals?: string[]
          default_alive_status?: 'alive' | 'dead' | 'uncertain'
          data_source?: 'manual' | 'integrated' | 'mixed'
          updated_at?: string
        }
      }
      captures: {
        Row: {
          id: string
          user_id: string
          content: string
          source: 'voice' | 'text' | 'slack' | 'email' | 'browser' | 'shortcut'
          category: 'decision' | 'concern' | 'idea' | 'progress' | 'uncategorized'
          urgency: 'time-sensitive' | 'normal'
          tags: string[]
          processed: boolean
          linked_decision_id: string | null
          audio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          source: 'voice' | 'text' | 'slack' | 'email' | 'browser' | 'shortcut'
          category?: 'decision' | 'concern' | 'idea' | 'progress' | 'uncategorized'
          urgency?: 'time-sensitive' | 'normal'
          tags?: string[]
          processed?: boolean
          linked_decision_id?: string | null
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          source?: 'voice' | 'text' | 'slack' | 'email' | 'browser' | 'shortcut'
          category?: 'decision' | 'concern' | 'idea' | 'progress' | 'uncategorized'
          urgency?: 'time-sensitive' | 'normal'
          tags?: string[]
          processed?: boolean
          linked_decision_id?: string | null
          audio_url?: string | null
          updated_at?: string
        }
      }
      decisions: {
        Row: {
          id: string
          user_id: string
          title: string
          status: 'active-loop' | 'locked' | 'deferred' | 'dismissed'
          mention_count: number
          first_mentioned: string
          last_mentioned: string
          options: Json
          selected_option: string | null
          reasoning: string | null
          next_step: string | null
          locked_at: string | null
          deferred_until: string | null
          execution_status: 'not-started' | 'in-progress' | 'completed' | null
          execution_progress: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          status?: 'active-loop' | 'locked' | 'deferred' | 'dismissed'
          mention_count?: number
          first_mentioned?: string
          last_mentioned?: string
          options?: Json
          selected_option?: string | null
          reasoning?: string | null
          next_step?: string | null
          locked_at?: string | null
          deferred_until?: string | null
          execution_status?: 'not-started' | 'in-progress' | 'completed' | null
          execution_progress?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          status?: 'active-loop' | 'locked' | 'deferred' | 'dismissed'
          mention_count?: number
          last_mentioned?: string
          options?: Json
          selected_option?: string | null
          reasoning?: string | null
          next_step?: string | null
          locked_at?: string | null
          deferred_until?: string | null
          execution_status?: 'not-started' | 'in-progress' | 'completed' | null
          execution_progress?: number | null
          updated_at?: string
        }
      }
      decision_captures: {
        Row: {
          decision_id: string
          capture_id: string
          created_at: string
        }
        Insert: {
          decision_id: string
          capture_id: string
          created_at?: string
        }
        Update: never
      }
      priorities: {
        Row: {
          id: string
          user_id: string
          content: string
          category: 'business' | 'leadership' | 'personal'
          importance: number
          week_of: string
          allocated_time: number
          actual_time: number | null
          status: 'pending' | 'on-track' | 'behind' | 'missed' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          category: 'business' | 'leadership' | 'personal'
          importance?: number
          week_of: string
          allocated_time?: number
          actual_time?: number | null
          status?: 'pending' | 'on-track' | 'behind' | 'missed' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          category?: 'business' | 'leadership' | 'personal'
          importance?: number
          allocated_time?: number
          actual_time?: number | null
          status?: 'pending' | 'on-track' | 'behind' | 'missed' | 'completed'
          updated_at?: string
        }
      }
      weekly_rituals: {
        Row: {
          id: string
          user_id: string
          week_of: string
          completed_at: string | null
          decisions_reviewed: boolean
          priorities_set: boolean
          execution_committed: boolean
          calendar_blocks_created: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_of: string
          completed_at?: string | null
          decisions_reviewed?: boolean
          priorities_set?: boolean
          execution_committed?: boolean
          calendar_blocks_created?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          decisions_reviewed?: boolean
          priorities_set?: boolean
          execution_committed?: boolean
          calendar_blocks_created?: number
          updated_at?: string
        }
      }
      weekly_recaps: {
        Row: {
          id: string
          user_id: string
          week_of: string
          time_allocation: Json
          priority_gap: number
          runway_at_start: number
          runway_at_end: number
          decisions_locked: number
          decisions_deferred: number
          loops_remaining: number
          insights: string[]
          viewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_of: string
          time_allocation?: Json
          priority_gap?: number
          runway_at_start?: number
          runway_at_end?: number
          decisions_locked?: number
          decisions_deferred?: number
          loops_remaining?: number
          insights?: string[]
          viewed_at?: string | null
          created_at?: string
        }
        Update: {
          time_allocation?: Json
          priority_gap?: number
          insights?: string[]
          viewed_at?: string | null
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          type: 'slack' | 'google-calendar' | 'stripe' | 'linear' | 'notion' | 'quickbooks' | 'xero'
          connected: boolean
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          settings: Json
          last_synced: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'slack' | 'google-calendar' | 'stripe' | 'linear' | 'notion' | 'quickbooks' | 'xero'
          connected?: boolean
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          settings?: Json
          last_synced?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          connected?: boolean
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          settings?: Json
          last_synced?: string | null
          updated_at?: string
        }
      }
      calendar_blocks: {
        Row: {
          id: string
          user_id: string
          priority_id: string | null
          external_event_id: string | null
          title: string
          start_time: string
          end_time: string
          protected: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          priority_id?: string | null
          external_event_id?: string | null
          title: string
          start_time: string
          end_time: string
          protected?: boolean
          created_at?: string
        }
        Update: {
          priority_id?: string | null
          external_event_id?: string | null
          title?: string
          start_time?: string
          end_time?: string
          protected?: boolean
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          monday_reminder_enabled: boolean
          monday_reminder_time: string
          friday_reminder_enabled: boolean
          friday_reminder_time: string
          decision_loop_alerts: boolean
          time_sensitive_captures: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          monday_reminder_enabled?: boolean
          monday_reminder_time?: string
          friday_reminder_enabled?: boolean
          friday_reminder_time?: string
          decision_loop_alerts?: boolean
          time_sensitive_captures?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          monday_reminder_enabled?: boolean
          monday_reminder_time?: string
          friday_reminder_enabled?: boolean
          friday_reminder_time?: string
          decision_loop_alerts?: boolean
          time_sensitive_captures?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

