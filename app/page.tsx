"use client";
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";
import LoginForm from "@/components/auth/LoginForm";
import QuickPlay from "@/components/lobby/QuickPlay";
import CreateRoom from "@/components/lobby/CreateRoom";
import JoinRoom from "@/components/lobby/JoinRoom";
import { Palette, Sparkles, Users, Trophy } from "lucide-react";
import { Toaster } from "react-hot-toast";
import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";
import LoginForm from "@/components/auth/LoginForm";
import QuickPlay from "@/components/lobby/QuickPlay";
import CreateRoom from "@/components/lobby/CreateRoom";
import JoinRoom from "@/components/lobby/JoinRoom";
import { Palette, Sparkles, Users, Trophy } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { user } = useGameStore();
  const { user } = useGameStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-6 animate-rainbow bg-clip-text text-transparent"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <span className="text-black">MassKribbl</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-white/80 mb-8"
            >
              Draw, Guess, and Have Fun with Friends!
            </motion.p>


            {/* Features */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            >
              {[
                { icon: Palette, text: "Creative Drawing" },
                { icon: Users, text: "Multiplayer Fun" },
                { icon: Sparkles, text: "Real-time Play" },
                { icon: Trophy, text: "Compete & Win" },
                { icon: Palette, text: "Creative Drawing" },
                { icon: Users, text: "Multiplayer Fun" },
                { icon: Sparkles, text: "Real-time Play" },
                { icon: Trophy, text: "Compete & Win" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="glass rounded-lg p-4 text-center animate-float"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-white/80 text-sm">{feature.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Login Form */}
          <div className="flex justify-center">
            <LoginForm />
          </div>
        </div>
      </div>
    );
    );
  }

  return (
    <div className="min-h-screen p-4">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-rainbow bg-clip-text text-transparent">
            <span className="text-black">MassKribbl</span>
          </h1>
          <p className="text-lg text-white/80">
            Welcome back,{" "}
            <span className="text-primary font-semibold">{user.username}</span>!
            Welcome back,{" "}
            <span className="text-primary font-semibold">{user.username}</span>!
          </p>
        </motion.div>

        {/* Game Options */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <QuickPlay />
          <CreateRoom />
          <JoinRoom />
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="glass rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Ready to Show Your Artistic Skills?
            </h3>
            <p className="text-white/60 mb-6">
              Join thousands of players in the most fun drawing and guessing
              game online!
              Join thousands of players in the most fun drawing and guessing
              game online!
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-white/60">Active Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-white/60">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-white/60">Fun Available</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
  );
}

