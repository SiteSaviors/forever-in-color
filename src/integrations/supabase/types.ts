
export type Database = {
  public: {
    Tables: {
      Photos: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          orientation: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          orientation?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          orientation?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      Previews: {
        Row: {
          created_at: string
          id: string
          photo_id: string | null
          preview_url: string | null
          style: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id?: string | null
          preview_url?: string | null
          style?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string | null
          preview_url?: string | null
          style?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Previews_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "Photos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      style_prompts: {
        Row: {
          created_at: string
          id: string
          prompt: string
          style_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          style_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          style_id?: number
          updated_at?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]