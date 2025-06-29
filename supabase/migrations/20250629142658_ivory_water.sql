/*
  # Create game rounds table

  1. New Tables
    - `game_rounds`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to game_sessions)
      - `round_number` (integer)
      - `drawer_id` (uuid, foreign key to users)
      - `word` (text)
      - `started_at` (timestamp)
      - `ended_at` (timestamp, nullable)
      - `duration_seconds` (integer, default 80)

  2. Security
    - Enable RLS on `game_rounds` table
    - Add policies for game participants
*/

CREATE TABLE IF NOT EXISTS game_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  drawer_id uuid NOT NULL REFERENCES users(id),
  word text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer DEFAULT 80,
  UNIQUE(game_id, round_number)
);

-- Enable RLS
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;

-- Public read access to game rounds
CREATE POLICY "Public read access to game rounds"
  ON game_rounds
  FOR SELECT
  TO public
  USING (true);

-- Game participants can create rounds
CREATE POLICY "Game participants can create rounds"
  ON game_rounds
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT player_id FROM game_participants WHERE game_id = game_rounds.game_id
    )
  );

-- Game participants can update rounds
CREATE POLICY "Game participants can update rounds"
  ON game_rounds
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT player_id FROM game_participants WHERE game_id = game_rounds.game_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_rounds_game ON game_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_drawer ON game_rounds(drawer_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_started ON game_rounds(started_at);