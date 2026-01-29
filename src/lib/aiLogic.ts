// AI Logic for Ludo

import {
  Player,
  Token,
  PlayerColor,
  AIDifficulty,
  START_POSITIONS,
  SAFE_POSITIONS,
  MAIN_TRACK_LENGTH,
} from '@/types/game';
import {
  getValidMoves,
  calculateNewPosition,
  checkForCut,
  getAbsolutePosition,
  isSafePosition,
} from './gameLogic';

interface MoveScore {
  token: Token;
  score: number;
  reason: string;
}

// Calculate move scores for AI
function scoreMoves(
  player: Player,
  diceValue: number,
  allPlayers: Player[],
  difficulty: AIDifficulty
): MoveScore[] {
  const validTokens = getValidMoves(player, diceValue, allPlayers);
  const scores: MoveScore[] = [];

  for (const token of validTokens) {
    let score = 0;
    let reason = 'default';

    const newPosition = calculateNewPosition(token, diceValue, player.color);
    const absoluteNewPos = getAbsolutePosition(newPosition, player.color);

    // Coming out of home
    if (token.isHome) {
      score += 50;
      reason = 'leaving home';
    }

    // Check if this move would cut an opponent
    const { isCut, cutToken } = checkForCut(absoluteNewPos, player.color, allPlayers);
    if (isCut && cutToken) {
      // Huge bonus for cutting
      score += 100;
      reason = 'cutting opponent';

      // Extra bonus if cutting a token that's far along
      if (cutToken.position > 26) {
        score += 50;
        reason = 'cutting advanced opponent';
      }
    }

    // Moving to safe position
    if (isSafePosition(absoluteNewPos)) {
      score += 30;
      reason = reason === 'default' ? 'moving to safe zone' : reason;
    }

    // Getting closer to finish
    if (newPosition >= MAIN_TRACK_LENGTH) {
      score += 40 + (newPosition - MAIN_TRACK_LENGTH) * 10;
      reason = 'entering home stretch';
    }

    // About to finish
    if (newPosition === 57) {
      score += 200;
      reason = 'finishing token';
    }

    // Check danger - are there opponents nearby who could cut this token?
    if (difficulty === 'medium') {
      const dangerScore = assessDanger(token, newPosition, player.color, allPlayers);
      score -= dangerScore;
      if (dangerScore > 20) {
        reason = 'avoiding danger';
      }
    }

    // Prioritize tokens that are further along (to finish faster)
    if (!token.isHome) {
      score += Math.floor(token.position / 10) * 5;
    }

    // Add some randomness for easy difficulty
    if (difficulty === 'easy') {
      score += Math.random() * 30;
    }

    scores.push({ token, score, reason });
  }

  return scores.sort((a, b) => b.score - a.score);
}

// Assess how dangerous a position is
function assessDanger(
  token: Token,
  newPosition: number,
  playerColor: PlayerColor,
  allPlayers: Player[]
): number {
  if (newPosition >= MAIN_TRACK_LENGTH) {
    return 0; // Home stretch is safe
  }

  const absolutePos = getAbsolutePosition(newPosition, playerColor);
  
  if (isSafePosition(absolutePos)) {
    return 0; // Safe zones are safe
  }

  let danger = 0;

  // Check how close opponents are behind us
  for (const opponent of allPlayers) {
    if (opponent.color === playerColor) continue;

    for (const oppToken of opponent.tokens) {
      if (oppToken.isHome || oppToken.isFinished) continue;

      const oppAbsPos = getAbsolutePosition(oppToken.position, opponent.color);
      
      // Calculate distance (opponent needs to be behind us)
      let distance = (absolutePos - oppAbsPos + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
      
      // If opponent is within 6 spaces behind, it's dangerous
      if (distance > 0 && distance <= 6) {
        danger += (7 - distance) * 10; // Closer = more dangerous
      }
    }
  }

  return danger;
}

// Main AI move selection
export function selectAIMove(
  player: Player,
  diceValue: number,
  allPlayers: Player[],
  difficulty: AIDifficulty
): Token | null {
  const validTokens = getValidMoves(player, diceValue, allPlayers);
  
  if (validTokens.length === 0) {
    return null;
  }

  if (validTokens.length === 1) {
    return validTokens[0];
  }

  const scores = scoreMoves(player, diceValue, allPlayers, difficulty);
  
  // For easy difficulty, sometimes pick a random move instead of best
  if (difficulty === 'easy' && Math.random() < 0.3) {
    const randomIndex = Math.floor(Math.random() * Math.min(3, scores.length));
    return scores[randomIndex].token;
  }

  // Return the highest scored move
  return scores[0]?.token || validTokens[0];
}

// AI thinking delay (milliseconds)
export function getAIThinkingDelay(difficulty: AIDifficulty): number {
  return difficulty === 'easy' ? 800 : 1200;
}
