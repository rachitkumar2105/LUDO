import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Player, PlayerColor } from '@/types/game';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  diceValue?: number;
}

const colorStyles: Record<PlayerColor, { bg: string; border: string; glow: string }> = {
  red: {
    bg: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
  },
  green: {
    bg: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20',
  },
  yellow: {
    bg: 'from-yellow-500/20 to-yellow-600/10',
    border: 'border-yellow-500/30',
    glow: 'shadow-yellow-500/20',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
  },
};

const textColors: Record<PlayerColor, string> = {
  red: 'text-red-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  blue: 'text-blue-400',
};

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isCurrentPlayer,
  diceValue,
}) => {
  const styles = colorStyles[player.color];
  const textColor = textColors[player.color];

  return (
    <motion.div
      className={cn(
        'relative px-3 py-2 rounded-xl border backdrop-blur-md transition-all duration-300',
        `bg-gradient-to-br ${styles.bg}`,
        styles.border,
        isCurrentPlayer && `shadow-lg ${styles.glow}`
      )}
      animate={isCurrentPlayer ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Current player indicator */}
      {isCurrentPlayer && (
        <motion.div
          className={cn(
            'absolute -inset-px rounded-xl border-2',
            player.color === 'red' && 'border-red-500/50',
            player.color === 'green' && 'border-green-500/50',
            player.color === 'yellow' && 'border-yellow-500/50',
            player.color === 'blue' && 'border-blue-500/50'
          )}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className="flex items-center gap-2">
        {/* Player color indicator */}
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            player.color === 'red' && 'bg-red-500',
            player.color === 'green' && 'bg-green-500',
            player.color === 'yellow' && 'bg-yellow-500',
            player.color === 'blue' && 'bg-blue-500'
          )}
          style={{
            boxShadow: isCurrentPlayer
              ? `0 0 10px ${
                  player.color === 'red'
                    ? '#ef4444'
                    : player.color === 'green'
                    ? '#22c55e'
                    : player.color === 'yellow'
                    ? '#eab308'
                    : '#3b82f6'
                }`
              : 'none',
          }}
        />

        {/* Player name */}
        <span className={cn('text-sm font-medium', textColor)}>
          {player.name}
        </span>

        {/* AI badge */}
        {player.type === 'ai' && (
          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">
            AI
          </span>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1 mt-1.5">
        {[0, 1, 2, 3].map((i) => {
          const token = player.tokens[i];
          const isFinished = token?.isFinished;
          const isOnBoard = !token?.isHome && !token?.isFinished;

          return (
            <div
              key={i}
              className={cn(
                'w-4 h-4 rounded-full border transition-all',
                isFinished && 'bg-current border-current',
                isOnBoard && 'bg-current/50 border-current/50',
                !isFinished && !isOnBoard && 'bg-transparent border-current/30',
                player.color === 'red' && 'border-red-500',
                player.color === 'green' && 'border-green-500',
                player.color === 'yellow' && 'border-yellow-500',
                player.color === 'blue' && 'border-blue-500'
              )}
              style={{
                backgroundColor: isFinished
                  ? player.color === 'red'
                    ? '#ef4444'
                    : player.color === 'green'
                    ? '#22c55e'
                    : player.color === 'yellow'
                    ? '#eab308'
                    : '#3b82f6'
                  : isOnBoard
                  ? `${
                      player.color === 'red'
                        ? 'rgba(239, 68, 68, 0.5)'
                        : player.color === 'green'
                        ? 'rgba(34, 197, 94, 0.5)'
                        : player.color === 'yellow'
                        ? 'rgba(234, 179, 8, 0.5)'
                        : 'rgba(59, 130, 246, 0.5)'
                    }`
                  : 'transparent',
              }}
            >
              {isFinished && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PlayerPanel;
