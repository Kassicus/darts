import type { PlayerColor, GamePhase } from "../_lib/types";
import { PLAYER_COLORS, TOTAL_ROUNDS, DARTS_PER_TURN } from "../_lib/constants";

interface PlayerTurnIndicatorProps {
  currentRound: number;
  currentPlayer: PlayerColor;
  currentDart: number;
  phase: GamePhase;
  roundOrder: PlayerColor[];
  onRestart: () => void;
}

export function PlayerTurnIndicator({
  currentRound,
  currentPlayer,
  currentDart,
  phase,
  roundOrder,
  onRestart,
}: PlayerTurnIndicatorProps) {
  const playerInfo = PLAYER_COLORS[currentPlayer];

  const restartButton = (
    <button
      onClick={onRestart}
      className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 text-sm font-medium border border-gray-700 transition-colors"
    >
      Restart
    </button>
  );

  if (phase === "finished") {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
        <span className="text-lg font-bold text-white">Game Over!</span>
        {restartButton}
      </div>
    );
  }

  if (phase === "roundEnd") {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
        <span className="text-lg font-bold text-white">
          Round {currentRound + 1} Complete
        </span>
        {restartButton}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
      {/* Round */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Round</span>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i <= currentRound ? "bg-white" : "bg-gray-600"
              } ${i === currentRound ? "ring-1 ring-white ring-offset-1 ring-offset-gray-900" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Current player */}
      <div className="flex items-center gap-2">
        <span
          className={`px-4 py-1.5 rounded-full text-base font-bold text-white ${playerInfo.bgClass}`}
        >
          {playerInfo.label}&apos;s Turn
        </span>
      </div>

      {/* Dart count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Dart</span>
        <div className="flex gap-1.5">
          {Array.from({ length: DARTS_PER_TURN }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i <= currentDart ? "bg-white" : "bg-gray-600"
              } ${i === currentDart ? "ring-1 ring-white ring-offset-1 ring-offset-gray-900" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Throw order */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 mr-1">Order:</span>
        {roundOrder.map((color, i) => {
          const info = PLAYER_COLORS[color];
          return (
            <div
              key={color}
              className={`w-5 h-5 rounded-full ${info.bgClass} ${
                color === currentPlayer
                  ? "ring-2 ring-white scale-125"
                  : i < roundOrder.indexOf(currentPlayer)
                    ? "opacity-40"
                    : "opacity-70"
              }`}
              title={`${info.label} - Position ${i + 1}`}
            />
          );
        })}
      </div>

      {restartButton}
    </div>
  );
}
