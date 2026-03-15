import { describe, expect, mock, test } from 'bun:test';
import type { FakturoidTokens } from '../types/common';
import { FakturoidApiError } from '../types/common';
import { OAuthService } from './oauth-service';
import type { FakturoidTokenStore } from './token-store';

describe('OAuthService', () => {
  const config = {
    clientId: 'client-id',
    clientSecret: 'client-secret',
    redirectUri: 'https://app.example.com/callback',
    userAgent: 'Test (test@example.com)',
    environment: 'production' as const,
    baseUrl: 'https://app.fakturoid.cz',
  };

  test('getAuthorizationUrl uses /api/v3/oauth and query params', () => {
    const tokenStore = {
      getTokens: mock(() => Promise.resolve(null)),
      saveTokens: mock(() => Promise.resolve()),
      deleteTokens: mock(() => Promise.resolve()),
    } as unknown as FakturoidTokenStore;

    const oauth = new OAuthService(config, tokenStore);
    const url = oauth.getAuthorizationUrl({ tenantId: 't1', state: 'xyz' });

    expect(url.pathname).toBe('/api/v3/oauth');
    expect(url.searchParams.get('client_id')).toBe(config.clientId);
    expect(url.searchParams.get('redirect_uri')).toBe(config.redirectUri);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe('xyz');
  });

  test('handleCallback saves tokens and returns them', async () => {
    const tokenResponse = {
      access_token: 'at',
      refresh_token: 'rt',
      expires_in: 7200,
    };
    const userResponse = {
      default_account: null,
      accounts: [{ slug: 'mycompany' }],
    };

    let fetchCallCount = 0;
    const fetchMock = mock((url: string | URL, init?: RequestInit) => {
      fetchCallCount++;
      const path = String(url);
      if (path.includes('/oauth/token')) {
        expect(init?.method).toBe('POST');
        return Promise.resolve(new Response(JSON.stringify(tokenResponse), { status: 200 }));
      }
      if (path.includes('/user.json')) {
        expect(init?.method).toBe('GET');
        return Promise.resolve(new Response(JSON.stringify(userResponse), { status: 200 }));
      }
      return Promise.resolve(new Response('{}', { status: 404 }));
    });

    const savedTokens: Array<{ tenantId: string; tokens: FakturoidTokens }> = [];
    const tokenStore: FakturoidTokenStore = {
      getTokens: mock(async (tenantId: string) => {
        const entry = savedTokens.find((s) => s.tenantId === tenantId);
        return entry ? entry.tokens : null;
      }),
      saveTokens: mock(async (tenantId: string, tokens: FakturoidTokens) => {
        const existing = savedTokens.findIndex((s) => s.tenantId === tenantId);
        if (existing >= 0) savedTokens[existing] = { tenantId, tokens };
        else savedTokens.push({ tenantId, tokens });
      }),
      deleteTokens: mock(() => Promise.resolve()),
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const oauth = new OAuthService(config, tokenStore);
      const result = await oauth.handleCallback({
        code: 'auth-code',
        state: 'xyz',
        tenantId: 'tenant-1',
      });

      expect(result.accessToken).toBe('at');
      expect(result.refreshToken).toBe('rt');
      expect(result.fakturoidSlug).toBe('mycompany');
      expect(fetchCallCount).toBe(2);
      expect(tokenStore.saveTokens).toHaveBeenCalledTimes(2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('token requests use URL-safe Basic auth header', async () => {
    const specialConfig = {
      ...config,
      clientId: 'a',
      clientSecret: '>a',
    };
    const fetchMock = mock((_url: string | URL, init?: RequestInit) => {
      const headers = (init?.headers ?? {}) as Record<string, string>;
      expect(headers.Authorization).toBe('Basic YTo-YQ==');
      return Promise.resolve(
        new Response(
          JSON.stringify({
            access_token: 'at',
            refresh_token: 'rt',
            expires_in: 7200,
          }),
          { status: 200 }
        )
      );
    });

    const tokenStore: FakturoidTokenStore = {
      getTokens: mock(() => Promise.resolve(null)),
      saveTokens: mock(() => Promise.resolve()),
      deleteTokens: mock(() => Promise.resolve()),
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const oauth = new OAuthService(specialConfig, tokenStore);
      await oauth.obtainClientCredentialsToken('tenant-1', 'acme');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('handleCallback throws FakturoidApiError when token endpoint fails', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Authorization code expired',
          }),
          { status: 400 }
        )
      )
    );

    const tokenStore: FakturoidTokenStore = {
      getTokens: mock(() => Promise.resolve(null)),
      saveTokens: mock(() => Promise.resolve()),
      deleteTokens: mock(() => Promise.resolve()),
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const oauth = new OAuthService(config, tokenStore);
      await expect(
        oauth.handleCallback({
          code: 'expired-code',
          state: 's',
          tenantId: 't1',
        })
      ).rejects.toThrow(FakturoidApiError);

      const err = await oauth
        .handleCallback({ code: 'x', state: 's', tenantId: 't1' })
        .catch((e) => e);
      expect(err).toBeInstanceOf(FakturoidApiError);
      expect((err as FakturoidApiError).message).toContain('expired');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('ensureValidTokens returns null when no tokens', async () => {
    const tokenStore: FakturoidTokenStore = {
      getTokens: mock(() => Promise.resolve(null)),
      saveTokens: mock(() => Promise.resolve()),
      deleteTokens: mock(() => Promise.resolve()),
    };
    const oauth = new OAuthService(config, tokenStore);
    const result = await oauth.ensureValidTokens('tenant-1');
    expect(result).toBeNull();
  });

  test('ensureValidTokens returns existing tokens when not expired', async () => {
    const tokens = {
      accessToken: 'at',
      refreshToken: 'rt',
      expiresAt: Date.now() + 120_000,
      fakturoidSlug: 'acme',
    };
    const tokenStore: FakturoidTokenStore = {
      getTokens: mock(() => Promise.resolve(tokens)),
      saveTokens: mock(() => Promise.resolve()),
      deleteTokens: mock(() => Promise.resolve()),
    };
    const oauth = new OAuthService(config, tokenStore);
    const result = await oauth.ensureValidTokens('tenant-1');
    expect(result).toEqual(tokens);
  });

  test('ensureValidTokens when expired calls refresh and returns new tokens', async () => {
    const expiredTokens = {
      accessToken: 'old-at',
      refreshToken: 'rt',
      expiresAt: Date.now() - 1000,
      fakturoidSlug: 'acme' as const,
    };
    const refreshResponse = {
      access_token: 'new-at',
      refresh_token: 'new-rt',
      expires_in: 7200,
    };
    const fetchMock = mock((url: string | URL) => {
      const path = String(url);
      if (path.includes('/oauth/token')) {
        return Promise.resolve(new Response(JSON.stringify(refreshResponse), { status: 200 }));
      }
      return Promise.resolve(new Response('{}', { status: 404 }));
    });

    const saved: Array<{ tenantId: string; tokens: FakturoidTokens }> = [];
    const tokenStore: FakturoidTokenStore = {
      getTokens: mock(async (tenantId: string) => {
        const entry = saved.find((s) => s.tenantId === tenantId);
        return entry ? entry.tokens : expiredTokens;
      }),
      saveTokens: mock(async (tenantId: string, tokens: FakturoidTokens) => {
        const i = saved.findIndex((s) => s.tenantId === tenantId);
        if (i >= 0) saved[i] = { tenantId, tokens };
        else saved.push({ tenantId, tokens });
      }),
      deleteTokens: mock(() => Promise.resolve()),
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const oauth = new OAuthService(config, tokenStore);
      const result = await oauth.ensureValidTokens('tenant-1');
      expect(result).not.toBeNull();
      expect(result?.accessToken).toBe('new-at');
      expect(result?.refreshToken).toBe('new-rt');
      expect(result?.fakturoidSlug).toBe('acme');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(tokenStore.saveTokens).toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
