"use client";

import type { PlayerColor, BoardNumber } from "../_lib/types";
import { BOARD_NUMBERS, RINGS } from "../_lib/constants";
import { polarToCartesian, getWedgeAngles } from "../_lib/dartboard-geometry";
import { DartboardWedge } from "./DartboardWedge";
import { Bullseye } from "./Bullseye";

interface DartboardProps {
  claimedNumbers: Record<number, PlayerColor>;
  onHit: (boardNumber: BoardNumber) => void;
  disabled: boolean;
}

export function Dartboard({ claimedNumbers, onHit, disabled }: DartboardProps) {
  return (
    <svg
      viewBox="-230 -230 460 460"
      className="w-full h-full"
      style={{ touchAction: "manipulation" }}
    >
      {/* Board background */}
      <circle cx={0} cy={0} r={210} fill="#111" />

      {/* Wedges */}
      {BOARD_NUMBERS.map((num, i) => (
        <DartboardWedge
          key={num}
          number={num}
          index={i}
          claimedBy={claimedNumbers[num] ?? null}
          onClick={() => onHit(num as BoardNumber)}
          disabled={disabled}
        />
      ))}

      {/* Bullseye */}
      <Bullseye
        claimedBy={claimedNumbers[25] ?? null}
        onClick={() => onHit(25)}
        disabled={disabled}
      />

      {/* Number labels */}
      {BOARD_NUMBERS.map((num, i) => {
        const { midAngle } = getWedgeAngles(i);
        const pos = polarToCartesian(0, 0, RINGS.double + 15, midAngle);
        return (
          <text
            key={`label-${num}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            pointerEvents="none"
          >
            {num}
          </text>
        );
      })}
    </svg>
  );
}
