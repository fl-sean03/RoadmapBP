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
      roadmaps: {
        Row: {
          id: string
          created_at: string
          user_input: string
          expanded_brief: Json
          phases: Json
          markdowns: Json
          executive_summaries: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_input: string
          expanded_brief: Json
          phases: Json
          markdowns: Json
          executive_summaries: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_input?: string
          expanded_brief?: Json
          phases?: Json
          markdowns?: Json
          executive_summaries?: Json
        }
      }
      feedback: {
        Row: {
          id: string
          created_at: string
          roadmap_id: string | null
          sentiment: string
          email: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          roadmap_id?: string | null
          sentiment: string
          email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          roadmap_id?: string | null
          sentiment?: string
          email?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
} 