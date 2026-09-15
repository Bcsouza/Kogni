// Hand-authored to mirror supabase/migrations/0001_init.sql. If you have the
// Supabase CLI linked to a project, prefer regenerating this with:
//   supabase gen types typescript --linked > src/lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type NoRelationships = { Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          plan_id: "free" | "pro" | "business";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      } & NoRelationships;
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "post" | "carousel" | "ad" | "story" | "thumbnail" | "custom";
          prompt: string;
          format: string;
          status: string;
          cover_image_url: string | null;
          model: string | null;
          credits_consumed: number;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          user_id: string;
          name: string;
          type: Database["public"]["Tables"]["projects"]["Row"]["type"];
          prompt: string;
          format: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
      } & NoRelationships;
      project_assets: {
        Row: {
          id: string;
          project_id: string;
          url: string;
          width: number;
          height: number;
          is_selected: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["project_assets"]["Row"]> & {
          project_id: string;
          url: string;
          width: number;
          height: number;
        };
        Update: Partial<Database["public"]["Tables"]["project_assets"]["Row"]>;
      } & NoRelationships;
      carousels: {
        Row: {
          id: string;
          project_id: string;
          slide_count: number;
          audience: string | null;
          tone: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["carousels"]["Row"]> & {
          project_id: string;
          slide_count: number;
        };
        Update: Partial<Database["public"]["Tables"]["carousels"]["Row"]>;
      } & NoRelationships;
      carousel_slides: {
        Row: {
          id: string;
          carousel_id: string;
          position: number;
          role: string;
          headline: string;
          body: string;
          image_url: string | null;
          prompt: string;
          status: string;
        };
        Insert: Partial<Database["public"]["Tables"]["carousel_slides"]["Row"]> & {
          carousel_id: string;
          position: number;
          role: string;
          headline: string;
          body: string;
          prompt: string;
        };
        Update: Partial<Database["public"]["Tables"]["carousel_slides"]["Row"]>;
      } & NoRelationships;
      generations: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          provider: string;
          model: string;
          prompt: string;
          status: string;
          credits_cost: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["generations"]["Row"]> & {
          project_id: string;
          user_id: string;
          provider: string;
          model: string;
          prompt: string;
        };
        Update: Partial<Database["public"]["Tables"]["generations"]["Row"]>;
      } & NoRelationships;
      generation_attempts: {
        Row: {
          id: string;
          generation_id: string;
          attempt_number: number;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["generation_attempts"]["Row"]> & {
          generation_id: string;
          attempt_number: number;
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["generation_attempts"]["Row"]>;
      } & NoRelationships;
      templates: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string;
          slide_count: number | null;
          style: string;
          preview_url: string;
          prompt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["templates"]["Row"]> & {
          name: string;
          category: string;
          description: string;
          style: string;
          preview_url: string;
          prompt: string;
        };
        Update: Partial<Database["public"]["Tables"]["templates"]["Row"]>;
      } & NoRelationships;
      favorites: {
        Row: {
          user_id: string;
          project_id: string;
          created_at: string;
        };
        Insert: { user_id: string; project_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Row"]>;
      } & NoRelationships;
      brand_kits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          font: string;
          style: string;
          logo_url: string | null;
          tone_of_voice: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["brand_kits"]["Row"]> & { user_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["brand_kits"]["Row"]>;
      } & NoRelationships;
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          project_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["credit_transactions"]["Row"]> & {
          user_id: string;
          amount: number;
          reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["credit_transactions"]["Row"]>;
      } & NoRelationships;
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: "free" | "pro" | "business";
          status: string;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          user_id: string;
          plan_id: Database["public"]["Tables"]["subscriptions"]["Row"]["plan_id"];
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      } & NoRelationships;
    };
    Views: {
      credit_balances: {
        Row: {
          user_id: string;
          balance: number;
        };
      } & NoRelationships;
    };
    Functions: Record<string, never>;
  };
}
