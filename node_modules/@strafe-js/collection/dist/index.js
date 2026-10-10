"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
class Collection extends Map {
    find(fn) {
        for (const [key, value] of this) {
            if (fn(value, key, this))
                return value;
        }
        return undefined;
    }
    filter(fn) {
        const out = new Collection();
        for (const [key, value] of this) {
            if (fn(value, key, this))
                out.set(key, value);
        }
        return out;
    }
    map(fn) {
        const out = [];
        for (const [key, value] of this)
            out.push(fn(value, key, this));
        return out;
    }
    some(fn) {
        for (const [key, value] of this) {
            if (fn(value, key, this))
                return true;
        }
        return false;
    }
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
    array() {
        return [...this.values()];
    }
    keyArray() {
        return [...this.keys()];
    }
}
exports.Collection = Collection;
//# sourceMappingURL=index.js.map