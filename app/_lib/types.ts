export type PlayerColor = "red" | "blue" | "green" | "yellow";

export type BoardNumber =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 25;

export type Multiplier = 1 | 2 | 3;

export type GameMode =
  | "countdown-chaos"
  | "countdown-chaos-plus"
  | "classic-501"
  | "classic-301";

export type RuleVariant = "historic" | "relaxed";

export interface GameConfig {
  gameMode: GameMode;
  playerCount: 2 | 3 | 4;
  rounds: number;
  ruleVariant?: RuleVariant;
}

export interface ClaimInfo {
  player: PlayerColor;
  multiplier: Multiplier;
}

export interface DartThrow {
  boardNumber: BoardNumber | null;
  multiplier: Multiplier;
  pointsAwarded: number;
  pointsLost: number; // points removed from a stolen player
  stolenFrom: PlayerColor | null;
  player: PlayerColor;
}

export interface RoundState {
  playerOrder: PlayerColor[];
  claimedNumbers: Record<number, ClaimInfo>;
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
  gameMode: GameMode;
  players: PlayerColor[];
  currentRound: number;
  currentPlayerIndex: number;
  currentDartIndex: number;
  rounds: RoundState[];
  scores: Record<string, PlayerScore>;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  round: number;
  playerIndex: number;
  dartIndex: number;
  dartThrow: DartThrow;
  claimedNumber: BoardNumber | null;
  previousClaim: ClaimInfo | null;
}

export type GameAction =
  | { type: "THROW_DART"; boardNumber: BoardNumber; multiplier: Multiplier }
  | { type: "MISS" }
  | { type: "UNDO" }
  | { type: "NEXT_ROUND" }
  | { type: "NEW_GAME" };
