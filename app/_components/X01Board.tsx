"use client";

import { useReducer } from "react";
import { x01Reducer, initialX01State } from "../_lib/x01-reducer";
import type { BoardNumber, GameConfig, Multiplier } from "../_lib/types";
import { PLAYER_COLORS } from "../_lib/constants";
import { Dartboard } from "./Dartboard";
import { PlayerTurnIndicator } from "./PlayerTurnIndicator";
import { ActionBar } from "./ActionBar";
import { X01Scoreboard } from "./X01Scoreboard";

interface X01BoardProps {
  config: GameConfig;
  onBack: () => void;
}

export function X01Board({ config, onBack }: X01BoardProps) {
  const [state, dispatch] = useReducer(x01Reducer, config, initialX01State);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const boardDisabled = state.phase !== "playing";

  return (
    <div className="h-dvh flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
        {state.phase === "finished" ? (
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">
              {PLAYER_COLORS[state.winner!].label} wins!
            </span>
            <span className={`w-4 h-4 rounded-full ${PLAYER_COLORS[state.winner!].bgClass}`} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {state.startingScore}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-xs text-gray-400 capitalize">
                {state.ruleVariant}
              </span>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-base font-bold text-white ${PLAYER_COLORS[currentPlayer].bgClass}`}
            >
              {PLAYER_COLORS[currentPlayer].label}&apos;s Turn
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Dart</span>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i <= state.currentDartIndex ? "bg-white" : "bg-gray-600"
                    } ${i === state.currentDartIndex ? "ring-1 ring-white ring-offset-1 ring-offset-gray-900" : ""}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: "NEW_GAME" })}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 text-sm font-medium border border-gray-700 transition-colors"
          >
            Restart
          </button>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 text-sm font-medium border border-gray-700 transition-colors"
          >
            Menu
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0 overflow-hidden">
        <div className="flex flex-col items-center min-h-0 lg:h-full lg:w-4/5">
          <div className="min-h-0 flex-1 flex items-center justify-center w-full">
            <div className="h-full max-h-full aspect-square">
              <Dartboard
                claimedNumbers={{}}
                onHit={(num: BoardNumber, mult: Multiplier) =>
                  dispatch({ type: "THROW_DART", boardNumber: num, multiplier: mult })
                }
                disabled={boardDisabled}
                advancedMode={true}
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
          <X01Scoreboard state={state} />
        </div>
      </div>
    </div>
  );
}
