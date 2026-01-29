import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GameBoard } from './GameBoard';
import { Dice } from './Dice';
import { PlayerPanel } from './PlayerPanel';
import { Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GameScreen: React.FC = () => {
  const {
    players,
    currentPlayerIndex,
    dice,
    isPaused,
    soundEnabled,
    rollDiceAction,
    pauseGame,
    resumeGame,
    toggleSound,
    resetGame,
  } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];

  // Auto-trigger AI turns
  useEffect(() => {
    if (currentPlayer?.type === 'ai' && !isPaused && dice.canRoll) {
      const timeout = setTimeout(() => {
        rollDiceAction();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, isPaused, dice.canRoll]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col px-4 py-6 safe-area-inset"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Ludo</h1>
        
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </motion.button>

          {/* Pause/Resume */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isPaused ? resumeGame : pauseGame}
            className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pause className="w-5 h-5" />
          </motion.button>

          {/* Reset */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={resetGame}
            className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Top players (Green & Yellow) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {players
          .filter((p) => p.color === 'green' || p.color === 'yellow')
          .map((player) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isCurrentPlayer={currentPlayer?.id === player.id}
              diceValue={currentPlayer?.id === player.id ? dice.value : undefined}
            />
          ))}
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center py-2">
        <GameBoard />
      </div>

      {/* Bottom players (Red & Blue) */}
      <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
        {players
          .filter((p) => p.color === 'red' || p.color === 'blue')
          .map((player) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isCurrentPlayer={currentPlayer?.id === player.id}
              diceValue={currentPlayer?.id === player.id ? dice.value : undefined}
            />
          ))}
      </div>

      {/* Dice Area */}
      <div className="glass p-4 flex flex-col items-center gap-3">
        {/* Current player indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-3 h-3 rounded-full animate-pulse',
              currentPlayer?.color === 'red' && 'bg-red-500',
              currentPlayer?.color === 'green' && 'bg-green-500',
              currentPlayer?.color === 'yellow' && 'bg-yellow-500',
              currentPlayer?.color === 'blue' && 'bg-blue-500'
            )}
          />
          <span className="text-sm font-medium text-foreground">
            {currentPlayer?.name}'s Turn
          </span>
          {currentPlayer?.type === 'ai' && (
            <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
              AI Thinking...
            </span>
          )}
        </div>

        {/* Dice */}
        <Dice
          value={dice.value}
          isRolling={dice.isRolling}
          canRoll={dice.canRoll && currentPlayer?.type === 'human'}
          onRoll={rollDiceAction}
          disabled={currentPlayer?.type === 'ai' || isPaused}
        />

        {/* Dice value display */}
        {dice.value > 0 && !dice.isRolling && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            {dice.value === 6 ? (
              <span className="text-green-400 font-medium">🎉 Rolled 6! Extra turn!</span>
            ) : (
              <span>Rolled: {dice.value}</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="glass p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Game Paused</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={resumeGame}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              Resume
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameScreen;
