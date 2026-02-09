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
      campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "landing_page_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      info_requests: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
        }
        Relationships: []
      }
      landing_page_templates: {
        Row: {
          about_content: string | null
          client_logos_url: string | null
          comparison_problem_items: Json | null
          comparison_problem_title: string | null
          comparison_solution_description: string | null
          comparison_solution_items: Json | null
          comparison_solution_title: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_subtitle: string | null
          contact_title: string | null
          created_at: string
          cta_banner_subtitle: string | null
          cta_banner_title: string | null
          custom_section_image_url: string | null
          feature_cards: Json | null
          features_list: Json | null
          features_subtitle: string | null
          features_title: string | null
          form_section_subtitle: string | null
          form_section_title: string | null
          hero_badge: string | null
          hero_cta_primary_text: string | null
          hero_cta_secondary_text: string | null
          hero_headline: string
          hero_subheadline: string | null
          hero_video_id: string | null
          hero_video_thumbnail_url: string | null
          id: string
          name: string
          personalization_config: Json | null
          portfolio_strip_url: string | null
          portfolio_videos: Json | null
          pricing_subtitle: string | null
          pricing_tiers: Json | null
          pricing_title: string | null
          slug: string
          testimonials: Json | null
          testimonials_subtitle: string | null
          testimonials_title: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          about_content?: string | null
          client_logos_url?: string | null
          comparison_problem_items?: Json | null
          comparison_problem_title?: string | null
          comparison_solution_description?: string | null
          comparison_solution_items?: Json | null
          comparison_solution_title?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_subtitle?: string | null
          contact_title?: string | null
          created_at?: string
          cta_banner_subtitle?: string | null
          cta_banner_title?: string | null
          custom_section_image_url?: string | null
          feature_cards?: Json | null
          features_list?: Json | null
          features_subtitle?: string | null
          features_title?: string | null
          form_section_subtitle?: string | null
          form_section_title?: string | null
          hero_badge?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_text?: string | null
          hero_headline: string
          hero_subheadline?: string | null
          hero_video_id?: string | null
          hero_video_thumbnail_url?: string | null
          id?: string
          name: string
          personalization_config?: Json | null
          portfolio_strip_url?: string | null
          portfolio_videos?: Json | null
          pricing_subtitle?: string | null
          pricing_tiers?: Json | null
          pricing_title?: string | null
          slug: string
          testimonials?: Json | null
          testimonials_subtitle?: string | null
          testimonials_title?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          about_content?: string | null
          client_logos_url?: string | null
          comparison_problem_items?: Json | null
          comparison_problem_title?: string | null
          comparison_solution_description?: string | null
          comparison_solution_items?: Json | null
          comparison_solution_title?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_subtitle?: string | null
          contact_title?: string | null
          created_at?: string
          cta_banner_subtitle?: string | null
          cta_banner_title?: string | null
          custom_section_image_url?: string | null
          feature_cards?: Json | null
          features_list?: Json | null
          features_subtitle?: string | null
          features_title?: string | null
          form_section_subtitle?: string | null
          form_section_title?: string | null
          hero_badge?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_text?: string | null
          hero_headline?: string
          hero_subheadline?: string | null
          hero_video_id?: string | null
          hero_video_thumbnail_url?: string | null
          id?: string
          name?: string
          personalization_config?: Json | null
          portfolio_strip_url?: string | null
          portfolio_videos?: Json | null
          pricing_subtitle?: string | null
          pricing_tiers?: Json | null
          pricing_title?: string | null
          slug?: string
          testimonials?: Json | null
          testimonials_subtitle?: string | null
          testimonials_title?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          ip_address: string | null
          personalized_page_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          personalized_page_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          personalized_page_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_personalized_page_id_fkey"
            columns: ["personalized_page_id"]
            isOneToOne: false
            referencedRelation: "personalized_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_pages: {
        Row: {
          campaign_id: string
          company: string | null
          created_at: string
          custom_message: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          template_id: string | null
          token: string
        }
        Insert: {
          campaign_id: string
          company?: string | null
          created_at?: string
          custom_message?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          template_id?: string | null
          token?: string
        }
        Update: {
          campaign_id?: string
          company?: string | null
          created_at?: string
          custom_message?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          template_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "personalized_pages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personalized_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "landing_page_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_personalized_page_by_token: {
        Args: { lookup_token: string }
        Returns: {
          campaign_id: string
          company: string
          created_at: string
          custom_message: string
          first_name: string
          id: string
          last_name: string
          template_id: string
          token: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_owns_campaign: { Args: { _campaign_id: string }; Returns: boolean }
      user_owns_personalized_page: {
        Args: { _page_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
