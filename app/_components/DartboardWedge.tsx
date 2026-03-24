import React from "react";
import type { ClaimInfo, Multiplier } from "../_lib/types";
import { RINGS, PLAYER_COLORS } from "../_lib/constants";
import { describeAnnularSector, getWedgeAngles } from "../_lib/dartboard-geometry";

interface DartboardWedgeProps {
  number: number;
  index: number;
  claimInfo: ClaimInfo | null;
  onHit: (multiplier: Multiplier) => void;
  disabled: boolean;
  advancedMode: boolean;
}

const WIRE = "#444";

export const DartboardWedge = React.memo(function DartboardWedge({
  number,
  index,
  claimInfo,
  onHit,
  disabled,
  advancedMode,
}: DartboardWedgeProps) {
  const { startAngle, endAngle } = getWedgeAngles(index);
  const isEven = index % 2 === 0;

  // Modern color scheme:
  // Even: navy singles, gold double/triple
  // Odd:  white singles, silver double/triple
  const singleColor = isEven ? "#0f172a" : "#e8e8e8";
  const doubleColor = isEven ? "#ca8a04" : "#9ca3af";
  const trebleColor = isEven ? "#ca8a04" : "#9ca3af";

  const doublePath = describeAnnularSector(0, 0, RINGS.outerSingle, RINGS.double, startAngle, endAngle);
  const outerSinglePath = describeAnnularSector(0, 0, RINGS.treble, RINGS.outerSingle, startAngle, endAngle);
  const treblePath = describeAnnularSector(0, 0, RINGS.innerSingle, RINGS.treble, startAngle, endAngle);
  const innerSinglePath = describeAnnularSector(0, 0, RINGS.outerBull, RINGS.innerSingle, startAngle, endAngle);
  const fullWedgePath = describeAnnularSector(0, 0, RINGS.outerBull, RINGS.double, startAngle, endAngle);

  const claimedColor = claimInfo ? PLAYER_COLORS[claimInfo.player].hex : null;

  if (advancedMode) {
    const mult = claimInfo?.multiplier ?? 0;

    // Determine fill and stroke per ring segment
    // Claimed rings get player color fill and no internal wire between claimed sections
    const singleClaimed = mult >= 1;
    const doubleClaimed = mult >= 2;
    const trebleClaimed = mult >= 3;

    // Wire between two adjacent rings is hidden if both are claimed by same player
    const wireDoubleSingle = doubleClaimed && singleClaimed ? "none" : WIRE;
    const wireSingleTreble = singleClaimed && trebleClaimed ? "none" : WIRE;

    return (
      <g>
        {/* Render base + claimed fill per ring */}
        <path
          d={doublePath}
          fill={doubleClaimed ? claimedColor! : doubleColor}
          stroke={WIRE} strokeWidth="0.5"
        />
        <path
          d={outerSinglePath}
          fill={singleClaimed ? claimedColor! : singleColor}
          stroke={wireDoubleSingle} strokeWidth="0.5"
        />
        <path
          d={treblePath}
          fill={trebleClaimed ? claimedColor! : trebleColor}
          stroke={wireSingleTreble} strokeWidth="0.5"
        />
        <path
          d={innerSinglePath}
          fill={singleClaimed ? claimedColor! : singleColor}
          stroke={WIRE} strokeWidth="0.5"
        />

        {/* Click targets */}
        <path
          d={doublePath} fill="transparent"
          cursor={disabled ? "default" : "pointer"}
          onClick={disabled ? undefined : () => onHit(2)}
          className={disabled ? "" : "hover:fill-white/15"}
          role="button" aria-label={`Double ${number}`}
        />
        <path
          d={outerSinglePath} fill="transparent"
          cursor={disabled ? "default" : "pointer"}
          onClick={disabled ? undefined : () => onHit(1)}
          className={disabled ? "" : "hover:fill-white/15"}
          role="button" aria-label={`Single ${number}`}
        />
        <path
          d={treblePath} fill="transparent"
          cursor={disabled ? "default" : "pointer"}
          onClick={disabled ? undefined : () => onHit(3)}
          className={disabled ? "" : "hover:fill-white/15"}
          role="button" aria-label={`Triple ${number}`}
        />
        <path
          d={innerSinglePath} fill="transparent"
          cursor={disabled ? "default" : "pointer"}
          onClick={disabled ? undefined : () => onHit(1)}
          className={disabled ? "" : "hover:fill-white/15"}
          role="button" aria-label={`Single ${number}`}
        />
      </g>
    );
  }

  // Basic mode: whole wedge is one click target
  const isClaimed = !!claimedColor;

  return (
    <g
      onClick={disabled ? undefined : () => onHit(1)}
      cursor={disabled ? "default" : "pointer"}
      role="button"
      aria-label={`Number ${number}${claimInfo ? `, claimed by ${claimInfo.player}` : ""}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onHit(1);
        }
      }}
    >
      <path d={doublePath} fill={isClaimed ? claimedColor : doubleColor} stroke={isClaimed ? "none" : WIRE} strokeWidth="0.5" />
      <path d={outerSinglePath} fill={isClaimed ? claimedColor : singleColor} stroke={isClaimed ? "none" : WIRE} strokeWidth="0.5" />
      <path d={treblePath} fill={isClaimed ? claimedColor : trebleColor} stroke={isClaimed ? "none" : WIRE} strokeWidth="0.5" />
      <path d={innerSinglePath} fill={isClaimed ? claimedColor : singleColor} stroke={isClaimed ? "none" : WIRE} strokeWidth="0.5" />

      <path
        d={fullWedgePath}
        fill="rgba(255,255,255,0)"
        className={disabled ? "" : "hover:fill-white/10"}
        pointerEvents="none"
      />
    </g>
  );
});
