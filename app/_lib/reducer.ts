import type {
  GameState,
  GameAction,
  PlayerColor,
  BoardNumber,
  DartThrow,
  RoundState,
  PlayerScore,
  Multiplier,
  ClaimInfo,
  GameConfig,
} from "./types";
import {
  DARTS_PER_TURN,
  getPlayersForCount,
  generateRotationOrders,
} from "./constants";

export function initialGameState(config: GameConfig): GameState {
  const players = getPlayersForCount(config.playerCount);
  const rotations = generateRotationOrders(players);

  return {
    phase: "playing",
    gameMode: config.gameMode,
    players,
    currentRound: 0,
    currentPlayerIndex: 0,
    currentDartIndex: 0,
    rounds: rotations.map((order) => ({
      playerOrder: order,
      claimedNumbers: {},
      throws: [],
    })),
    scores: Object.fromEntries(
      players.map((color) => [
        color,
        {
          color,
          roundScores: Array(players.length).fill(0),
          totalScore: 0,
        } as PlayerScore,
      ]),
    ) as Record<string, PlayerScore>,
    history: [],
  };
}

function advanceCounters(state: GameState): Partial<GameState> {
  let { currentDartIndex, currentPlayerIndex, currentRound } = state;
  const playerCount = state.players.length;
  const totalRounds = playerCount;

  currentDartIndex++;

  if (currentDartIndex >= DARTS_PER_TURN) {
    currentDartIndex = 0;
    currentPlayerIndex++;

    if (currentPlayerIndex >= playerCount) {
      currentPlayerIndex = 0;
      if (currentRound < totalRounds - 1) {
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

  return { currentDartIndex, currentPlayerIndex, currentRound, phase: "playing" };
}

function handleThrow(
  state: GameState,
  boardNumber: BoardNumber | null,
  multiplier: Multiplier,
): GameState {
  if (state.phase !== "playing") return state;

  const round = state.rounds[state.currentRound];
  const currentPlayer = round.playerOrder[state.currentPlayerIndex];
  const isPlus = state.gameMode === "countdown-chaos-plus";

  let pointsAwarded = 0;
  let pointsLost = 0;
  let stolenFrom: PlayerColor | null = null;
  let claimedNumber: BoardNumber | null = null;
  let previousClaim: ClaimInfo | null = null;

  if (boardNumber !== null) {
    const existing = round.claimedNumbers[boardNumber] as ClaimInfo | undefined;

    if (!existing) {
      // Unclaimed — claim it
      pointsAwarded = boardNumber * multiplier;
      claimedNumber = boardNumber;
    } else if (isPlus && multiplier > existing.multiplier) {
      // Steal: higher multiplier takes it
      previousClaim = existing;
      stolenFrom = existing.player;
      pointsLost = boardNumber * existing.multiplier;
      pointsAwarded = boardNumber * multiplier;
      claimedNumber = boardNumber;
    }
    // Otherwise: already claimed at same or higher multiplier — 0 points
  }

  const dartThrow: DartThrow = {
    boardNumber,
    multiplier,
    pointsAwarded,
    pointsLost,
    stolenFrom,
    player: currentPlayer,
  };

  const newClaimedNumbers = { ...round.claimedNumbers };
  if (claimedNumber !== null) {
    newClaimedNumbers[claimedNumber] = { player: currentPlayer, multiplier };
  }

  const newRound: RoundState = {
    ...round,
    claimedNumbers: newClaimedNumbers,
    throws: [...round.throws, dartThrow],
  };

  const newRounds = [...state.rounds];
  newRounds[state.currentRound] = newRound;

  const newScores = { ...state.scores };

  // Add points to current player
  const playerScore = { ...newScores[currentPlayer] };
  playerScore.roundScores = [...playerScore.roundScores];
  playerScore.roundScores[state.currentRound] += pointsAwarded;
  playerScore.totalScore += pointsAwarded;
  newScores[currentPlayer] = playerScore;

  // Remove points from stolen player
  if (stolenFrom) {
    const victimScore = { ...newScores[stolenFrom] };
    victimScore.roundScores = [...victimScore.roundScores];
    victimScore.roundScores[state.currentRound] -= pointsLost;
    victimScore.totalScore -= pointsLost;
    newScores[stolenFrom] = victimScore;
  }

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
        previousClaim,
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
    if (entry.previousClaim) {
      // Restore the previous claim (undo a steal)
      newClaimedNumbers[entry.claimedNumber] = entry.previousClaim;
    } else {
      delete newClaimedNumbers[entry.claimedNumber];
    }
  }

  const newRound: RoundState = {
    ...round,
    claimedNumbers: newClaimedNumbers,
    throws: round.throws.slice(0, -1),
  };

  const newRounds = [...state.rounds];
  newRounds[entry.round] = newRound;

  const newScores = { ...state.scores };

  // Remove points from current player
  const playerScore = { ...newScores[entry.dartThrow.player] };
  playerScore.roundScores = [...playerScore.roundScores];
  playerScore.roundScores[entry.round] -= entry.dartThrow.pointsAwarded;
  playerScore.totalScore -= entry.dartThrow.pointsAwarded;
  newScores[entry.dartThrow.player] = playerScore;

  // Restore points to stolen player
  if (entry.dartThrow.stolenFrom) {
    const victimScore = { ...newScores[entry.dartThrow.stolenFrom] };
    victimScore.roundScores = [...victimScore.roundScores];
    victimScore.roundScores[entry.round] += entry.dartThrow.pointsLost;
    victimScore.totalScore += entry.dartThrow.pointsLost;
    newScores[entry.dartThrow.stolenFrom] = victimScore;
  }

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
      return handleThrow(state, action.boardNumber, action.multiplier);
    case "MISS":
      return handleThrow(state, null, 1);
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
      return initialGameState({
        gameMode: state.gameMode,
        playerCount: state.players.length as 2 | 3 | 4,
      });
    default:
      return state;
  }
}
