/*
  # Create utility functions and triggers

  1. Functions
    - Function to update user statistics after game completion
    - Function to calculate leaderboard rankings
    - Function to clean up old game sessions
    - Function to get random words for game

  2. Triggers
    - Auto-update user stats when game ends
    - Auto-update leaderboards
*/

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats(
  user_id uuid,
  score_gained integer,
  won boolean DEFAULT false
)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    total_score = total_score + score_gained,
    games_played = games_played + 1,
    games_won = CASE WHEN won THEN games_won + 1 ELSE games_won END,
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get random words by category and difficulty
CREATE OR REPLACE FUNCTION get_random_words(
  word_count integer DEFAULT 3,
  word_category text DEFAULT NULL,
  word_difficulty difficulty_level DEFAULT NULL
)
RETURNS TABLE(word text, category text, difficulty difficulty_level) AS $$
BEGIN
  RETURN QUERY
  SELECT w.word, w.category, w.difficulty
  FROM words w
  WHERE 
    (word_category IS NULL OR w.category = word_category) AND
    (word_difficulty IS NULL OR w.difficulty = word_difficulty)
  ORDER BY RANDOM()
  LIMIT word_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update leaderboards
CREATE OR REPLACE FUNCTION update_leaderboards()
RETURNS void AS $$
DECLARE
  current_date date := CURRENT_DATE;
  week_start date := date_trunc('week', current_date)::date;
  month_start date := date_trunc('month', current_date)::date;
BEGIN
  -- Update daily leaderboards
  INSERT INTO leaderboards (player_id, period, total_score, games_played, games_won, period_start, period_end)
  SELECT 
    u.id,
    'daily'::leaderboard_period,
    COALESCE(SUM(gp.score), 0),
    COUNT(DISTINCT gs.id),
    COUNT(DISTINCT CASE WHEN gp.score = (
      SELECT MAX(gp2.score) 
      FROM game_participants gp2 
      WHERE gp2.game_id = gs.id
    ) THEN gs.id END),
    current_date,
    current_date
  FROM users u
  LEFT JOIN game_participants gp ON u.id = gp.player_id
  LEFT JOIN game_sessions gs ON gp.game_id = gs.id 
    AND gs.status = 'finished' 
    AND DATE(gs.updated_at) = current_date
  GROUP BY u.id
  ON CONFLICT (player_id, period, period_start) 
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    games_played = EXCLUDED.games_played,
    games_won = EXCLUDED.games_won,
    updated_at = now();

  -- Update weekly leaderboards
  INSERT INTO leaderboards (player_id, period, total_score, games_played, games_won, period_start, period_end)
  SELECT 
    u.id,
    'weekly'::leaderboard_period,
    COALESCE(SUM(gp.score), 0),
    COUNT(DISTINCT gs.id),
    COUNT(DISTINCT CASE WHEN gp.score = (
      SELECT MAX(gp2.score) 
      FROM game_participants gp2 
      WHERE gp2.game_id = gs.id
    ) THEN gs.id END),
    week_start,
    week_start + interval '6 days'
  FROM users u
  LEFT JOIN game_participants gp ON u.id = gp.player_id
  LEFT JOIN game_sessions gs ON gp.game_id = gs.id 
    AND gs.status = 'finished' 
    AND DATE(gs.updated_at) >= week_start
    AND DATE(gs.updated_at) < week_start + interval '7 days'
  GROUP BY u.id
  ON CONFLICT (player_id, period, period_start) 
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    games_played = EXCLUDED.games_played,
    games_won = EXCLUDED.games_won,
    updated_at = now();

  -- Update all-time leaderboards
  INSERT INTO leaderboards (player_id, period, total_score, games_played, games_won, period_start, period_end)
  SELECT 
    u.id,
    'all_time'::leaderboard_period,
    u.total_score,
    u.games_played,
    u.games_won,
    '1970-01-01'::date,
    '2099-12-31'::date
  FROM users u
  ON CONFLICT (player_id, period, period_start) 
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    games_played = EXCLUDED.games_played,
    games_won = EXCLUDED.games_won,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old game sessions
CREATE OR REPLACE FUNCTION cleanup_old_games()
RETURNS void AS $$
BEGIN
  -- Delete finished games older than 7 days
  DELETE FROM game_sessions 
  WHERE status = 'finished' 
    AND updated_at < now() - interval '7 days';
  
  -- Delete abandoned games older than 1 day
  DELETE FROM game_sessions 
  WHERE status IN ('waiting', 'playing') 
    AND updated_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to auto-update leaderboards when games finish
CREATE OR REPLACE FUNCTION trigger_update_leaderboards()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    PERFORM update_leaderboards();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_finished_update_leaderboards
  AFTER UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_leaderboards();