export type PlayerColor = "red" | "blue" | "green" | "yellow";

export type BoardNumber =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 25;

export interface DartThrow {
  boardNumber: BoardNumber | null;
  pointsAwarded: number;
  player: PlayerColor;
}

export interface RoundState {
  playerOrder: PlayerColor[];
  claimedNumbers: Record<number, PlayerColor>;
  throws: DartThrow[];
}

export interface PlayerScore {
  color: PlayerColor;
  roundScores: number[];
  totalScore: number;
}

export type GamePhase = "playing" | "roundEnd" | "finished";

export interface GameState {
  phase: GamePhase;
  currentRound: number;
  currentPlayerIndex: number;
  currentDartIndex: number;
  rounds: RoundState[];
  scores: Record<PlayerColor, PlayerScore>;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  round: number;
  playerIndex: number;
  dartIndex: number;
  dartThrow: DartThrow;
  claimedNumber: BoardNumber | null;
}

export type GameAction =
  | { type: "THROW_DART"; boardNumber: BoardNumber }
  | { type: "MISS" }
  | { type: "UNDO" }
  | { type: "NEXT_ROUND" }
  | { type: "NEW_GAME" };
