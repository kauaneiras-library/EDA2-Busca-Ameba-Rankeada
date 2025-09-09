import type { GameRecord } from "../types";

export function searchByPlayer(records: GameRecord[], playerName: string): GameRecord[] {
  if (!playerName) return [];
  const lowerName = playerName.toLowerCase();
  return records.filter(r => r.playerName.toLowerCase().includes(lowerName));
}
