import type { GameRecord } from "../types";

export function binarySearchByDay(records: GameRecord[], day: string): GameRecord[] {
  if (!day || records.length === 0) return [];
  
  const start = day + "T00:00:00.000Z";
  const end = day + "T23:59:59.999Z";
  
  let left = 0;
  let right = records.length - 1;
  let firstIndex = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (records[mid].dateISO < start) {
      left = mid + 1;
    } else if (records[mid].dateISO > end) {
      right = mid - 1;
    } else {
      firstIndex = mid;
      right = mid - 1; 
    }
  }
  
  if (firstIndex === -1) return [];
  
  const result: GameRecord[] = [];
  let i = firstIndex;
  while (i < records.length && records[i].dateISO <= end) {
    if (records[i].dateISO >= start) {
      result.push(records[i]);
    }
    i++;
  }
  
  return result;
}
