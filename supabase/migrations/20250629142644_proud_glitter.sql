/*
  # Create game sessions table

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `room_code` (text, unique)
      - `host_id` (uuid, foreign key to users)
      - `status` (enum: waiting, playing, finished)
      - `current_round` (integer, default 1)
      - `max_rounds` (integer, default 3)
      - `max_players` (integer, default 8)
      - `current_drawer` (uuid, nullable, foreign key to users)
      - `current_word` (text, nullable)
      - `round_start_time` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `game_sessions` table
    - Add policies for game participants
*/

-- Create game status enum
DO $$ BEGIN
  CREATE TYPE game_status AS ENUM ('waiting', 'playing', 'finished');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status game_status DEFAULT 'waiting',
  current_round integer DEFAULT 1,
  max_rounds integer DEFAULT 3,
  max_players integer DEFAULT 8,
  current_drawer uuid REFERENCES users(id),
  current_word text,
  round_start_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access to game sessions (for joining rooms)
CREATE POLICY "Public read access to game sessions"
  ON game_sessions
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create game sessions
CREATE POLICY "Authenticated users can create game sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Game participants can update sessions
CREATE POLICY "Game participants can update sessions"
  ON game_sessions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = host_id OR 
    auth.uid() IN (
      SELECT player_id FROM game_participants WHERE game_id = id
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_code ON game_sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host ON game_sessions(host_id);