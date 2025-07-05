'use client'

import React, { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import WinnerPopup from './WinnerPopup'

export default function GameEndHandler() {
  const { gameState, user } = useGameStore()
  const [showWinnerPopup, setShowWinnerPopup] = useState(false)
  const [winner, setWinner] = useState<any>(null)

  useEffect(() => {
    const socket = socketManager.getSocket()
    if (!socket) return

    const handleGameEnd = (results: any) => {
      if (gameState && gameState.players.length > 0) {
        // Find the winner (player with highest score)
        const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score)
        const winnerPlayer = sortedPlayers[0]
        
        setWinner({
          id: winnerPlayer.id,
          username: winnerPlayer.username,
          avatar: winnerPlayer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winnerPlayer.username}`,
          score: winnerPlayer.score
        })
        
        setShowWinnerPopup(true)
      }
    }

    socket.on('game:end', handleGameEnd)

    return () => {
      socket.off('game:end', handleGameEnd)
    }
  }, [gameState])

  // Also check for game finished status
  useEffect(() => {
    if (gameState?.status === 'finished' && gameState.players.length > 0 && !showWinnerPopup) {
      const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score)
      const winnerPlayer = sortedPlayers[0]
      
      setWinner({
        id: winnerPlayer.id,
        username: winnerPlayer.username,
        avatar: winnerPlayer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winnerPlayer.username}`,
        score: winnerPlayer.score
      })
      
      setShowWinnerPopup(true)
    }
  }, [gameState?.status, gameState?.players, showWinnerPopup])

  if (!winner || !gameState) return null

  return (
    <WinnerPopup
      isOpen={showWinnerPopup}
      onClose={() => setShowWinnerPopup(false)}
      winner={winner}
      allPlayers={gameState.players.map(p => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`,
        score: p.score
      }))}
      isCurrentUser={winner.id === user?.id}
    />
  )
}