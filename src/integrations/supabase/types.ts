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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          admin_notes: string | null
          category: string | null
          commission_rate: string | null
          created_at: string
          id: string
          price: string | null
          product_id: number | null
          status: string
          store: string
          subcategory: string | null
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          commission_rate?: string | null
          created_at?: string
          id?: string
          price?: string | null
          product_id?: number | null
          status?: string
          store: string
          subcategory?: string | null
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          commission_rate?: string | null
          created_at?: string
          id?: string
          price?: string | null
          product_id?: number | null
          status?: string
          store?: string
          subcategory?: string | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      awards: {
        Row: {
          cost_usd: number
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          like_value: number
          name: string
        }
        Insert: {
          cost_usd: number
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          like_value?: number
          name: string
        }
        Update: {
          cost_usd?: number
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          like_value?: number
          name?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      book_follows: {
        Row: {
          book_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_follows_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_request_chapters: {
        Row: {
          book_request_id: string
          chapter_number: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_epilogue: boolean | null
          is_prologue: boolean | null
          title: string | null
        }
        Insert: {
          book_request_id: string
          chapter_number: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_epilogue?: boolean | null
          is_prologue?: boolean | null
          title?: string | null
        }
        Update: {
          book_request_id?: string
          chapter_number?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_epilogue?: boolean | null
          is_prologue?: boolean | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_request_chapters_book_request_id_fkey"
            columns: ["book_request_id"]
            isOneToOne: false
            referencedRelation: "book_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_book_request_chapters_request"
            columns: ["book_request_id"]
            isOneToOne: false
            referencedRelation: "book_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      book_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string
          chapter_count: number | null
          cover_url: string | null
          created_at: string
          created_by: string
          expires_at: string | null
          genre: Database["public"]["Enums"]["book_genre"] | null
          has_epilogue: boolean
          has_prologue: boolean
          id: string
          isbn: string | null
          published_year: number | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["book_request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author: string
          chapter_count?: number | null
          cover_url?: string | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          genre?: Database["public"]["Enums"]["book_genre"] | null
          has_epilogue?: boolean
          has_prologue?: boolean
          id?: string
          isbn?: string | null
          published_year?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["book_request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string
          chapter_count?: number | null
          cover_url?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          genre?: Database["public"]["Enums"]["book_genre"] | null
          has_epilogue?: boolean
          has_prologue?: boolean
          id?: string
          isbn?: string | null
          published_year?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["book_request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          chapter_count: number | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          genre: Database["public"]["Enums"]["book_genre"] | null
          has_epilogue: boolean
          has_prologue: boolean
          id: string
          published_year: number | null
          title: string
        }
        Insert: {
          author: string
          chapter_count?: number | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          genre?: Database["public"]["Enums"]["book_genre"] | null
          has_epilogue?: boolean
          has_prologue?: boolean
          id?: string
          published_year?: number | null
          title: string
        }
        Update: {
          author?: string
          chapter_count?: number | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          genre?: Database["public"]["Enums"]["book_genre"] | null
          has_epilogue?: boolean
          has_prologue?: boolean
          id?: string
          published_year?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chapter_reactions: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_reactions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_saves: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_saves_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_views: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_views_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          book_id: string
          chapter_number: number
          created_at: string
          id: string
          is_active: boolean
          is_epilogue: boolean | null
          is_prologue: boolean | null
          title: string
        }
        Insert: {
          book_id: string
          chapter_number: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_epilogue?: boolean | null
          is_prologue?: boolean | null
          title: string
        }
        Update: {
          book_id?: string
          chapter_number?: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_epilogue?: boolean | null
          is_prologue?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_categories: {
        Row: {
          category_id: string
          created_at: string
          creator_id: string
          id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          creator_id: string
          id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          creator_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_categories_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_follows: {
        Row: {
          created_at: string
          creator_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          banner_url: string | null
          bio: string | null
          completed_tasks_count: number | null
          created_at: string
          display_name: string
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          minimum_task_amount: number | null
          social_links: Json | null
          total_earnings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          banner_url?: string | null
          bio?: string | null
          completed_tasks_count?: number | null
          created_at?: string
          display_name: string
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          minimum_task_amount?: number | null
          social_links?: Json | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          banner_url?: string | null
          bio?: string | null
          completed_tasks_count?: number | null
          created_at?: string
          display_name?: string
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          minimum_task_amount?: number | null
          social_links?: Json | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discussion_likes: {
        Row: {
          created_at: string
          discussion_id: string
          id: string
          user_id: string
          vote_type: string | null
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: string
          user_id: string
          vote_type?: string | null
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: string
          user_id?: string
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_likes_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          chapter_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings_transactions: {
        Row: {
          amount_usd: number
          award_id: string | null
          comment_id: string | null
          created_at: string
          id: string
          like_count: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount_usd: number
          award_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          like_count?: number
          transaction_type: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          award_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          like_count?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_transactions_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string | null
          id: string
          recipient_id: string | null
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          category: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          has_been_edited: boolean
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_available: boolean | null
          is_hidden: boolean | null
          looking_for_categories: string[] | null
          looking_for_conditions: string[] | null
          looking_for_description: string | null
          looking_for_price_ranges: string[] | null
          name: string
          price_range_max: number | null
          price_range_min: number | null
          removal_reason: string | null
          removed_at: string | null
          removed_by: string | null
          status: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          has_been_edited?: boolean
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_available?: boolean | null
          is_hidden?: boolean | null
          looking_for_categories?: string[] | null
          looking_for_conditions?: string[] | null
          looking_for_description?: string | null
          looking_for_price_ranges?: string[] | null
          name: string
          price_range_max?: number | null
          price_range_min?: number | null
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          has_been_edited?: boolean
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_available?: boolean | null
          is_hidden?: boolean | null
          looking_for_categories?: string[] | null
          looking_for_conditions?: string[] | null
          looking_for_description?: string | null
          looking_for_price_ranges?: string[] | null
          name?: string
          price_range_max?: number | null
          price_range_min?: number | null
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      liked_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          my_item_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          my_item_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          my_item_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      liked_markets: {
        Row: {
          created_at: string
          id: string
          market_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          user_id?: string
        }
        Relationships: []
      }
      liked_vendors: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      liked_websites: {
        Row: {
          audience_rating: number
          created_at: string
          creator: string
          creator_image: string
          id: string
          likes: number
          professional_rating: number
          user_id: string
          website_id: string
          website_image: string
          website_title: string
        }
        Insert: {
          audience_rating: number
          created_at?: string
          creator: string
          creator_image: string
          id?: string
          likes: number
          professional_rating: number
          user_id: string
          website_id: string
          website_image: string
          website_title: string
        }
        Update: {
          audience_rating?: number
          created_at?: string
          creator?: string
          creator_image?: string
          id?: string
          likes?: number
          professional_rating?: number
          user_id?: string
          website_id?: string
          website_image?: string
          website_title?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          accepts_credit_cards: boolean | null
          additional_info: string | null
          address: string | null
          city: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          description: string
          has_parking: boolean | null
          id: string
          is_outdoor: boolean | null
          name: string
          operating_days: string[] | null
          state: string | null
          submission_id: string | null
          updated_at: string
          vendor_count: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          accepts_credit_cards?: boolean | null
          additional_info?: string | null
          address?: string | null
          city?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          description: string
          has_parking?: boolean | null
          id?: string
          is_outdoor?: boolean | null
          name: string
          operating_days?: string[] | null
          state?: string | null
          submission_id?: string | null
          updated_at?: string
          vendor_count?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          accepts_credit_cards?: boolean | null
          additional_info?: string | null
          address?: string | null
          city?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          description?: string
          has_parking?: boolean | null
          id?: string
          is_outdoor?: boolean | null
          name?: string
          operating_days?: string[] | null
          state?: string | null
          submission_id?: string | null
          updated_at?: string
          vendor_count?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          image_urls: string[] | null
          is_read: boolean | null
          message_type: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          message_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      mutual_matches: {
        Row: {
          created_at: string | null
          id: string
          user1_id: string
          user1_item_id: string
          user2_id: string
          user2_item_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user1_id: string
          user1_item_id: string
          user2_id: string
          user2_item_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user1_id?: string
          user1_item_id?: string
          user2_id?: string
          user2_item_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_by: string | null
          action_taken: string
          book_title: string | null
          chapter_number: number | null
          chapter_title: string | null
          created_at: string | null
          id: string
          message: string
          reference_id: string
          status: Database["public"]["Enums"]["notification_status"] | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_by?: string | null
          action_taken: string
          book_title?: string | null
          chapter_number?: number | null
          chapter_title?: string | null
          created_at?: string | null
          id?: string
          message: string
          reference_id: string
          status?: Database["public"]["Enums"]["notification_status"] | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_by?: string | null
          action_taken?: string
          book_title?: string | null
          chapter_number?: number | null
          chapter_title?: string | null
          created_at?: string | null
          id?: string
          message?: string
          reference_id?: string
          status?: Database["public"]["Enums"]["notification_status"] | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_author: boolean | null
          message: string | null
          status: Database["public"]["Enums"]["offer_status"]
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_author?: boolean | null
          message?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_author?: boolean | null
          message?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          offer_id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          offer_id: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          offer_id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          parent_id: string | null
          product_id: number
          rating: number | null
          section: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          product_id: number
          rating?: number | null
          section: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          product_id?: number
          rating?: number | null
          section?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_reviews_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_product_reviews_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      product_submissions: {
        Row: {
          admin_notes: string | null
          affiliate_link: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_urls: string[] | null
          name: string
          price_range: string | null
          status: string
          updated_at: string
          user_id: string
          where_to_buy: string | null
        }
        Insert: {
          admin_notes?: string | null
          affiliate_link?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          name: string
          price_range?: string | null
          status?: string
          updated_at?: string
          user_id: string
          where_to_buy?: string | null
        }
        Update: {
          admin_notes?: string | null
          affiliate_link?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          name?: string
          price_range?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          where_to_buy?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          name: string | null
          phone: string | null
          show_location: boolean | null
          state: string | null
          street: string | null
          strikes_count: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          vacation_mode: boolean | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          show_location?: boolean | null
          state?: string | null
          street?: string | null
          strikes_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          vacation_mode?: boolean | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          show_location?: boolean | null
          state?: string | null
          street?: string | null
          strikes_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          vacation_mode?: boolean | null
          zip_code?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          admin_notes: string | null
          blog_url: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          product_id: number | null
          status: string
          subcategory: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          blog_url: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          product_id?: number | null
          status?: string
          subcategory?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          blog_url?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          product_id?: number | null
          status?: string
          subcategory?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rejections: {
        Row: {
          created_at: string
          id: string
          item_id: string
          my_item_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          my_item_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          my_item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rejections_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      report_attachments: {
        Row: {
          created_at: string
          file_path: string
          id: string
          report_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          report_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_attachments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          action_taken: string | null
          book_id: string | null
          chapter_id: string | null
          created_at: string
          id: string
          message: string
          reported_user_id: string | null
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string
        }
        Insert: {
          action_taken?: string | null
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string
          id?: string
          message: string
          reported_user_id?: string | null
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          type: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Update: {
          action_taken?: string | null
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string
          id?: string
          message?: string
          reported_user_id?: string | null
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          images: string[] | null
          market_id: string | null
          rating: number
          reviewee_id: string | null
          reviewer_id: string | null
          trade_conversation_id: string | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          images?: string[] | null
          market_id?: string | null
          rating: number
          reviewee_id?: string | null
          reviewer_id?: string | null
          trade_conversation_id?: string | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          images?: string[] | null
          market_id?: string | null
          rating?: number
          reviewee_id?: string | null
          reviewer_id?: string | null
          trade_conversation_id?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
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
      submission_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          submission_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_attachments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "submission_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          submission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          submission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          submission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "submission_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_likes: {
        Row: {
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_likes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          accepts_credit_cards: boolean | null
          additional_info: string | null
          address: string | null
          city: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          created_by: string | null
          description: string
          has_parking: boolean | null
          hours: Json | null
          id: string
          is_outdoor: boolean | null
          market_id: string | null
          name: string
          operating_days: string[] | null
          products: Json | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialties: string | null
          state: string | null
          status: string
          type: string
          updated_at: string
          vendor_count: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          accepts_credit_cards?: boolean | null
          additional_info?: string | null
          address?: string | null
          city?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          created_by?: string | null
          description: string
          has_parking?: boolean | null
          hours?: Json | null
          id?: string
          is_outdoor?: boolean | null
          market_id?: string | null
          name: string
          operating_days?: string[] | null
          products?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string | null
          state?: string | null
          status?: string
          type: string
          updated_at?: string
          vendor_count?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          accepts_credit_cards?: boolean | null
          additional_info?: string | null
          address?: string | null
          city?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          created_by?: string | null
          description?: string
          has_parking?: boolean | null
          hours?: Json | null
          id?: string
          is_outdoor?: boolean | null
          market_id?: string | null
          name?: string
          operating_days?: string[] | null
          products?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string | null
          state?: string | null
          status?: string
          type?: string
          updated_at?: string
          vendor_count?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sender_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sender_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sender_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_likes: {
        Row: {
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_likes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          duration: number | null
          external_url: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_final: boolean | null
          submission_type: Database["public"]["Enums"]["submission_type"]
          task_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          duration?: number | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_final?: boolean | null
          submission_type: Database["public"]["Enums"]["submission_type"]
          task_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          duration?: number | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_final?: boolean | null
          submission_type?: Database["public"]["Enums"]["submission_type"]
          task_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          accepted_at: string | null
          author_id: string
          category_id: string | null
          completed_at: string | null
          created_at: string
          creator_id: string | null
          deadline: string | null
          description: string
          final_submission_id: string | null
          id: string
          requirements: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          author_id: string
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          creator_id?: string | null
          deadline?: string | null
          description: string
          final_submission_id?: string | null
          id?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          author_id?: string
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          creator_id?: string | null
          deadline?: string | null
          description?: string
          final_submission_id?: string | null
          id?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_final_submission"
            columns: ["final_submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_conversations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          owner_accepted: boolean | null
          owner_id: string
          owner_item_id: string
          requester_accepted: boolean | null
          requester_id: string
          requester_item_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          owner_accepted?: boolean | null
          owner_id: string
          owner_item_id: string
          requester_accepted?: boolean | null
          requester_id: string
          requester_item_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          owner_accepted?: boolean | null
          owner_id?: string
          owner_item_id?: string
          requester_accepted?: boolean | null
          requester_id?: string
          requester_item_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_conversations_owner_item_id_fkey"
            columns: ["owner_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_conversations_requester_item_id_fkey"
            columns: ["requester_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          image_urls: string[] | null
          message: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          message: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          message?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "trade_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string | null
          id: string
          owner_accepted: boolean | null
          owner_id: string
          owner_item_id: string
          requester_accepted: boolean | null
          requester_id: string
          requester_item_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_accepted?: boolean | null
          owner_id: string
          owner_item_id: string
          requester_accepted?: boolean | null
          requester_id: string
          requester_item_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_accepted?: boolean | null
          owner_id?: string
          owner_item_id?: string
          requester_accepted?: boolean | null
          requester_id?: string
          requester_item_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_awards: {
        Row: {
          award_id: string
          comment_id: string
          created_at: string
          given_by: string
          id: string
          user_id: string
        }
        Insert: {
          award_id: string
          comment_id: string
          created_at?: string
          given_by: string
          id?: string
          user_id: string
        }
        Update: {
          award_id?: string
          comment_id?: string
          created_at?: string
          given_by?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          ban_duration_days: number | null
          ban_type: string
          banned_at: string
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ban_duration_days?: number | null
          ban_type: string
          banned_at?: string
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ban_duration_days?: number | null
          ban_type?: string
          banned_at?: string
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_earnings: {
        Row: {
          created_at: string
          id: string
          last_calculated_at: string
          total_earnings_usd: number
          total_likes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_calculated_at?: string
          total_earnings_usd?: number
          total_likes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_calculated_at?: string
          total_earnings_usd?: number
          total_likes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          additional_info: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          description: string
          id: string
          market_id: string | null
          name: string
          products: Json | null
          specialties: string | null
          submission_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          additional_info?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          description: string
          id?: string
          market_id?: string | null
          name: string
          products?: Json | null
          specialties?: string | null
          submission_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          additional_info?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          description?: string
          id?: string
          market_id?: string | null
          name?: string
          products?: Json | null
          specialties?: string | null
          submission_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      matches: {
        Row: {
          created_at: string | null
          id: string | null
          user1_id: string | null
          user1_item_id: string | null
          user2_id: string | null
          user2_item_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          user1_id?: string | null
          user1_item_id?: string | null
          user2_id?: string | null
          user2_item_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          user1_id?: string | null
          user1_item_id?: string | null
          user2_id?: string | null
          user2_item_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_first_admin: {
        Args: { admin_email: string }
        Returns: undefined
      }
      add_moderator_by_email: {
        Args: { admin_user_id: string; moderator_email: string }
        Returns: undefined
      }
      admin_remove_item: {
        Args:
          | { item_id_param: string }
          | { item_id_param: string; reason_param?: string }
        Returns: Json
      }
      ban_user_progressive: {
        Args: {
          admin_user_id: string
          ban_reason: string
          target_user_id: string
        }
        Returns: {
          ban_duration_days: number
          ban_id: string
          ban_type: string
          previous_ban_count: number
        }[]
      }
      calculate_user_earnings: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_username_availability: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      cleanup_all_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_user_data: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_action_by: string
          p_action_taken: string
          p_message: string
          p_reference_id: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      create_trade_accepted_notification: {
        Args: { p_conversation_id: string; p_message?: string }
        Returns: string
      }
      create_trade_completed_notifications: {
        Args: { p_conversation_id: string; p_message?: string }
        Returns: undefined
      }
      deactivate_user_account: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      delete_item_cascade: {
        Args: { p_item_id: string }
        Returns: undefined
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_notifications: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
      delete_user_support_data: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
      get_book_discussion_counts: {
        Args: { book_ids: string[] }
        Returns: {
          book_id: string
          discussion_count: number
        }[]
      }
      get_book_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          cover_url: string
          created_at: string
          created_by: string
          genre: Database["public"]["Enums"]["book_genre"]
          id: string
          isbn: string
          published_year: number
          requester_username: string
          status: Database["public"]["Enums"]["book_request_status"]
          title: string
        }[]
      }
      get_chapter_stats: {
        Args: { chapter_ids: string[] }
        Returns: {
          chapter_id: string
          reaction_count: number
          view_count: number
        }[]
      }
      get_discussion_like_counts: {
        Args: { discussion_ids: string[] }
        Returns: {
          discussion_id: string
          like_count: number
        }[]
      }
      get_moderators: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          created_by: string
          email: string
          id: string
          is_active: boolean
          username: string
        }[]
      }
      get_most_engaged_books: {
        Args: { limit_count: number }
        Returns: {
          author: string
          book_id: string
          cover_url: string
          discussion_count: number
          genre: Database["public"]["Enums"]["book_genre"]
          published_year: number
          reaction_count: number
          title: string
          view_count: number
        }[]
      }
      get_recent_discussions: {
        Args: { limit_count: number }
        Returns: {
          avatar_url: string
          book_id: string
          book_title: string
          chapter_id: string
          chapter_number: number
          chapter_title: string
          content: string
          created_at: string
          discussion_id: string
          username: string
        }[]
      }
      get_reports: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_status?: Database["public"]["Enums"]["report_status"]
          p_type?: Database["public"]["Enums"]["report_type"]
        }
        Returns: {
          action_taken: string
          attachment_count: number
          book_id: string
          book_title: string
          chapter_id: string
          chapter_number: number
          chapter_title: string
          created_at: string
          id: string
          message: string
          reporter_id: string
          reporter_username: string
          status: Database["public"]["Enums"]["report_status"]
          status_changed_at: string
          status_changed_by: string
          status_changed_by_username: string
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string
        }[]
      }
      get_trending_books: {
        Args: { limit_count: number }
        Returns: {
          author: string
          book_id: string
          cover_url: string
          discussion_count: number
          genre: Database["public"]["Enums"]["book_genre"]
          published_year: number
          reaction_count: number
          title: string
          view_count: number
        }[]
      }
      get_user_ban_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_user_discussions_paginated: {
        Args: { p_limit: number; p_offset: number; p_user_id: string }
        Returns: Json[]
      }
      get_user_notifications: {
        Args: { p_user_id: string }
        Returns: {
          action_by_username: string
          book_title: string
          chapter_number: number
          chapter_title: string
          created_at: string
          id: string
          message: string
          reference_id: string
          report_type: string
          resolved_at: string
          resolved_by: string
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }[]
      }
      get_user_notifications_paginated: {
        Args: { p_limit: number; p_offset: number; p_user_id: string }
        Returns: {
          action_by_username: string
          book_title: string
          chapter_number: number
          chapter_title: string
          created_at: string
          id: string
          message: string
          reference_id: string
          report_type: string
          resolved_at: string
          resolved_by: string
          status: Database["public"]["Enums"]["notification_status"]
          total_count: number
          type: Database["public"]["Enums"]["notification_type"]
        }[]
      }
      get_user_stats: {
        Args: { user_id_param: string }
        Returns: {
          discussion_count: number
          followed_books_count: number
          received_likes_count: number
        }[]
      }
      has_role: {
        Args: { role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Returns: boolean
      }
      increment_user_strikes: {
        Args: { target_user_id: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_moderator: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_banned: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_user_blocked: {
        Args: { blocked_user_id: string; blocker_user_id: string }
        Returns: boolean
      }
      mark_notification_as_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      remove_moderator: {
        Args: { admin_user_id: string; moderator_id: string }
        Returns: undefined
      }
      search_books: {
        Args: { search_term: string }
        Returns: {
          author: string
          chapter_count: number
          cover_url: string
          genre: Database["public"]["Enums"]["book_genre"]
          has_epilogue: boolean
          has_prologue: boolean
          id: string
          published_year: number
          title: string
        }[]
      }
      search_books_ai: {
        Args: { query: string }
        Returns: Json
      }
      send_violation_notification: {
        Args:
          | {
              item_id: string
              item_name: string
              strike_count: number
              target_user_id: string
              violation_reason: string
            }
          | {
              item_name: string
              strike_count: number
              target_user_id: string
              violation_reason: string
            }
        Returns: string
      }
      toggle_moderator_status: {
        Args: { admin_user_id: string; moderator_id: string }
        Returns: undefined
      }
      update_report_status: {
        Args:
          | {
              p_action_taken?: string
              p_report_id: string
              p_status: Database["public"]["Enums"]["report_status"]
              p_user_id: string
            }
          | {
              p_report_id: string
              p_status: Database["public"]["Enums"]["report_status"]
            }
        Returns: undefined
      }
      update_submission_admin: {
        Args: {
          new_status: string
          rejection_reason_param?: string
          submission_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      book_genre:
        | "Self-Help"
        | "Business"
        | "Biography"
        | "Psychology"
        | "History"
        | "Science"
        | "Personal Development"
        | "Health & Wellness"
        | "Fantasy"
        | "Science Fiction"
        | "Mystery"
        | "Romance"
        | "Thriller"
        | "Contemporary Fiction"
        | "Historical Fiction"
        | "Autobiography"
        | "Memoir"
        | "Philosophy"
        | "Travel"
        | "True Crime"
        | "Religion & Spirituality"
        | "Political Science"
        | "Horror"
        | "Adventure"
        | "Dystopian"
        | "Literary Fiction"
        | "Magical Realism"
        | "Gothic Fiction"
        | "Psychological Fiction"
        | "Crime Fiction"
        | "Children's Literature"
      book_request_status: "draft" | "submitted" | "approved" | "rejected"
      notification_status: "unread" | "read"
      notification_type:
        | "book_request"
        | "report"
        | "comment"
        | "sub_comment"
        | "violation"
      offer_status: "active" | "withdrawn" | "refunded" | "paid_out"
      payment_status: "pending" | "held" | "released" | "refunded" | "failed"
      report_status: "open" | "in_progress" | "resolved"
      report_type: "book" | "chapter" | "general"
      submission_type:
        | "video"
        | "image"
        | "audio"
        | "document"
        | "archive"
        | "link"
      task_status:
        | "open"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
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
      app_role: ["admin", "moderator", "user"],
      book_genre: [
        "Self-Help",
        "Business",
        "Biography",
        "Psychology",
        "History",
        "Science",
        "Personal Development",
        "Health & Wellness",
        "Fantasy",
        "Science Fiction",
        "Mystery",
        "Romance",
        "Thriller",
        "Contemporary Fiction",
        "Historical Fiction",
        "Autobiography",
        "Memoir",
        "Philosophy",
        "Travel",
        "True Crime",
        "Religion & Spirituality",
        "Political Science",
        "Horror",
        "Adventure",
        "Dystopian",
        "Literary Fiction",
        "Magical Realism",
        "Gothic Fiction",
        "Psychological Fiction",
        "Crime Fiction",
        "Children's Literature",
      ],
      book_request_status: ["draft", "submitted", "approved", "rejected"],
      notification_status: ["unread", "read"],
      notification_type: [
        "book_request",
        "report",
        "comment",
        "sub_comment",
        "violation",
      ],
      offer_status: ["active", "withdrawn", "refunded", "paid_out"],
      payment_status: ["pending", "held", "released", "refunded", "failed"],
      report_status: ["open", "in_progress", "resolved"],
      report_type: ["book", "chapter", "general"],
      submission_type: [
        "video",
        "image",
        "audio",
        "document",
        "archive",
        "link",
      ],
      task_status: [
        "open",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
