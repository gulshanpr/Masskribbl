/*
  # Create drawing strokes table

  1. New Tables
    - `drawing_strokes`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to game_sessions)
      - `round_id` (uuid, foreign key to game_rounds)
      - `player_id` (uuid, foreign key to users)
      - `stroke_data` (jsonb) - contains points, color, size
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `drawing_strokes` table
    - Add policies for game participants
*/

CREATE TABLE IF NOT EXISTS drawing_strokes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  round_id uuid REFERENCES game_rounds(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stroke_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE drawing_strokes ENABLE ROW LEVEL SECURITY;

-- Public read access to drawing strokes
CREATE POLICY "Public read access to drawing strokes"
  ON drawing_strokes
  FOR SELECT
  TO public
  USING (true);

-- Game participants can create strokes
CREATE POLICY "Game participants can create strokes"
  ON drawing_strokes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = player_id AND
    auth.uid() IN (
      SELECT player_id FROM game_participants WHERE game_id = drawing_strokes.game_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_game ON drawing_strokes(game_id);
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_round ON drawing_strokes(round_id);
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_player ON drawing_strokes(player_id);
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_created ON drawing_strokes(created_at);