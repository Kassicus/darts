"use client";

import { useState } from "react";
import type { GameConfig } from "../_lib/types";
import { PLAYER_COLORS, getPlayersForCount } from "../_lib/constants";

interface GameModeDefinition {
  id: GameConfig["gameMode"];
  name: string;
  description: string;
  playerOptions: readonly (2 | 3 | 4)[];
  defaultPlayers: 2 | 3 | 4;
}

const GAME_MODES: GameModeDefinition[] = [
  {
    id: "countdown-chaos",
    name: "Countdown Chaos",
    description:
      "Claim numbers by hitting them first. Each number scores once per round. Rotate throwing order so everyone gets a fair shot.",
    playerOptions: [2, 3, 4],
    defaultPlayers: 4,
  },
  {
    id: "countdown-chaos-plus",
    name: "Countdown Chaos +",
    description:
      "Same as Countdown Chaos, but doubles (2x) and triples (3x) matter. Hit a double or triple to steal a number claimed at a lower multiplier.",
    playerOptions: [2, 3, 4],
    defaultPlayers: 4,
  },
];

interface MainMenuProps {
  onStartGame: (config: GameConfig) => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<string, 2 | 3 | 4>>(
    Object.fromEntries(GAME_MODES.map((m) => [m.id, m.defaultPlayers])),
  );

  const selected = GAME_MODES.find((m) => m.id === selectedMode);

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Darts</h1>
          <p className="text-gray-400">Select a game mode</p>
        </div>

        <div className="space-y-4">
          {GAME_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            const playerCount = playerCounts[mode.id];
            const activePlayers = getPlayersForCount(playerCount);

            return (
              <div
                key={mode.id}
                className={`rounded-2xl border bg-gray-900 transition-colors ${
                  isSelected
                    ? "border-blue-500"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                {/* Game mode header — tap to expand */}
                <button
                  onClick={() =>
                    setSelectedMode(isSelected ? null : mode.id)
                  }
                  className="w-full p-5 text-left"
                >
                  <div className="text-xl font-bold mb-1">{mode.name}</div>
                  <p className="text-sm text-gray-400">{mode.description}</p>
                </button>

                {/* Expanded settings */}
                {isSelected && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                    {/* Player count */}
                    <div>
                      <div className="text-sm text-gray-400 mb-2 font-medium">
                        Players
                      </div>
                      <div className="flex gap-3">
                        {mode.playerOptions.map((n) => (
                          <button
                            key={n}
                            onClick={() =>
                              setPlayerCounts((prev) => ({
                                ...prev,
                                [mode.id]: n,
                              }))
                            }
                            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-colors ${
                              playerCount === n
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>

                      {/* Player preview */}
                      <div className="flex justify-center gap-3 mt-3">
                        {activePlayers.map((color) => {
                          const info = PLAYER_COLORS[color];
                          return (
                            <div
                              key={color}
                              className="flex flex-col items-center gap-1"
                            >
                              <div
                                className={`w-5 h-5 rounded-full ${info.bgClass}`}
                              />
                              <span
                                className={`text-xs font-medium ${info.textClass}`}
                              >
                                {info.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Start button */}
                    <button
                      onClick={() =>
                        onStartGame({
                          gameMode: mode.id,
                          playerCount,
                        })
                      }
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-lg transition-colors"
                    >
                      Start Game
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
