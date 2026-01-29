import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Token } from './Token';
import { useGameStore } from '@/store/gameStore';
import {
  Token as TokenType,
  PlayerColor,
} from '@/types/game';
import { getHomeBaseCoordinates, getPositionCoordinates } from '@/lib/gameLogic';
import { Star, ArrowRight } from 'lucide-react';

const BOARD_SIZE = 15;

// Cell types for styling
type CellType = 'empty' | 'path' | 'home-red' | 'home-green' | 'home-yellow' | 'home-blue' |
  'safe' | 'home-stretch-red' | 'home-stretch-green' | 'home-stretch-yellow' | 'home-stretch-blue' |
  'center';

function getCellType(row: number, col: number): CellType {
  // Center (finish area)
  if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
    return 'center';
  }

  // Home bases (corners) - kept as "empty" in grid to place overlays, 
  // but we can mark them if needed. For now, we will handle them with overlays.
  if ((row < 6 && col < 6) || (row < 6 && col > 8) || (row > 8 && col < 6) || (row > 8 && col > 8)) {
    return 'empty';
  }

  // Home stretches
  if (col === 7 && row >= 8 && row <= 13) return 'home-stretch-red';
  if (row === 7 && col >= 1 && col <= 6) return 'home-stretch-green';
  if (col === 7 && row >= 1 && row <= 6) return 'home-stretch-yellow';
  if (row === 7 && col >= 8 && col <= 13) return 'home-stretch-blue';

  // Main path cells (Rest of the cross)
  return 'path';
}

function getCellColor(cellType: CellType): string {
  switch (cellType) {
    case 'home-stretch-red': return 'bg-[hsl(var(--player-red))] border-slate-300';
    case 'home-stretch-green': return 'bg-[hsl(var(--player-green))] border-slate-300';
    case 'home-stretch-yellow': return 'bg-[hsl(var(--player-yellow))] border-slate-300';
    case 'home-stretch-blue': return 'bg-[hsl(var(--player-blue))] border-slate-300';
    case 'center': return 'bg-white border-transparent'; // Center triangle logic needs overlay
    case 'path': return 'bg-white border-slate-300';
    default: return 'bg-transparent border-transparent';
  }
}

// Start positions for colored tiles on the track
function getStartColor(row: number, col: number): PlayerColor | null {
  if (row === 13 && col === 6) return 'red';
  if (row === 6 && col === 1) return 'green';
  if (row === 1 && col === 8) return 'yellow';
  if (row === 8 && col === 13) return 'blue';
  return null;
}

function isSafeCell(row: number, col: number): boolean {
  // Standard safe spots + Global safe spots
  // Star spots usually: 
  // Green: 2,6 (Note: 0-indexed, so row 2, col 6 is incorrect logic for Ludo usually)
  // Let's stick to standard Ludo safe spots relative to board coordinates
  // (8,2) -> (8,3) ? 
  // Let's map physically.
  const safeSpots = [
    [13, 6], [8, 2], // Red side
    [6, 1], [2, 6],  // Green side
    [1, 8], [6, 12], // Yellow side
    [8, 13], [12, 8] // Blue side
  ];
  return safeSpots.some(([r, c]) => r === row && c === col);
}

// Helper to determine arrow rotation and position
function getArrowProps(row: number, col: number) {
  if (row === 13 && col === 6) return { rotate: 0, color: 'text-white' }; // Red start
  if (row === 6 && col === 1) return { rotate: 90, color: 'text-white' }; // Green start
  if (row === 1 && col === 8) return { rotate: 180, color: 'text-white' }; // Yellow start
  if (row === 8 && col === 13) return { rotate: 270, color: 'text-white' }; // Blue start
  return null;
}

export const GameBoard: React.FC = () => {
  const { players, validMoves, moveToken } = useGameStore();

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
    <div className="relative w-full max-w-[500px] mx-auto p-4">
      {/* Board Aspect Ratio Container */}
      <div className="relative w-full pb-[100%] bg-white shadow-2xl rounded-sm overflow-hidden border-4 border-slate-800">

        {/* Main Grid */}
        <div
          className="absolute inset-0 grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;
            const cellType = getCellType(row, col);

            // Skip rendering corner "empty" cells to let HomeBase layers show through cleanly
            if (cellType === 'empty') return <div key={index} />;

            const startColor = getStartColor(row, col);
            const isSafe = isSafeCell(row, col);
            const arrowProps = getArrowProps(row, col); // Not really used in standard ludo but good for start

            const cellColorClass = startColor
              ? `bg-[hsl(var(--player-${startColor}))] border-slate-300` // Start cells are colored
              : getCellColor(cellType);

            const tokens = tokenPositions.get(`${row}-${col}`) || [];

            return (
              <div
                key={`${row}-${col}`}
                className={cn(
                  'relative border box-border flex items-center justify-center',
                  cellColorClass,
                  // Center specific styling handled separately or by cellType
                )}
              >
                {/* Safe Spot Star */}
                {isSafe && !startColor && (
                  <Star className="w-full h-full p-1 text-slate-400 opacity-50" fill="currentColor" />
                )}

                {/* Start Spot Arrow/Icon */}
                {startColor && (
                  <ArrowRight className={cn(
                    "w-full h-full p-1 text-slate-100 opacity-80",
                    startColor === 'red' && "rotate-0",
                    startColor === 'green' && "rotate-90",
                    startColor === 'yellow' && "rotate-180",
                    startColor === 'blue' && "-rotate-90"
                  )} />
                )}

                {/* Tokens */}
                {tokens.length > 0 && (
                  <div className={cn(
                    'absolute inset-0 flex items-center justify-center z-10',
                    tokens.length > 1 && 'scale-75' // Shrink if multiple
                  )}>
                    {tokens.map((token, i) => (
                      <div key={token.id} className={cn(
                        "transition-all duration-300",
                        tokens.length > 1 && i === 0 && "-translate-x-1 -translate-y-1",
                        tokens.length > 1 && i === 1 && "translate-x-1 translate-y-1",
                        tokens.length > 1 && i === 2 && "-translate-x-1 translate-y-1",
                        tokens.length > 1 && i === 3 && "translate-x-1 -translate-y-1",
                      )}>
                        <Token
                          token={token}
                          isValidMove={validMoves.includes(token.id)}
                          onClick={() => handleTokenClick(token)}
                          size={tokens.length > 1 ? 'sm' : 'md'}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Clickable area for empty valid moves (optional visual cue) */}
                {tokens.length === 0 && validMoves.length > 0 && cellType !== 'center' && (
                  // We can add a specialized highlight if a move lands here, etc.
                  // For now, keep clean.
                  null
                )}

              </div>
            );
          })}
        </div>

        {/* Center Triangles Layer */}
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%]">
          {/* Green Triangle (Left) */}
          <div className="absolute top-0 left-0 w-full h-full clip-path-polygon-[0_0,50%_50%,0_100%] bg-[hsl(var(--player-green))] z-0"
            style={{ clipPath: 'polygon(0 0, 50% 50%, 0 100%)', backgroundColor: 'hsl(var(--player-green))' }} />
          {/* Yellow Triangle (Top) */}
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ clipPath: 'polygon(0 0, 100% 0, 50% 50%)', backgroundColor: 'hsl(var(--player-yellow))' }} />
          {/* Blue Triangle (Right) */}
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)', backgroundColor: 'hsl(var(--player-blue))' }} />
          {/* Red Triangle (Bottom) */}
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)', backgroundColor: 'hsl(var(--player-red))' }} />
        </div>

        {/* Start Bases */}
        <HomeBase color="green" position="top-left" tokenPositions={tokenPositions} onTokenClick={handleTokenClick} validMoves={validMoves} />
        <HomeBase color="yellow" position="top-right" tokenPositions={tokenPositions} onTokenClick={handleTokenClick} validMoves={validMoves} />
        <HomeBase color="red" position="bottom-left" tokenPositions={tokenPositions} onTokenClick={handleTokenClick} validMoves={validMoves} />
        <HomeBase color="blue" position="bottom-right" tokenPositions={tokenPositions} onTokenClick={handleTokenClick} validMoves={validMoves} />

      </div>
    </div>
  );
};

interface HomeBaseProps {
  color: PlayerColor;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  tokenPositions: Map<string, TokenType[]>;
  onTokenClick: (token: TokenType) => void;
  validMoves: string[];
}

const HomeBase: React.FC<HomeBaseProps> = ({ color, position, tokenPositions, onTokenClick, validMoves }) => {
  const baseClasses = {
    'top-left': 'top-0 left-0 border-r-4 border-b-4 border-slate-800',
    'top-right': 'top-0 right-0 border-l-4 border-b-4 border-slate-800',
    'bottom-left': 'bottom-0 left-0 border-r-4 border-t-4 border-slate-800',
    'bottom-right': 'bottom-0 right-0 border-l-4 border-t-4 border-slate-800',
  };

  const bgClass = {
    red: 'home-red-bg',
    green: 'home-green-bg',
    yellow: 'home-yellow-bg',
    blue: 'home-blue-bg',
  }[color];

  // Manual mapping of internal 4 spots for the home base (0-3)
  // We need to know which tokens are AT home.
  // The GameLogic usually assigns a "position" -1 for home? 
  // Or do we rely on `token.isHome`?
  // `tokenPositions` map uses "row-col". We need the correct coords for the grid inside the base.
  // Let's grab all tokens of this color that are `isHome`.

  // Actually, `tokenPositions` already maps them to coordinates based on `getHomeBaseCoordinates`.
  // So we just need to render the 4 white circles and check if tokens exist there.

  // Coordinates in the 15x15 grid for the 4 home spots:
  // Green (TL): (2,2), (2,3), (3,2), (3,3)
  // Yellow (TR): (2,11), (2,12), (3,11), (3,12)
  // Red (BL): (11,2), (11,3), (12,2), (12,3)
  // Blue (BR): (11,11), (11,12), (12,11), (12,12)

  const getSpotCoords = (index: number) => {
    switch (color) {
      case 'green': return [[2, 2], [2, 3], [3, 2], [3, 3]][index];
      case 'yellow': return [[2, 11], [2, 12], [3, 11], [3, 12]][index];
      case 'red': return [[11, 2], [11, 3], [12, 2], [12, 3]][index];
      case 'blue': return [[11, 11], [11, 12], [12, 11], [12, 12]][index];
    }
    return [0, 0];
  };

  return (
    <div className={cn("absolute w-[40%] h-[40%]", baseClasses[position], bgClass)}>
      {/* Inner white container for the 4 circles */}
      <div className="absolute inset-0 bg-white m-[20%] rounded-2xl shadow-inner flex flex-wrap p-2 gap-2 content-center justify-center">
        {/* Render 4 spots */}
        {[0, 1, 2, 3].map(i => {
          const [r, c] = getSpotCoords(i);
          const tokens = tokenPositions.get(`${r}-${c}`) || [];

          return (
            <div key={i} className="w-[35%] h-[35%] rounded-full bg-slate-100 border border-slate-300 relative flex items-center justify-center shadow-inner">
              {tokens.map(token => (
                <Token
                  key={token.id}
                  token={token}
                  isValidMove={validMoves.includes(token.id)}
                  onClick={() => onTokenClick(token)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
