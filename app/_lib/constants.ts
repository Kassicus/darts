import type { PlayerColor } from "./types";

export const ALL_PLAYERS: PlayerColor[] = ["red", "blue", "green", "yellow"];

export const DARTS_PER_TURN = 3;

export const BOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17,
  3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
] as const;

export function getPlayersForCount(count: 2 | 3 | 4): PlayerColor[] {
  return ALL_PLAYERS.slice(0, count);
}

export function generateRotationOrders(players: PlayerColor[], rounds: number): PlayerColor[][] {
  const orders: PlayerColor[][] = [];
  for (let r = 0; r < rounds; r++) {
    const offset = r % players.length;
    orders.push([...players.slice(offset), ...players.slice(0, offset)]);
  }
  return orders;
}

export const PLAYER_COLORS: Record<
  PlayerColor,
  { label: string; hex: string; textClass: string; bgClass: string; ringClass: string }
> = {
  red: {
    label: "Red",
    hex: "#dc2626",
    textClass: "text-red-500",
    bgClass: "bg-red-600",
    ringClass: "ring-red-600",
  },
  blue: {
    label: "Blue",
    hex: "#2563eb",
    textClass: "text-blue-500",
    bgClass: "bg-blue-600",
    ringClass: "ring-blue-600",
  },
  green: {
    label: "Green",
    hex: "#16a34a",
    textClass: "text-green-500",
    bgClass: "bg-green-600",
    ringClass: "ring-green-600",
  },
  yellow: {
    label: "Yellow",
    hex: "#eab308",
    textClass: "text-yellow-400",
    bgClass: "bg-yellow-500",
    ringClass: "ring-yellow-500",
  },
};

export const BOARD_RADIUS = 200;

export const RINGS = {
  innerBull: 7.5,
  outerBull: 19,
  innerSingle: 112,
  treble: 130,
  outerSingle: 184,
  double: 200,
} as const;
