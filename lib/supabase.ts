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
    try {
      if (period === 'all_time') {
        // Use the database function for all-time leaderboard
        const { data, error } = await supabase
          .rpc('get_all_time_leaderboard', { limit_count: limit })
        
        if (error) throw error
        
        return data?.map((item: any) => ({
          player_id: item.player_id,
          total_score: item.total_score,
          games_played: item.games_played,
          games_won: item.games_won,
          average_score: parseFloat(item.average_score) || 0,
          win_rate: parseFloat(item.win_rate) || 0,
          users: {
            username: item.username,
            avatar_url: item.avatar_url
          }
        })) || []
      } else {
        // For time-based periods, we need to query game data directly with proper date filtering
        let startDate = new Date()
        
        switch (period) {
          case 'daily':
            // Set to start of today (midnight)
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
            break
          case 'weekly':
            // Set to start of current week (Sunday)
            const dayOfWeek = startDate.getDay()
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - dayOfWeek)
            break
          case 'monthly':
            // Set to start of current month
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
            break
        }
        
        // Get game sessions for the period
        console.log(`Fetching games for ${period} from ${startDate.toISOString()}`)
        const { data: gameSessions, error: gameError } = await supabase
          .from('game_sessions')
          .select('id, updated_at')
          .eq('status', 'finished')
          .gte('updated_at', startDate.toISOString())
        
        if (gameError) throw gameError
        
        console.log(`Found ${gameSessions?.length || 0} games for ${period}`)
        console.log('Game sessions:', gameSessions?.map(gs => ({
          id: gs.id,
          updated_at: gs.updated_at,
          date: new Date(gs.updated_at).toLocaleDateString()
        })))
        
        if (!gameSessions || gameSessions.length === 0) {
          return []
        }
        
        const gameIds = gameSessions.map(gs => gs.id)
        
        // Get participant data for these games
        const { data: participants, error: participantError } = await supabase
          .from('game_participants')
          .select(`
            game_id,
            player_id,
            score,
            users (username, avatar_url)
          `)
          .in('game_id', gameIds)
        
        if (participantError) throw participantError
        
        console.log(`Found ${participants?.length || 0} participants for ${period}`)
        console.log('Participant data:', participants)
        
        // Calculate leaderboard data
        const playerStats = new Map()
        
        participants?.forEach((participant: any) => {
          const playerId = participant.player_id
          if (!playerStats.has(playerId)) {
            playerStats.set(playerId, {
              player_id: playerId,
              total_score: 0,
              games_played: new Set(),
              games_won: new Set(),
              users: participant.users
            })
          }
          
          const stats = playerStats.get(playerId)
          stats.total_score += participant.score || 0
          stats.games_played.add(participant.game_id)
          
          // Check if this player won the game (highest score in the game)
          const gameParticipants = participants.filter((p: any) => p.game_id === participant.game_id)
          const maxScore = Math.max(...gameParticipants.map((p: any) => p.score || 0))
          if (participant.score === maxScore) {
            stats.games_won.add(participant.game_id)
          }
        })
        
        // Convert to array and calculate final stats
        const leaderboardData = Array.from(playerStats.values()).map((stats: any) => ({
          player_id: stats.player_id,
          total_score: stats.total_score,
          games_played: stats.games_played.size,
          games_won: stats.games_won.size,
          average_score: stats.games_played.size > 0 ? stats.total_score / stats.games_played.size : 0,
          win_rate: stats.games_played.size > 0 ? (stats.games_won.size / stats.games_played.size * 100) : 0,
          users: stats.users
        }))
        
        // Sort by total score and return top players (only those who played games)
        return leaderboardData
          .filter(player => player.games_played > 0)
          .sort((a, b) => b.total_score - a.total_score)
          .slice(0, limit)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      // Return empty array on error
      return []
    }
  },

  // Active games
  async getActiveGames() {
    const { data, error } = await supabase
      .from('active_games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get game count for a specific period
  async getGameCountForPeriod(period: 'daily' | 'weekly' | 'monthly' | 'all_time') {
    try {
      let startDate = new Date()
      
      switch (period) {
        case 'daily':
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
          break
        case 'weekly':
          const dayOfWeek = startDate.getDay()
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - dayOfWeek)
          break
        case 'monthly':
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
          break
        case 'all_time':
          // For all-time, we don't need date filtering
          const { count, error } = await supabase
            .from('game_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'finished')
          
          if (error) throw error
          return count || 0
      }
      
      const { count, error } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finished')
        .gte('updated_at', startDate.toISOString())
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Failed to get game count:', error)
      return 0
    }
  }
}