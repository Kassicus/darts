export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Math.round((cx + radius * Math.cos(angleRad)) * 1000) / 1000,
    y: Math.round((cy + radius * Math.sin(angleRad)) * 1000) / 1000,
  };
}

export function describeAnnularSector(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    `Z`,
  ].join(" ");
}

export function getWedgeAngles(index: number): {
  startAngle: number;
  endAngle: number;
  midAngle: number;
} {
  const startAngle = index * 18 - 9;
  const endAngle = index * 18 + 9;
  const midAngle = index * 18;
  return { startAngle, endAngle, midAngle };
}
