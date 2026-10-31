<div align="center">
	<br />
	<a href="https://strafe-js.github.io/strafe.js/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="84" height="84" alt="Strafe.js" />
	</a>
	<h1>Strafe.js</h1>
	<p>
		<strong>TypeScript and Node.js SDK for the Strafe Chat REST API and Stargate WebSocket Gateway</strong>
	</p>
</div>

---

## OAuth2 (server-side)

```ts
import { OAuth2Client } from '@strafe-js/strafebot';

const oauth = new OAuth2Client({
  clientId: process.env.STRAFE_CLIENT_ID!,
  clientSecret: process.env.STRAFE_CLIENT_SECRET!,
  redirectUri: 'https://example.com/callback',
});

const state = oauth.generateState(); // store in session
const url = oauth.getAuthorizationUrl({ scope: ['identify', 'email'], state });
// after callback:
const tokens = await oauth.exchangeCode(code);
const user = await oauth.getUser(tokens.access_token);
```

Never put the client secret in browser code. See `examples/oauth-server.ts`.

---

## Installation

**Node.js 18+ required.**

```sh
npm install @strafe-js/strafebot
```

```ts
import { Client, command } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: 'https://app.strafe.chat/api',
  gatewayUrl: 'wss://app.strafe.chat/gateway/events',
  prefix: '!',
});

client.commands.register(
  command({
    name: 'ping',
    async run(ctx) {
      await ctx.reply('Pong!');
    },
  }),
);

await client.login(process.env.BOT_TOKEN!);
```

## Docs

- SDK: https://strafe-js.github.io/strafe.js/
- Platform: https://app.strafe.chat/docs/

## License

Apache-2.0
