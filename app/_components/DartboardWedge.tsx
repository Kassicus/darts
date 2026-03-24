import React from "react";
import type { PlayerColor } from "../_lib/types";
import { RINGS } from "../_lib/constants";
import { PLAYER_COLORS } from "../_lib/constants";
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

  return (
    <g>
      {/* Visual segments */}
      <path d={doublePath} fill={multiColor} stroke="#555" strokeWidth="0.5" />
      <path d={outerSinglePath} fill={singleColor} stroke="#555" strokeWidth="0.5" />
      <path d={treblePath} fill={multiColor} stroke="#555" strokeWidth="0.5" />
      <path d={innerSinglePath} fill={singleColor} stroke="#555" strokeWidth="0.5" />

      {/* Claimed overlay */}
      {claimedBy && (
        <path
          d={fullWedgePath}
          fill={PLAYER_COLORS[claimedBy].hex}
          opacity={0.45}
          pointerEvents="none"
        />
      )}

      {/* Click target */}
      <path
        d={fullWedgePath}
        fill="transparent"
        cursor={disabled ? "default" : "pointer"}
        onClick={disabled ? undefined : onClick}
        className={disabled ? "" : "hover:opacity-100"}
        style={disabled ? {} : { opacity: 0 }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.fill = "rgba(255,255,255,0.12)";
            e.currentTarget.style.opacity = "1";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.fill = "transparent";
            e.currentTarget.style.opacity = "0";
          }
        }}
        role="button"
        aria-label={`Number ${number}${claimedBy ? `, claimed by ${claimedBy}` : ""}`}
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
