/**
 * Minimal server-side OAuth2 flow (authorization code).
 * Do not put client_secret in browser code.
 *
 *   STRAFE_CLIENT_ID=... STRAFE_CLIENT_SECRET=...
 *   STRAFE_REDIRECT_URI=http://localhost:3000/callback
 *   node --experimental-strip-types examples/oauth-server.ts
 */
import { createServer } from 'node:http';
import { OAuth2Client } from '../packages/@strafe-js/rest/src/oauth.js';

const oauth = new OAuth2Client({
  clientId: process.env.STRAFE_CLIENT_ID!,
  clientSecret: process.env.STRAFE_CLIENT_SECRET!,
  redirectUri: process.env.STRAFE_REDIRECT_URI || 'http://localhost:3000/callback',
});

// In production, store state in the visitor session (cookie/redis), not memory.
const pendingStates = new Set<string>();

createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost:3000');

  if (url.pathname === '/login') {
    const state = oauth.generateState();
    pendingStates.add(state);
    const location = oauth.getAuthorizationUrl({
      scope: ['identify', 'email'],
      state,
    });
    res.writeHead(302, { Location: location });
    res.end();
    return;
  }

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state || !pendingStates.delete(state)) {
      res.writeHead(400);
      res.end('invalid state or code');
      return;
    }
    try {
      const tokens = await oauth.exchangeCode(code);
      const user = await oauth.getUser(tokens.access_token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          user,
          tokens: { token_type: tokens.token_type, expires_in: tokens.expires_in },
        }),
      );
    } catch (e) {
      res.writeHead(500);
      res.end(String(e));
    }
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GET /login to start Strafe OAuth');
}).listen(3000, () => console.log('http://localhost:3000/login'));
