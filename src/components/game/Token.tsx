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
  blue: '#3b82f6',
};

const strokeMap: Record<PlayerColor, string> = {
  red: '#991b1b',
  green: '#14532d',
  yellow: '#a16207',
  blue: '#1e3a8a',
};

const gradientMap: Record<PlayerColor, string> = {
  red: 'url(#grad-red)',
  green: 'url(#grad-green)',
  yellow: 'url(#grad-yellow)',
  blue: 'url(#grad-blue)',
};

export const Token: React.FC<TokenProps> = ({
  token,
  isSelected = false,
  isValidMove = false,
  onClick,
  size = 'md',
}) => {
  if (token.isFinished) return null;

  const width = size === 'sm' ? 18 : size === 'md' ? 28 : 36;
  const height = width * 1.6; // High aspect ratio for "Pin" look

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer transition-all',
        isValidMove ? 'z-50' : 'z-20', // Higher z-index to stand above others
        !isValidMove && !isSelected && 'cursor-default'
      )}
      whileHover={isValidMove ? { scale: 1.2, y: -10, zIndex: 100 } : {}}
      animate={isValidMove ? { y: [0, -8, 0], transition: { repeat: Infinity, duration: 0.8 } } : {}}
      style={{
        width: width,
        height: height,
        // Drop shadow for standing effect at the base
        filter: isSelected
          ? 'drop-shadow(0 0 4px white) drop-shadow(0 5px 5px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 4px 3px rgba(0,0,0,0.6))'
      }}
    >
      <svg
        viewBox="0 0 60 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Gradients for 3D effect */}
          <radialGradient id="grad-red" cx="50%" cy="30%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
          <radialGradient id="grad-green" cx="50%" cy="30%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>
          <radialGradient id="grad-yellow" cx="50%" cy="30%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#a16207" />
          </radialGradient>
          <radialGradient id="grad-blue" cx="50%" cy="30%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Glassy Shine */}
          <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.1" />
            <stop offset="50%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Pin Shape - Bulbous head, tapered body, wide base */}
        <path
          d="M30 5 
              C 45 5, 52 18, 52 30
              C 52 45, 40 50, 40 60
              L 45 85
              A 5 5 0 0 1 50 90
              L 50 95
              L 10 95
              L 10 90
              A 5 5 0 0 1 15 85
              L 20 60
              C 20 50, 8 45, 8 30
              C 8 18, 15 5, 30 5
              Z"
          fill={gradientMap[token.color]}
          stroke={strokeMap[token.color]}
          strokeWidth="1.5"
        />

        {/* Top Shine (Head) */}
        <ellipse cx="30" cy="25" rx="10" ry="12" fill="white" fillOpacity="0.3" transform="rotate(-15 30 25)" />

        {/* Inner Ring Detail (Neck) */}
        <path d="M 22 55 Q 30 60 38 55" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none" />

        {/* Highlight Line Side */}
        <path d="M 42 20 Q 48 30 46 45" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      </svg>

      {/* Selection Arrow */}
      {isValidMove && (
        <motion.div
          className="absolute -top-3 left-[50%] -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-md"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
    </motion.div>
  );
};
