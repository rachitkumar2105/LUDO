import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Token } from './Token';
import { useGameStore } from '@/store/gameStore';
import { 
  Token as TokenType, 
  PlayerColor, 
  SAFE_POSITIONS,
  START_POSITIONS,
} from '@/types/game';
import { getHomeBaseCoordinates, getPositionCoordinates, getAbsolutePosition } from '@/lib/gameLogic';

const BOARD_SIZE = 15;
const CELL_SIZE = 'min(6vw, 24px)';

// Cell types for styling
type CellType = 'empty' | 'path' | 'home-red' | 'home-green' | 'home-yellow' | 'home-blue' | 
  'safe' | 'start-red' | 'start-green' | 'start-yellow' | 'start-blue' |
  'home-stretch-red' | 'home-stretch-green' | 'home-stretch-yellow' | 'home-stretch-blue' |
  'center';

function getCellType(row: number, col: number): CellType {
  // Center (finish area)
  if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
    return 'center';
  }

  // Home bases (corners)
  // Red - bottom left
  if (row >= 9 && row <= 14 && col >= 0 && col <= 5) {
    return 'home-red';
  }
  // Green - top left
  if (row >= 0 && row <= 5 && col >= 0 && col <= 5) {
    return 'home-green';
  }
  // Yellow - top right
  if (row >= 0 && row <= 5 && col >= 9 && col <= 14) {
    return 'home-yellow';
  }
  // Blue - bottom right
  if (row >= 9 && row <= 14 && col >= 9 && col <= 14) {
    return 'home-blue';
  }

  // Home stretches
  // Red home stretch (column 7, rows 8-13)
  if (col === 7 && row >= 8 && row <= 13) {
    return 'home-stretch-red';
  }
  // Green home stretch (row 7, cols 1-6)
  if (row === 7 && col >= 1 && col <= 6) {
    return 'home-stretch-green';
  }
  // Yellow home stretch (column 7, rows 1-6)
  if (col === 7 && row >= 1 && row <= 6) {
    return 'home-stretch-yellow';
  }
  // Blue home stretch (row 7, cols 8-13)
  if (row === 7 && col >= 8 && col <= 13) {
    return 'home-stretch-blue';
  }

  // Main path cells
  const isPath = 
    // Vertical paths
    (col === 6 && (row <= 5 || row >= 9)) ||
    (col === 8 && (row <= 5 || row >= 9)) ||
    // Horizontal paths
    (row === 6 && (col <= 5 || col >= 9)) ||
    (row === 8 && (col <= 5 || col >= 9)) ||
    // Cross sections
    (col === 6 && row === 6) ||
    (col === 6 && row === 8) ||
    (col === 8 && row === 6) ||
    (col === 8 && row === 8) ||
    // Extensions at corners
    (row === 7 && (col === 0 || col === 14)) ||
    (col === 7 && (row === 0 || row === 14));

  if (isPath) {
    return 'path';
  }

  return 'empty';
}

function getCellColor(cellType: CellType): string {
  switch (cellType) {
    case 'home-red':
      return 'bg-red-500/10 border-red-500/20';
    case 'home-green':
      return 'bg-green-500/10 border-green-500/20';
    case 'home-yellow':
      return 'bg-yellow-500/10 border-yellow-500/20';
    case 'home-blue':
      return 'bg-blue-500/10 border-blue-500/20';
    case 'home-stretch-red':
      return 'bg-red-500/30 border-red-500/30';
    case 'home-stretch-green':
      return 'bg-green-500/30 border-green-500/30';
    case 'home-stretch-yellow':
      return 'bg-yellow-500/30 border-yellow-500/30';
    case 'home-stretch-blue':
      return 'bg-blue-500/30 border-blue-500/30';
    case 'center':
      return 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30';
    case 'path':
      return 'bg-secondary/50 border-border';
    case 'safe':
      return 'bg-board-safe border-purple-500/30';
    default:
      return 'bg-transparent border-transparent';
  }
}

// Check if position is a start position
function isStartPosition(row: number, col: number): PlayerColor | null {
  const positions: Record<string, PlayerColor> = {
    '13-6': 'red',   // Red start
    '6-0': 'green',  // Green start 
    '0-8': 'yellow', // Yellow start (adjusted)
    '8-14': 'blue',  // Blue start
  };
  return positions[`${row}-${col}`] || null;
}

// Check if position is safe
function isSafeCell(row: number, col: number): boolean {
  const safePositions = [
    [13, 6], [8, 3], [6, 0], [3, 6],
    [0, 8], [6, 11], [8, 14], [11, 8],
  ];
  return safePositions.some(([r, c]) => r === row && c === col);
}

export const GameBoard: React.FC = () => {
  const { players, validMoves, moveToken, dice } = useGameStore();

  // Get all tokens with their positions
  const tokenPositions = useMemo(() => {
    const positions: Map<string, TokenType[]> = new Map();

    for (const player of players) {
      for (const token of player.tokens) {
        if (token.isFinished) continue;

        let key: string;
        if (token.isHome) {
          const coords = getHomeBaseCoordinates(token.color, token.homeIndex);
          key = `${coords.row}-${coords.col}`;
        } else {
          const coords = getPositionCoordinates(token.position, token.color);
          key = `${coords.row}-${coords.col}`;
        }

        const existing = positions.get(key) || [];
        positions.set(key, [...existing, token]);
      }
    }

    return positions;
  }, [players]);

  const handleTokenClick = (token: TokenType) => {
    if (validMoves.includes(token.id)) {
      moveToken(token.id);
    }
  };

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      {/* Board container with aspect ratio */}
      <div className="relative w-full pb-[100%]">
        <div 
          className="absolute inset-0 grid gap-[1px] p-1 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;
            const cellType = getCellType(row, col);
            const cellColor = getCellColor(cellType);
            const startColor = isStartPosition(row, col);
            const isSafe = isSafeCell(row, col);
            const tokens = tokenPositions.get(`${row}-${col}`) || [];

            return (
              <motion.div
                key={`${row}-${col}`}
                className={cn(
                  'relative flex items-center justify-center rounded-sm border transition-all',
                  cellColor,
                  cellType === 'empty' && 'border-transparent',
                  startColor && `ring-1 ring-inset ring-${startColor === 'red' ? 'red' : startColor === 'green' ? 'green' : startColor === 'yellow' ? 'yellow' : 'blue'}-400/50`
                )}
              >
                {/* Safe zone star */}
                {isSafe && cellType === 'path' && (
                  <span className="absolute text-[8px] text-purple-400/60">★</span>
                )}

                {/* Start position indicator */}
                {startColor && (
                  <div 
                    className={cn(
                      'absolute inset-0 rounded-sm',
                      startColor === 'red' && 'bg-red-500/20',
                      startColor === 'green' && 'bg-green-500/20',
                      startColor === 'yellow' && 'bg-yellow-500/20',
                      startColor === 'blue' && 'bg-blue-500/20'
                    )}
                  />
                )}

                {/* Tokens on this cell */}
                {tokens.length > 0 && (
                  <div className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    tokens.length > 1 && 'flex-wrap gap-[1px]'
                  )}>
                    {tokens.map((token) => (
                      <Token
                        key={token.id}
                        token={token}
                        isValidMove={validMoves.includes(token.id)}
                        onClick={() => handleTokenClick(token)}
                        size={tokens.length > 1 ? 'sm' : 'md'}
                      />
                    ))}
                  </div>
                )}

                {/* Valid move highlight for empty cells */}
                {tokens.length === 0 && cellType !== 'empty' && validMoves.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Home base circles - overlays */}
        <HomeBase color="red" position="bottom-left" />
        <HomeBase color="green" position="top-left" />
        <HomeBase color="yellow" position="top-right" />
        <HomeBase color="blue" position="bottom-right" />

        {/* Center finish area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18%] h-[18%]">
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-purple-300/80">HOME</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Home base component
interface HomeBaseProps {
  color: PlayerColor;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const HomeBase: React.FC<HomeBaseProps> = ({ color, position }) => {
  const positionClasses = {
    'top-left': 'top-[3%] left-[3%]',
    'top-right': 'top-[3%] right-[3%]',
    'bottom-left': 'bottom-[3%] left-[3%]',
    'bottom-right': 'bottom-[3%] right-[3%]',
  };

  const colorClasses = {
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  };

  return (
    <div 
      className={cn(
        'absolute w-[37%] h-[37%] rounded-xl border-2 bg-gradient-to-br pointer-events-none',
        positionClasses[position],
        colorClasses[color]
      )}
    >
      {/* Inner circle for token starting positions */}
      <div className="absolute inset-[15%] rounded-lg bg-card/50 border border-border/50" />
    </div>
  );
};

export default GameBoard;
