import type { PlayerColor, PlayerScore, RoundState, DartThrow } from "../_lib/types";
import { PLAYER_COLORS, TOTAL_ROUNDS, ROTATION_ORDERS } from "../_lib/constants";

interface ScoreboardProps {
  scores: Record<PlayerColor, PlayerScore>;
  rounds: RoundState[];
  currentRound: number;
}

export function Scoreboard({ scores, rounds, currentRound }: ScoreboardProps) {
  const players: PlayerColor[] = ["red", "blue", "green", "yellow"];
  const maxScore = Math.max(...players.map((p) => scores[p].totalScore));

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Score table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-2 py-2 text-left text-gray-400 font-medium w-12"></th>
              {players.map((color) => (
                <th key={color} className="px-1 py-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${PLAYER_COLORS[color].bgClass}`} />
                    <span className={`font-bold text-xs ${PLAYER_COLORS[color].textClass}`}>
                      {PLAYER_COLORS[color].label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: TOTAL_ROUNDS }, (_, roundIdx) => {
              const isCurrentRound = roundIdx === currentRound;
              const order = ROTATION_ORDERS[roundIdx];
              return (
                <tr
                  key={roundIdx}
                  className={`border-b border-gray-800 ${
                    isCurrentRound ? "bg-gray-800/50" : ""
                  }`}
                >
                  <td className="px-2 py-2 text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">R{roundIdx + 1}</span>
                      {isCurrentRound && (
                        <span className="text-xs text-blue-400">●</span>
                      )}
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {order.map((c) => (
                        <div
                          key={c}
                          className={`w-1.5 h-1.5 rounded-full ${PLAYER_COLORS[c].bgClass}`}
                        />
                      ))}
                    </div>
                  </td>
                  {players.map((color) => (
                    <td
                      key={color}
                      className="px-1 py-2 text-center text-white font-mono text-base font-semibold"
                    >
                      {scores[color].roundScores[roundIdx] || (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-800/80">
              <td className="px-2 py-2 font-bold text-white text-sm">Total</td>
              {players.map((color) => {
                const total = scores[color].totalScore;
                const isLeading = total === maxScore && total > 0;
                return (
                  <td
                    key={color}
                    className={`px-1 py-2 text-center font-mono font-bold ${
                      isLeading
                        ? `${PLAYER_COLORS[color].textClass} text-xl`
                        : "text-white text-lg"
                    }`}
                  >
                    {total}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Current round throw log */}
      <ThrowLog throws={rounds[currentRound].throws} />
    </div>
  );
}

function ThrowLog({ throws }: { throws: DartThrow[] }) {
  if (throws.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
      <div className="text-xs text-gray-400 mb-2 font-medium">
        This Round
      </div>
      <div className="flex flex-wrap gap-1.5">
        {throws.map((t, i) => (
          <span
            key={i}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
              t.boardNumber === null
                ? "bg-gray-800 text-gray-500"
                : t.pointsAwarded > 0
                  ? `${PLAYER_COLORS[t.player].bgClass} text-white`
                  : "bg-gray-800 text-gray-400 line-through"
            }`}
          >
            {t.boardNumber === null ? "Miss" : t.boardNumber}
            {t.boardNumber !== null && t.pointsAwarded === 0 && (
              <span className="ml-1 text-[10px] no-underline" style={{ textDecoration: "none" }}>
                (taken)
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
