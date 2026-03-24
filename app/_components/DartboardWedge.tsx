import React from "react";
import type { PlayerColor } from "../_lib/types";
import { RINGS, PLAYER_COLORS } from "../_lib/constants";
import { describeAnnularSector, getWedgeAngles } from "../_lib/dartboard-geometry";

interface DartboardWedgeProps {
  number: number;
  index: number;
  claimedBy: PlayerColor | null;
  onClick: () => void;
  disabled: boolean;
}

export const DartboardWedge = React.memo(function DartboardWedge({
  number,
  index,
  claimedBy,
  onClick,
  disabled,
}: DartboardWedgeProps) {
  const { startAngle, endAngle } = getWedgeAngles(index);
  const isEven = index % 2 === 0;

  const singleColor = isEven ? "#1a1a2e" : "#f5e6ca";
  const multiColor = isEven ? "#e63946" : "#2d6a4f";

  const doublePath = describeAnnularSector(0, 0, RINGS.outerSingle, RINGS.double, startAngle, endAngle);
  const outerSinglePath = describeAnnularSector(0, 0, RINGS.treble, RINGS.outerSingle, startAngle, endAngle);
  const treblePath = describeAnnularSector(0, 0, RINGS.innerSingle, RINGS.treble, startAngle, endAngle);
  const innerSinglePath = describeAnnularSector(0, 0, RINGS.outerBull, RINGS.innerSingle, startAngle, endAngle);
  const fullWedgePath = describeAnnularSector(0, 0, RINGS.outerBull, RINGS.double, startAngle, endAngle);

  const claimedColor = claimedBy ? PLAYER_COLORS[claimedBy].hex : null;

  return (
    <g
      onClick={disabled ? undefined : onClick}
      cursor={disabled ? "default" : "pointer"}
      role="button"
      aria-label={`Number ${number}${claimedBy ? `, claimed by ${claimedBy}` : ""}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Visual segments — solid player color when claimed */}
      <path d={doublePath} fill={claimedColor ?? multiColor} stroke="#555" strokeWidth="0.5" />
      <path d={outerSinglePath} fill={claimedColor ?? singleColor} stroke="#555" strokeWidth="0.5" />
      <path d={treblePath} fill={claimedColor ?? multiColor} stroke="#555" strokeWidth="0.5" />
      <path d={innerSinglePath} fill={claimedColor ?? singleColor} stroke="#555" strokeWidth="0.5" />

      {/* Hover highlight — always present, visible on hover only */}
      <path
        d={fullWedgePath}
        fill="rgba(255,255,255,0)"
        className={disabled ? "" : "hover:fill-white/10"}
        pointerEvents="none"
      />
    </g>
  );
});
