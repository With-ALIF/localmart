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
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string;
          image: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          icon?: string;
          image?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          icon?: string;
          image?: string;
          sort_order?: number;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          details: string;
          category: string | null;
          price: number;
          old_price: number;
          rating: number;
          reviews: number;
          stock: number;
          unit: string;
          brand: string;
          image: string | null;
          tags: string[];
          sku: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          details?: string;
          category?: string | null;
          price?: number;
          old_price?: number;
          rating?: number;
          reviews?: number;
          stock?: number;
          unit?: string;
          brand?: string;
          image?: string | null;
          tags?: string[];
          sku?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          details?: string;
          category?: string | null;
          price?: number;
          old_price?: number;
          rating?: number;
          reviews?: number;
          stock?: number;
          unit?: string;
          brand?: string;
          image?: string | null;
          tags?: string[];
          sku?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          name: string;
          phone: string;
          address: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          name: string;
          phone: string;
          address: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          label?: string;
          name?: string;
          phone?: string;
          address?: string;
          is_default?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          order_source: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          address: string | null;
          subtotal: number;
          discount_amount: number;
          total_amount: number;
          paid_amount: number;
          due_amount: number;
          payment_method: string;
          payment_status: string;
          status: string;
          admin_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          order_source?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          address?: string | null;
          subtotal?: number;
          discount_amount?: number;
          total_amount?: number;
          paid_amount?: number;
          due_amount?: number;
          payment_method?: string;
          payment_status?: string;
          status?: string;
          admin_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          order_number?: string;
          user_id?: string | null;
          order_source?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          address?: string | null;
          subtotal?: number;
          discount_amount?: number;
          total_amount?: number;
          paid_amount?: number;
          due_amount?: number;
          payment_method?: string;
          payment_status?: string;
          status?: string;
          admin_name?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Update: {
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          unit_price?: number;
          quantity?: number;
          subtotal?: number;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          note: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          note?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          order_id?: string;
          status?: string;
          note?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      update_order_status: {
        Args: {
          p_order_id: string;
          p_new_status: string;
          p_created_by?: string;
          p_note?: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}
