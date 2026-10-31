import { randomBytes } from 'node:crypto';
import type {
  OAuth2Scope,
  OAuth2TokenInfo,
  OAuth2TokenResponse,
  Space,
  User,
} from '@strafe-js/util';
import { StrafeError } from '@strafe-js/util';

const DEFAULT_AUTHORIZE_URL = 'https://app.strafe.chat/oauth2/authorize';
const DEFAULT_API_BASE_URL = 'https://app.strafe.chat/api';

/** Thrown when the token or authorize endpoints return a non-2xx response. */
export class OAuth2Error extends StrafeError {
  constructor(message: string, status: number, body?: unknown) {
    super(message, status, undefined, body);
    this.name = 'OAuth2Error';
  }
}

export interface OAuth2ClientOptions {
  clientId: string;
  clientSecret: string;
  /** Must match a redirect URI registered on the application. */
  redirectUri: string;
  authorizeUrl?: string;
  apiBaseUrl?: string;
  /** Override for tests / custom runtimes. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * Server-side OAuth2 (authorization code). Keep the client secret off the browser.
 *
 * Typical flow:
 * 1. `generateState()` → store in session
 * 2. redirect to `getAuthorizationUrl({ state, scope })`
 * 3. on callback, verify state, then `exchangeCode(code)`
 * 4. use `getUser(access_token)` (or refresh later)
 */
export class OAuth2Client {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  readonly authorizeUrl: URL;
  readonly apiBaseUrl: string;
  private readonly fetch: typeof fetch;

  constructor(opts: OAuth2ClientOptions) {
    if (typeof opts.clientId !== 'string' || !opts.clientId.trim()) {
      throw new TypeError('clientId is required');
    }
    if (typeof opts.clientSecret !== 'string' || !opts.clientSecret.trim()) {
      throw new TypeError('clientSecret is required');
    }
    if (typeof opts.redirectUri !== 'string' || !opts.redirectUri.trim()) {
      throw new TypeError('redirectUri is required');
    }
    const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
      throw new TypeError('fetch is required');
    }

    this.clientId = opts.clientId;
    this.clientSecret = opts.clientSecret;
    this.redirectUri = opts.redirectUri;
    this.authorizeUrl = new URL(opts.authorizeUrl ?? DEFAULT_AUTHORIZE_URL);
    this.apiBaseUrl = (opts.apiBaseUrl ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
    this.fetch = fetchImpl.bind(globalThis);
  }

  /** Random state for CSRF checks — store it in the user session. */
  generateState(): string {
    return randomBytes(32).toString('base64url');
  }

  getAuthorizationUrl(opts: {
    scope?: OAuth2Scope[] | string;
    state: string;
  }): string {
    if (typeof opts.state !== 'string' || !opts.state) {
      throw new TypeError('state is required');
    }
    const requested = Array.isArray(opts.scope)
      ? opts.scope
      : opts.scope
        ? String(opts.scope).split(/\s+/)
        : ['identify'];
    if (
      requested.length === 0 ||
      requested.some((v) => typeof v !== 'string' || !v.trim())
    ) {
      throw new TypeError('at least one scope is required');
    }
    const scopes = requested.map((v) => String(v).trim());

    const url = new URL(this.authorizeUrl);
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: opts.state,
    }).toString();
    return url.toString();
  }

  exchangeCode(code: string, opts?: { signal?: AbortSignal }): Promise<OAuth2TokenResponse> {
    if (typeof code !== 'string' || !code) {
      throw new TypeError('code is required');
    }
    return this.tokenRequest(
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      },
      opts,
    );
  }

  refreshToken(
    refreshToken: string,
    opts?: { signal?: AbortSignal },
  ): Promise<OAuth2TokenResponse> {
    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new TypeError('refreshToken is required');
    }
    return this.tokenRequest(
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      opts,
    );
  }

  async revokeToken(token: string, opts?: { signal?: AbortSignal }): Promise<void> {
    if (typeof token !== 'string' || !token) {
      throw new TypeError('token is required');
    }
    await this.formRequest('/oauth2/token/revoke', { token }, opts);
  }

  getUser(accessToken: string, opts?: { signal?: AbortSignal }): Promise<User> {
    return this.authorizedRequest<User>('/users/@me', accessToken, opts);
  }

  getTokenInfo(accessToken: string, opts?: { signal?: AbortSignal }): Promise<OAuth2TokenInfo> {
    return this.authorizedRequest<OAuth2TokenInfo>('/oauth2/@me', accessToken, opts);
  }

  getUserSpaces(accessToken: string, opts?: { signal?: AbortSignal }): Promise<Space[]> {
    return this.authorizedRequest<Space[]>('/users/@me/spaces', accessToken, opts);
  }

  private tokenRequest(
    body: Record<string, string>,
    opts?: { signal?: AbortSignal },
  ): Promise<OAuth2TokenResponse> {
    return this.formRequest('/oauth2/token', body, opts) as Promise<OAuth2TokenResponse>;
  }

  private async formRequest(
    path: string,
    body: Record<string, string>,
    opts?: { signal?: AbortSignal },
  ): Promise<unknown> {
    const url = new URL(path.replace(/^\/+/, ''), `${this.apiBaseUrl}/`);
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await this.fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(body),
      signal: opts?.signal,
    });
    return this.readResponse(response);
  }

  private async authorizedRequest<T>(
    path: string,
    accessToken: string,
    opts?: { signal?: AbortSignal },
  ): Promise<T> {
    if (typeof accessToken !== 'string' || !accessToken) {
      throw new TypeError('accessToken is required');
    }
    const url = new URL(path.replace(/^\/+/, ''), `${this.apiBaseUrl}/`);
    const response = await this.fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      signal: opts?.signal,
    });
    return this.readResponse(response) as Promise<T>;
  }

  private async readResponse(response: Response): Promise<unknown> {
    const text = await response.text();
    let body: unknown;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    if (response.ok) return body;

    const obj = typeof body === 'object' && body ? (body as Record<string, unknown>) : {};
    const message = String(
      obj.error_description ?? obj.message ?? obj.error ?? `OAuth request failed (${response.status})`,
    );
    throw new OAuth2Error(message, response.status, body);
  }
}

/** Same as {@link OAuth2Client} — name used by some older examples. */
export { OAuth2Client as StrafeOAuth, OAuth2Error as StrafeOAuthError };
