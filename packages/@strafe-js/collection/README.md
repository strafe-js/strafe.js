<div align="center">
	<br />
	<h1>@strafe-js/collection</h1>
	<p>
		<strong>Extended Map&lt;K, V&gt; Data Structure with Functional Array-Like Query Methods</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/collection"><img src="https://img.shields.io/npm/v/@strafe-js/collection.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/collection` exports `Collection<K, V>`, a zero-dependency subclass of JavaScript's built-in `Map<K, V>` enriched with functional search, filtering, and projection methods. It powers all entity caches in `@strafe-js/strafebot` (`client.spaces`, `client.rooms`, `client.spaceRooms`, `client.members`).

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

// Find a single entry matching a predicate
const general = rooms.find((room) => room.name === 'general');

// Filter into a new Collection<K, V>
const withTopics = rooms.filter((room) => Boolean(room.topic));

// Map values into an array
const names = rooms.map((room) => room.name); // ['general', 'announcements', 'off-topic']

// Retrieve first item or first N items
const firstRoom = rooms.first();
const topTwo = rooms.first(2);
```

---

## API Reference

In addition to all standard `Map<K, V>` methods (`get`, `set`, `has`, `delete`, `clear`, `entries`, `keys`, `values`, `forEach`, `size`), `Collection<K, V>` provides:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `find` | `(fn: (value: V, key: K, col: this) => boolean) => V \| undefined` | Returns the first value where `fn` returns `true` |
| `filter` | `(fn: (value: V, key: K, col: this) => boolean) => Collection<K, V>` | Returns a new `Collection` containing all matching entries |
| `map` | `<T>(fn: (value: V, key: K, col: this) => T) => T[]` | Maps every entry in the collection into an array of `T` |
| `some` | `(fn: (value: V, key: K, col: this) => boolean) => boolean` | Returns `true` if at least one entry satisfies `fn` |
| `every` | `(fn: (value: V, key: K, col: this) => boolean) => boolean` | Returns `true` if all entries satisfy `fn` |
| `first` | `() => V \| undefined` / `(count: number) => V[]` | Returns the first value, or an array of the first `count` values |
| `array` | `() => V[]` | Converts all collection values to an array (`[...this.values()]`) |
| `keyArray` | `() => K[]` | Converts all collection keys to an array (`[...this.keys()]`) |

## License

Apache-2.0
