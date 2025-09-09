import type { GameRecord } from "../types";

class BSTNode {
  distance: number;
  record: GameRecord;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  constructor(distance: number, record: GameRecord) {
    this.distance = distance;
    this.record = record;
  }
}

export class ScoreBST {
  root: BSTNode | null = null;
  
  insert(distance: number, record: GameRecord) {
    const node = new BSTNode(distance, record);
    if (!this.root) {
      this.root = node;
      return;
    }
    let cur: BSTNode | null = this.root;
    while (true) {
      if (distance > cur.distance) {
        if (!cur.left) {
          cur.left = node;
          return;
        }
        cur = cur.left;
      } else {
        if (!cur.right) {
          cur.right = node;
          return;
        }
        cur = cur.right;
      }
    }
  }
  
  findMax(): GameRecord | null {
    if (!this.root) return null;
    let current = this.root;
    while (current.left) {
      current = current.left;
    }
    return current.record;
  }
  
  inOrder(): GameRecord[] {
    const out: GameRecord[] = [];
    function trav(n: BSTNode | null) {
      if (!n) return;
      trav(n.left);
      out.push(n.record);
      trav(n.right);
    }
    trav(this.root);
    return out;
  }
  
  clear() {
    this.root = null;
  }
}
