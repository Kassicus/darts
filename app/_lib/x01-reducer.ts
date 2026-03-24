import type {
  PlayerColor,
  BoardNumber,
  Multiplier,
  GameConfig,
  RuleVariant,
  GameMode,
} from "./types";
import { DARTS_PER_TURN, getPlayersForCount } from "./constants";

export interface X01DartThrow {
  boardNumber: BoardNumber | null;
  multiplier: Multiplier;
  rawScore: number; // boardNumber * multiplier
  player: PlayerColor;
}

export interface X01Turn {
  player: PlayerColor;
  darts: X01DartThrow[];
  totalScored: number;
  busted: boolean;
  scoreAfter: number;
}

export interface X01HistoryEntry {
  playerIndex: number;
  dartIndex: number;
  dart: X01DartThrow;
  scoreBefore: number;
  wasBust: boolean;
  // If bust ended the turn early, store how many darts were skipped
  dartsSkipped: number;
}

export interface X01State {
  phase: "playing" | "finished";
  gameMode: GameMode;
  ruleVariant: RuleVariant;
  players: PlayerColor[];
  startingScore: number;
  currentPlayerIndex: number;
  currentDartIndex: number;
  remainingScores: Record<string, number>;
  turnStartScore: number;
  turnDarts: X01DartThrow[];
  turns: X01Turn[];
  winner: PlayerColor | null;
  history: X01HistoryEntry[];
}

export type X01Action =
  | { type: "THROW_DART"; boardNumber: BoardNumber; multiplier: Multiplier }
  | { type: "MISS" }
  | { type: "UNDO" }
  | { type: "NEW_GAME" };

export function initialX01State(config: GameConfig): X01State {
  const players = getPlayersForCount(config.playerCount);
  const startingScore = config.gameMode === "classic-501" ? 501 : 301;

  return {
    phase: "playing",
    gameMode: config.gameMode,
    ruleVariant: config.ruleVariant ?? "relaxed",
    players,
    startingScore,
    currentPlayerIndex: 0,
    currentDartIndex: 0,
    remainingScores: Object.fromEntries(
      players.map((c) => [c, startingScore]),
    ),
    turnStartScore: startingScore,
    turnDarts: [],
    turns: [],
    winner: null,
    history: [],
  };
}

function advanceToNextPlayer(state: X01State): Partial<X01State> {
  const player = state.players[state.currentPlayerIndex];
  const totalScored = state.turnDarts.reduce((s, d) => s + d.rawScore, 0);
  const busted = state.remainingScores[player] === state.turnStartScore &&
    totalScored === 0 && state.turnDarts.length > 0
    ? false // just all misses, not a bust
    : state.remainingScores[player] !== state.turnStartScore - totalScored;
  // Actually bust is handled inline, this just records the turn

  const turn: X01Turn = {
    player,
    darts: [...state.turnDarts],
    totalScored: state.turnStartScore - state.remainingScores[player],
    busted: false,
    scoreAfter: state.remainingScores[player],
  };

  const nextPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;
  const nextPlayer = state.players[nextPlayerIndex];

  return {
    currentPlayerIndex: nextPlayerIndex,
    currentDartIndex: 0,
    turnStartScore: state.remainingScores[nextPlayer],
    turnDarts: [],
    turns: [...state.turns, turn],
  };
}

function isBust(
  remaining: number,
  dartScore: number,
  multiplier: Multiplier,
  ruleVariant: RuleVariant,
): boolean {
  const newRemaining = remaining - dartScore;
  if (newRemaining < 0) return true;
  if (newRemaining === 0 && ruleVariant === "historic" && multiplier !== 2) {
    return true; // must finish on a double
  }
  // In historic mode, remaining of 1 after a dart means you can't finish
  // (smallest double is 2), but that's not an immediate bust — player
  // just can't go out this turn. Only bust if they go to exactly 0 without double.
  return false;
}

function handleThrow(
  state: X01State,
  boardNumber: BoardNumber | null,
  multiplier: Multiplier,
): X01State {
  if (state.phase !== "playing") return state;

  const player = state.players[state.currentPlayerIndex];
  const remaining = state.remainingScores[player];
  const rawScore = boardNumber !== null ? boardNumber * multiplier : 0;

  const dart: X01DartThrow = {
    boardNumber,
    multiplier,
    rawScore,
    player,
  };

  // Check for bust
  if (boardNumber !== null && isBust(remaining, rawScore, multiplier, state.ruleVariant)) {
    // Bust: revert to turn start score, skip remaining darts, advance player
    const dartsSkipped = DARTS_PER_TURN - state.currentDartIndex - 1;

    const bustTurn: X01Turn = {
      player,
      darts: [...state.turnDarts, dart],
      totalScored: 0,
      busted: true,
      scoreAfter: state.turnStartScore,
    };

    const newScores = { ...state.remainingScores };
    newScores[player] = state.turnStartScore;

    const nextPlayerIndex =
      (state.currentPlayerIndex + 1) % state.players.length;
    const nextPlayer = state.players[nextPlayerIndex];

    return {
      ...state,
      remainingScores: newScores,
      currentPlayerIndex: nextPlayerIndex,
      currentDartIndex: 0,
      turnStartScore: newScores[nextPlayer],
      turnDarts: [],
      turns: [...state.turns, bustTurn],
      history: [
        ...state.history,
        {
          playerIndex: state.currentPlayerIndex,
          dartIndex: state.currentDartIndex,
          dart,
          scoreBefore: remaining,
          wasBust: true,
          dartsSkipped,
        },
      ],
    };
  }

  // Normal scoring
  const newRemaining = remaining - rawScore;
  const newScores = { ...state.remainingScores };
  newScores[player] = newRemaining;

  const newTurnDarts = [...state.turnDarts, dart];
  const newHistory: X01HistoryEntry[] = [
    ...state.history,
    {
      playerIndex: state.currentPlayerIndex,
      dartIndex: state.currentDartIndex,
      dart,
      scoreBefore: remaining,
      wasBust: false,
      dartsSkipped: 0,
    },
  ];

  // Check for win
  if (newRemaining === 0) {
    const winTurn: X01Turn = {
      player,
      darts: newTurnDarts,
      totalScored: state.turnStartScore,
      busted: false,
      scoreAfter: 0,
    };

    return {
      ...state,
      phase: "finished",
      remainingScores: newScores,
      turnDarts: newTurnDarts,
      turns: [...state.turns, winTurn],
      winner: player,
      history: newHistory,
    };
  }

  // Advance dart/player
  const nextDartIndex = state.currentDartIndex + 1;
  if (nextDartIndex >= DARTS_PER_TURN) {
    const turn: X01Turn = {
      player,
      darts: newTurnDarts,
      totalScored: state.turnStartScore - newRemaining,
      busted: false,
      scoreAfter: newRemaining,
    };

    const nextPlayerIndex =
      (state.currentPlayerIndex + 1) % state.players.length;
    const nextPlayer = state.players[nextPlayerIndex];

    return {
      ...state,
      remainingScores: newScores,
      currentPlayerIndex: nextPlayerIndex,
      currentDartIndex: 0,
      turnStartScore: newScores[nextPlayer],
      turnDarts: [],
      turns: [...state.turns, turn],
      history: newHistory,
    };
  }

  return {
    ...state,
    remainingScores: newScores,
    currentDartIndex: nextDartIndex,
    turnDarts: newTurnDarts,
    history: newHistory,
  };
}

function handleUndo(state: X01State): X01State {
  if (state.history.length === 0) return state;

  const history = [...state.history];
  const entry = history.pop()!;

  const player = state.players[entry.playerIndex];
  const newScores = { ...state.remainingScores };
  newScores[player] = entry.scoreBefore;

  if (entry.wasBust) {
    // Undo a bust: restore to mid-turn state before the bust dart
    // We need to reconstruct turnDarts from the bust turn
    const newTurns = [...state.turns];
    const bustTurn = newTurns.pop()!;
    const restoredDarts = bustTurn.darts.slice(0, -1); // remove the bust dart

    return {
      ...state,
      phase: "playing",
      remainingScores: newScores,
      currentPlayerIndex: entry.playerIndex,
      currentDartIndex: entry.dartIndex,
      turnStartScore: bustTurn.scoreAfter, // was the turn start score (reverted)
      turnDarts: restoredDarts,
      turns: newTurns,
      winner: null,
      history,
    };
  }

  // Check if we need to un-advance the player (went to next player's turn)
  if (entry.dartIndex === DARTS_PER_TURN - 1 || state.phase === "finished") {
    // Last dart of turn or winning dart — undo the turn advance
    const newTurns = state.phase === "finished"
      ? state.turns.slice(0, -1)
      : state.turns.slice(0, -1);

    // Reconstruct turnDarts: the previous turn's darts minus the last one
    const prevTurn = state.turns[state.turns.length - 1];
    const restoredDarts = prevTurn ? prevTurn.darts.slice(0, -1) : [];

    return {
      ...state,
      phase: "playing",
      remainingScores: newScores,
      currentPlayerIndex: entry.playerIndex,
      currentDartIndex: entry.dartIndex,
      turnStartScore: entry.scoreBefore + (restoredDarts.reduce((s, d) => s + d.rawScore, 0) > 0
        ? restoredDarts.reduce((s, d) => s + d.rawScore, 0) + entry.dart.rawScore
        : entry.dart.rawScore),
      turnDarts: restoredDarts,
      turns: newTurns,
      winner: null,
      history,
    };
  }

  // Mid-turn undo: just remove the last dart
  return {
    ...state,
    phase: "playing",
    remainingScores: newScores,
    currentDartIndex: entry.dartIndex,
    turnDarts: state.turnDarts.slice(0, -1),
    winner: null,
    history,
  };
}

export function x01Reducer(state: X01State, action: X01Action): X01State {
  switch (action.type) {
    case "THROW_DART":
      return handleThrow(state, action.boardNumber, action.multiplier);
    case "MISS":
      return handleThrow(state, null, 1);
    case "UNDO":
      return handleUndo(state);
    case "NEW_GAME":
      return initialX01State({
        gameMode: state.gameMode,
        playerCount: state.players.length as 2 | 3 | 4,
        rounds: 0,
        ruleVariant: state.ruleVariant,
      });
    default:
      return state;
  }
}
