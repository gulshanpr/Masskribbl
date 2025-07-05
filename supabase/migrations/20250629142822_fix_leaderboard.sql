/*
  # Fix leaderboard functionality

  1. Create a function to calculate leaderboard data directly from game data
  2. This avoids the issues with the leaderboards table having duplicate entries
  3. Provides accurate, real-time leaderboard data
*/

-- Function to get leaderboard data directly from game data
CREATE OR REPLACE FUNCTION get_leaderboard_data(
  period_filter text DEFAULT '',
  limit_count integer DEFAULT 10
)
RETURNS TABLE(
  player_id uuid,
  total_score bigint,
  games_played bigint,
  games_won bigint,
  average_score numeric,
  win_rate numeric,
  username text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  WITH player_stats AS (
    SELECT 
      u.id as player_id,
      u.username,
      u.avatar_url,
      COALESCE(SUM(gp.score), 0) as total_score,
      COUNT(DISTINCT gs.id) as games_played,
      COUNT(DISTINCT CASE 
        WHEN gp.score = (
          SELECT MAX(gp2.score) 
          FROM game_participants gp2 
          WHERE gp2.game_id = gs.id
        ) THEN gs.id 
      END) as games_won
    FROM users u
    LEFT JOIN game_participants gp ON u.id = gp.player_id
    LEFT JOIN game_sessions gs ON gp.game_id = gs.id 
      AND gs.status = 'finished'
      AND (period_filter = '' OR gs.updated_at::text ~ period_filter)
    GROUP BY u.id, u.username, u.avatar_url
    HAVING COUNT(DISTINCT gs.id) > 0
  )
  SELECT 
    ps.player_id,
    ps.total_score,
    ps.games_played,
    ps.games_won,
    CASE 
      WHEN ps.games_played > 0 THEN ps.total_score::numeric / ps.games_played 
      ELSE 0 
    END as average_score,
    CASE 
      WHEN ps.games_played > 0 THEN (ps.games_won::numeric / ps.games_played * 100)
      ELSE 0 
    END as win_rate,
    ps.username,
    ps.avatar_url
  FROM player_stats ps
  ORDER BY ps.total_score DESC, ps.games_won DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_leaderboard_data(text, integer) TO public;

-- Create a simpler function for all-time leaderboard using user stats
CREATE OR REPLACE FUNCTION get_all_time_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE(
  player_id uuid,
  total_score integer,
  games_played integer,
  games_won integer,
  average_score numeric,
  win_rate numeric,
  username text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as player_id,
    u.total_score,
    u.games_played,
    u.games_won,
    CASE 
      WHEN u.games_played > 0 THEN u.total_score::numeric / u.games_played 
      ELSE 0 
    END as average_score,
    CASE 
      WHEN u.games_played > 0 THEN (u.games_won::numeric / u.games_played * 100)
      ELSE 0 
    END as win_rate,
    u.username,
    u.avatar_url
  FROM users u
  WHERE u.games_played > 0
  ORDER BY u.total_score DESC, u.games_won DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_all_time_leaderboard(integer) TO public; 