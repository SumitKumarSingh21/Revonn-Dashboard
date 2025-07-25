export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          assigned_at: string | null
          assigned_mechanic_id: string | null
          assigned_mechanic_name: string | null
          booking_date: string
          booking_time: string
          car_details: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          garage_id: string
          id: string
          notes: string | null
          payment_method: string | null
          service_id: string
          status: string | null
          total_amount: number | null
          user_id: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_type: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_mechanic_id?: string | null
          assigned_mechanic_name?: string | null
          booking_date: string
          booking_time: string
          car_details?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          garage_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          service_id: string
          status?: string | null
          total_amount?: number | null
          user_id: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_mechanic_id?: string | null
          assigned_mechanic_name?: string | null
          booking_date?: string
          booking_time?: string
          car_details?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          garage_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          service_id?: string
          status?: string | null
          total_amount?: number | null
          user_id?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_mechanic_id_fkey"
            columns: ["assigned_mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_1: string
          participant_2: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          garage_id: string | null
          id: string
          payment_method: string | null
          status: string | null
          transaction_date: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          garage_id?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          transaction_date?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          garage_id?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      garage_time_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          garage_id: string
          id: string
          is_available: boolean
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          garage_id: string
          id?: string
          is_available?: boolean
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          garage_id?: string
          id?: string
          is_available?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_time_slots_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garages: {
        Row: {
          average_rating: number | null
          created_at: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          owner_id: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          status: string | null
          total_reviews: number | null
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          owner_id?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          owner_id?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      mechanics: {
        Row: {
          created_at: string
          email: string | null
          garage_id: string
          id: string
          mechanic_id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          garage_id: string
          id?: string
          mechanic_id: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          garage_id?: string
          id?: string
          mechanic_id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mechanics_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption: string
          comments: number | null
          created_at: string | null
          id: string
          likes: number | null
          post_image: string | null
          updated_at: string | null
          user_id: string
          user_image: string | null
          username: string
        }
        Insert: {
          caption: string
          comments?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          post_image?: string | null
          updated_at?: string | null
          user_id: string
          user_image?: string | null
          username: string
        }
        Update: {
          caption?: string
          comments?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          post_image?: string | null
          updated_at?: string | null
          user_id?: string
          user_image?: string | null
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          garage_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          garage_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          garage_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          garage_id: string | null
          id: string
          name: string
          price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          garage_id?: string | null
          id?: string
          name: string
          price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          garage_id?: string | null
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_comment: {
        Args: { p_post_id: string; p_user_id: string; p_content: string }
        Returns: undefined
      }
      check_user_liked_post: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: boolean
      }
      generate_mechanic_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_post_comments: {
        Args: { p_post_id: string }
        Returns: {
          id: string
          content: string
          created_at: string
          user_id: string
          profiles: Json
        }[]
      }
      like_post: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: undefined
      }
      unlike_post: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: undefined
      }
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
