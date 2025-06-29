/*
  # Create views and additional indexes for performance

  1. Views
    - Active games view
    - Top players view
    - Game statistics view
    - Recent games view

  2. Additional Indexes
    - Performance optimization indexes
    - Composite indexes for common queries
*/

-- View for active games
CREATE OR REPLACE VIEW active_games AS
SELECT 
  gs.id,
  gs.room_code,
  gs.status,
  gs.current_round,
  gs.max_rounds,
  gs.max_players,
  COUNT(gp.player_id) as current_players,
  u.username as host_username,
  gs.created_at
FROM game_sessions gs
LEFT JOIN game_participants gp ON gs.id = gp.game_id
LEFT JOIN users u ON gs.host_id = u.id
WHERE gs.status IN ('waiting', 'playing')
GROUP BY gs.id, u.username;

-- View for top players (all time)
CREATE OR REPLACE VIEW top_players AS
SELECT 
  u.id,
  u.username,
  u.avatar_url,
  u.total_score,
  u.games_played,
  u.games_won,
  CASE 
    WHEN u.games_played > 0 THEN ROUND(u.total_score::decimal / u.games_played, 2)
    ELSE 0 
  END as average_score,
  CASE 
    WHEN u.games_played > 0 THEN ROUND(u.games_won::decimal / u.games_played * 100, 2)
    ELSE 0 
  END as win_rate,
  ROW_NUMBER() OVER (ORDER BY u.total_score DESC) as rank
FROM users u
WHERE u.games_played > 0
ORDER BY u.total_score DESC;

-- View for game statistics
CREATE OR REPLACE VIEW game_statistics AS
SELECT 
  gs.id,
  gs.room_code,
  gs.status,
  gs.created_at,
  gs.updated_at,
  COUNT(gp.player_id) as total_players,
  COUNT(gr.id) as total_rounds,
  AVG(gp.score) as average_score,
  MAX(gp.score) as highest_score,
  u.username as winner_username
FROM game_sessions gs
LEFT JOIN game_participants gp ON gs.id = gp.game_id
LEFT JOIN game_rounds gr ON gs.id = gr.game_id
LEFT JOIN users u ON u.id = (
  SELECT gp2.player_id 
  FROM game_participants gp2 
  WHERE gp2.game_id = gs.id 
  ORDER BY gp2.score DESC 
  LIMIT 1
)
WHERE gs.status = 'finished'
GROUP BY gs.id, u.username;

-- View for recent games
CREATE OR REPLACE VIEW recent_games AS
SELECT 
  gs.id,
  gs.room_code,
  gs.status,
  gs.created_at,
  gs.updated_at,
  COUNT(gp.player_id) as player_count,
  MAX(gp.score) as winning_score,
  u.username as winner
FROM game_sessions gs
LEFT JOIN game_participants gp ON gs.id = gp.game_id
LEFT JOIN users u ON u.id = (
  SELECT gp2.player_id 
  FROM game_participants gp2 
  WHERE gp2.game_id = gs.id 
  ORDER BY gp2.score DESC 
  LIMIT 1
)
WHERE gs.status = 'finished'
  AND gs.updated_at > now() - interval '24 hours'
GROUP BY gs.id, u.username
ORDER BY gs.updated_at DESC;

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_status_updated ON game_sessions(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_game_participants_score ON game_participants(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_created ON chat_messages(game_id, created_at);
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_game_created ON drawing_strokes(game_id, created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_status_host ON game_sessions(status, host_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period_score ON leaderboards(period, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_words_category_difficulty ON words(category, difficulty);