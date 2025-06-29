'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Crown, Palette } from 'lucide-react'

export default function PlayerList() {
  const { gameState, user } = useGameStore()

  if (!gameState) return null

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score)

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass rounded-lg p-4"
    >
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-400" />
        Players ({gameState.players.length})
      </h3>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all
              ${player.id === user?.id ? 'bg-primary/20 border border-primary/40' : 'bg-white/5'}
              ${player.isDrawing ? 'ring-2 ring-yellow-400' : ''}
            `}
          >
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`} />
                <AvatarFallback className="text-sm">
                  {player.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {player.isDrawing && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Palette className="w-3 h-3 text-black" />
                </div>
              )}
              
              {index === 0 && (
                <div className="absolute -top-2 -left-2 bg-yellow-400 rounded-full p-1">
                  <Crown className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white truncate">
                  {player.username}
                </span>
                {player.id === user?.id && (
                  <Badge variant="secondary" className="text-xs">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">
                  {player.score} points
                </span>
                {player.isDrawing && (
                  <Badge className="text-xs bg-yellow-400 text-black">
                    Drawing
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                #{index + 1}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {gameState.status === 'drawing' && (
        <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/40">
          <div className="text-sm text-blue-200">
            <strong>{gameState.players.find(p => p.isDrawing)?.username}</strong> is drawing
          </div>
          <div className="text-xs text-blue-300 mt-1">
            Round {gameState.round} of {gameState.maxRounds}
          </div>
        </div>
      )}
    </motion.div>
  )
}