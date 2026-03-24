"use client";

import { useReducer } from "react";
import { gameReducer, initialGameState } from "../_lib/reducer";
import { getCurrentPlayer } from "../_lib/scoring";
import type { BoardNumber } from "../_lib/types";
import { Dartboard } from "./Dartboard";
import { PlayerTurnIndicator } from "./PlayerTurnIndicator";
import { Scoreboard } from "./Scoreboard";
import { ActionBar } from "./ActionBar";
import { GameSummary } from "./GameSummary";
import { RoundSummary } from "./RoundSummary";

export function GameShell() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialGameState);

  const currentRound = state.rounds[state.currentRound];
  const currentPlayer =
    state.phase === "playing" ? getCurrentPlayer(state) : currentRound.playerOrder[0];
  const boardDisabled = state.phase !== "playing";

  return (
    <div className="h-dvh flex flex-col bg-gray-950 text-white overflow-hidden">
      <PlayerTurnIndicator
        currentRound={state.currentRound}
        currentPlayer={currentPlayer}
        currentDart={state.currentDartIndex}
        phase={state.phase}
        roundOrder={currentRound.playerOrder}
        onRestart={() => dispatch({ type: "NEW_GAME" })}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0 overflow-hidden">
        {/* Dartboard section — 4/5 width */}
        <div className="flex flex-col items-center min-h-0 lg:h-full lg:w-4/5">
          <div className="min-h-0 flex-1 flex items-center justify-center w-full">
            <div className="h-full max-h-full aspect-square">
              <Dartboard
                claimedNumbers={currentRound.claimedNumbers}
                onHit={(num: BoardNumber) =>
                  dispatch({ type: "THROW_DART", boardNumber: num })
                }
                disabled={boardDisabled}
              />
            </div>
          </div>
          <ActionBar
            onMiss={() => dispatch({ type: "MISS" })}
            onUndo={() => dispatch({ type: "UNDO" })}
            canUndo={state.history.length > 0}
            disabled={boardDisabled}
          />
        </div>

        {/* Scoreboard section — 1/5 width */}
        <div className="lg:w-1/5 min-h-0 overflow-auto">
          <Scoreboard
            scores={state.scores}
            rounds={state.rounds}
            currentRound={state.currentRound}
          />
        </div>
      </div>

      {/* Round end overlay */}
      {state.phase === "roundEnd" && (
        <RoundSummary
          roundIndex={state.currentRound}
          round={currentRound}
          scores={state.scores}
          onNextRound={() => dispatch({ type: "NEXT_ROUND" })}
        />
      )}

      {/* Game over overlay */}
      {state.phase === "finished" && (
        <GameSummary
          scores={state.scores}
          onNewGame={() => dispatch({ type: "NEW_GAME" })}
        />
      )}
    </div>
  );
}
