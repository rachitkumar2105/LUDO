import { create } from 'zustand';
import {
  GameState,
  Player,
  Token,
  PlayerColor,
  GameMode,
  AIDifficulty,
  GameScreen,
  DiceState,
  MoveHistoryEntry,
  createPlayer,
  getPlayerColors,
} from '@/types/game';
import {
  rollDice,
  executeMove,
  getValidMoves,
  hasAnyValidMove,
  isGameOver,
  shouldGetExtraTurn,
} from '@/lib/gameLogic';
import { selectAIMove, getAIThinkingDelay } from '@/lib/aiLogic';

interface GameStore extends GameState {
  // Screen management
  currentScreen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  // Game setup
  initializeGame: (
    playerCount: number,
    gameMode: GameMode,
    aiDifficulty: AIDifficulty,
    humanColors?: PlayerColor[]
  ) => void;

  // Dice actions
  rollDiceAction: () => void;
  setDiceRolling: (isRolling: boolean) => void;

  // Token actions
  selectToken: (token: Token | null) => void;
  moveToken: (tokenId: string) => void;

  // Turn management
  nextTurn: () => void;
  skipTurn: () => void;

  // Game controls
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  toggleSound: () => void;

  // AI turn
  executeAITurn: () => void;

  // Undo
  undoLastMove: () => void;

  // Helpers
  getCurrentPlayer: () => Player | null;
  isPlayerTurn: (playerId: string) => boolean;
}

const initialDiceState: DiceState = {
  value: 0,
  isRolling: false,
  canRoll: true,
  rollCount: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  players: [],
  currentPlayerIndex: 0,
  dice: initialDiceState,
  gameMode: 'local',
  aiDifficulty: 'medium',
  isGameOver: false,
  winner: null,
  rankings: [],
  selectedToken: null,
  validMoves: [],
  moveHistory: [],
  lastCutToken: null,
  isPaused: false,
  soundEnabled: true,
  currentScreen: 'splash',

  // Screen management
  setScreen: (screen) => set({ currentScreen: screen }),

  // Initialize game
  initializeGame: (playerCount, gameMode, aiDifficulty, humanColors) => {
    const colors = getPlayerColors(playerCount);
    const players: Player[] = colors.map((color, index) => {
      let type: 'human' | 'ai' = 'human';
      
      if (gameMode === 'vsAI') {
        // First player is human, rest are AI
        if (humanColors) {
          type = humanColors.includes(color) ? 'human' : 'ai';
        } else {
          type = index === 0 ? 'human' : 'ai';
        }
      }
      
      return createPlayer(color, type, index);
    });

    set({
      players,
      currentPlayerIndex: 0,
      dice: { ...initialDiceState },
      gameMode,
      aiDifficulty,
      isGameOver: false,
      winner: null,
      rankings: [],
      selectedToken: null,
      validMoves: [],
      moveHistory: [],
      lastCutToken: null,
      isPaused: false,
      currentScreen: 'game',
    });
  },

  // Roll dice
  rollDiceAction: () => {
    const { dice, players, currentPlayerIndex } = get();
    
    if (!dice.canRoll || dice.isRolling) return;

    set({ dice: { ...dice, isRolling: true } });

    // Simulate dice roll animation
    setTimeout(() => {
      const value = rollDice();
      const currentPlayer = players[currentPlayerIndex];
      const validTokens = getValidMoves(value === 6 ? { ...currentPlayer } : currentPlayer, value, players);
      
      // Recalculate with actual dice value
      const actualValidMoves = getValidMoves(currentPlayer, value, players);
      
      set({
        dice: {
          value,
          isRolling: false,
          canRoll: false,
          rollCount: value === 6 ? dice.rollCount + 1 : 0,
        },
        validMoves: actualValidMoves.map((t) => t.id),
      });

      // Check if no valid moves - auto skip
      if (actualValidMoves.length === 0) {
        setTimeout(() => {
          get().skipTurn();
        }, 1000);
      }
    }, 600);
  },

  setDiceRolling: (isRolling) => {
    set((state) => ({ dice: { ...state.dice, isRolling } }));
  },

  // Select token
  selectToken: (token) => {
    set({ selectedToken: token });
  },

  // Move token
  moveToken: (tokenId) => {
    const { players, currentPlayerIndex, dice, validMoves, moveHistory } = get();
    
    if (!validMoves.includes(tokenId)) return;

    const currentPlayer = players[currentPlayerIndex];
    const token = currentPlayer.tokens.find((t) => t.id === tokenId);
    
    if (!token) return;

    const fromPosition = token.position;
    const { updatedPlayers, wasCut, cutToken, isFinished } = executeMove(
      currentPlayer,
      token,
      dice.value,
      players
    );

    // Create history entry
    const historyEntry: MoveHistoryEntry = {
      playerColor: currentPlayer.color,
      tokenId,
      fromPosition,
      toPosition: token.position + dice.value,
      diceValue: dice.value,
      wasCut,
      cutTokenId: cutToken?.id,
      timestamp: Date.now(),
    };

    set({
      players: updatedPlayers,
      selectedToken: null,
      validMoves: [],
      moveHistory: [...moveHistory, historyEntry],
      lastCutToken: cutToken,
    });

    // Check for game over
    const gameResult = isGameOver(updatedPlayers);
    if (gameResult.isOver) {
      set({
        isGameOver: true,
        winner: gameResult.winner,
        rankings: gameResult.rankings,
        currentScreen: 'gameOver',
      });
      return;
    }

    // Check if player gets another turn
    const extraTurn = shouldGetExtraTurn(dice.value, wasCut, dice.rollCount);
    
    if (extraTurn && dice.rollCount < 3) {
      // Same player rolls again
      set({
        dice: {
          ...dice,
          value: 0,
          canRoll: true,
          rollCount: dice.rollCount,
        },
      });
      
      // If AI, trigger AI turn
      const nextPlayer = updatedPlayers[currentPlayerIndex];
      if (nextPlayer.type === 'ai') {
        setTimeout(() => get().executeAITurn(), getAIThinkingDelay(get().aiDifficulty));
      }
    } else {
      // Next player's turn
      get().nextTurn();
    }
  },

  // Next turn
  nextTurn: () => {
    const { players, currentPlayerIndex } = get();
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    
    set({
      currentPlayerIndex: nextIndex,
      dice: { ...initialDiceState },
      selectedToken: null,
      validMoves: [],
    });

    // If next player is AI, trigger AI turn
    const nextPlayer = players[nextIndex];
    if (nextPlayer.type === 'ai') {
      setTimeout(() => get().executeAITurn(), getAIThinkingDelay(get().aiDifficulty));
    }
  },

  // Skip turn (no valid moves)
  skipTurn: () => {
    get().nextTurn();
  },

  // AI turn
  executeAITurn: () => {
    const { players, currentPlayerIndex, dice, aiDifficulty, isPaused, isGameOver: gameOver } = get();
    
    if (isPaused || gameOver) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.type !== 'ai') return;

    // Roll dice first if needed
    if (dice.canRoll && !dice.isRolling) {
      get().rollDiceAction();
      return;
    }

    // Wait for dice to finish rolling
    if (dice.isRolling) {
      setTimeout(() => get().executeAITurn(), 200);
      return;
    }

    // Select and execute move
    if (dice.value > 0 && !dice.canRoll) {
      const selectedToken = selectAIMove(currentPlayer, dice.value, players, aiDifficulty);
      
      if (selectedToken) {
        setTimeout(() => {
          get().moveToken(selectedToken.id);
        }, getAIThinkingDelay(aiDifficulty) / 2);
      }
    }
  },

  // Game controls
  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => {
    set({ isPaused: false });
    
    // If AI's turn, continue
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer?.type === 'ai') {
      setTimeout(() => get().executeAITurn(), 500);
    }
  },

  resetGame: () => {
    set({
      players: [],
      currentPlayerIndex: 0,
      dice: initialDiceState,
      isGameOver: false,
      winner: null,
      rankings: [],
      selectedToken: null,
      validMoves: [],
      moveHistory: [],
      lastCutToken: null,
      isPaused: false,
      currentScreen: 'home',
    });
  },

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  // Undo last move
  undoLastMove: () => {
    const { moveHistory } = get();
    if (moveHistory.length === 0) return;
    
    // For simplicity, we'll just remove the last history entry
    // Full undo would require storing complete game states
    set({
      moveHistory: moveHistory.slice(0, -1),
    });
  },

  // Helpers
  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex] || null;
  },

  isPlayerTurn: (playerId) => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex]?.id === playerId;
  },
}));
