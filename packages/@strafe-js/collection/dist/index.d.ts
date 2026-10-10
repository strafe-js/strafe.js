export declare class Collection<K, V> extends Map<K, V> {
    find(fn: (value: V, key: K, col: this) => boolean): V | undefined;
    filter(fn: (value: V, key: K, col: this) => boolean): Collection<K, V>;
    map<T>(fn: (value: V, key: K, col: this) => T): T[];
    some(fn: (value: V, key: K, col: this) => boolean): boolean;
    every(fn: (value: V, key: K, col: this) => boolean): boolean;
    first(): V | undefined;
    first(count: number): V[];
    array(): V[];
    keyArray(): K[];
}
//# sourceMappingURL=index.d.ts.map