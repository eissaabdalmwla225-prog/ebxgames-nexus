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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          placement: string
          sort_order: number
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          placement?: string
          sort_order?: number
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          placement?: string
          sort_order?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          episode_number: number
          id: string
          media_id: string
          season: number
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          episode_number: number
          id?: string
          media_id: string
          season?: number
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          episode_number?: number
          id?: string
          media_id?: string
          season?: number
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      game_packages: {
        Row: {
          amount: number
          created_at: string
          currency: string
          game_id: string
          id: string
          price: number
          sort_order: number
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          game_id: string
          id?: string
          price: number
          sort_order?: number
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          game_id?: string
          id?: string
          price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_packages_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      leagues: {
        Row: {
          country: string | null
          id: number
          is_featured: boolean
          logo_url: string | null
          name: string
        }
        Insert: {
          country?: string | null
          id: number
          is_featured?: boolean
          logo_url?: string | null
          name: string
        }
        Update: {
          country?: string | null
          id?: number
          is_featured?: boolean
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          ai_insight: string | null
          away_logo: string | null
          away_score: number | null
          away_team: string
          home_logo: string | null
          home_score: number | null
          home_team: string
          id: number
          is_live: boolean
          kickoff_at: string
          league_id: number | null
          league_name: string | null
          status: string | null
          stream_url: string | null
          updated_at: string
        }
        Insert: {
          ai_insight?: string | null
          away_logo?: string | null
          away_score?: number | null
          away_team: string
          home_logo?: string | null
          home_score?: number | null
          home_team: string
          id: number
          is_live?: boolean
          kickoff_at: string
          league_id?: number | null
          league_name?: string | null
          status?: string | null
          stream_url?: string | null
          updated_at?: string
        }
        Update: {
          ai_insight?: string | null
          away_logo?: string | null
          away_score?: number | null
          away_team?: string
          home_logo?: string | null
          home_score?: number | null
          home_team?: string
          id?: number
          is_live?: boolean
          kickoff_at?: string
          league_id?: number | null
          league_name?: string | null
          status?: string | null
          stream_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          backdrop_url: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_free: boolean
          poster_url: string | null
          price: number
          sort_order: number
          title: string
          type: string
          updated_at: string
          video_url: string | null
          year: number | null
        }
        Insert: {
          backdrop_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          poster_url?: string | null
          price?: number
          sort_order?: number
          title: string
          type: string
          updated_at?: string
          video_url?: string | null
          year?: number | null
        }
        Update: {
          backdrop_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          poster_url?: string | null
          price?: number
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
          year?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_note: string | null
          created_at: string
          final_price: number
          game_id: string
          game_name: string
          id: string
          original_price: number
          package_amount: number
          package_currency: string
          player_id: string
          promo_code: string | null
          sale_id: string
          screenshot_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          final_price: number
          game_id: string
          game_name: string
          id?: string
          original_price: number
          package_amount: number
          package_currency: string
          player_id: string
          promo_code?: string | null
          sale_id: string
          screenshot_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          final_price?: number
          game_id?: string
          game_name?: string
          id?: string
          original_price?: number
          package_amount?: number
          package_currency?: string
          player_id?: string
          promo_code?: string | null
          sale_id?: string
          screenshot_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          media_id: string
          status: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          media_id: string
          status?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          media_id?: string
          status?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_video_url: {
        Args: { _episode_id?: string; _media_id: string }
        Returns: string
      }
      is_admin: { Args: { _email: string }; Returns: boolean }
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
