import React from "react";
import type { PlayerColor } from "../_lib/types";
import { RINGS, PLAYER_COLORS } from "../_lib/constants";

interface BullseyeProps {
  claimedBy: PlayerColor | null;
  onClick: () => void;
  disabled: boolean;
}

export const Bullseye = React.memo(function Bullseye({
  claimedBy,
  onClick,
  disabled,
}: BullseyeProps) {
  return (
    <g>
      {/* Outer bull ring */}
      <circle cx={0} cy={0} r={RINGS.outerBull} fill="#2d6a4f" stroke="#555" strokeWidth="0.5" />
      {/* Inner bull */}
      <circle cx={0} cy={0} r={RINGS.innerBull} fill="#e63946" stroke="#555" strokeWidth="0.5" />

      {/* Claimed overlay */}
      {claimedBy && (
        <circle
          cx={0}
          cy={0}
          r={RINGS.outerBull}
          fill={PLAYER_COLORS[claimedBy].hex}
          opacity={0.5}
          pointerEvents="none"
        />
      )}

      {/* Click target */}
      <circle
        cx={0}
        cy={0}
        r={RINGS.outerBull}
        fill="transparent"
        cursor={disabled ? "default" : "pointer"}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.fill = "rgba(255,255,255,0.15)";
        }}
        onMouseLeave={(e) => {
          if (!disabled) e.currentTarget.style.fill = "transparent";
        }}
        role="button"
        aria-label={`Bullseye 25 points${claimedBy ? `, claimed by ${claimedBy}` : ""}`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
      />
    </g>
  );
});
