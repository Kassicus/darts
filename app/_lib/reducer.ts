import type {
  GameState,
  GameAction,
  PlayerColor,
  BoardNumber,
  DartThrow,
  RoundState,
  PlayerScore,
} from "./types";
import {
  PLAYERS,
  ROTATION_ORDERS,
  DARTS_PER_TURN,
  PLAYERS_PER_ROUND,
  TOTAL_ROUNDS,
} from "./constants";

export function initialGameState(): GameState {
  return {
    phase: "playing",
    currentRound: 0,
    currentPlayerIndex: 0,
    currentDartIndex: 0,
    rounds: ROTATION_ORDERS.map((order) => ({
      playerOrder: order,
      claimedNumbers: {},
      throws: [],
    })),
    scores: Object.fromEntries(
      PLAYERS.map((color) => [
        color,
        { color, roundScores: [0, 0, 0, 0], totalScore: 0 } as PlayerScore,
      ]),
    ) as Record<PlayerColor, PlayerScore>,
    history: [],
  };
}

function advanceCounters(state: GameState): Partial<GameState> {
  let { currentDartIndex, currentPlayerIndex, currentRound, phase } = state;

  currentDartIndex++;

  if (currentDartIndex >= DARTS_PER_TURN) {
    currentDartIndex = 0;
    currentPlayerIndex++;

    if (currentPlayerIndex >= PLAYERS_PER_ROUND) {
      currentPlayerIndex = 0;
      // Show round-end summary before advancing
      if (currentRound < TOTAL_ROUNDS - 1) {
        return {
          currentDartIndex,
          currentPlayerIndex,
          currentRound,
          phase: "roundEnd",
        };
      } else {
        return {
          currentDartIndex: 0,
          currentPlayerIndex: 0,
          currentRound,
          phase: "finished",
        };
      }
    }
  }

  return { currentDartIndex, currentPlayerIndex, currentRound, phase };
}

function handleThrow(
  state: GameState,
  boardNumber: BoardNumber | null,
): GameState {
  if (state.phase !== "playing") return state;

  const round = state.rounds[state.currentRound];
  const currentPlayer = round.playerOrder[state.currentPlayerIndex];

  let pointsAwarded = 0;
  let claimedNumber: BoardNumber | null = null;

  if (boardNumber !== null && !(boardNumber in round.claimedNumbers)) {
    pointsAwarded = boardNumber;
    claimedNumber = boardNumber;
  }

  const dartThrow: DartThrow = {
    boardNumber,
    pointsAwarded,
    player: currentPlayer,
  };

  const newClaimedNumbers = { ...round.claimedNumbers };
  if (claimedNumber !== null) {
    newClaimedNumbers[claimedNumber] = currentPlayer;
  }

  const newRound: RoundState = {
    ...round,
    claimedNumbers: newClaimedNumbers,
    throws: [...round.throws, dartThrow],
  };

  const newRounds = [...state.rounds];
  newRounds[state.currentRound] = newRound;

  const newScores = { ...state.scores };
  const playerScore = { ...newScores[currentPlayer] };
  playerScore.roundScores = [...playerScore.roundScores];
  playerScore.roundScores[state.currentRound] += pointsAwarded;
  playerScore.totalScore += pointsAwarded;
  newScores[currentPlayer] = playerScore;

  const counters = advanceCounters(state);

  return {
    ...state,
    ...counters,
    rounds: newRounds,
    scores: newScores,
    history: [
      ...state.history,
      {
        round: state.currentRound,
        playerIndex: state.currentPlayerIndex,
        dartIndex: state.currentDartIndex,
        dartThrow,
        claimedNumber,
      },
    ],
  };
}

function handleUndo(state: GameState): GameState {
  if (state.history.length === 0) return state;

  const history = [...state.history];
  const entry = history.pop()!;

  const round = state.rounds[entry.round];
  const newClaimedNumbers = { ...round.claimedNumbers };
  if (entry.claimedNumber !== null) {
    delete newClaimedNumbers[entry.claimedNumber];
  }

  const newRound: RoundState = {
    ...round,
    claimedNumbers: newClaimedNumbers,
    throws: round.throws.slice(0, -1),
  };

  const newRounds = [...state.rounds];
  newRounds[entry.round] = newRound;

  const newScores = { ...state.scores };
  const playerScore = { ...newScores[entry.dartThrow.player] };
  playerScore.roundScores = [...playerScore.roundScores];
  playerScore.roundScores[entry.round] -= entry.dartThrow.pointsAwarded;
  playerScore.totalScore -= entry.dartThrow.pointsAwarded;
  newScores[entry.dartThrow.player] = playerScore;

  return {
    ...state,
    phase: "playing",
    currentRound: entry.round,
    currentPlayerIndex: entry.playerIndex,
    currentDartIndex: entry.dartIndex,
    rounds: newRounds,
    scores: newScores,
    history,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "THROW_DART":
      return handleThrow(state, action.boardNumber);
    case "MISS":
      return handleThrow(state, null);
    case "UNDO":
      return handleUndo(state);
    case "NEXT_ROUND": {
      if (state.phase !== "roundEnd") return state;
      return {
        ...state,
        phase: "playing",
        currentRound: state.currentRound + 1,
        currentPlayerIndex: 0,
        currentDartIndex: 0,
      };
    }
    case "NEW_GAME":
      return initialGameState();
    default:
      return state;
  }
}
