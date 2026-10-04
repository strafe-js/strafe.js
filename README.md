# Strafe Bot

This library provides convenient access to the Strafe Bot REST API from TypeScript or JavaScript.

The full API of this library can be found in [api.md](./api.md).

<br />

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](./api.md)
- [Authentication](#authentication)
- [Errors](#errors)
- [Client Options](#client-options)
- [Request Options](#request-options)
- [Retries and Timeouts](#retries-and-timeouts)
- [Helpers](#helpers)
- [Logging](#logging)
- [Requirements](#requirements)

<br />

## Installation

```sh
npm install @strafebot/strafebot
```

<br />

## Usage

```ts
import StrafeBot from '@strafebot/strafebot';

const client = new StrafeBot({
  environment: 'app_strafe_chat_instance',
});

// Easily set your bot token for authentication
client.login('your_bot_token_here');

const user = await client.users.me.list();

console.log(user);
```

The examples in the following sections assume a `client` configured as shown above.

See the [API reference](./api.md) for every available operation.

<br />

## Authentication

Pass credentials to the generated client constructor, or use helper methods. Environment variables are read automatically when supported by the target runtime.

### The easiest way: `client.login()`

For bots, you can just use `.login()` to easily set the token:

```ts
const client = new StrafeBot();
client.login('your_bot_token_here');
```

This will automatically prepend `Bot ` to your token if needed and handle authentication for you.

### Constructor Authentication

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `botAuth` | `string \| provider` | - | Bot token: `Bot <token>` Defaults to BOT_AUTH. |
| `bearerAuth` | `string \| provider` | - | OAuth2 access token. Scopes: identify, email, spaces, spaces.join, bot Defaults to BEARER_AUTH. |
| `oAuth2` | `string \| provider` | - | Credential for the OAuth2 scheme. Defaults to O_AUTH2. |

Declared schemes:

- `BotAuth` API key in header `Authorization`
- `BearerAuth` bearer token
- `OAuth2` OAuth2/OpenID Connect

<br />

## Errors

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

Documented error statuses: `400`, `401`, `403`, `404`, `429`.

<br />

## Client Options

Configure the generated client by setting any of these options when you create it.

```ts
import StrafeBot from '@strafebot/strafebot';

const client = new StrafeBot({
  timeout: 60000,
  maxRetries: 2,
  logLevel: 'debug',
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `botAuth` | `string \| AuthTokenProvider` | `process.env["BOT_AUTH"]` | Bot token: `Bot <token>` |
| `bearerAuth` | `string \| AuthTokenProvider` | `process.env["BEARER_AUTH"]` | OAuth2 access token. Scopes: identify, email, spaces, spaces.join, bot |
| `oAuth2` | `string \| AuthTokenProvider` | `process.env["O_AUTH2"]` | Credential for the OAuth2 scheme. |
| `environment` | `Environment` | - | Select one of the configured API environments. |
| `baseURL` | `string \| null` | `process.env["STRAFE_BASE_URL"]` | Override the default API base URL. Pass `null` when selecting a configured environment. |
| `timeout` | `number` | `60000` | Maximum time in milliseconds to wait for a response before aborting a request. |
| `maxRetries` | `number` | `2` | Number of retries for temporary failures. |
| `defaultHeaders` | `HeadersInit` | - | Headers sent with every request. |
| `defaultQuery` | `Record<string, string \| undefined>` | - | Query parameters sent with every request. |
| `fetchOptions` | `RequestInit` | - | Additional fetch options sent with every request. |
| `fetch` | `Fetch` | - | Custom fetch implementation. |
| `logLevel` | `"off" \| "error" \| "warn" \| "info" \| "debug" \| null` | `process.env["STRAFE_LOG"]` | Controls request and retry debug logging. |
| `logger` | `Logger \| null` | `console` | Custom logger implementation. |

<br />

## Request Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `headers` | `HeadersInit` | - | Per-request headers. |
| `query` | `Record<string, unknown>` | - | Per-request query parameters. |
| `body` | `unknown` | - | Override the generated request body. |
| `timeout` | `number` | - | Per-request timeout in milliseconds. |
| `maxRetries` | `number` | - | Per-request retry count. |
| `signal` | `AbortSignal` | - | Abort an in-flight request. |
| `fetchOptions` | `RequestInit` | - | Per-request fetch options. |
| `idempotencyKey` | `string` | - | Idempotency key for retry-safe operations. Applies to this request and its retries. |

<br />

## Retries and Timeouts

Generated clients support request timeouts and retry temporary failures such as network errors, 408, 409, 429, and 5xx responses. Retry delays honor `Retry-After` headers when present. Tune the retry and timeout client options shown above, or override them per request.

<br />

## Helpers

- Use `.withResponse()` on any request to inspect both parsed data and the raw `Response` object.
- Every operation returns an `APIPromise`, so you can `await` it directly or chain `.withResponse()`.

<br />

## Logging

- Set `logLevel: "debug"` to log request URLs, options, response status, response headers, and retry attempts.
- Pass a custom `logger` to route logs into your own observability pipeline.
- Set `logLevel: null` to disable environment-driven logging.

<br />

## Requirements

- Node.js 20+, a modern browser, or any runtime with `fetch` support

Powered by Scalar.
