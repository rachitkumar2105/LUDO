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
}

const colorMap: Record<PlayerColor, string> = {
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#eab308',
  blue: '#2563eb', // slightly darker blue for better contrast
};

const strokeMap: Record<PlayerColor, string> = {
  red: '#991b1b',
  green: '#14532d',
  yellow: '#a16207',
  blue: '#1e3a8a',
};

export const Token: React.FC<TokenProps> = ({
  token,
  isSelected = false,
  isValidMove = false,
  onClick,
  size = 'md',
}) => {
  if (token.isFinished) return null;

  const width = size === 'sm' ? 16 : size === 'md' ? 24 : 32;
  const height = width * 1.5; // Pawn is taller

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer transition-all',
        isValidMove ? 'z-50' : 'z-10',
        !isValidMove && !isSelected && 'cursor-default'
      )}
      whileHover={isValidMove ? { scale: 1.2, y: -5 } : {}}
      animate={isValidMove ? { y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.8 } } : {}}
      style={{
        width: width,
        height: height,
        filter: isSelected ? 'drop-shadow(0 0 4px white)' : 'drop-shadow(1px 2px 2px rgba(0,0,0,0.4))'
      }}
    >
      <svg
        viewBox="0 0 100 150"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="piece-shadow"
      >
        {/* Simple Pawn Shape */}
        <path
          d="M50 20 C65 20 75 30 75 45 C75 55 70 65 60 70 L65 110 L80 120 L80 135 L20 135 L20 120 L35 110 L40 70 C30 65 25 55 25 45 C25 30 35 20 50 20 Z"
          fill={colorMap[token.color]}
          stroke={strokeMap[token.color]}
          strokeWidth="3"
        />
        {/* Head Highlight */}
        <ellipse cx="60" cy="35" rx="8" ry="8" fill="white" fillOpacity="0.3" />
        {/* Body Highlight */}
        <path d="M55 75 L58 110 L42 110 L45 75 Z" fill="white" fillOpacity="0.2" />
      </svg>
    </motion.div>
  );
};
