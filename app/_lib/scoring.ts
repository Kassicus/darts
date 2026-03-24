import type { GameState, PlayerColor, PlayerScore, BoardNumber } from "./types";

export function getCurrentPlayer(state: GameState): PlayerColor {
  return state.rounds[state.currentRound].playerOrder[state.currentPlayerIndex];
}

export function isNumberAvailable(
  state: GameState,
  boardNumber: BoardNumber,
): boolean {
  return !(boardNumber in state.rounds[state.currentRound].claimedNumbers);
}

export function getStandings(
  scores: Record<string, PlayerScore>,
): PlayerScore[] {
  return Object.values(scores).sort((a, b) => b.totalScore - a.totalScore);
}

export function getWinner(
  scores: Record<string, PlayerScore>,
): PlayerColor[] {
  const standings = getStandings(scores);
  const topScore = standings[0].totalScore;
  return standings
    .filter((s) => s.totalScore === topScore)
    .map((s) => s.color);
}
