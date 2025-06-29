/*
  # Create chat messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to game_sessions)
      - `player_id` (uuid, foreign key to users)
      - `message` (text)
      - `is_guess` (boolean, default false)
      - `is_correct` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for game participants
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_guess boolean DEFAULT false,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read access to chat messages
CREATE POLICY "Public read access to chat messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

-- Game participants can send messages
CREATE POLICY "Game participants can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = player_id AND
    auth.uid() IN (
      SELECT player_id FROM game_participants WHERE game_id = chat_messages.game_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_game ON chat_messages(game_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_player ON chat_messages(player_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);