<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="64" height="64" alt="Strafe" />
	</a>
	<h1>@strafe-js/collection</h1>
	<p>
		<strong>Extended Map&lt;K, V&gt; Data Structure with Array-Like Query Methods</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/collection"><img src="https://img.shields.io/npm/v/@strafe-js/collection.svg?color=509b6b" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/collection` exports `Collection<K, V>`, a zero-dependency subclass of JavaScript's built-in `Map<K, V>` with search, filtering, and projection methods. It backs all entity caches in `@strafe-js/strafebot` (`client.spaces`, `client.rooms`, `client.spaceRooms`, `client.members`).

---

## Installation

```sh
npm install @strafe-js/collection
```

---

## Usage

```ts
import { Collection } from '@strafe-js/collection';

interface CachedRoom {
  id: string;
  name: string;
  topic?: string;
}

const rooms = new Collection<string, CachedRoom>();
rooms.set('101', { id: '101', name: 'general', topic: 'Main chat' });
rooms.set('102', { id: '102', name: 'announcements', topic: 'News' });
rooms.set('103', { id: '103', name: 'off-topic' });

const general = rooms.find((room) => room.name === 'general');
const withTopics = rooms.filter((room) => Boolean(room.topic));
const names = rooms.map((room) => room.name); // ['general', 'announcements', 'off-topic']
const firstRoom = rooms.first();
const topTwo = rooms.first(2);
```

---

## API Reference

In addition to standard `Map<K, V>` methods (`get`, `set`, `has`, `delete`, `clear`, `entries`, `keys`, `values`, `forEach`, `size`), `Collection<K, V>` provides:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `find` | `(fn: (value: V, key: K, col: this) => boolean) => V \| undefined` | Returns the first value where `fn` returns `true` |
| `filter` | `(fn: (value: V, key: K, col: this) => boolean) => Collection<K, V>` | Returns a new `Collection` containing all matching entries |
| `map` | `<T>(fn: (value: V, key: K, col: this) => T) => T[]` | Maps every entry in the collection into an array of `T` |
| `some` | `(fn: (value: V, key: K, col: this) => boolean) => boolean` | Returns `true` if at least one entry satisfies `fn` |
| `every` | `(fn: (value: V, key: K, col: this) => boolean) => boolean` | Returns `true` if all entries satisfy `fn` |
| `first` | `() => V \| undefined` / `(count: number) => V[]` | Returns the first value, or an array of the first `count` values |
| `last` | `() => V \| undefined` / `(count: number) => V[]` | Returns the last value, or an array of the last `count` values |
| `random` | `() => V \| undefined` / `(count: number) => V[]` | Samples random item(s) without replacement |
| `reduce` | `<T>(fn: (acc: T, value: V, key: K, col: this) => T, init: T) => T` | Folds all entries into an accumulated value |
| `partition` | `(fn: (value: V, key: K, col: this) => boolean) => [Collection, Collection]` | Splits entries into `[matching, nonMatching]` collections |
| `sweep` | `(fn: (value: V, key: K, col: this) => boolean) => number` | Removes matching entries in place and returns deleted count |
| `clone` | `() => Collection<K, V>` | Creates a shallow copy of the collection |
| `concat` | `(...cols: Collection<K, V>[]) => Collection<K, V>` | Combines multiple collections into a new instance |
| `tap` | `(fn: (col: this) => void) => this` | Runs a callback on the collection and returns `this` |
| `array` | `() => V[]` | Converts all collection values to an array (`[...this.values()]`) |
| `keyArray` | `() => K[]` | Converts all collection keys to an array (`[...this.keys()]`) |

## License

Apache-2.0
