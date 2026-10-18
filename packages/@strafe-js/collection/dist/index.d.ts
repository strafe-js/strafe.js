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
export declare class Collection<K, V> extends Map<K, V> {
    /**
     * Returns the first value in insertion order that satisfies `fn`, or `undefined` if no entry matches.
     *
     * @example
     * ```ts
     * const room = client.rooms.find((r) => r.name === 'general');
     * ```
     */
    find(fn: (value: V, key: K, col: this) => boolean): V | undefined;
    /**
     * Returns a new `Collection<K, V>` containing only entries for which `fn` returns `true`.
     *
     * @example
     * ```ts
     * const textRooms = client.rooms.filter((r) => r.type === 3);
     * ```
     */
    filter(fn: (value: V, key: K, col: this) => boolean): Collection<K, V>;
    /**
     * Projects each entry in insertion order through `fn` into a new array.
     *
     * @example
     * ```ts
     * const spaceNames = client.spaces.map((s) => s.name);
     * ```
     */
    map<T>(fn: (value: V, key: K, col: this) => T): T[];
    /**
     * Short-circuits and returns `true` on the first entry that satisfies `fn`, or `false` if none match.
     *
     * @example
     * ```ts
     * const hasVoiceRoom = client.rooms.some((r) => r.type === 4);
     * ```
     */
    some(fn: (value: V, key: K, col: this) => boolean): boolean;
    /**
     * Short-circuits and returns `false` on the first entry that fails `fn`, or `true` if all entries pass.
     *
     * @example
     * ```ts
     * const allHaveNames = client.rooms.every((r) => Boolean(r.name));
     * ```
     */
    every(fn: (value: V, key: K, col: this) => boolean): boolean;
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
    /**
     * Copies all values in insertion order into a plain array (`[...this.values()]`).
     *
     * @example
     * ```ts
     * const allRooms = client.rooms.array();
     * ```
     */
    array(): V[];
    /**
     * Copies all keys in insertion order into a plain array (`[...this.keys()]`).
     *
     * @example
     * ```ts
     * const roomIds = client.rooms.keyArray();
     * ```
     */
    keyArray(): K[];
    /**
     * Returns the last value in insertion order, or `undefined` if the collection is empty.
     *
     * @example
     * ```ts
     * const newestRoom = client.rooms.last();
     * ```
     */
    last(): V | undefined;
    /**
     * Returns up to `count` values from the end of the collection in insertion order.
     *
     * @example
     * ```ts
     * const lastTwoSpaces = client.spaces.last(2);
     * ```
     */
    last(count: number): V[];
    /**
     * Returns a single uniformly sampled value from the collection, or `undefined` if empty.
     *
     * @example
     * ```ts
     * const randomMember = members.random();
     * ```
     */
    random(): V | undefined;
    /**
     * Returns up to `count` unique uniformly sampled values from the collection without replacement.
     *
     * @example
     * ```ts
     * const winners = members.random(3);
     * ```
     */
    random(count: number): V[];
    /**
     * Folds all entries in insertion order into a single accumulated value starting from `initialValue`.
     *
     * @example
     * ```ts
     * const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
     * ```
     */
    reduce<T>(fn: (accumulator: T, value: V, key: K, col: this) => T, initialValue: T): T;
    /**
     * Splits the collection into a two-tuple `[matching, nonMatching]` based on predicate `fn`.
     *
     * @example
     * ```ts
     * const [bots, humans] = members.partition((m) => Boolean(m.bot));
     * ```
     */
    partition(fn: (value: V, key: K, col: this) => boolean): [Collection<K, V>, Collection<K, V>];
    /**
     * Removes all entries for which `fn` returns `true` in place and returns the number of deleted entries.
     *
     * @example
     * ```ts
     * const evicted = cache.sweep((entry) => entry.expiresAt < Date.now());
     * ```
     */
    sweep(fn: (value: V, key: K, col: this) => boolean): number;
    /**
     * Creates a shallow copy of this collection with identical key-value pairs.
     *
     * @example
     * ```ts
     * const snapshot = client.rooms.clone();
     * ```
     */
    clone(): Collection<K, V>;
    /**
     * Combines this collection with one or more additional collections into a new `Collection` instance without mutating the originals.
     *
     * @example
     * ```ts
     * const combined = spaceARooms.concat(spaceBRooms);
     * ```
     */
    concat(...collections: Collection<K, V>[]): Collection<K, V>;
    /**
     * Invokes `fn(this)` for side effects and returns `this` to allow method chaining.
     *
     * @example
     * ```ts
     * const admins = members.filter((m) => m.role_ids.length > 0).tap((col) => console.log(col.size));
     * ```
     */
    tap(fn: (col: this) => void): this;
}
//# sourceMappingURL=index.d.ts.map