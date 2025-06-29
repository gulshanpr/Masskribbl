/*
  # Create words table

  1. New Tables
    - `words`
      - `id` (uuid, primary key)
      - `word` (text, unique)
      - `difficulty` (enum: easy, medium, hard)
      - `category` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `words` table
    - Add policy for public read access
    - Add policy for authenticated users to suggest words
*/

-- Create difficulty enum
DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text UNIQUE NOT NULL,
  difficulty difficulty_level DEFAULT 'medium',
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Public read access to words
CREATE POLICY "Public read access to words"
  ON words
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can suggest new words
CREATE POLICY "Authenticated users can insert words"
  ON words
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty);