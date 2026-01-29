// Complete Ludo Game Logic

import {
  Player,
  Token,
  PlayerColor,
  START_POSITIONS,
  SAFE_POSITIONS,
  HOME_ENTRY_POSITIONS,
  MAIN_TRACK_LENGTH,
  FINISH_POSITION,
  HOME_STRETCH_LENGTH,
} from '@/types/game';

// Roll dice with random value 1-6
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Check if a position is a safe zone
export function isSafePosition(position: number): boolean {
  return SAFE_POSITIONS.includes(position);
}

// Convert relative position to absolute position on track
export function getAbsolutePosition(
  relativePosition: number,
  playerColor: PlayerColor
): number {
  if (relativePosition < 0 || relativePosition >= FINISH_POSITION) {
    return relativePosition;
  }
  
  const startPos = START_POSITIONS[playerColor];
  
  // If in home stretch (positions 52-57)
  if (relativePosition >= MAIN_TRACK_LENGTH) {
    return relativePosition; // Home stretch positions are already relative
  }
  
  return (startPos + relativePosition) % MAIN_TRACK_LENGTH;
}

// Check if token can move with given dice value
export function canTokenMove(
  token: Token,
  diceValue: number,
  player: Player,
  allPlayers: Player[]
): boolean {
  // Token is finished
  if (token.isFinished) {
    return false;
  }

  // Token is at home - needs 6 to come out
  if (token.isHome) {
    return diceValue === 6;
  }

  // Calculate steps traveled by this token
  const startPos = START_POSITIONS[player.color];
  let stepsFromStart: number;
  
  if (token.position >= MAIN_TRACK_LENGTH) {
    // Already in home stretch
    stepsFromStart = MAIN_TRACK_LENGTH + (token.position - MAIN_TRACK_LENGTH);
  } else {
    // On main track - calculate relative position
    stepsFromStart = (token.position - startPos + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
  }

  const newStepsFromStart = stepsFromStart + diceValue;
  
  // Maximum steps is 51 (around the board) + 6 (home stretch) = 57
  const maxSteps = MAIN_TRACK_LENGTH + HOME_STRETCH_LENGTH;
  
  // Check if exceeds maximum
  if (newStepsFromStart > maxSteps) {
    return false; // Must roll exact number to finish
  }

  return true;
}

// Get steps remaining to reach home entry
export function getStepsToHomeEntry(
  currentPosition: number,
  playerColor: PlayerColor
): number {
  if (currentPosition >= MAIN_TRACK_LENGTH) {
    return -1; // Already in home stretch
  }

  const homeEntry = HOME_ENTRY_POSITIONS[playerColor];
  const startPos = START_POSITIONS[playerColor];
  
  // Convert current absolute position to relative position for this player
  let relativePos = (currentPosition - startPos + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
  
  // Home entry is at relative position 51 (just before completing the circuit)
  const relativeHomeEntry = (homeEntry - startPos + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
  
  if (relativePos <= relativeHomeEntry) {
    return relativeHomeEntry - relativePos;
  }
  
  return -1; // Passed home entry, need to go around again (shouldn't happen in valid game)
}

// Calculate new position after move
export function calculateNewPosition(
  token: Token,
  diceValue: number,
  playerColor: PlayerColor
): number {
  if (token.isHome) {
    // Coming out of home base - go to start position
    return START_POSITIONS[playerColor];
  }

  const startPos = START_POSITIONS[playerColor];
  
  if (token.position >= MAIN_TRACK_LENGTH) {
    // Already in home stretch, just add dice value
    return token.position + diceValue;
  }
  
  // Calculate current steps from start
  const stepsFromStart = (token.position - startPos + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
  const newStepsFromStart = stepsFromStart + diceValue;
  
  // Check if entering home stretch (after completing circuit)
  if (newStepsFromStart >= MAIN_TRACK_LENGTH) {
    // Enter home stretch
    const homeStretchPosition = MAIN_TRACK_LENGTH + (newStepsFromStart - MAIN_TRACK_LENGTH);
    return homeStretchPosition;
  }
  
  // Still on main track
  return (token.position + diceValue) % MAIN_TRACK_LENGTH;
}

// Get all valid tokens that can move
export function getValidMoves(
  player: Player,
  diceValue: number,
  allPlayers: Player[]
): Token[] {
  return player.tokens.filter((token) =>
    canTokenMove(token, diceValue, player, allPlayers)
  );
}

// Check if a token at position would be cut by an opponent
export function checkForCut(
  newPosition: number,
  movingPlayerColor: PlayerColor,
  allPlayers: Player[]
): { isCut: boolean; cutToken: Token | null; cutPlayer: Player | null } {
  // Can't cut in safe zones
  if (isSafePosition(newPosition)) {
    return { isCut: false, cutToken: null, cutPlayer: null };
  }

  // Can't cut in home stretch
  if (newPosition >= MAIN_TRACK_LENGTH) {
    return { isCut: false, cutToken: null, cutPlayer: null };
  }

  // Check all opponent tokens
  for (const player of allPlayers) {
    if (player.color === movingPlayerColor) continue;

    for (const token of player.tokens) {
      if (token.isHome || token.isFinished) continue;
      
      // Get absolute position of opponent token
      const opponentAbsPos = getAbsolutePosition(token.position, player.color);
      
      if (opponentAbsPos === newPosition && opponentAbsPos < MAIN_TRACK_LENGTH) {
        return { isCut: true, cutToken: token, cutPlayer: player };
      }
    }
  }

  return { isCut: false, cutToken: null, cutPlayer: null };
}

// Execute a token move
export function executeMove(
  player: Player,
  token: Token,
  diceValue: number,
  allPlayers: Player[]
): {
  updatedPlayers: Player[];
  wasCut: boolean;
  cutToken: Token | null;
  isFinished: boolean;
} {
  const newPosition = calculateNewPosition(token, diceValue, player.color);
  const absoluteNewPos = getAbsolutePosition(newPosition, player.color);
  
  // Check for cuts (only on main track)
  const { isCut, cutToken, cutPlayer } = checkForCut(
    absoluteNewPos,
    player.color,
    allPlayers
  );

  // Create updated players array
  const updatedPlayers = allPlayers.map((p) => {
    if (p.color === player.color) {
      // Update moving player's token
      const updatedTokens = p.tokens.map((t) => {
        if (t.id === token.id) {
          const isFinished = newPosition === FINISH_POSITION;
          return {
            ...t,
            position: newPosition,
            isHome: false,
            isFinished,
          };
        }
        return t;
      });

      return {
        ...p,
        tokens: updatedTokens,
        finishedTokens: updatedTokens.filter((t) => t.isFinished).length,
      };
    }

    if (isCut && cutPlayer && p.color === cutPlayer.color) {
      // Send cut token back to home
      const updatedTokens = p.tokens.map((t) => {
        if (cutToken && t.id === cutToken.id) {
          return {
            ...t,
            position: -1,
            isHome: true,
            isFinished: false,
          };
        }
        return t;
      });

      return { ...p, tokens: updatedTokens };
    }

    return p;
  });

  const isFinished = newPosition === FINISH_POSITION;

  return { updatedPlayers, wasCut: isCut, cutToken, isFinished };
}

// Check if player has won (all 4 tokens finished)
export function hasPlayerWon(player: Player): boolean {
  return player.finishedTokens === 4;
}

// Check if game is over (only one player remaining or a player has won)
export function isGameOver(players: Player[]): { 
  isOver: boolean; 
  winner: Player | null;
  rankings: Player[];
} {
  // Sort players by finished tokens (descending)
  const sortedPlayers = [...players].sort(
    (a, b) => b.finishedTokens - a.finishedTokens
  );

  // Check if any player has won
  const winner = players.find((p) => p.finishedTokens === 4);
  
  if (winner) {
    return { isOver: true, winner, rankings: sortedPlayers };
  }

  return { isOver: false, winner: null, rankings: sortedPlayers };
}

// Check if player should get another turn (rolled 6 or made a cut)
export function shouldGetExtraTurn(
  diceValue: number,
  wasCut: boolean,
  consecutiveSixes: number
): boolean {
  // Three consecutive 6s means forfeit turn
  if (diceValue === 6 && consecutiveSixes >= 2) {
    return false;
  }
  
  // Get extra turn for rolling 6
  if (diceValue === 6) {
    return true;
  }

  return false;
}

// Check if player has any valid moves
export function hasAnyValidMove(
  player: Player,
  diceValue: number,
  allPlayers: Player[]
): boolean {
  return getValidMoves(player, diceValue, allPlayers).length > 0;
}

// Get board cell coordinates for a position (position is absolute track position)
export function getPositionCoordinates(
  position: number,
  playerColor: PlayerColor
): { row: number; col: number } {
  // Main track positions on a 15x15 grid (absolute positions 0-51)
  const BOARD_POSITIONS: Record<number, { row: number; col: number }> = {
    // Red start and path going up
    0: { row: 13, col: 6 },
    1: { row: 12, col: 6 },
    2: { row: 11, col: 6 },
    3: { row: 10, col: 6 },
    4: { row: 9, col: 6 },
    5: { row: 8, col: 6 },
    // Turn left
    6: { row: 8, col: 5 },
    7: { row: 8, col: 4 },
    8: { row: 8, col: 3 },
    9: { row: 8, col: 2 },
    10: { row: 8, col: 1 },
    11: { row: 8, col: 0 },
    // Turn up
    12: { row: 7, col: 0 },
    // Green start and path going right
    13: { row: 6, col: 0 },
    14: { row: 6, col: 1 },
    15: { row: 6, col: 2 },
    16: { row: 6, col: 3 },
    17: { row: 6, col: 4 },
    18: { row: 6, col: 5 },
    // Turn up
    19: { row: 5, col: 6 },
    20: { row: 4, col: 6 },
    21: { row: 3, col: 6 },
    22: { row: 2, col: 6 },
    23: { row: 1, col: 6 },
    24: { row: 0, col: 6 },
    // Turn right
    25: { row: 0, col: 7 },
    // Yellow start and path going down
    26: { row: 0, col: 8 },
    27: { row: 1, col: 8 },
    28: { row: 2, col: 8 },
    29: { row: 3, col: 8 },
    30: { row: 4, col: 8 },
    31: { row: 5, col: 8 },
    // Turn right
    32: { row: 6, col: 9 },
    33: { row: 6, col: 10 },
    34: { row: 6, col: 11 },
    35: { row: 6, col: 12 },
    36: { row: 6, col: 13 },
    37: { row: 6, col: 14 },
    // Turn down
    38: { row: 7, col: 14 },
    // Blue start and path going left
    39: { row: 8, col: 14 },
    40: { row: 8, col: 13 },
    41: { row: 8, col: 12 },
    42: { row: 8, col: 11 },
    43: { row: 8, col: 10 },
    44: { row: 8, col: 9 },
    // Turn down
    45: { row: 9, col: 8 },
    46: { row: 10, col: 8 },
    47: { row: 11, col: 8 },
    48: { row: 12, col: 8 },
    49: { row: 13, col: 8 },
    50: { row: 14, col: 8 },
    // Turn left back to start
    51: { row: 14, col: 7 },
  };

  // Home stretch positions (52-57 relative positions per player)
  const HOME_STRETCH_POSITIONS: Record<PlayerColor, Array<{ row: number; col: number }>> = {
    red: [
      { row: 13, col: 7 },
      { row: 12, col: 7 },
      { row: 11, col: 7 },
      { row: 10, col: 7 },
      { row: 9, col: 7 },
      { row: 8, col: 7 },
    ],
    green: [
      { row: 7, col: 1 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
      { row: 7, col: 6 },
    ],
    yellow: [
      { row: 1, col: 7 },
      { row: 2, col: 7 },
      { row: 3, col: 7 },
      { row: 4, col: 7 },
      { row: 5, col: 7 },
      { row: 6, col: 7 },
    ],
    blue: [
      { row: 7, col: 13 },
      { row: 7, col: 12 },
      { row: 7, col: 11 },
      { row: 7, col: 10 },
      { row: 7, col: 9 },
      { row: 7, col: 8 },
    ],
  };

  // Check if in home stretch (position 52-58)
  if (position >= MAIN_TRACK_LENGTH && position <= FINISH_POSITION) {
    const homeStretchIndex = position - MAIN_TRACK_LENGTH;
    if (homeStretchIndex >= 0 && homeStretchIndex < HOME_STRETCH_LENGTH) {
      return HOME_STRETCH_POSITIONS[playerColor][homeStretchIndex];
    }
    // Finished - center position
    return { row: 7, col: 7 };
  }

  // Main track - position is stored as absolute position on track
  if (position >= 0 && position < MAIN_TRACK_LENGTH) {
    return BOARD_POSITIONS[position] || { row: 7, col: 7 };
  }

  // Default to center
  return { row: 7, col: 7 };
}

// Get home base coordinates for tokens at home
export function getHomeBaseCoordinates(
  color: PlayerColor,
  homeIndex: number
): { row: number; col: number } {
  const HOME_BASES: Record<PlayerColor, Array<{ row: number; col: number }>> = {
    red: [
      { row: 11, col: 2 },
      { row: 11, col: 4 },
      { row: 13, col: 2 },
      { row: 13, col: 4 },
    ],
    green: [
      { row: 2, col: 2 },
      { row: 2, col: 4 },
      { row: 4, col: 2 },
      { row: 4, col: 4 },
    ],
    yellow: [
      { row: 2, col: 10 },
      { row: 2, col: 12 },
      { row: 4, col: 10 },
      { row: 4, col: 12 },
    ],
    blue: [
      { row: 11, col: 10 },
      { row: 11, col: 12 },
      { row: 13, col: 10 },
      { row: 13, col: 12 },
    ],
  };

  return HOME_BASES[color][homeIndex] || HOME_BASES[color][0];
}
