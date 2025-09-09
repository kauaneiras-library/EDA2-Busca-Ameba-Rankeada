export class HashTable {
  private map: Map<string, string> = new Map();
  set(id: string, name: string) {
    this.map.set(id, name);
  }
  get(id: string) {
    return this.map.get(id) ?? null;
  }
  getAllNames(): string[] {
    return Array.from(this.map.values());
  }
  toObject() {
    return Object.fromEntries(this.map.entries());
  }
  load(obj: Record<string, string>) {
    this.map = new Map(Object.entries(obj));
  }
}
