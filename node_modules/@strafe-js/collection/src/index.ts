export class Collection<K, V> extends Map<K, V> {
  find(fn: (value: V, key: K, col: this) => boolean): V | undefined {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return value;
    }
    return undefined;
  }

  filter(fn: (value: V, key: K, col: this) => boolean): Collection<K, V> {
    const out = new Collection<K, V>();
    for (const [key, value] of this) {
      if (fn(value, key, this)) out.set(key, value);
    }
    return out;
  }

  map<T>(fn: (value: V, key: K, col: this) => T): T[] {
    const out: T[] = [];
    for (const [key, value] of this) out.push(fn(value, key, this));
    return out;
  }

  some(fn: (value: V, key: K, col: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return true;
    }
    return false;
  }

  every(fn: (value: V, key: K, col: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (!fn(value, key, this)) return false;
    }
    return true;
  }

  first(): V | undefined;
  first(count: number): V[];
  first(count = 1): V | V[] | undefined {
    if (count === 1) return this.values().next().value;
    const out: V[] = [];
    for (const value of this.values()) {
      out.push(value);
      if (out.length >= count) break;
    }
    return out;
  }

  array(): V[] {
    return [...this.values()];
  }

  keyArray(): K[] {
    return [...this.keys()];
  }
}
