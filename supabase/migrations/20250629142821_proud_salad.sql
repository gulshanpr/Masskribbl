/*
  # Setup Realtime subscriptions

  1. Enable Realtime
    - Enable realtime for relevant tables
    - Configure publication settings

  2. Security
    - Ensure RLS policies work with realtime
*/

-- Enable realtime for game-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE drawing_strokes;
ALTER PUBLICATION supabase_realtime ADD TABLE game_rounds;

-- Enable realtime for user updates (for live leaderboards)
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboards;