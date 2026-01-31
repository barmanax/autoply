export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      application_drafts: {
        Row: {
          answers_json: Json | null
          cover_letter: string | null
          created_at: string | null
          id: string
          job_match_id: string | null
          tailoring_notes: Json | null
          version_meta: Json | null
        }
        Insert: {
          answers_json?: Json | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_match_id?: string | null
          tailoring_notes?: Json | null
          version_meta?: Json | null
        }
        Update: {
          answers_json?: Json | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_match_id?: string | null
          tailoring_notes?: Json | null
          version_meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "application_drafts_job_match_id_fkey"
            columns: ["job_match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matches: {
        Row: {
          created_at: string | null
          fit_score: number | null
          id: string
          job_post_id: string | null
          reasons: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fit_score?: number | null
          id?: string
          job_post_id?: string | null
          reasons?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fit_score?: number | null
          id?: string
          job_post_id?: string | null
          reasons?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          company: string | null
          created_at: string | null
          date_posted: string | null
          description: string | null
          id: string
          location: string | null
          source: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          date_posted?: string | null
          description?: string | null
          id?: string
          location?: string | null
          source?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          date_posted?: string | null
          description?: string | null
          id?: string
          location?: string | null
          source?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      preferences: {
        Row: {
          avoid_keywords: string[] | null
          keywords: string[] | null
          locations: string[] | null
          min_salary: number | null
          remote_ok: boolean | null
          roles: string[] | null
          sponsorship_needed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avoid_keywords?: string[] | null
          keywords?: string[] | null
          locations?: string[] | null
          min_salary?: number | null
          remote_ok?: boolean | null
          roles?: string[] | null
          sponsorship_needed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avoid_keywords?: string[] | null
          keywords?: string[] | null
          locations?: string[] | null
          min_salary?: number | null
          remote_ok?: boolean | null
          roles?: string[] | null
          sponsorship_needed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          phone_verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          phone_verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string | null
          file_path: string | null
          id: string
          resume_text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          resume_text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          resume_text?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      submission_events: {
        Row: {
          created_at: string | null
          id: string
          job_match_id: string | null
          payload: Json | null
          submitted_to: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_match_id?: string | null
          payload?: Json | null
          submitted_to?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_match_id?: string | null
          payload?: Json | null
          submitted_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_events_job_match_id_fkey"
            columns: ["job_match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
