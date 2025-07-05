"use client";

import { usePathname } from "next/navigation";
import { SplashCursor } from "./splash-cursor";

export function SplashCursorWrapper() {
  const pathname = usePathname();
  const isGamePage = pathname?.startsWith('/game');
  const isLeaderboardPage = pathname?.startsWith('/leaderboard');

  if (isGamePage || isLeaderboardPage) {
    return null;
  }

  return <SplashCursor />;
} 