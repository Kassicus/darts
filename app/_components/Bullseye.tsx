import React from "react";
import type { ClaimInfo, Multiplier } from "../_lib/types";
import { RINGS, PLAYER_COLORS } from "../_lib/constants";

const OUTER_BULL_COLOR = "#ca8a04"; // gold
const INNER_BULL_COLOR = "#0f172a"; // navy
const WIRE = "#444";

interface BullseyeProps {
  claimInfo: ClaimInfo | null;
  onHit: (multiplier: Multiplier) => void;
  disabled: boolean;
  advancedMode: boolean;
}

export const Bullseye = React.memo(function Bullseye({
  claimInfo,
  onHit,
  disabled,
  advancedMode,
}: BullseyeProps) {
  const claimedColor = claimInfo ? PLAYER_COLORS[claimInfo.player].hex : null;

  if (advancedMode) {
    const mult = claimInfo?.multiplier ?? 0;
    const outerFill = mult >= 1 ? claimedColor! : OUTER_BULL_COLOR;
    const innerFill = mult >= 2 ? claimedColor! : INNER_BULL_COLOR;
    const innerWire = mult >= 2 && mult >= 1 ? "none" : WIRE;

    return (
      <g>
        <circle cx={0} cy={0} r={RINGS.outerBull} fill={outerFill} stroke={WIRE} strokeWidth="0.5" />
        <circle cx={0} cy={0} r={RINGS.innerBull} fill={innerFill} stroke={innerWire} strokeWidth="0.5" />

        {/* Outer bull = single 25 */}
        <circle
          cx={0} cy={0} r={RINGS.outerBull}
          fill="transparent"
          cursor={disabled ? "default" : "pointer"}
          onClick={disabled ? undefined : () => onHit(1)}
          className={disabled ? "" : "hover:fill-white/15"}
          role="button" aria-label="Single Bull 25"
        />
        {/* Inner bull = double 25 (50 pts) */}
        <circle
          cx={0} cy={0} r={RINGS.innerBull}
          fill="transparent"
          cursor={disabled ? "default" : "pointer"}
          onClick={disabled ? undefined : (e) => { e.stopPropagation(); onHit(2); }}
          className={disabled ? "" : "hover:fill-white/20"}
          role="button" aria-label="Double Bull 50"
        />
      </g>
    );
  }

  // Basic mode
  return (
    <g
      onClick={disabled ? undefined : () => onHit(1)}
      cursor={disabled ? "default" : "pointer"}
      role="button"
      aria-label={`Bullseye 25 points${claimInfo ? `, claimed by ${claimInfo.player}` : ""}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onHit(1);
        }
      }}
    >
      <circle cx={0} cy={0} r={RINGS.outerBull} fill={claimedColor ?? OUTER_BULL_COLOR} stroke={claimedColor ? "none" : WIRE} strokeWidth="0.5" />
      <circle cx={0} cy={0} r={RINGS.innerBull} fill={claimedColor ?? INNER_BULL_COLOR} stroke={claimedColor ? "none" : WIRE} strokeWidth="0.5" />
      <circle
        cx={0} cy={0} r={RINGS.outerBull}
        fill="rgba(255,255,255,0)"
        className={disabled ? "" : "hover:fill-white/15"}
        pointerEvents="none"
      />
    </g>
  );
});
