'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { dbOperations } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp, 
  Users, 
  Target, 
  Zap,
  Home,
  Sparkles,
  Award,
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react'
import { Toaster } from 'react-hot-toast'

interface LeaderboardPlayer {
  id: string
  username: string
  avatar_url: string | null
  total_score: number
  games_played: number
  games_won: number
  average_score: number
  win_rate: number
  rank: number
}

type Period = 'daily' | 'weekly' | 'monthly' | 'all_time'

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all_time')
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalGames: 0,
    averageScore: 0
  })

  const periods = [
    { key: 'daily' as Period, label: 'Today', icon: Clock },
    { key: 'weekly' as Period, label: 'This Week', icon: Calendar },
    { key: 'monthly' as Period, label: 'This Month', icon: BarChart3 },
    { key: 'all_time' as Period, label: 'All Time', icon: Trophy }
  ]

  useEffect(() => {
    fetchLeaderboard()
    
    // Set up real-time updates
    const interval = setInterval(fetchLeaderboard, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const data = await dbOperations.getLeaderboard(selectedPeriod, 50)
      
      console.log(`Leaderboard data for ${selectedPeriod}:`, data)
      
      // Transform data to match our interface
      const transformedData: LeaderboardPlayer[] = data.map((item: any, index: number) => ({
        id: item.player_id,
        username: item.users?.username || 'Unknown',
        avatar_url: item.users?.avatar_url,
        total_score: item.total_score || 0,
        games_played: item.games_played || 0,
        games_won: item.games_won || 0,
        average_score: parseFloat(item.average_score) || 0,
        win_rate: parseFloat(item.win_rate) || 0,
        rank: index + 1
      }))
      
      setPlayers(transformedData)
      
      // Calculate stats for the selected period
      const totalScore = transformedData.reduce((sum, p) => sum + p.total_score, 0)
      
              // Get the actual number of games for this period
        const totalGames = await dbOperations.getGameCountForPeriod(selectedPeriod)
      
      setStats({
        totalPlayers: transformedData.length,
        totalGames: totalGames,
        averageScore: transformedData.length > 0 ? Math.round(totalScore / transformedData.length) : 0
      })
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-400" />
      case 3: return <Award className="w-6 h-6 text-orange-600" />
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-white/60">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-orange-500'
      case 2: return 'from-gray-300 to-gray-500'
      case 3: return 'from-orange-500 to-red-500'
      default: return 'from-purple-500 to-pink-500'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [-5, 5, -5],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.2),transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="fixed top-20 left-10 opacity-20"
      >
        <Trophy className="w-16 h-16 text-yellow-400" />
      </motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
        className="fixed top-40 right-20 opacity-20"
      >
        <Star className="w-12 h-12 text-pink-400" />
      </motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '4s' }}
        className="fixed bottom-20 left-20 opacity-20"
      >
        <Sparkles className="w-14 h-14 text-blue-400" />
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            LEADERBOARD
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-white/80 mb-8"
          >
            Compete with the best players worldwide
          </motion.p>

          {/* Period Selector */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {periods.map((period) => (
              <motion.div key={period.key} variants={itemVariants}>
                <Button
                  onClick={() => setSelectedPeriod(period.key)}
                  variant={selectedPeriod === period.key ? 'default' : 'outline'}
                  className={`
                    transition-all duration-300 ${
                    selectedPeriod === period.key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-glow'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <period.icon className="w-4 h-4 mr-2" />
                  {period.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { icon: Users, label: 'Total Players', value: stats.totalPlayers, color: 'from-blue-500 to-cyan-500' },
            { icon: Target, label: 'Games Played', value: stats.totalGames, color: 'from-green-500 to-emerald-500' },
            { icon: TrendingUp, label: 'Average Score', value: stats.averageScore, color: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="glass border-white/20 hover:border-white/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Top Players - {periods.find(p => p.key === selectedPeriod)?.label}
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"
                  />
                </div>
              ) : (
                <div className="space-y-2 p-6">
                  <AnimatePresence>
                    {players.map((player, index) => (
                      <motion.div
                        key={`${player.id}-${selectedPeriod}-${index}`}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        className={`
                          relative p-4 rounded-xl transition-all duration-300 cursor-pointer
                          ${index < 3 
                            ? `bg-gradient-to-r ${getRankBadgeColor(index + 1)}/20 border-2 border-gradient-to-r ${getRankBadgeColor(index + 1)}/40` 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }
                        `}
                      >
                        {/* Rank Glow Effect for Top 3 */}
                        {index < 3 && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${getRankBadgeColor(index + 1)}/10 rounded-xl blur-xl`} />
                        )}
                        
                        <div className="relative flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0">
                            {getRankIcon(index + 1)}
                          </div>

                          {/* Avatar */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative"
                          >
                            <Avatar className={`w-12 h-12 ${index < 3 ? 'ring-2 ring-white/30' : ''}`}>
                              <AvatarImage src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
                                {player.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            {index === 0 && (
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1"
                              >
                                <Crown className="w-3 h-3 text-black" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Player Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white truncate">
                                {player.username}
                              </h3>
                              {index < 3 && (
                                <Badge className={`bg-gradient-to-r ${getRankBadgeColor(index + 1)} text-white text-xs`}>
                                  {index === 0 ? 'CHAMPION' : index === 1 ? 'RUNNER-UP' : 'BRONZE'}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {player.games_played} games
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {player.win_rate.toFixed(1)}% win rate
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-xl font-bold text-white">
                                {player.total_score.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-white/60">
                              {player.average_score.toFixed(1)} avg
                            </div>
                          </div>

                          {/* Trend Indicator */}
                          <div className="flex-shrink-0">
                            <motion.div
                              animate={{ y: [-2, 2, -2] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-green-400"
                            >
                              <ChevronUp className="w-5 h-5" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {players.length === 0 && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No players found for this period</p>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-white/40 text-sm"
        >
          <p>Leaderboard updates in real-time • Last updated: <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span></p>
        </motion.div>
      </div>
    </div>
  )
}