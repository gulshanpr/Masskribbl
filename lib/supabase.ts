import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          total_score: number
          games_played: number
          games_won: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_url?: string | null
          total_score?: number
          games_played?: number
          games_won?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          total_score?: number
          games_played?: number
          games_won?: number
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          room_code: string
          host_id: string
          status: 'waiting' | 'playing' | 'finished'
          current_round: number
          max_rounds: number
          max_players: number
          current_drawer: string | null
          current_word: string | null
          round_start_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_code: string
          host_id: string
          status?: 'waiting' | 'playing' | 'finished'
          current_round?: number
          max_rounds?: number
          max_players?: number
          current_drawer?: string | null
          current_word?: string | null
          round_start_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_code?: string
          host_id?: string
          status?: 'waiting' | 'playing' | 'finished'
          current_round?: number
          max_rounds?: number
          max_players?: number
          current_drawer?: string | null
          current_word?: string | null
          round_start_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_participants: {
        Row: {
          id: string
          game_id: string
          player_id: string
          score: number
          is_ready: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          score?: number
          is_ready?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          score?: number
          is_ready?: boolean
          joined_at?: string
        }
      }
      game_rounds: {
        Row: {
          id: string
          game_id: string
          round_number: number
          drawer_id: string
          word: string
          started_at: string
          ended_at: string | null
          duration_seconds: number
        }
        Insert: {
          id?: string
          game_id: string
          round_number: number
          drawer_id: string
          word: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number
        }
        Update: {
          id?: string
          game_id?: string
          round_number?: number
          drawer_id?: string
          word?: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number
        }
      }
      words: {
        Row: {
          id: string
          word: string
          difficulty: 'easy' | 'medium' | 'hard'
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          game_id: string
          player_id: string
          message: string
          is_guess: boolean
          is_correct: boolean
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          message: string
          is_guess?: boolean
          is_correct?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          message?: string
          is_guess?: boolean
          is_correct?: boolean
          created_at?: string
        }
      }
      drawing_strokes: {
        Row: {
          id: string
          game_id: string
          round_id: string | null
          player_id: string
          stroke_data: any
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          round_id?: string | null
          player_id: string
          stroke_data: any
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          round_id?: string | null
          player_id?: string
          stroke_data?: any
          created_at?: string
        }
      }
      leaderboards: {
        Row: {
          id: string
          player_id: string
          period: 'daily' | 'weekly' | 'monthly' | 'all_time'
          total_score: number
          games_played: number
          games_won: number
          average_score: number
          win_rate: number
          period_start: string
          period_end: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          period: 'daily' | 'weekly' | 'monthly' | 'all_time'
          total_score?: number
          games_played?: number
          games_won?: number
          period_start: string
          period_end: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          period?: 'daily' | 'weekly' | 'monthly' | 'all_time'
          total_score?: number
          games_played?: number
          games_won?: number
          period_start?: string
          period_end?: string
          updated_at?: string
        }
      }
    }
    Views: {
      active_games: {
        Row: {
          id: string
          room_code: string
          status: string
          current_round: number
          max_rounds: number
          max_players: number
          current_players: number
          host_username: string
          created_at: string
        }
      }
      top_players: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          total_score: number
          games_played: number
          games_won: number
          average_score: number
          win_rate: number
          rank: number
        }
      }
    }
    Functions: {
      get_random_words: {
        Args: {
          word_count?: number
          word_category?: string
          word_difficulty?: 'easy' | 'medium' | 'hard'
        }
        Returns: {
          word: string
          category: string
          difficulty: 'easy' | 'medium' | 'hard'
        }[]
      }
      update_user_stats: {
        Args: {
          user_id: string
          score_gained: number
          won?: boolean
        }
        Returns: void
      }
    }
  }
}

// Helper functions for database operations
export const dbOperations = {
  // User operations
  async createUser(userData: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserStats(userId: string, scoreGained: number, won: boolean = false) {
    const { error } = await supabase.rpc('update_user_stats', {
      user_id: userId,
      score_gained: scoreGained,
      won
    })
    
    if (error) throw error
  },

  // Game operations
  async createGameSession(gameData: Database['public']['Tables']['game_sessions']['Insert']) {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert(gameData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getGameSession(roomCode: string) {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        game_participants (
          *,
          users (username, avatar_url)
        )
      `)
      .eq('room_code', roomCode)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async addGameParticipant(gameId: string, playerId: string) {
    const { data, error } = await supabase
      .from('game_participants')
      .insert({
        game_id: gameId,
        player_id: playerId
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateGameSession(id: string, updates: Database['public']['Tables']['game_sessions']['Update']) {
    const { data, error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createGameRound(roundData: Database['public']['Tables']['game_rounds']['Insert']) {
    const { data, error } = await supabase
      .from('game_rounds')
      .insert(roundData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async endGameRound(roundId: string) {
    const { data, error } = await supabase
      .from('game_rounds')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', roundId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateParticipantScore(gameId: string, playerId: string, score: number) {
    const { data, error } = await supabase
      .from('game_participants')
      .update({ score })
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Word operations
  async getRandomWords(count: number = 3, category?: string, difficulty?: 'easy' | 'medium' | 'hard') {
    const { data, error } = await supabase.rpc('get_random_words', {
      word_count: count,
      word_category: category,
      word_difficulty: difficulty
    })
    
    if (error) throw error
    return data
  },

  // Chat operations
  async saveChatMessage(messageData: Database['public']['Tables']['chat_messages']['Insert']) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Drawing operations
  async saveDrawingStroke(strokeData: Database['public']['Tables']['drawing_strokes']['Insert']) {
    const { data, error } = await supabase
      .from('drawing_strokes')
      .insert(strokeData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getDrawingStrokes(gameId: string, roundId?: string) {
    let query = supabase
      .from('drawing_strokes')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true })
    
    if (roundId) {
      query = query.eq('round_id', roundId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async clearDrawingStrokes(gameId: string, roundId: string) {
    const { error } = await supabase
      .from('drawing_strokes')
      .delete()
      .eq('game_id', gameId)
      .eq('round_id', roundId)
    
    if (error) throw error
  },

  // Leaderboard operations
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time', limit: number = 10) {
    const { data, error } = await supabase
      .from('leaderboards')
      .select(`
        *,
        users (username, avatar_url)
      `)
      .eq('period', period)
      .order('total_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Active games
  async getActiveGames() {
    const { data, error } = await supabase
      .from('active_games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}