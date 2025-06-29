/*
  # Create game participants table

  1. New Tables
    - `game_participants`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to game_sessions)
      - `player_id` (uuid, foreign key to users)
      - `score` (integer, default 0)
      - `is_ready` (boolean, default false)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on `game_participants` table
    - Add policies for game participants
*/

CREATE TABLE IF NOT EXISTS game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  is_ready boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(game_id, player_id)
);

-- Enable RLS
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Public read access to game participants
CREATE POLICY "Public read access to game participants"
  ON game_participants
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can join games
CREATE POLICY "Authenticated users can join games"
  ON game_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- Players can update their own participation
CREATE POLICY "Players can update own participation"
  ON game_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id);

-- Players can leave games
CREATE POLICY "Players can leave games"
  ON game_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = player_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_participants_game ON game_participants(game_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_player ON game_participants(player_id);