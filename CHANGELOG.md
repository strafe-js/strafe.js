# Changelog

## 1.0.0

Breaking rewrite of `@strafe-js/strafebot`.

- Full gateway (WebSocket) client aligned with Strafe docs
- Command framework with permission gates, cooldowns, guild/dm filters
- REST helpers for messages, reactions, members, invites, uploads
- Typed permission bitfield (bits 0–27 from official docs)
- Monorepo packages under `@strafe-js/*`
- CLI: `create-strafebot`

Removed the Scalar-generated REST surface from 0.1.x (`users.me.list`, etc.).
