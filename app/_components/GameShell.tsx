"use client";

import { useReducer, useState } from "react";
import { gameReducer, initialGameState } from "../_lib/reducer";
import { getCurrentPlayer } from "../_lib/scoring";
import type { BoardNumber, GameConfig, Multiplier } from "../_lib/types";
import { MainMenu } from "./MainMenu";
import { Dartboard } from "./Dartboard";
import { PlayerTurnIndicator } from "./PlayerTurnIndicator";
import { Scoreboard } from "./Scoreboard";
import { ActionBar } from "./ActionBar";
import { GameSummary } from "./GameSummary";
import { RoundSummary } from "./RoundSummary";

export function GameShell() {
  const [config, setConfig] = useState<GameConfig | null>(null);

  if (!config) {
    return <MainMenu onStartGame={setConfig} />;
  }

  return (
    <GameBoard
      key={`${config.gameMode}-${config.playerCount}-${Date.now()}`}
      config={config}
      onBack={() => setConfig(null)}
    />
  );
}

function GameBoard({ config, onBack }: { config: GameConfig; onBack: () => void }) {
  const [state, dispatch] = useReducer(gameReducer, config, initialGameState);

  const advancedMode = config.gameMode === "countdown-chaos-plus";
  const currentRound = state.rounds[state.currentRound];
  const currentPlayer =
    state.phase === "playing"
      ? getCurrentPlayer(state)
      : currentRound.playerOrder[0];
  const boardDisabled = state.phase !== "playing";

  return (
    <div className="h-dvh flex flex-col bg-gray-950 text-white overflow-hidden">
      <PlayerTurnIndicator
        currentRound={state.currentRound}
        totalRounds={state.rounds.length}
        currentPlayer={currentPlayer}
        currentDart={state.currentDartIndex}
        phase={state.phase}
        roundOrder={currentRound.playerOrder}
        onRestart={() => dispatch({ type: "NEW_GAME" })}
        onBack={onBack}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0 overflow-hidden">
        <div className="flex flex-col items-center min-h-0 lg:h-full lg:w-4/5">
          <div className="min-h-0 flex-1 flex items-center justify-center w-full">
            <div className="h-full max-h-full aspect-square">
              <Dartboard
                claimedNumbers={currentRound.claimedNumbers}
                onHit={(num: BoardNumber, mult: Multiplier) =>
                  dispatch({ type: "THROW_DART", boardNumber: num, multiplier: mult })
                }
                disabled={boardDisabled}
                advancedMode={advancedMode}
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

        <div className="lg:w-1/5 min-h-0 overflow-auto">
          <Scoreboard
            players={state.players}
            scores={state.scores}
            rounds={state.rounds}
            currentRound={state.currentRound}
            advancedMode={advancedMode}
          />
        </div>
      </div>

      {state.phase === "roundEnd" && (
        <RoundSummary
          roundIndex={state.currentRound}
          round={currentRound}
          rounds={state.rounds}
          scores={state.scores}
          onNextRound={() => dispatch({ type: "NEXT_ROUND" })}
        />
      )}

      {state.phase === "finished" && (
        <GameSummary
          scores={state.scores}
          onNewGame={() => dispatch({ type: "NEW_GAME" })}
          onBackToMenu={onBack}
        />
      )}
    </div>
  );
}
