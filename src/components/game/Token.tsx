import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Token as TokenType, PlayerColor } from '@/types/game';

interface TokenProps {
  token: TokenType;
  isSelected?: boolean;
  isValidMove?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

const colorClasses: Record<PlayerColor, string> = {
  red: 'player-red',
  green: 'player-green',
  yellow: 'player-yellow',
  blue: 'player-blue',
};

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
};

export const Token: React.FC<TokenProps> = ({
  token,
  isSelected = false,
  isValidMove = false,
  onClick,
  size = 'md',
  showPulse = false,
}) => {
  if (token.isFinished) {
    return null;
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isValidMove && !isSelected}
      className={cn(
        'token relative rounded-full cursor-pointer transition-all',
        colorClasses[token.color],
        sizeClasses[size],
        isSelected && 'ring-2 ring-white/50 scale-110',
        isValidMove && 'token-highlight cursor-pointer',
        !isValidMove && !isSelected && 'cursor-default',
        token.isHome && 'opacity-90'
      )}
      whileHover={isValidMove ? { scale: 1.2 } : {}}
      whileTap={isValidMove ? { scale: 0.9 } : {}}
      animate={
        isValidMove
          ? {
              y: [0, -3, 0],
              transition: { duration: 0.5, repeat: Infinity },
            }
          : {}
      }
      layout
      layoutId={token.id}
    >
      {/* Inner shine */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
      
      {/* Token number/indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-bold text-white/80 drop-shadow-md">
          {token.homeIndex + 1}
        </span>
      </div>

      {/* Pulse ring for valid moves */}
      {isValidMove && (
        <motion.div
          className="absolute -inset-1 rounded-full"
          style={{
            border: '2px solid currentColor',
            opacity: 0.5,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Current player indicator */}
      {showPulse && (
        <motion.div
          className="absolute -inset-2 rounded-full border-2 border-white/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default Token;
