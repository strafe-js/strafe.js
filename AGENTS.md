# AGENTS.md - Strafe.js Repository Guidelines

This document defines the mandatory engineering, documentation, commit, release, and Anti-Slop standards for all AI coding agents and contributors working in the `strafe-js/strafe.js` monorepo.

---

## 1. Anti-Slop Enforcement (`miqdadbadjuber/anti-slop`)

All code, comments, JSDoc/TSDoc blocks, commit messages, changelogs, and documentation in this repository must comply with [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop).

### Default Mode
- **Default session mode**: `during` (apply Anti-Slop rules while generating every file edit and text response).
- Announce `antislop active: during.` before making the first file edit in a session.

### Hard Writing & Documentation Rules (`antislop.md` + `antislop-copywriting`)
1. **No Em Dashes or En Dashes (`R-02`)**: Never use the em dash (`U+2014`) or en dash (`U+2013`) in code comments, JSDoc, Markdown docs, UI strings, or commit messages. Use a period, comma, colon, parentheses, or ASCII hyphen (`-`) instead.
2. **No Banned AI Vocabulary (`R-16`)**: Never use filler buzzwords such as `delve`, `tapestry`, `vibrant`, `crucial`, `comprehensive`, `meticulous`, `seamless`, `robust`, `leverage`, `empower`, `cutting-edge`, `next-gen`, `game-changer`, `elevate`, `streamline`, or `foster`.
3. **No Negative Parallelism (`R-03`)**: Do not write constructions like `It is not X, it is Y` or `Not only X, but also Y`. State what the code or feature does directly.
4. **No Filler Transitions or Throat-Clearing (`R-05`, `R-11`)**: Start descriptions with the subject, HTTP route, opcode, or return behavior. Never open with `In order to`, `It is important to note that`, or `Let's explore`.
5. **Specificity Over Vague Claims (`R-08`)**: Replace vague adjectives with exact invariants (for example: `Retries HTTP 429 responses up to 3 times using retry_after` instead of `Handles rate limits gracefully`).

### Code Comment & JSDoc Rules (`antislop-code`)
Every comment in TypeScript or JavaScript source files must pass all 8 checks below:
1. **No Restating the Code**: Never write inline comments (`// Increment counter`, `// Return user`) or `@param` / `@returns` tags that only repeat the parameter name and TypeScript type signature.
2. **No Narrative Comment Trails**: Do not scatter `// Step 1:`, `// First, validate`, `// Then, send request` inside function bodies. If the control flow needs explanation, put the algorithm invariant in the function's TSDoc summary.
3. **No ASCII Section Divider Banners**: Never use `// ========` or `// --------` banners.
4. **No Commented-Out Dead Code**: Delete unused code instead of commenting it out. Git history preserves old implementations.
5. **No Unowned Speculative Markers**: Do not leave `TODO`, `FIXME`, or `HACK` comments without a linked issue or concrete blocker.
6. **No Apologetic Comments**: Never write `// Quick hack`, `// Not ideal`, or `// Temporary workaround`.
7. **No Inline Changelog / Attribution Comments**: Never write `// Added in v1.2.0` or `// Fixed by agent`. Belongs in git commit history and `CHANGELOG.md`.
8. **Comment Only the "Why" and Protocol Contracts**: Write comments only when documenting Strafe API routes (`POST /rooms/:roomId/messages`), Gateway opcodes (`op: 0..8`), Equinox permission cascade rules, bitmask math, side effects, thrown error types (`@throws`), or copy-pasteable `@example` blocks for IDE hover tooltips.

---

## 2. Commit Message & Pull Request Naming Conventions

All commits and Pull Request titles must follow **Conventional Commits** in English (or Polish when explicitly requested by the user for a specific commit).

### Format
```text
<type>(<scope>): <imperative summary>
```

### Rules
- **`<type>`** must be one of:
  - `feat`: New API method, Gateway event, command feature, or builder
  - `fix`: Bug fix in runtime behavior, type inference, or protocol handling
  - `docs`: JSDoc/TSDoc updates, `README.md`, or `docs/` site content
  - `refactor`: Internal code restructuring with no public API change
  - `test`: Adding or updating unit/integration tests in `tests/`
  - `chore`: Version bumps, dependency updates, `npm pkg fix`, build artifacts
  - `ci`: Changes to `.github/workflows/*.yml`
- **`<scope>`** (optional but recommended) must match the affected package or area:
  - `util`, `collection`, `formatters`, `builders`, `rest`, `ws`, `strafebot`, `cli`, `docs`, `release`, `deps`
- **`<imperative summary>`**:
  - Use imperative mood (`add`, `fix`, `remove`, `document`, `bump`, not `added` or `adding`).
  - Maximum **72 characters** on the first line.
  - Do not end the subject line with a period (`.`).
  - Never include em dashes (`U+2014`) or en dashes (`U+2013`).
  - Never use vague messages (`update files`, `fix stuff`, `changes`, `wip`).

### Good Commit Examples
- `feat(rest): add getPinnedMessages and pinMessage endpoints`
- `fix(strafebot): clear AttachFiles when SendMessages is denied in room override`
- `docs(util): add TSDoc bitshift descriptions and examples for Permission flags`
- `chore(release): v1.2.0`
- `ci(publish): publish packages to npmjs.org when NPM_TOKEN is set`

### Important Git Rule for Agent Sessions
- **Do not run `git commit` or `git tag` unless the user explicitly asks you to create a commit or release.** Leave modified files uncommitted in the working tree during normal tasks so the IDE / Cloud Agent interface can display the diff and commit them cleanly.

---

## 3. Monorepo Architecture & Build Order

Packages live under `packages/@strafe-js/*`, `packages/strafebot`, and `packages/create-strafe-bot`. Because downstream packages import `.d.ts` declarations from upstream packages, always build in strict topological order:

1. `@strafe-js/util` (`packages/@strafe-js/util`) - Zero internal dependencies. Defines `Snowflake`, `Permission`, `BitField`, `RoomType`, `GatewayOp`, `StrafeError`, `RateLimitError`, and all REST/Gateway entity interfaces.
2. `@strafe-js/collection` (`packages/@strafe-js/collection`) - Zero internal dependencies. Defines `Collection<K, V> extends Map<K, V>`.
3. `@strafe-js/formatters` (`packages/@strafe-js/formatters`) - Depends on `@strafe-js/util`. Mention, emoji, and Markdown string helpers.
4. `@strafe-js/builders` (`packages/@strafe-js/builders`) - Depends on `@strafe-js/util`. Fluent `MessageBuilder` (`message()`) and permission mask builders (`permissions()`, `permissionMask()`).
5. `@strafe-js/rest` (`packages/@strafe-js/rest`) - Depends on `@strafe-js/util`. Fetch-based `REST` client with automatic `429` retry backoff.
6. `@strafe-js/ws` (`packages/@strafe-js/ws`) - Depends on `@strafe-js/util` and `ws`. Stargate WebSocket `Gateway` client.
7. `@strafe-js/strafebot` (`packages/strafebot`) - Depends on all 6 `@strafe-js/*` packages above and re-exports them from `src/index.ts`. Defines `Client`, `Command`, `command()`, `CommandHandler`, `Context`, `ParsedArguments`, and `ArgumentValidationError`.
8. `create-strafebot` (`packages/create-strafe-bot`) - Standalone ESM CLI (`src/cli.js`) for scaffolding bots and commands.

### Verification Commands
Before finishing any code or documentation task, run:
```bash
npm test
```
`npm test` compiles all 7 TypeScript packages in dependency order (`npm run build`, updating `dist/*.js`, `dist/*.d.ts`, and `dist/*.d.ts.map`) and executes all test suites in `tests/**/*.test.ts` using `node --import tsx --test`.

---

## 4. Coding Standards (TypeScript & Node.js)

1. **Module System & Imports**:
   - All packages use `"module": "NodeNext"` / `"moduleResolution": "NodeNext"` (or `"ES2022"`).
   - Relative imports inside `src/` **must** include the `.js` extension (for example: `import { Context } from './Context.js';`).
   - Use `import type { ... }` when importing types that are erased at runtime.
2. **Strict Typing**:
   - `"strict": true` is enabled across all `tsconfig.json` files.
   - Avoid `any`. Use generics (`Schema extends CommandArgumentsSchema`), discriminated unions, or `unknown` with narrowing.
   - Only use `any` where required by `EventEmitter` overload compatibility (`(...args: any[]) => void`).
3. **IDE Documentation (TSDoc / JSDoc)**:
   - Every exported class, interface, type alias, enum-like constant object, method, and public property must have a `/** ... */` JSDoc comment so IDE users get hover tooltips and autocomplete descriptions via `.d.ts` files.
   - Use `{@link SymbolName}` to cross-reference related types and methods.
   - Include `@throws {StrafeError}` / `@throws {RateLimitError}` / `@throws {ArgumentValidationError}` where applicable.
   - Do **not** add `@param` or `@returns` tags unless they document non-obvious constraints (such as valid ranges, default values, or mutating behavior) that are not already expressed in the TypeScript signature.
4. **Protocol Invariants to Preserve**:
   - **Equinox 6-Stage Permission Cascade** (`Client.resolveMemberPermissions`):
     1. Space owner (`space.owner_id === userId`) receives `ALL_PERMISSIONS`.
     2. Base permissions combine `@everyone` (`space.everyone_role_id`) and `member.role_ids`.
     3. `Permission.Administrator` short-circuits to `ALL_PERMISSIONS`.
     4. Room overrides apply in exact order: `@everyone` room override -> bitwise union of member role overrides (`deny` cleared before `allow` applied) -> individual user override.
     5. Missing `Permission.ViewRoom` zeroes out the entire room bitmask (`0`).
     6. Missing `Permission.SendMessages` clears `Permission.AttachFiles` and `Permission.MentionEveryone`.
   - **Gateway Opcodes (`GatewayOp`)**:
     - `0` = `Heartbeat`, `1` = `Subscribe`, `2` = `Send`, `3` = `Event`, `4` = `Ready`, `5` = `Unsubscribe`, `6` = `Ping`, `7` = `Pong`, `8` = `Error`.
     - Always support both nested (`frame.d = { t, d, space_id }`) and flat (`frame = { op: 3, t, d, space_id }`) `op: 3` dispatch envelopes.

---

## 5. Release & Version Bump Procedure

When creating a new release (for example `1.2.0` -> `1.3.0`):
1. Update `"version"` and internal `@strafe-js/*` dependency ranges (`"^X.Y.Z"`) in lockstep across:
   - `package.json`
   - `packages/@strafe-js/util/package.json`
   - `packages/@strafe-js/collection/package.json`
   - `packages/@strafe-js/formatters/package.json`
   - `packages/@strafe-js/builders/package.json`
   - `packages/@strafe-js/rest/package.json` (and default `userAgent` in `packages/@strafe-js/rest/src/index.ts`)
   - `packages/@strafe-js/ws/package.json`
   - `packages/strafebot/package.json`
   - `packages/create-strafe-bot/package.json` (and template dependency in `packages/create-strafe-bot/src/cli.js`)
   - `docs/src/app/page.tsx`
2. Add a new version section at the top of `CHANGELOG.md` (no em dashes, concrete bullet points).
3. Run `npm pkg fix` in each package directory under `packages/`.
4. Run `npm install` and `npm test` so `package-lock.json` and all `dist/` directories are rebuilt and verified.
