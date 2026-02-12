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
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number | null
          converted_at: string
          created_at: string
          id: string
          paid_at: string | null
          plan: string | null
          referred_email: string | null
          referred_user_id: string | null
          status: string
          subscription_amount: number | null
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number | null
          converted_at?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          plan?: string | null
          referred_email?: string | null
          referred_user_id?: string | null
          status?: string
          subscription_amount?: number | null
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number | null
          converted_at?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          plan?: string | null
          referred_email?: string | null
          referred_user_id?: string | null
          status?: string
          subscription_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          commission_rate: number
          created_at: string
          email: string
          id: string
          name: string
          payout_details: string | null
          payout_method: string | null
          status: string
          total_earned: number
          total_paid: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          affiliate_code?: string
          commission_rate?: number
          created_at?: string
          email: string
          id?: string
          name: string
          payout_details?: string | null
          payout_method?: string | null
          status?: string
          total_earned?: number
          total_paid?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          payout_details?: string | null
          payout_method?: string | null
          status?: string
          total_earned?: number
          total_paid?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          alert_on_view: boolean
          created_at: string
          id: string
          name: string
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_on_view?: boolean
          created_at?: string
          id?: string
          name: string
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_on_view?: boolean
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
      chat_cache: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          hit_count: number
          id: string
          question: string
          question_normalized: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          hit_count?: number
          id?: string
          question: string
          question_normalized: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          hit_count?: number
          id?: string
          question?: string
          question_normalized?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          created_at: string
          email: string | null
          extra_fields: Json | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          primary_goal: string | null
          product_url: string | null
          state: string | null
          template_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          extra_fields?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          primary_goal?: string | null
          product_url?: string | null
          state?: string | null
          template_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          extra_fields?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          primary_goal?: string | null
          product_url?: string | null
          state?: string | null
          template_id?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_template_id_fkey"
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
          accent_color: string | null
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
          form_steps: Json | null
          hero_badge: string | null
          hero_cta_primary_text: string | null
          hero_cta_secondary_text: string | null
          hero_headline: string
          hero_subheadline: string | null
          hero_video_id: string | null
          hero_video_thumbnail_url: string | null
          id: string
          is_builder_template: boolean | null
          logo_url: string | null
          name: string
          personalization_config: Json | null
          portfolio_strip_url: string | null
          portfolio_videos: Json | null
          pricing_subtitle: string | null
          pricing_tiers: Json | null
          pricing_title: string | null
          sections: Json | null
          slug: string
          testimonials: Json | null
          testimonials_subtitle: string | null
          testimonials_title: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          about_content?: string | null
          accent_color?: string | null
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
          form_steps?: Json | null
          hero_badge?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_text?: string | null
          hero_headline: string
          hero_subheadline?: string | null
          hero_video_id?: string | null
          hero_video_thumbnail_url?: string | null
          id?: string
          is_builder_template?: boolean | null
          logo_url?: string | null
          name: string
          personalization_config?: Json | null
          portfolio_strip_url?: string | null
          portfolio_videos?: Json | null
          pricing_subtitle?: string | null
          pricing_tiers?: Json | null
          pricing_title?: string | null
          sections?: Json | null
          slug: string
          testimonials?: Json | null
          testimonials_subtitle?: string | null
          testimonials_title?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          about_content?: string | null
          accent_color?: string | null
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
          form_steps?: Json | null
          hero_badge?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_text?: string | null
          hero_headline?: string
          hero_subheadline?: string | null
          hero_video_id?: string | null
          hero_video_thumbnail_url?: string | null
          id?: string
          is_builder_template?: boolean | null
          logo_url?: string | null
          name?: string
          personalization_config?: Json | null
          portfolio_strip_url?: string | null
          portfolio_videos?: Json | null
          pricing_subtitle?: string | null
          pricing_tiers?: Json | null
          pricing_title?: string | null
          sections?: Json | null
          slug?: string
          testimonials?: Json | null
          testimonials_subtitle?: string | null
          testimonials_title?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      link_clicks: {
        Row: {
          clicked_at: string
          id: string
          link_label: string | null
          link_url: string | null
          personalized_page_id: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          link_label?: string | null
          link_url?: string | null
          personalized_page_id: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          link_label?: string | null
          link_url?: string | null
          personalized_page_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_personalized_page_id_fkey"
            columns: ["personalized_page_id"]
            isOneToOne: false
            referencedRelation: "personalized_pages"
            referencedColumns: ["id"]
          },
        ]
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
          is_paused: boolean
          last_name: string | null
          photo_url: string | null
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
          is_paused?: boolean
          last_name?: string | null
          photo_url?: string | null
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
          is_paused?: boolean
          last_name?: string | null
          photo_url?: string | null
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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          max_campaigns: number
          max_live_pages: number
          max_pages: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          trial_expired_email_sent: boolean | null
          trial_reminder_sent: boolean | null
          updated_at: string
          user_id: string
          welcome_email_sent: boolean | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          max_campaigns?: number
          max_live_pages?: number
          max_pages?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_expired_email_sent?: boolean | null
          trial_reminder_sent?: boolean | null
          updated_at?: string
          user_id: string
          welcome_email_sent?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          max_campaigns?: number
          max_live_pages?: number
          max_pages?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_expired_email_sent?: boolean | null
          trial_reminder_sent?: boolean | null
          updated_at?: string
          user_id?: string
          welcome_email_sent?: boolean | null
        }
        Relationships: []
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
      video_clicks: {
        Row: {
          clicked_at: string
          id: string
          personalized_page_id: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          personalized_page_id: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          personalized_page_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_clicks_personalized_page_id_fkey"
            columns: ["personalized_page_id"]
            isOneToOne: false
            referencedRelation: "personalized_pages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          max_campaigns: number | null
          max_live_pages: number | null
          max_pages: number | null
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          max_campaigns?: number | null
          max_live_pages?: number | null
          max_pages?: number | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          max_campaigns?: number | null
          max_live_pages?: number | null
          max_pages?: number | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_usage_limit: {
        Args: { _resource_type: string; _user_id: string }
        Returns: boolean
      }
      get_personalized_page_by_token: {
        Args: { lookup_token: string }
        Returns: {
          campaign_id: string
          company: string
          created_at: string
          custom_message: string
          first_name: string
          id: string
          is_paused: boolean
          last_name: string
          template_id: string
          token: string
        }[]
      }
      get_template_for_public_page: {
        Args: { template_uuid: string }
        Returns: {
          about_content: string
          accent_color: string
          client_logos_url: string
          comparison_problem_items: Json
          comparison_problem_title: string
          comparison_solution_description: string
          comparison_solution_items: Json
          comparison_solution_title: string
          contact_email: string
          contact_phone: string
          contact_subtitle: string
          contact_title: string
          cta_banner_subtitle: string
          cta_banner_title: string
          custom_section_image_url: string
          feature_cards: Json
          features_list: Json
          features_subtitle: string
          features_title: string
          form_section_subtitle: string
          form_section_title: string
          hero_badge: string
          hero_cta_primary_text: string
          hero_cta_secondary_text: string
          hero_headline: string
          hero_subheadline: string
          hero_video_id: string
          hero_video_thumbnail_url: string
          id: string
          is_builder_template: boolean
          logo_url: string
          name: string
          personalization_config: Json
          portfolio_strip_url: string
          portfolio_videos: Json
          pricing_subtitle: string
          pricing_tiers: Json
          pricing_title: string
          sections: Json
          slug: string
          testimonials: Json
          testimonials_subtitle: string
          testimonials_title: string
          thumbnail_url: string
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
      subscription_plan: "trial" | "starter" | "pro" | "enterprise"
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
      subscription_plan: ["trial", "starter", "pro", "enterprise"],
    },
  },
} as const
