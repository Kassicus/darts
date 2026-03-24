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
  const claimedColor = claimedBy ? PLAYER_COLORS[claimedBy].hex : null;

  return (
    <g
      onClick={disabled ? undefined : onClick}
      cursor={disabled ? "default" : "pointer"}
      role="button"
      aria-label={`Bullseye 25 points${claimedBy ? `, claimed by ${claimedBy}` : ""}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Outer bull ring */}
      <circle cx={0} cy={0} r={RINGS.outerBull} fill={claimedColor ?? "#2d6a4f"} stroke="#555" strokeWidth="0.5" />
      {/* Inner bull */}
      <circle cx={0} cy={0} r={RINGS.innerBull} fill={claimedColor ?? "#e63946"} stroke="#555" strokeWidth="0.5" />

      {/* Hover highlight */}
      <circle
        cx={0}
        cy={0}
        r={RINGS.outerBull}
        fill="rgba(255,255,255,0)"
        className={disabled ? "" : "hover:fill-white/15"}
        pointerEvents="none"
      />
    </g>
  );
});
