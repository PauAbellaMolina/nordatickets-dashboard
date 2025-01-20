export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _organizers: {
        Row: {
          address: string | null
          cif: string | null
          created_at: string
          email: string | null
          id: number
          legal_name: string | null
          name: string | null
          nif: string | null
          phone: string | null
          zipcode_city_country: string | null
        }
        Insert: {
          address?: string | null
          cif?: string | null
          created_at?: string
          email?: string | null
          id?: number
          legal_name?: string | null
          name?: string | null
          nif?: string | null
          phone?: string | null
          zipcode_city_country?: string | null
        }
        Update: {
          address?: string | null
          cif?: string | null
          created_at?: string
          email?: string | null
          id?: number
          legal_name?: string | null
          name?: string | null
          nif?: string | null
          phone?: string | null
          zipcode_city_country?: string | null
        }
        Relationships: []
      }
      event_tickets: {
        Row: {
          additional_info: string | null
          buy_includes_event_tickets_ids: number[] | null
          color_code_dark: string | null
          color_code_light: string | null
          conditions_notice: string | null
          created_at: string
          description: string | null
          email_qr_pdf: boolean
          event_id: number | null
          hide_from_event_page: boolean
          id: number
          iva: number
          minor_restricted: boolean
          name: string | null
          price: number | null
          purchased_additional_info: string | null
          purchased_conditions_notice: string | null
          selling: boolean
          strikethrough_price: number | null
          ticket_form_templates_id: number | null
          type: Database["public"]["Enums"]["event_ticket_type"]
          wallet_tickets_limit: number | null
        }
        Insert: {
          additional_info?: string | null
          buy_includes_event_tickets_ids?: number[] | null
          color_code_dark?: string | null
          color_code_light?: string | null
          conditions_notice?: string | null
          created_at?: string
          description?: string | null
          email_qr_pdf?: boolean
          event_id?: number | null
          hide_from_event_page?: boolean
          id?: number
          iva?: number
          minor_restricted?: boolean
          name?: string | null
          price?: number | null
          purchased_additional_info?: string | null
          purchased_conditions_notice?: string | null
          selling?: boolean
          strikethrough_price?: number | null
          ticket_form_templates_id?: number | null
          type?: Database["public"]["Enums"]["event_ticket_type"]
          wallet_tickets_limit?: number | null
        }
        Update: {
          additional_info?: string | null
          buy_includes_event_tickets_ids?: number[] | null
          color_code_dark?: string | null
          color_code_light?: string | null
          conditions_notice?: string | null
          created_at?: string
          description?: string | null
          email_qr_pdf?: boolean
          event_id?: number | null
          hide_from_event_page?: boolean
          id?: number
          iva?: number
          minor_restricted?: boolean
          name?: string | null
          price?: number | null
          purchased_additional_info?: string | null
          purchased_conditions_notice?: string | null
          selling?: boolean
          strikethrough_price?: number | null
          ticket_form_templates_id?: number | null
          type?: Database["public"]["Enums"]["event_ticket_type"]
          wallet_tickets_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          access_tickets_section_expanded: boolean
          access_tickets_section_title: string | null
          age_required: number | null
          color_code_dark: string | null
          color_code_light: string | null
          consumable_tickets_section_expanded: boolean
          consumable_tickets_section_title: string | null
          created_at: string
          description: string | null
          id: number
          location: string | null
          more_info_content: string | null
          name: string | null
          organizer_email: string | null
          selling: boolean
          selling_access: boolean
          slug: string
          start_date: string | null
          ticket_fee: number | null
          tickets_deactivable: boolean
        }
        Insert: {
          access_tickets_section_expanded?: boolean
          access_tickets_section_title?: string | null
          age_required?: number | null
          color_code_dark?: string | null
          color_code_light?: string | null
          consumable_tickets_section_expanded?: boolean
          consumable_tickets_section_title?: string | null
          created_at?: string
          description?: string | null
          id?: number
          location?: string | null
          more_info_content?: string | null
          name?: string | null
          organizer_email?: string | null
          selling?: boolean
          selling_access?: boolean
          slug?: string
          start_date?: string | null
          ticket_fee?: number | null
          tickets_deactivable?: boolean
        }
        Update: {
          access_tickets_section_expanded?: boolean
          access_tickets_section_title?: string | null
          age_required?: number | null
          color_code_dark?: string | null
          color_code_light?: string | null
          consumable_tickets_section_expanded?: boolean
          consumable_tickets_section_title?: string | null
          created_at?: string
          description?: string | null
          id?: number
          location?: string | null
          more_info_content?: string | null
          name?: string | null
          organizer_email?: string | null
          selling?: boolean
          selling_access?: boolean
          slug?: string
          start_date?: string | null
          ticket_fee?: number | null
          tickets_deactivable?: boolean
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string | null
          created_at: string
          id: number
          language: string
          order: number
          question: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: number
          language?: string
          order: number
          question?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: number
          language?: string
          order?: number
          question?: string | null
        }
        Relationships: []
      }
      redsys_orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          event_id: number | null
          id: number
          order_id: string | null
          order_status:
            | Database["public"]["Enums"]["redsys_order_status"]
            | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_id?: number | null
          id?: number
          order_id?: string | null
          order_status?:
            | Database["public"]["Enums"]["redsys_order_status"]
            | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_id?: number | null
          id?: number
          order_id?: string | null
          order_status?:
            | Database["public"]["Enums"]["redsys_order_status"]
            | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redsys_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redsys_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_form_submits: {
        Row: {
          created_at: string
          entries: string[] | null
          event_id: number
          id: number
          tickets_form_templates_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          entries?: string[] | null
          event_id: number
          id?: number
          tickets_form_templates_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          entries?: string[] | null
          event_id?: number
          id?: number
          tickets_form_templates_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_form_submits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_form_templates: {
        Row: {
          created_at: string
          id: number
          q1: string | null
          q1_max_value: number | null
          q1_multiplies_ticket_price: boolean
          q1_options: string[] | null
          q1_required: boolean
          q1_type: Database["public"]["Enums"]["ticket_form_templates_q_type"]
          q2: string | null
          q2_max_value: number | null
          q2_multiplies_ticket_price: boolean
          q2_options: string[] | null
          q2_required: boolean
          q2_type: Database["public"]["Enums"]["ticket_form_templates_q_type"]
          q3: string | null
          q3_max_value: number | null
          q3_multiplies_ticket_price: boolean
          q3_options: string[] | null
          q3_required: boolean
          q3_type: Database["public"]["Enums"]["ticket_form_templates_q_type"]
        }
        Insert: {
          created_at?: string
          id?: number
          q1?: string | null
          q1_max_value?: number | null
          q1_multiplies_ticket_price?: boolean
          q1_options?: string[] | null
          q1_required?: boolean
          q1_type?: Database["public"]["Enums"]["ticket_form_templates_q_type"]
          q2?: string | null
          q2_max_value?: number | null
          q2_multiplies_ticket_price?: boolean
          q2_options?: string[] | null
          q2_required?: boolean
          q2_type?: Database["public"]["Enums"]["ticket_form_templates_q_type"]
          q3?: string | null
          q3_max_value?: number | null
          q3_multiplies_ticket_price?: boolean
          q3_options?: string[] | null
          q3_required?: boolean
          q3_type?: Database["public"]["Enums"]["ticket_form_templates_q_type"]
        }
        Update: {
          created_at?: string
          id?: number
          q1?: string | null
          q1_max_value?: number | null
          q1_multiplies_ticket_price?: boolean
          q1_options?: string[] | null
          q1_required?: boolean
          q1_type?: Database["public"]["Enums"]["ticket_form_templates_q_type"]
          q2?: string | null
          q2_max_value?: number | null
          q2_multiplies_ticket_price?: boolean
          q2_options?: string[] | null
          q2_required?: boolean
          q2_type?: Database["public"]["Enums"]["ticket_form_templates_q_type"]
          q3?: string | null
          q3_max_value?: number | null
          q3_multiplies_ticket_price?: boolean
          q3_options?: string[] | null
          q3_required?: boolean
          q3_type?: Database["public"]["Enums"]["ticket_form_templates_q_type"]
        }
        Relationships: []
      }
      users: {
        Row: {
          card_number: string | null
          created_at: string
          event_ids_following: number[] | null
          expiry_date: number | null
          fullname: string | null
          id: string
        }
        Insert: {
          card_number?: string | null
          created_at?: string
          event_ids_following?: number[] | null
          expiry_date?: number | null
          fullname?: string | null
          id: string
        }
        Update: {
          card_number?: string | null
          created_at?: string
          event_ids_following?: number[] | null
          expiry_date?: number | null
          fullname?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wallet_tickets: {
        Row: {
          created_at: string
          email_qr_pdf: boolean
          event_id: number | null
          event_tickets_id: number | null
          event_tickets_name: string | null
          event_tickets_purchased_additional_info: string | null
          event_tickets_purchased_conditions_notice: string | null
          id: number
          iva: number
          order_id: string
          price: number | null
          refunded_at: string | null
          refunded_partial_price: number | null
          ticket_form_submits_id: number | null
          type: Database["public"]["Enums"]["event_ticket_type"]
          used_at: string | null
          used_with_addon_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_qr_pdf?: boolean
          event_id?: number | null
          event_tickets_id?: number | null
          event_tickets_name?: string | null
          event_tickets_purchased_additional_info?: string | null
          event_tickets_purchased_conditions_notice?: string | null
          id?: number
          iva?: number
          order_id: string
          price?: number | null
          refunded_at?: string | null
          refunded_partial_price?: number | null
          ticket_form_submits_id?: number | null
          type?: Database["public"]["Enums"]["event_ticket_type"]
          used_at?: string | null
          used_with_addon_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_qr_pdf?: boolean
          event_id?: number | null
          event_tickets_id?: number | null
          event_tickets_name?: string | null
          event_tickets_purchased_additional_info?: string | null
          event_tickets_purchased_conditions_notice?: string | null
          id?: number
          iva?: number
          order_id?: string
          price?: number | null
          refunded_at?: string | null
          refunded_partial_price?: number | null
          ticket_form_submits_id?: number | null
          type?: Database["public"]["Enums"]["event_ticket_type"]
          used_at?: string | null
          used_with_addon_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_tickets_event_tickets_id_fkey"
            columns: ["event_tickets_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_tickets_ticket_form_submits_id_fkey"
            columns: ["ticket_form_submits_id"]
            isOneToOne: false
            referencedRelation: "ticket_form_submits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_wallet_tickets_by_event_tickets_id: {
        Args: {
          p_event_tickets_id: number
        }
        Returns: number
      }
      delete_secret: {
        Args: {
          secret_name: string
        }
        Returns: string
      }
      email_is_admin: {
        Args: {
          email_to_check: string
        }
        Returns: boolean
      }
      insert_secret: {
        Args: {
          name: string
          secret: string
        }
        Returns: string
      }
      organizer_email_exists: {
        Args: {
          email_to_check: string
        }
        Returns: boolean
      }
      read_secret: {
        Args: {
          secret_name: string
        }
        Returns: string
      }
      update_wallet_tickets_used_at: {
        Args: {
          req_user_id: string
          wallet_tickets_id: number
          addon_id: number
        }
        Returns: string
      }
      user_email_by_id: {
        Args: {
          user_id: string
        }
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      event_ticket_type: "CONSUMABLE" | "ADDON" | "ADDON_REFUNDABLE" | "ACCESS"
      redsys_order_status:
        | "PAYMENT_PENDING"
        | "PAYMENT_SUCCEEDED"
        | "PAYMENT_FAILED"
      ticket_form_templates_q_type:
        | "TEXT"
        | "EMAIL"
        | "NUMBER"
        | "DATE"
        | "OPTIONS"
    }
    CompositeTypes: {
      user_email_lang: {
        email: string
        lang: string
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

