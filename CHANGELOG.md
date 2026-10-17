# Changelog

## 1.2.0

IDE IntelliSense & TSDoc documentation across all `@strafe-js/*` packages.

- Added TSDoc/JSDoc annotations, `@example` blocks, `@throws` declarations, and `{@link}` references across `@strafe-js/util`, `@strafe-js/collection`, `@strafe-js/formatters`, `@strafe-js/builders`, `@strafe-js/rest`, `@strafe-js/ws`, and `@strafe-js/strafebot`
- Re-exported `@strafe-js/util`, `@strafe-js/collection`, `@strafe-js/rest`, `@strafe-js/ws`, `@strafe-js/builders`, and `@strafe-js/formatters` from `@strafe-js/strafebot` entry point
- Updated release workflows to publish both GitHub Releases and packages to GitHub Packages and the npm registry

## 1.1.0

- Expanded REST and Gateway support for threads, pins, search, custom reactions, and Equinox 6-stage permission cascade
- Added declarative command argument schema parser (`CommandArgumentOption`, `ParsedArguments`, `ArgumentValidationError`)
- Added documentation portal and interactive developer tools (`PermissionCalculator`, `CommandBuilder`, `ApiPlayground`)

## 1.0.0

Breaking rewrite of `@strafe-js/strafebot`.

- Full gateway (WebSocket) client aligned with Strafe docs
- Command framework with permission gates, cooldowns, guild/dm filters
- REST helpers for messages, reactions, members, invites, uploads
- Typed permission bitfield (bits 0..27 from official docs)
- Monorepo packages under `@strafe-js/*`
- CLI: `create-strafebot`

Removed the Scalar-generated REST surface from 0.1.x (`users.me.list`, etc.).
