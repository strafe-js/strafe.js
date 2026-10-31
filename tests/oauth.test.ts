import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OAuth2Client } from '../packages/@strafe-js/rest/src/oauth.ts';

function createOAuth(fetchImpl?: typeof fetch) {
  return new OAuth2Client({
    clientId: 'client-id',
    clientSecret: 'client-secret',
    redirectUri: 'https://example.com/callback',
    fetchImpl: fetchImpl ?? (async () => new Response('{}', { status: 200 })),
  });
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('authorization URL includes client, scopes, and state', () => {
  const oauth = createOAuth();
  const url = new URL(
    oauth.getAuthorizationUrl({
      scope: ['identify', 'email'],
      state: 'session-state',
    }),
  );

  assert.equal(url.origin, 'https://app.strafe.chat');
  assert.equal(url.pathname, '/oauth2/authorize');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('client_id'), 'client-id');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://example.com/callback');
  assert.equal(url.searchParams.get('scope'), 'identify email');
  assert.equal(url.searchParams.get('state'), 'session-state');
});

test('authorization URL requires state', () => {
  assert.throws(() => createOAuth().getAuthorizationUrl({ state: '' } as any), /state/);
});

test('code exchange uses form body and HTTP Basic', async () => {
  let request: { url: URL; options: RequestInit } | undefined;
  const oauth = createOAuth(async (url, options) => {
    request = { url: new URL(String(url)), options: options ?? {} };
    return jsonResponse({ access_token: 'access-token', refresh_token: 'refresh-token' });
  });

  const tokens = await oauth.exchangeCode('one-time-code');

  assert.equal(tokens.access_token, 'access-token');
  assert.equal(request!.url.href, 'https://app.strafe.chat/api/oauth2/token');
  assert.equal(
    (request!.options.headers as Record<string, string>).Authorization,
    `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`,
  );
  assert.equal(
    (request!.options.headers as Record<string, string>)['Content-Type'],
    'application/x-www-form-urlencoded',
  );
  assert.deepEqual(Object.fromEntries(new URLSearchParams(String(request!.options.body))), {
    grant_type: 'authorization_code',
    code: 'one-time-code',
    redirect_uri: 'https://example.com/callback',
  });
});

test('refresh and revoke send the right fields', async () => {
  const requests: { path: string; body: Record<string, string> }[] = [];
  const oauth = createOAuth(async (url, options) => {
    requests.push({
      path: new URL(String(url)).pathname,
      body: Object.fromEntries(new URLSearchParams(String(options?.body))),
    });
    return jsonResponse({});
  });

  await oauth.refreshToken('refresh-token');
  await oauth.revokeToken('access-token');

  assert.deepEqual(requests, [
    {
      path: '/api/oauth2/token',
      body: { grant_type: 'refresh_token', refresh_token: 'refresh-token' },
    },
    { path: '/api/oauth2/token/revoke', body: { token: 'access-token' } },
  ]);
});

test('getUser sends Bearer access token', async () => {
  let auth: string | undefined;
  const oauth = createOAuth(async (_url, options) => {
    auth = (options?.headers as Record<string, string>)?.Authorization;
    return jsonResponse({ id: '1', username: 'docs_bot' });
  });

  const user = await oauth.getUser('access-token');
  assert.equal(auth, 'Bearer access-token');
  assert.equal(user.username, 'docs_bot');
});

test('generateState returns unique non-empty strings', () => {
  const oauth = createOAuth();
  const a = oauth.generateState();
  const b = oauth.generateState();
  assert.ok(a.length > 10);
  assert.notEqual(a, b);
});
