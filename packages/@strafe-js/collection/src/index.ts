/**
 * Extended `Map<K, V>` subclass with functional search, filtering, and transformation methods.
 * All entity caches on `Client` (`client.spaces`, `client.rooms`, `client.spaceRooms`, `client.members`)
 * are instances of `Collection`.
 */
export class Collection<K, V> extends Map<K, V> {
  /** Returns the value for `key`, creating it via `defaultValueGenerator` when missing. */
  ensure(key: K, defaultValueGenerator: (key: K, col: this) => V): V {
    if (this.has(key)) return this.get(key)!;
    const value = defaultValueGenerator(key, this);
    this.set(key, value);
    return value;
  }

  /** True when every key in `keys` exists. */
  hasAll(...keys: K[]): boolean {
    return keys.every((k) => this.has(k));
  }

  /** True when at least one key in `keys` exists. */
  hasAny(...keys: K[]): boolean {
    return keys.some((k) => this.has(k));
  }

  /** Returns the value at `index` (supports negative indices from the end). */
  at(index: number): V | undefined {
    const size = this.size;
    if (size === 0) return undefined;
    let i = index < 0 ? size + index : index;
    if (i < 0 || i >= size) return undefined;
    let n = 0;
    for (const value of this.values()) {
      if (n === i) return value;
      n++;
    }
    return undefined;
  }

  firstKey(): K | undefined;
  firstKey(count: number): K[];
  firstKey(count = 1): K | K[] | undefined {
    if (count === 1) return this.keys().next().value;
    const out: K[] = [];
    for (const key of this.keys()) {
      out.push(key);
      if (out.length >= count) break;
    }
    return out;
  }

  lastKey(): K | undefined;
  lastKey(count: number): K[];
  lastKey(count = 1): K | K[] | undefined {
    const arr = [...this.keys()];
    if (count === 1) return arr[arr.length - 1];
    return arr.slice(-count);
  }

  /** Returns the first value that satisfies `fn`, or `undefined`. */
  find(fn: (value: V, key: K, col: this) => boolean): V | undefined {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return value;
    }
    return undefined;
  }

  /** New collection of entries for which `fn` is true. */
  filter(fn: (value: V, key: K, col: this) => boolean): Collection<K, V> {
    const out = new Collection<K, V>();
    for (const [key, value] of this) {
      if (fn(value, key, this)) out.set(key, value);
    }
    return out;
  }

  /** Map values through `fn` into an array. */
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

  last(): V | undefined;
  last(count: number): V[];
  last(count = 1): V | V[] | undefined {
    const arr = this.array();
    if (count === 1) return arr[arr.length - 1];
    if (count <= 0) return [];
    return arr.slice(-count);
  }

  random(): V | undefined;
  random(count: number): V[];
  random(count?: number): V | V[] | undefined {
    const arr = this.array();
    if (count === undefined) {
      if (arr.length === 0) return undefined;
      return arr[Math.floor(Math.random() * arr.length)];
    }
    if (count <= 0 || arr.length === 0) return [];
    const pool = arr.slice();
    const limit = Math.min(count, pool.length);
    const result: V[] = [];
    for (let i = 0; i < limit; i++) {
      const randIndex = i + Math.floor(Math.random() * (pool.length - i));
      const picked = pool[randIndex]!;
      pool[randIndex] = pool[i]!;
      pool[i] = picked;
      result.push(picked);
    }
    return result;
  }

  reduce<T>(fn: (accumulator: T, value: V, key: K, col: this) => T, initialValue: T): T {
    let acc = initialValue;
    for (const [key, value] of this) {
      acc = fn(acc, value, key, this);
    }
    return acc;
  }

  partition(
    fn: (value: V, key: K, col: this) => boolean,
  ): [Collection<K, V>, Collection<K, V>] {
    const pass = new Collection<K, V>();
    const fail = new Collection<K, V>();
    for (const [key, value] of this) {
      if (fn(value, key, this)) pass.set(key, value);
      else fail.set(key, value);
    }
    return [pass, fail];
  }

  sweep(fn: (value: V, key: K, col: this) => boolean): number {
    const previousSize = this.size;
    for (const [key, value] of this) {
      if (fn(value, key, this)) this.delete(key);
    }
    return previousSize - this.size;
  }

  clone(): Collection<K, V> {
    return new Collection<K, V>(this);
  }

  concat(...collections: Collection<K, V>[]): Collection<K, V> {
    const out = this.clone();
    for (const col of collections) {
      for (const [key, value] of col) out.set(key, value);
    }
    return out;
  }

  tap(fn: (col: this) => void): this {
    fn(this);
    return this;
  }
}
