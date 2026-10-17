import test from 'node:test';
import assert from 'node:assert/strict';
import { REST } from '@strafe-js/rest';
import {
  Permission,
  RateLimitError,
  StrafeError,
  READ_AND_POST_PERMISSIONS,
  DEFAULT_EVERYONE_PERMISSIONS,
} from '@strafe-js/util';
import { generateBotInviteUrl, generateOAuth2Url } from '@strafe-js/builders';

test('REST - 204 No Content returns undefined without JSON parsing', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(null, { status: 204 });

    const rest = new REST({
      baseUrl: 'https://test.local/api',
      token: 'bot_token_123',
    });

    const res = await rest.deleteMessage('room_1', 'msg_1');
    assert.equal(res, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('REST - Automatic retry on HTTP 429 using body retry_after', async () => {
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  try {
    globalThis.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({ message: 'Rate limited', retry_after: 0.01 }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      return new Response(
        JSON.stringify({ id: 'user_1', username: 'StrafeBot' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    };

    const rest = new REST({
      baseUrl: 'https://test.local/api',
      token: 'bot_token_123',
      retries: 2,
    });

    const me = await rest.getMe();
    assert.equal(callCount, 2);
    assert.equal(me.id, 'user_1');
    assert.equal(me.username, 'StrafeBot');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('REST - Throws RateLimitError when HTTP 429 retries are exhausted (Retry-After header)', async () => {
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  try {
    globalThis.fetch = async () => {
      callCount++;
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '0.01',
          },
        },
      );
    };

    const rest = new REST({
      baseUrl: 'https://test.local/api',
      token: 'bot_token_123',
      retries: 1,
    });

    await assert.rejects(
      () => rest.getMe(),
      (err: unknown) => {
        assert.ok(err instanceof RateLimitError);
        assert.equal(err.status, 429);
        assert.equal(err.retryAfter, 0.01);
        return true;
      },
    );
    assert.equal(callCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('REST - Throws StrafeError on non-2xx responses and RFC 6749 error_description', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Authorization code expired',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );

    const rest = new REST({
      baseUrl: 'https://test.local/api',
    });

    await assert.rejects(
      () =>
        rest.exchangeOAuth2Code({
          client_id: 'app_1',
          client_secret: 'secret_1',
          code: 'expired_code',
          redirect_uri: 'https://example.com/cb',
        }),
      (err: unknown) => {
        assert.ok(err instanceof StrafeError);
        assert.equal(err.status, 400);
        assert.equal(err.code, 'invalid_grant');
        assert.equal(err.message, 'Authorization code expired');
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('REST - OAuth2 token exchange, getOAuth2MeBearer, and addSpaceMemberWithToken', async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; method: string; auth: string | null }> = [];

  try {
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      const headers = new Headers(init?.headers);
      requests.push({
        url,
        method,
        auth: headers.get('Authorization'),
      });

      if (url.endsWith('/oauth2/token')) {
        return new Response(
          JSON.stringify({
            access_token: 'strf_oat_abc',
            token_type: 'Bearer',
            expires_in: 604800,
            refresh_token: 'strf_ort_xyz',
            scope: 'identify spaces.join',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith('/oauth2/@me')) {
        return new Response(
          JSON.stringify({
            application: { id: 'app_1', name: 'Test App', verify_key: 'vk' },
            scopes: ['identify', 'spaces.join'],
            expires: '2026-10-24T00:00:00Z',
            user: { id: 'u_1', username: 'alice' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith('/spaces/space_1/members/u_1')) {
        return new Response(
          JSON.stringify({ space_id: 'space_1', user_id: 'u_1' }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(null, { status: 404 });
    };

    const rest = new REST({
      baseUrl: 'https://test.local/api',
      token: 'bot_token_123',
      authScheme: 'Bot',
    });

    const tokenRes = await rest.exchangeOAuth2Code({
      client_id: 'app_1',
      client_secret: 'sec_1',
      code: 'code_1',
      redirect_uri: 'https://example.com/callback',
    });
    assert.equal(tokenRes.access_token, 'strf_oat_abc');
    assert.equal(requests[0].auth, null);

    const meRes = await rest.getOAuth2Me(tokenRes.access_token);
    assert.equal(meRes.user?.username, 'alice');
    assert.equal(requests[1].auth, 'Bearer strf_oat_abc');

    const joinRes = await rest.addSpaceMemberWithToken(
      'space_1',
      'u_1',
      tokenRes.access_token,
    );
    assert.deepEqual(joinRes, { space_id: 'space_1', user_id: 'u_1' });
    assert.equal(requests[2].auth, 'Bot bot_token_123');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Builders - generateBotInviteUrl and generateOAuth2Url', () => {
  assert.equal(READ_AND_POST_PERMISSIONS, 7);
  assert.equal(DEFAULT_EVERYONE_PERMISSIONS, 10723359);

  const botUrl = generateBotInviteUrl({
    clientId: '123456789',
    permissions: ['ViewRoom', 'SendMessages', 'ReadMessageHistory'],
    spaceId: '987654321',
    disableSpaceSelect: true,
  });

  assert.equal(
    botUrl,
    'https://app.strafe.chat/oauth2/authorize?response_type=code&client_id=123456789&scope=bot&permissions=7&space_id=987654321&disable_space_select=true',
  );

  const oauthUrl = generateOAuth2Url({
    baseUrl: 'https://chat.example.com/api/',
    clientId: '123456789',
    scopes: ['identify', 'email', 'spaces'],
    redirectUri: 'https://example.com/cb',
    state: 'csrf_token_1',
    permissions: Permission.SendMessages,
  });

  assert.equal(
    oauthUrl,
    'https://chat.example.com/oauth2/authorize?response_type=code&client_id=123456789&scope=identify+email+spaces&redirect_uri=https%3A%2F%2Fexample.com%2Fcb&state=csrf_token_1&permissions=2',
  );
});
