/*
  # Create leaderboards table

  1. New Tables
    - `leaderboards`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to users)
      - `period` (enum: daily, weekly, monthly, all_time)
      - `total_score` (integer, default 0)
      - `games_played` (integer, default 0)
      - `games_won` (integer, default 0)
      - `average_score` (decimal, computed)
      - `win_rate` (decimal, computed)
      - `period_start` (date)
      - `period_end` (date)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `leaderboards` table
    - Add policies for public read access
*/

-- Create period enum
DO $$ BEGIN
  CREATE TYPE leaderboard_period AS ENUM ('daily', 'weekly', 'monthly', 'all_time');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period leaderboard_period NOT NULL,
  total_score integer DEFAULT 0,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  average_score decimal GENERATED ALWAYS AS (
    CASE 
      WHEN games_played > 0 THEN total_score::decimal / games_played 
      ELSE 0 
    END
  ) STORED,
  win_rate decimal GENERATED ALWAYS AS (
    CASE 
      WHEN games_played > 0 THEN games_won::decimal / games_played * 100 
      ELSE 0 
    END
  ) STORED,
  period_start date NOT NULL,
  period_end date NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, period, period_start)
);

-- Enable RLS
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Public read access to leaderboards
CREATE POLICY "Public read access to leaderboards"
  ON leaderboards
  FOR SELECT
  TO public
  USING (true);

-- System can update leaderboards
CREATE POLICY "System can manage leaderboards"
  ON leaderboards
  FOR ALL
  TO service_role
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_leaderboards_updated_at
  BEFORE UPDATE ON leaderboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_player ON leaderboards(player_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period_dates ON leaderboards(period, period_start, period_end);