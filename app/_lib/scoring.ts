import type { GameState, PlayerColor, PlayerScore, BoardNumber } from "./types";
import { ROTATION_ORDERS } from "./constants";

export function getCurrentPlayer(state: GameState): PlayerColor {
  return state.rounds[state.currentRound].playerOrder[state.currentPlayerIndex];
}

export function getRoundOrder(roundIndex: number): PlayerColor[] {
  return ROTATION_ORDERS[roundIndex];
}

export function isNumberAvailable(
  state: GameState,
  boardNumber: BoardNumber,
): boolean {
  return !(boardNumber in state.rounds[state.currentRound].claimedNumbers);
}

export function getStandings(
  scores: Record<PlayerColor, PlayerScore>,
): PlayerScore[] {
  return Object.values(scores).sort((a, b) => b.totalScore - a.totalScore);
}

export function getWinner(
  scores: Record<PlayerColor, PlayerScore>,
): PlayerColor[] {
  const standings = getStandings(scores);
  const topScore = standings[0].totalScore;
  return standings
    .filter((s) => s.totalScore === topScore)
    .map((s) => s.color);
}
