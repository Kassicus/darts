import type { PlayerColor, PlayerScore, RoundState } from "../_lib/types";
import { PLAYER_COLORS } from "../_lib/constants";

interface RoundSummaryProps {
  roundIndex: number;
  round: RoundState;
  rounds: RoundState[];
  scores: Record<string, PlayerScore>;
  onNextRound: () => void;
}

export function RoundSummary({
  roundIndex,
  round,
  rounds,
  scores,
  onNextRound,
}: RoundSummaryProps) {
  const order = round.playerOrder;
  const nextRound = rounds[roundIndex + 1];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
        <h2 className="text-xl font-bold text-center text-white mb-1">
          Round {roundIndex + 1} Complete
        </h2>
        <p className="text-center text-gray-400 text-sm mb-5">
          {Object.keys(round.claimedNumbers).length} numbers claimed
        </p>

        <div className="space-y-2 mb-5">
          {order.map((color) => {
            const info = PLAYER_COLORS[color];
            const roundScore = scores[color].roundScores[roundIndex];
            return (
              <div
                key={color}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/60"
              >
                <div className={`w-3 h-3 rounded-full ${info.bgClass}`} />
                <span className={`font-medium flex-1 ${info.textClass}`}>
                  {info.label}
                </span>
                <span className="font-mono font-bold text-white">
                  +{roundScore}
                </span>
                <span className="text-xs text-gray-500 font-mono w-12 text-right">
                  ({scores[color].totalScore})
                </span>
              </div>
            );
          })}
        </div>

        {nextRound && (
          <p className="text-center text-gray-400 text-xs mb-4">
            Next round order:{" "}
            {nextRound.playerOrder.map((c) => PLAYER_COLORS[c].label).join(" → ")}
          </p>
        )}

        <button
          onClick={onNextRound}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold transition-colors"
        >
          Start Round {roundIndex + 2}
        </button>
      </div>
    </div>
  );
}
