import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SplashCursorWrapper } from "@/components/ui/splash-cursor-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c3aed"
};

export const metadata: Metadata = {
  title: "MassKribbl - Draw & Guess Multiplayer Game",
  description: "The most fun real-time multiplayer drawing and guessing game. Play with friends or join random players worldwide!",
  keywords: "drawing game, multiplayer, skribbl, gartic, online game, draw and guess",
  authors: [{ name: "MassKribbl Team" }],
  openGraph: {
    title: "MassKribbl - Draw & Guess Multiplayer Game",
    description: "The most fun real-time multiplayer drawing and guessing game. Play with friends or join random players worldwide!",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MassKribbl Game"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "MassKribbl - Draw & Guess Multiplayer Game",
    description: "The most fun real-time multiplayer drawing and guessing game. Play with friends or join random players worldwide!",
    images: ["/og-image.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SplashCursorWrapper />
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </>
  );
}