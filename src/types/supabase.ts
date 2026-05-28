export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          tax_code: string | null;
          address: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tax_code?: string | null;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tax_code?: string | null;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "admin" | "team_lead" | "sales" | "accountant";
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "team_lead" | "sales" | "accountant";
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "team_lead" | "sales" | "accountant";
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          lead_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          team_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          team_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          team_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          order_num: number;
          is_terminal: boolean;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          order_num: number;
          is_terminal?: boolean;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          order_num?: number;
          is_terminal?: boolean;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          organization_id: string;
          assigned_to: string | null;
          team_id: string | null;
          full_name: string;
          phone_primary: string;
          phone_secondary: string | null;
          email: string | null;
          segment: "vip" | "retail" | "agent";
          product_interests: ("raw_nest" | "stewed_nest" | "refined_nest")[];
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          assigned_to?: string | null;
          team_id?: string | null;
          full_name: string;
          phone_primary: string;
          phone_secondary?: string | null;
          email?: string | null;
          segment?: "vip" | "retail" | "agent";
          product_interests?: ("raw_nest" | "stewed_nest" | "refined_nest")[];
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          assigned_to?: string | null;
          team_id?: string | null;
          full_name?: string;
          phone_primary?: string;
          phone_secondary?: string | null;
          email?: string | null;
          segment?: "vip" | "retail" | "agent";
          product_interests?: ("raw_nest" | "stewed_nest" | "refined_nest")[];
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      lead_tags: {
        Row: {
          id: string;
          name: string;
          color: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string | null;
        };
      };
      lead_tag_assignments: {
        Row: {
          lead_id: string;
          tag_id: string;
        };
        Insert: {
          lead_id: string;
          tag_id: string;
        };
        Update: {
          lead_id?: string;
          tag_id?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          organization_id: string;
          lead_id: string;
          stage_id: string;
          title: string;
          value: number;
          probability: number | null;
          notes: string | null;
          assigned_to: string | null;
          team_id: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          lead_id: string;
          stage_id: string;
          title: string;
          value?: number;
          probability?: number | null;
          notes?: string | null;
          assigned_to?: string | null;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          lead_id?: string;
          stage_id?: string;
          title?: string;
          value?: number;
          probability?: number | null;
          notes?: string | null;
          assigned_to?: string | null;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
          deleted_at?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          organization_id: string;
          lead_id: string | null;
          assigned_to: string | null;
          team_id: string | null;
          title: string;
          description: string | null;
          priority: "low" | "medium" | "high";
          status: "todo" | "in_progress" | "completed" | "overdue";
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          lead_id?: string | null;
          assigned_to?: string | null;
          team_id?: string | null;
          title: string;
          description?: string | null;
          priority?: "low" | "medium" | "high";
          status?: "todo" | "in_progress" | "completed" | "overdue";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          lead_id?: string | null;
          assigned_to?: string | null;
          team_id?: string | null;
          title?: string;
          description?: string | null;
          priority?: "low" | "medium" | "high";
          status?: "todo" | "in_progress" | "completed" | "overdue";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          lead_id: string;
          opportunity_id: string | null;
          amount: number;
          payment_method: "bank_transfer" | "cash" | "cod";
          status: "pending" | "deposit" | "completed" | "failed";
          notes: string | null;
          recorded_by: string;
          team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          lead_id: string;
          opportunity_id?: string | null;
          amount: number;
          payment_method: "bank_transfer" | "cash" | "cod";
          status?: "pending" | "deposit" | "completed" | "failed";
          notes?: string | null;
          recorded_by: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          lead_id?: string;
          opportunity_id?: string | null;
          amount?: number;
          payment_method?: "bank_transfer" | "cash" | "cod";
          status?: "pending" | "deposit" | "completed" | "failed";
          notes?: string | null;
          recorded_by?: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string;
          action: string;
          entity_name: string | null;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id: string;
          action: string;
          entity_name?: string | null;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          user_id?: string;
          action?: string;
          entity_name?: string | null;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
