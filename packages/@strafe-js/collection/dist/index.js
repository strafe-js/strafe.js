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
}
exports.Collection = Collection;
//# sourceMappingURL=index.js.map