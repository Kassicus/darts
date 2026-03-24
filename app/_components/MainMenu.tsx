"use client";

import { useState } from "react";
import type { GameConfig, RuleVariant } from "../_lib/types";
import { PLAYER_COLORS, getPlayersForCount } from "../_lib/constants";

interface GameModeDefinition {
  id: GameConfig["gameMode"];
  name: string;
  description: string;
  playerOptions: readonly (2 | 3 | 4)[];
  defaultPlayers: 2 | 3 | 4;
  hasRounds: boolean;
  hasRuleVariant: boolean;
}

const GAME_MODES: GameModeDefinition[] = [
  {
    id: "countdown-chaos",
    name: "Countdown Chaos",
    description:
      "Claim numbers by hitting them first. Each number scores once per round. Rotate throwing order so everyone gets a fair shot.",
    playerOptions: [2, 3, 4],
    defaultPlayers: 4,
    hasRounds: true,
    hasRuleVariant: false,
  },
  {
    id: "countdown-chaos-plus",
    name: "Countdown Chaos +",
    description:
      "Same as Countdown Chaos, but doubles (2x) and triples (3x) matter. Hit a double or triple to steal a number claimed at a lower multiplier.",
    playerOptions: [2, 3, 4],
    defaultPlayers: 4,
    hasRounds: true,
    hasRuleVariant: false,
  },
  {
    id: "classic-501",
    name: "Classic 501",
    description:
      "Start at 501 and count down to exactly zero. Standard darts scoring with singles, doubles, and triples.",
    playerOptions: [2, 3, 4],
    defaultPlayers: 2,
    hasRounds: false,
    hasRuleVariant: true,
  },
  {
    id: "classic-301",
    name: "Classic 301",
    description:
      "Start at 301 and count down to exactly zero. A quicker game with the same scoring rules as 501.",
    playerOptions: [2, 3, 4],
    defaultPlayers: 2,
    hasRounds: false,
    hasRuleVariant: true,
  },
];

const MAX_ROUNDS = 10;

interface MainMenuProps {
  onStartGame: (config: GameConfig) => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<string, 2 | 3 | 4>>(
    Object.fromEntries(GAME_MODES.map((m) => [m.id, m.defaultPlayers])),
  );
  const [roundCounts, setRoundCounts] = useState<Record<string, number>>(
    Object.fromEntries(GAME_MODES.map((m) => [m.id, m.defaultPlayers])),
  );
  const [ruleVariants, setRuleVariants] = useState<Record<string, RuleVariant>>(
    Object.fromEntries(GAME_MODES.map((m) => [m.id, "relaxed"])),
  );

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-gray-950 text-white p-6 overflow-auto">
      <div className="max-w-md w-full space-y-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Darts</h1>
          <p className="text-gray-400">Select a game mode</p>
        </div>

        <div className="space-y-4">
          {GAME_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            const playerCount = playerCounts[mode.id];
            const roundCount = roundCounts[mode.id];
            const ruleVariant = ruleVariants[mode.id];
            const minRounds = playerCount;
            const activePlayers = getPlayersForCount(playerCount);
            const effectiveRounds = Math.max(minRounds, Math.min(roundCount, MAX_ROUNDS));

            return (
              <div
                key={mode.id}
                className={`rounded-2xl border bg-gray-900 transition-colors ${
                  isSelected
                    ? "border-blue-500"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <button
                  onClick={() =>
                    setSelectedMode(isSelected ? null : mode.id)
                  }
                  className="w-full p-5 text-left"
                >
                  <div className="text-xl font-bold mb-1">{mode.name}</div>
                  <p className="text-sm text-gray-400">{mode.description}</p>
                </button>

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
                            onClick={() => {
                              setPlayerCounts((prev) => ({
                                ...prev,
                                [mode.id]: n,
                              }));
                              setRoundCounts((prev) => ({
                                ...prev,
                                [mode.id]: Math.max(n, prev[mode.id]),
                              }));
                            }}
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

                    {/* Round count (only for countdown modes) */}
                    {mode.hasRounds && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2 font-medium">
                          Rounds
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from(
                            { length: MAX_ROUNDS - minRounds + 1 },
                            (_, i) => minRounds + i,
                          ).map((n) => (
                            <button
                              key={n}
                              onClick={() =>
                                setRoundCounts((prev) => ({
                                  ...prev,
                                  [mode.id]: n,
                                }))
                              }
                              className={`w-11 py-2 rounded-lg font-bold text-base transition-colors ${
                                effectiveRounds === n
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rule variant (only for x01 modes) */}
                    {mode.hasRuleVariant && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2 font-medium">
                          Rules
                        </div>
                        <div className="flex gap-3">
                          {(["relaxed", "historic"] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() =>
                                setRuleVariants((prev) => ({
                                  ...prev,
                                  [mode.id]: v,
                                }))
                              }
                              className={`flex-1 py-3 rounded-xl font-bold text-base transition-colors ${
                                ruleVariant === v
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                              }`}
                            >
                              {v === "relaxed" ? "Relaxed" : "Historic"}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {ruleVariant === "historic"
                            ? "Must finish on a double or bullseye to win."
                            : "Reach exactly zero with any combination to win."}
                        </p>
                      </div>
                    )}

                    {/* Start button */}
                    <button
                      onClick={() =>
                        onStartGame({
                          gameMode: mode.id,
                          playerCount,
                          rounds: effectiveRounds,
                          ruleVariant: mode.hasRuleVariant ? ruleVariant : undefined,
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
