"use client";

import { usePathname } from "next/navigation";
import { SplashCursor } from "./splash-cursor";

export function SplashCursorWrapper() {
  const pathname = usePathname();
  const isGamePage = pathname?.startsWith('/game');

  if (isGamePage) {
    return null;
  }

  return <SplashCursor />;
} 