"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
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
class Collection extends Map {
    /**
     * Returns the first value in insertion order that satisfies `fn`, or `undefined` if no entry matches.
     *
     * @example
     * ```ts
     * const room = client.rooms.find((r) => r.name === 'general');
     * ```
     */
    find(fn) {
        for (const [key, value] of this) {
            if (fn(value, key, this))
                return value;
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
    filter(fn) {
        const out = new Collection();
        for (const [key, value] of this) {
            if (fn(value, key, this))
                out.set(key, value);
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
    map(fn) {
        const out = [];
        for (const [key, value] of this)
            out.push(fn(value, key, this));
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
    some(fn) {
        for (const [key, value] of this) {
            if (fn(value, key, this))
                return true;
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
    every(fn) {
        for (const [key, value] of this) {
            if (!fn(value, key, this))
                return false;
        }
        return true;
    }
    first(count = 1) {
        if (count === 1)
            return this.values().next().value;
        const out = [];
        for (const value of this.values()) {
            out.push(value);
            if (out.length >= count)
                break;
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
    array() {
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
    keyArray() {
        return [...this.keys()];
    }
    last(count = 1) {
        const arr = this.array();
        if (count === 1)
            return arr[arr.length - 1];
        if (count <= 0)
            return [];
        return arr.slice(-count);
    }
    random(count) {
        const arr = this.array();
        if (count === undefined) {
            if (arr.length === 0)
                return undefined;
            return arr[Math.floor(Math.random() * arr.length)];
        }
        if (count <= 0 || arr.length === 0)
            return [];
        const pool = arr.slice();
        const limit = Math.min(count, pool.length);
        const result = [];
        for (let i = 0; i < limit; i++) {
            const randIndex = i + Math.floor(Math.random() * (pool.length - i));
            const picked = pool[randIndex];
            pool[randIndex] = pool[i];
            pool[i] = picked;
            result.push(picked);
        }
        return result;
    }
    /**
     * Folds all entries in insertion order into a single accumulated value starting from `initialValue`.
     *
     * @example
     * ```ts
     * const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
     * ```
     */
    reduce(fn, initialValue) {
        let acc = initialValue;
        for (const [key, value] of this) {
            acc = fn(acc, value, key, this);
        }
        return acc;
    }
    /**
     * Splits the collection into a two-tuple `[matching, nonMatching]` based on predicate `fn`.
     *
     * @example
     * ```ts
     * const [bots, humans] = members.partition((m) => Boolean(m.bot));
     * ```
     */
    partition(fn) {
        const pass = new Collection();
        const fail = new Collection();
        for (const [key, value] of this) {
            if (fn(value, key, this)) {
                pass.set(key, value);
            }
            else {
                fail.set(key, value);
            }
        }
        return [pass, fail];
    }
    /**
     * Removes all entries for which `fn` returns `true` in place and returns the number of deleted entries.
     *
     * @example
     * ```ts
     * const evicted = cache.sweep((entry) => entry.expiresAt < Date.now());
     * ```
     */
    sweep(fn) {
        const previousSize = this.size;
        for (const [key, value] of this) {
            if (fn(value, key, this)) {
                this.delete(key);
            }
        }
        return previousSize - this.size;
    }
    /**
     * Creates a shallow copy of this collection with identical key-value pairs.
     *
     * @example
     * ```ts
     * const snapshot = client.rooms.clone();
     * ```
     */
    clone() {
        return new Collection(this);
    }
    /**
     * Combines this collection with one or more additional collections into a new `Collection` instance without mutating the originals.
     *
     * @example
     * ```ts
     * const combined = spaceARooms.concat(spaceBRooms);
     * ```
     */
    concat(...collections) {
        const out = this.clone();
        for (const col of collections) {
            for (const [key, value] of col) {
                out.set(key, value);
            }
        }
        return out;
    }
    /**
     * Invokes `fn(this)` for side effects and returns `this` to allow method chaining.
     *
     * @example
     * ```ts
     * const admins = members.filter((m) => m.role_ids.length > 0).tap((col) => console.log(col.size));
     * ```
     */
    tap(fn) {
        fn(this);
        return this;
    }
}
exports.Collection = Collection;
//# sourceMappingURL=index.js.map