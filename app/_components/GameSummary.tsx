import type { PlayerColor, PlayerScore } from "../_lib/types";
import { PLAYER_COLORS } from "../_lib/constants";
import { getStandings, getWinner } from "../_lib/scoring";

interface GameSummaryProps {
  scores: Record<PlayerColor, PlayerScore>;
  onNewGame: () => void;
}

export function GameSummary({ scores, onNewGame }: GameSummaryProps) {
  const standings = getStandings(scores);
  const winners = getWinner(scores);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Final Results
        </h2>

        <div className="space-y-3">
          {standings.map((player, i) => {
            const info = PLAYER_COLORS[player.color];
            const isWinner = winners.includes(player.color);
            return (
              <div
                key={player.color}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  isWinner
                    ? `bg-gray-800 ring-2 ${info.ringClass}`
                    : "bg-gray-800/50"
                }`}
              >
                <div
                  className={`text-lg font-bold w-8 text-center ${
                    isWinner ? "text-yellow-400" : "text-gray-500"
                  }`}
                >
                  {isWinner ? "🏆" : `#${i + 1}`}
                </div>
                <div
                  className={`w-4 h-4 rounded-full ${info.bgClass}`}
                />
                <div className="flex-1">
                  <div className={`font-bold ${info.textClass}`}>
                    {info.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {player.roundScores.join(" + ")}
                  </div>
                </div>
                <div
                  className={`text-xl font-bold font-mono ${
                    isWinner ? "text-white" : "text-gray-400"
                  }`}
                >
                  {player.totalScore}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onNewGame}
          className="w-full mt-6 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-lg transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
