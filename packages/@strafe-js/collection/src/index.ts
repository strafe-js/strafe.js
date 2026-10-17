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
   * Returns the first value in insertion order that satisfies `fn`, or `undefined` if no entry matches.
   *
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
   * Returns a new `Collection<K, V>` containing only entries for which `fn` returns `true`.
   *
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
   * Projects each entry in insertion order through `fn` into a new array.
   *
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
   * Short-circuits and returns `true` on the first entry that satisfies `fn`, or `false` if none match.
   *
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
   * Short-circuits and returns `false` on the first entry that fails `fn`, or `true` if all entries pass.
   *
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
   * Returns up to `count` values from the start of the collection in insertion order.
   *
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
   * Copies all values in insertion order into a plain array (`[...this.values()]`).
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
   * Copies all keys in insertion order into a plain array (`[...this.keys()]`).
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
