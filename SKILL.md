---
name: strafe-bot-typescript-sdk
description: "TypeScript SDK for Strafe Bot API. Use when writing TypeScript code that calls Strafe Bot API with the @strafebot/strafebot package: installing it, constructing and authenticating the client, and calling API operations."
---

# Strafe Bot TypeScript SDK

Generated TypeScript client for Strafe Bot API, published as `@strafebot/strafebot`. Use the generated client instead of hand-writing HTTP requests.

## Install

```sh
npm install @strafebot/strafebot
```

## Client setup and authentication

```ts
import StrafeBot from '@strafebot/strafebot';

const client = new StrafeBot({
  environment: 'app_strafe_chat_instance',
});

client.login('your_bot_token_here');
```

Provide credentials using `client.login(token)` (which handles formatting automatically) or using the options below. Environment variables are read automatically when the target runtime supports them:

- `botAuth` (env: `BOT_AUTH`) — Bot token: `Bot <token>`
- `bearerAuth` (env: `BEARER_AUTH`) — OAuth2 access token. Scopes: identify, email, spaces, spaces.join, bot
- `oAuth2` (env: `O_AUTH2`) — Credential for the OAuth2 scheme.

## Calling operations

```ts
import StrafeBot from '@strafebot/strafebot';

const client = new StrafeBot({
  environment: 'app_strafe_chat_instance',
});
client.login('your_bot_token_here');

const user = await client.users.me.list();

console.log(user);
```

Method names, parameter shapes, and response types are generated from the API description — do not guess them. Look up the exact call signature in [api.md](./api.md) before writing a call.

## Error handling

Non-success responses throw generated API errors. Error objects expose status, headers, response body, and request metadata where the target runtime supports it.

```ts
import { APIError } from '@strafebot/strafebot';

try {
  const user = await client.users.me.list();
} catch (err) {
  if (err instanceof APIError) {
    console.log(err.status, err.name, err.headers);
  }
  throw err;
}
```

## Requirements

- Node.js 20+, a modern browser, or any runtime with `fetch` support

## Reference files

- [README.md](./README.md) — full feature tour: client options, request options, retries and timeouts, logging.
- [api.md](./api.md) — complete catalogue of every operation with request and response types.
