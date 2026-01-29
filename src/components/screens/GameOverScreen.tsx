import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Trophy, Medal, RotateCcw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerColor } from '@/types/game';

export const GameOverScreen: React.FC = () => {
  const { winner, rankings, resetGame, initializeGame, players, gameMode, aiDifficulty } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayAgain = () => {
    const playerCount = players.length;
    initializeGame(playerCount, gameMode, aiDifficulty);
  };

  const getColorClass = (color: PlayerColor) => {
    switch (color) {
      case 'red': return 'text-red-400';
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'blue': return 'text-blue-400';
    }
  };

  const getBgClass = (color: PlayerColor) => {
    switch (color) {
      case 'red': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'green': return 'from-green-500/20 to-green-600/10 border-green-500/30';
      case 'yellow': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 'blue': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background flex flex-col items-center justify-center px-6 py-8 overflow-hidden"
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: -20,
                backgroundColor: ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#a855f7'][
                  Math.floor(Math.random() * 5)
                ],
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{
                y: '100vh',
                rotate: 720,
                opacity: 0,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Winner announcement */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl"
          style={{
            boxShadow: '0 0 60px rgba(234, 179, 8, 0.5)',
          }}
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-foreground mb-2"
        >
          🎉 Winner! 🎉
        </motion.h1>

        {winner && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={cn('text-2xl font-bold', getColorClass(winner.color))}
          >
            {winner.name}
          </motion.p>
        )}
      </motion.div>

      {/* Rankings */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-3 mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground text-center mb-4">
          Final Rankings
        </h2>

        {rankings.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className={cn(
              'p-4 rounded-xl border bg-gradient-to-br flex items-center gap-4',
              getBgClass(player.color)
            )}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
              {index === 0 ? (
                <Trophy className="w-5 h-5 text-yellow-400" />
              ) : index === 1 ? (
                <Medal className="w-5 h-5 text-gray-300" />
              ) : index === 2 ? (
                <Medal className="w-5 h-5 text-amber-600" />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
              )}
            </div>

            {/* Player info */}
            <div className="flex-1">
              <h3 className={cn('font-semibold', getColorClass(player.color))}>
                {player.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {player.finishedTokens}/4 tokens home
              </p>
            </div>

            {/* Player color indicator */}
            <div
              className={cn(
                'w-6 h-6 rounded-full',
                player.color === 'red' && 'bg-red-500',
                player.color === 'green' && 'bg-green-500',
                player.color === 'yellow' && 'bg-yellow-500',
                player.color === 'blue' && 'bg-blue-500'
              )}
              style={{
                boxShadow: `0 0 15px ${
                  player.color === 'red'
                    ? 'rgba(239, 68, 68, 0.5)'
                    : player.color === 'green'
                    ? 'rgba(34, 197, 94, 0.5)'
                    : player.color === 'yellow'
                    ? 'rgba(234, 179, 8, 0.5)'
                    : 'rgba(59, 130, 246, 0.5)'
                }`,
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAgain}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default GameOverScreen;
