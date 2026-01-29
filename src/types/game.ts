// Ludo Game Types

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'ai';

export type AIDifficulty = 'easy' | 'medium';

export type GameMode = 'local' | 'vsAI';

export type GameScreen = 'splash' | 'home' | 'game' | 'gameOver';

export interface Position {
  x: number;
  y: number;
}

export interface Token {
  id: string;
  color: PlayerColor;
  position: number; // -1 = home, 0-56 = on board, 57 = finished
  isHome: boolean;
  isFinished: boolean;
  homeIndex: number; // 0-3, position in home base
}

export interface Player {
  id: string;
  color: PlayerColor;
  type: PlayerType;
  tokens: Token[];
  finishedTokens: number;
  name: string;
}

export interface DiceState {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  rollCount: number; // Counts consecutive 6s
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dice: DiceState;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  isGameOver: boolean;
  winner: Player | null;
  rankings: Player[];
  selectedToken: Token | null;
  validMoves: string[]; // Token IDs that can move
  moveHistory: MoveHistoryEntry[];
  lastCutToken: Token | null;
  isPaused: boolean;
  soundEnabled: boolean;
}

export interface MoveHistoryEntry {
  playerColor: PlayerColor;
  tokenId: string;
  fromPosition: number;
  toPosition: number;
  diceValue: number;
  wasCut: boolean;
  cutTokenId?: string;
  timestamp: number;
}

export interface GameSettings {
  playerCount: number;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerColors: PlayerColor[];
  humanPlayerColors: PlayerColor[];
}

// Board position mappings
export const BOARD_SIZE = 15;
export const CELLS_PER_SIDE = 6;
export const TOTAL_PATH_LENGTH = 52;
export const HOME_STRETCH_LENGTH = 6;

// Starting positions for each color (where tokens enter the main track)
export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe zone positions on the main track (0-indexed)
export const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

// Home stretch entry positions (where tokens enter their home column)
export const HOME_ENTRY_POSITIONS: Record<PlayerColor, number> = {
  red: 50,
  green: 11,
  yellow: 24,
  blue: 37,
};

// Position where tokens finish
export const FINISH_POSITION = 57;

// Number of positions on main track
export const MAIN_TRACK_LENGTH = 52;

// Create initial tokens for a player
export function createInitialTokens(color: PlayerColor): Token[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `${color}-${i}`,
    color,
    position: -1,
    isHome: true,
    isFinished: false,
    homeIndex: i,
  }));
}

// Create a player
export function createPlayer(
  color: PlayerColor,
  type: PlayerType,
  index: number
): Player {
  const names: Record<PlayerColor, string> = {
    red: 'Red',
    green: 'Green',
    yellow: 'Yellow',
    blue: 'Blue',
  };

  return {
    id: `player-${color}`,
    color,
    type,
    tokens: createInitialTokens(color),
    finishedTokens: 0,
    name: type === 'ai' ? `${names[color]} (AI)` : names[color],
  };
}

// Get player colors based on player count
export function getPlayerColors(count: number): PlayerColor[] {
  const allColors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  
  if (count === 2) {
    return ['red', 'yellow']; // Opposite corners
  } else if (count === 3) {
    return ['red', 'green', 'yellow'];
  }
  return allColors;
}
