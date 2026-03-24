import type { PlayerColor } from "../_lib/types";
import type { X01State, X01DartThrow, X01Turn } from "../_lib/x01-reducer";
import { PLAYER_COLORS } from "../_lib/constants";

interface X01ScoreboardProps {
  state: X01State;
}

export function X01Scoreboard({ state }: X01ScoreboardProps) {
  const { players, remainingScores, currentPlayerIndex, turnDarts, turns } = state;

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Remaining scores */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 space-y-2">
        {players.map((color, i) => {
          const info = PLAYER_COLORS[color];
          const remaining = remainingScores[color];
          const isActive = i === currentPlayerIndex && state.phase === "playing";
          return (
            <div
              key={color}
              className={`flex items-center gap-3 p-2.5 rounded-lg ${
                isActive ? "bg-gray-800 ring-1 " + info.ringClass : "bg-gray-800/30"
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${info.bgClass}`} />
              <span className={`text-sm font-medium flex-1 ${info.textClass}`}>
                {info.label}
              </span>
              <span
                className={`font-mono font-bold ${
                  remaining === 0
                    ? "text-green-400 text-xl"
                    : isActive
                      ? "text-white text-2xl"
                      : "text-gray-300 text-xl"
                }`}
              >
                {remaining}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current turn */}
      {state.phase === "playing" && (
        <CurrentTurn
          darts={turnDarts}
          player={players[currentPlayerIndex]}
        />
      )}

      {/* Recent turns */}
      <div className="flex-1 min-h-0 overflow-auto">
        <TurnHistory turns={turns} />
      </div>
    </div>
  );
}

function CurrentTurn({
  darts,
  player,
}: {
  darts: X01DartThrow[];
  player: PlayerColor;
}) {
  if (darts.length === 0) return null;

  const total = darts.reduce((s, d) => s + d.rawScore, 0);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium">Current Turn</span>
        <span className="text-sm font-mono font-bold text-white">-{total}</span>
      </div>
      <div className="flex gap-1.5">
        {darts.map((d, i) => (
          <DartBadge key={i} dart={d} />
        ))}
      </div>
    </div>
  );
}

function TurnHistory({ turns }: { turns: X01Turn[] }) {
  if (turns.length === 0) return null;

  // Show most recent first
  const recent = [...turns].reverse().slice(0, 20);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
      <div className="text-xs text-gray-400 mb-2 font-medium">History</div>
      <div className="space-y-1.5">
        {recent.map((turn, i) => {
          const info = PLAYER_COLORS[turn.player];
          return (
            <div
              key={turns.length - 1 - i}
              className="flex items-center gap-2 text-xs"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${info.bgClass}`} />
              <div className="flex gap-1 flex-1 min-w-0">
                {turn.darts.map((d, j) => (
                  <DartBadge key={j} dart={d} small />
                ))}
              </div>
              <span
                className={`font-mono font-bold flex-shrink-0 ${
                  turn.busted
                    ? "text-red-400"
                    : turn.scoreAfter === 0
                      ? "text-green-400"
                      : "text-gray-400"
                }`}
              >
                {turn.busted ? "BUST" : `-${turn.totalScored}`}
              </span>
              <span className="font-mono text-gray-600 w-8 text-right flex-shrink-0">
                {turn.scoreAfter}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DartBadge({ dart, small }: { dart: X01DartThrow; small?: boolean }) {
  const isMiss = dart.boardNumber === null;
  const prefix =
    dart.multiplier === 3 ? "T" : dart.multiplier === 2 ? "D" : "";

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-bold ${
        small ? "px-1 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${
        isMiss
          ? "bg-gray-800 text-gray-500"
          : `${PLAYER_COLORS[dart.player].bgClass} text-white`
      }`}
    >
      {isMiss ? "Miss" : `${prefix}${dart.boardNumber}`}
    </span>
  );
}
