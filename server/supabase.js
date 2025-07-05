require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Use service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

// Database operations for server
const dbOperations = {
  // Game session operations
  async createGameSession(gameData) {
    const { data, error } = await supabase
      .from("game_sessions")
      .insert(gameData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGameSession(id, updates) {
    const { data, error } = await supabase
      .from("game_sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGameSession(roomCode) {
    const { data, error } = await supabase
      .from("game_sessions")
      .select(
        `
        *,
        game_participants (
          *,
          users (username, avatar_url)
        )
      `
      )
      .eq("room_code", roomCode)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Game participants operations
  async addGameParticipant(gameId, playerId) {
    const { data, error } = await supabase
      .from("game_participants")
      .insert({
        game_id: gameId,
        player_id: playerId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateParticipantScore(gameId, playerId, score) {
    const { data, error } = await supabase
      .from("game_participants")
      .update({ score })
      .eq("game_id", gameId)
      .eq("player_id", playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeGameParticipant(gameId, playerId) {
    const { error } = await supabase
      .from("game_participants")
      .delete()
      .eq("game_id", gameId)
      .eq("player_id", playerId);

    if (error) throw error;
  },

  // Game rounds operations
  async createGameRound(roundData) {
    const { data, error } = await supabase
      .from("game_rounds")
      .insert(roundData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async endGameRound(roundId) {
    const { data, error } = await supabase
      .from("game_rounds")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", roundId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Chat operations
  async saveChatMessage(messageData) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Drawing operations
  async saveDrawingStroke(strokeData) {
    const { data, error } = await supabase
      .from("drawing_strokes")
      .insert(strokeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clearDrawingStrokes(gameId, roundId) {
    const { error } = await supabase
      .from("drawing_strokes")
      .delete()
      .eq("game_id", gameId)
      .eq("round_id", roundId);

    if (error) throw error;
  },

  // Word operations
  async getRandomWords(count = 3, category = null, difficulty = null) {
    const { data, error } = await supabase.rpc("get_random_words", {
      word_count: count,
      word_category: category,
      word_difficulty: difficulty,
    });

    if (error) throw error;
    return data;
  },

  // User statistics
  async updateUserStats(userId, scoreGained, won = false) {
    const { error } = await supabase.rpc("update_user_stats", {
      user_id: userId,
      score_gained: scoreGained,
      won,
    });

    if (error) throw error;
  },

  // Get user by ID
  async getUserById(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },
};

module.exports = { supabase, dbOperations };
