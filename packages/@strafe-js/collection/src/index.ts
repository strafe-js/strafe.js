/**
 * Extended `Map<K, V>` subclass with functional search, filtering, and transformation methods.
 * All entity caches on `Client` (`client.spaces`, `client.rooms`, `client.spaceRooms`, `client.members`)
 * are instances of `Collection`.
 *
 * @typeParam K - Type of keys stored in the collection.
 * @typeParam V - Type of values stored in the collection.
 * @example
 * ```ts
 * import { Collection } from '@strafe-js/collection';
 *
 * const rooms = new Collection<string, { id: string; name: string; type: number }>();
 * rooms.set('1', { id: '1', name: 'general', type: 3 });
 *
 * const general = rooms.find((r) => r.name === 'general');
 * const textRooms = rooms.filter((r) => r.type === 3);
 * const names = rooms.map((r) => r.name);
 * ```
 */
export class Collection<K, V> extends Map<K, V> {
  /**
   * Returns the first value in the collection that satisfies the testing predicate,
   * or `undefined` if no entry matches.
   *
   * @param fn - Predicate function invoked for each `(value, key, collection)` entry.
   * @returns The first matching value, or `undefined`.
   * @example
   * ```ts
   * const room = client.rooms.find((r) => r.name === 'general');
   * ```
   */
  find(fn: (value: V, key: K, col: this) => boolean): V | undefined {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return value;
    }
    return undefined;
  }

  /**
   * Returns a new `Collection<K, V>` containing all key-value pairs for which the predicate returns `true`.
   *
   * @param fn - Filter predicate function invoked for each `(value, key, collection)` entry.
   * @returns A new `Collection` containing only matching entries.
   * @example
   * ```ts
   * const textRooms = client.rooms.filter((r) => r.type === 3);
   * ```
   */
  filter(fn: (value: V, key: K, col: this) => boolean): Collection<K, V> {
    const out = new Collection<K, V>();
    for (const [key, value] of this) {
      if (fn(value, key, this)) out.set(key, value);
    }
    return out;
  }

  /**
   * Maps each entry in the collection to a new value and returns the resulting array.
   *
   * @param fn - Mapping function invoked for each `(value, key, collection)` entry.
   * @returns Array of mapped results.
   * @example
   * ```ts
   * const spaceNames = client.spaces.map((s) => s.name);
   * ```
   */
  map<T>(fn: (value: V, key: K, col: this) => T): T[] {
    const out: T[] = [];
    for (const [key, value] of this) out.push(fn(value, key, this));
    return out;
  }

  /**
   * Tests whether at least one entry in the collection passes the predicate.
   *
   * @param fn - Predicate function invoked for each `(value, key, collection)` entry.
   * @returns `true` if any entry matches, otherwise `false`.
   * @example
   * ```ts
   * const hasVoiceRoom = client.rooms.some((r) => r.type === 4);
   * ```
   */
  some(fn: (value: V, key: K, col: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return true;
    }
    return false;
  }

  /**
   * Tests whether all entries in the collection pass the predicate.
   *
   * @param fn - Predicate function invoked for each `(value, key, collection)` entry.
   * @returns `true` if every entry matches, otherwise `false`.
   * @example
   * ```ts
   * const allHaveNames = client.rooms.every((r) => Boolean(r.name));
   * ```
   */
  every(fn: (value: V, key: K, col: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (!fn(value, key, this)) return false;
    }
    return true;
  }

  /**
   * Returns the first value in insertion order, or `undefined` if the collection is empty.
   *
   * @example
   * ```ts
   * const firstSpace = client.spaces.first();
   * ```
   */
  first(): V | undefined;
  /**
   * Returns an array of the first `count` values in insertion order.
   *
   * @param count - Number of values to return.
   * @example
   * ```ts
   * const firstThreeSpaces = client.spaces.first(3);
   * ```
   */
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

  /**
   * Spreads all values in the collection into a standard JavaScript array (`V[]`).
   *
   * @example
   * ```ts
   * const allRooms = client.rooms.array();
   * ```
   */
  array(): V[] {
    return [...this.values()];
  }

  /**
   * Spreads all keys in the collection into a standard JavaScript array (`K[]`).
   *
   * @example
   * ```ts
   * const roomIds = client.rooms.keyArray();
   * ```
   */
  keyArray(): K[] {
    return [...this.keys()];
  }
}
