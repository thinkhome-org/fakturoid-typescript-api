/**
 * Integration tests against the real Fakturoid API.
 *
 * Two auth modes:
 * 1) Client Credentials: FAKTUROID_CLIENT_ID + FAKTUROID_CLIENT_SECRET from
 *    Settings → User account (Client Credentials). No refresh token.
 * 2) OAuth App + Refresh Token: FAKTUROID_OAUTH_CLIENT_ID + FAKTUROID_OAUTH_CLIENT_SECRET
 *    (from "Propojit další aplikace") and FAKTUROID_REFRESH_TOKEN. Optional fallback:
 *    FAKTUROID_CLIENT_ID + FAKTUROID_CLIENT_SECRET used as OAuth app if OAuth vars unset.
 *
 * Optional: FAKTUROID_SLUG (default testcompany1), FAKTUROID_REDIRECT_URI.
 */
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createFakturoidClient, FakturoidApiError } from '../../src';
import type { FakturoidTokenStore } from '../../src/auth/token-store';
import type { TenantResources } from '../../src/client/fakturoid-client';
import type { FakturoidTokens } from '../../src/types/common';

const INTEGRATION_TENANT_ID = 'integration-test-tenant';

const CLIENT_ID = process.env.FAKTUROID_CLIENT_ID;
const CLIENT_SECRET = process.env.FAKTUROID_CLIENT_SECRET;
const SLUG = process.env.FAKTUROID_SLUG ?? 'testcompany1';
const REFRESH_TOKEN = process.env.FAKTUROID_REFRESH_TOKEN ?? '';

const OAUTH_APP_CLIENT_ID = process.env.FAKTUROID_OAUTH_CLIENT_ID ?? CLIENT_ID ?? '';
const OAUTH_APP_CLIENT_SECRET =
  process.env.FAKTUROID_OAUTH_CLIENT_SECRET ?? CLIENT_SECRET ?? '';
const REDIRECT_URI =
  process.env.FAKTUROID_REDIRECT_URI ?? 'https://faktubot.thinkhome.org/auth/redirect';

const USER_AGENT = 'FaktuBot (admin@faktubot.thinkhome.org)';

/** True when we can run API tests: Client Credentials OR OAuth App + Refresh Token. */
const hasApiCredentials =
  Boolean(CLIENT_ID && CLIENT_SECRET) ||
  Boolean(REFRESH_TOKEN && OAUTH_APP_CLIENT_ID && OAUTH_APP_CLIENT_SECRET);

describe('Fakturoid API integration', () => {
  let storedTokens: FakturoidTokens | null = null;
  let tenant: TenantResources;

  const tokenStore: FakturoidTokenStore = {
    getTokens: async (tenantId: string) => {
      if (tenantId !== INTEGRATION_TENANT_ID) return null;
      return storedTokens;
    },
    saveTokens: async (tenantId: string, tokens: FakturoidTokens) => {
      if (tenantId === INTEGRATION_TENANT_ID) {
        storedTokens = tokens;
      }
    },
    deleteTokens: async () => {
      storedTokens = null;
    },
  };

  beforeAll(async () => {
    if (!hasApiCredentials) return;

    if (REFRESH_TOKEN && OAUTH_APP_CLIENT_ID && OAUTH_APP_CLIENT_SECRET) {
      const client = createFakturoidClient({
        config: {
          clientId: OAUTH_APP_CLIENT_ID,
          clientSecret: OAUTH_APP_CLIENT_SECRET,
          redirectUri: REDIRECT_URI,
          userAgent: USER_AGENT,
          environment: 'production',
        },
        tokenStore,
      });
      storedTokens = {
        accessToken: '',
        refreshToken: REFRESH_TOKEN,
        expiresAt: 0,
        fakturoidSlug: SLUG || undefined,
      };
      await tokenStore.saveTokens(INTEGRATION_TENANT_ID, storedTokens);
      tenant = client.forTenant(INTEGRATION_TENANT_ID);
    } else if (CLIENT_ID && CLIENT_SECRET) {
      const client = createFakturoidClient({
        config: {
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectUri: REDIRECT_URI,
          userAgent: USER_AGENT,
          environment: 'production',
        },
        tokenStore,
      });
      tenant = await client.connectWithClientCredentials(
        INTEGRATION_TENANT_ID,
        SLUG || undefined,
      );
    }
  });

  afterAll(() => {
    storedTokens = null;
  });

  test(
    'get account info',
    async () => {
      if (!hasApiCredentials) return;
      const account = await tenant.account.getAccountInfo();
      expect(account).toBeDefined();
      expect(typeof account.subdomain).toBe('string');
      expect(account.subdomain.length).toBeGreaterThan(0);
      if (SLUG) {
        expect(account.subdomain).toBe(SLUG);
      }
    },
    { timeout: 15_000 },
  );

  test(
    'list subjects returns array and validates shape (with seeded subject)',
    async () => {
      if (!hasApiCredentials) return;
      const created = await tenant.subjects.create({
        name: 'SDK Integration List Test Subject',
        type: 'customer',
      });
      try {
        const subjects = await tenant.subjects.list({ page: 1 });
        expect(Array.isArray(subjects)).toBe(true);
        expect(subjects.length).toBeGreaterThan(0);
        const found = subjects.find((s) => s.id === created.id);
        expect(found).toBeDefined();
        expect(typeof found?.id).toBe('number');
        expect(typeof found?.name).toBe('string');
      } finally {
        await tenant.subjects.delete(created.id);
      }
    },
    { timeout: 15_000 },
  );

  test(
    'list invoices (first page) and validate shape',
    async () => {
      if (!hasApiCredentials) return;
      const invoices = await tenant.invoices.list({ page: 1 });
      expect(Array.isArray(invoices)).toBe(true);
      for (const inv of invoices) {
        expect(typeof inv.id).toBe('number');
        expect(typeof inv.number).toBe('string');
      }
    },
    { timeout: 15_000 },
  );

  test(
    'get non-existent subject returns 404 FakturoidApiError',
    async () => {
      if (!hasApiCredentials) return;
      const nonExistentId = 999_999_999;
      const err = await tenant.subjects.get(nonExistentId).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(FakturoidApiError);
      expect((err as FakturoidApiError).status).toBe(404);
    },
    { timeout: 15_000 },
  );

  test(
    'subject CRUD: create, get, update, delete',
    async () => {
      if (!hasApiCredentials) return;
      const created = await tenant.subjects.create({
        name: 'SDK Integration Test Subject',
        type: 'customer',
      });
      expect(created.id).toBeDefined();
      expect(created.name).toBe('SDK Integration Test Subject');

      try {
        const fetched = await tenant.subjects.get(created.id);
        expect(fetched.id).toBe(created.id);
        expect(fetched.name).toBe(created.name);

        const updated = await tenant.subjects.update(created.id, {
          name: 'SDK Integration Test Updated',
        });
        expect(updated.name).toBe('SDK Integration Test Updated');
      } finally {
        await tenant.subjects.delete(created.id);
      }

      const getAfterDelete = await tenant.subjects
        .get(created.id)
        .catch((e: unknown) => e);
      expect(getAfterDelete).toBeInstanceOf(FakturoidApiError);
      expect((getAfterDelete as FakturoidApiError).status).toBe(404);
    },
    { timeout: 30_000 },
  );

  test(
    'list users for account',
    async () => {
      if (!hasApiCredentials) return;
      const users = await tenant.users.list();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      for (const u of users) {
        expect(typeof u.id).toBe('number');
        expect(typeof u.full_name).toBe('string');
      }
    },
    { timeout: 15_000 },
  );

  test(
    'list bank accounts',
    async () => {
      if (!hasApiCredentials) return;
      const bankAccounts = await tenant.bankAccounts.list();
      expect(Array.isArray(bankAccounts)).toBe(true);
    },
    { timeout: 15_000 },
  );

  test(
    'list events',
    async () => {
      if (!hasApiCredentials) return;
      const events = await tenant.events.list({ page: 1 });
      expect(Array.isArray(events)).toBe(true);
    },
    { timeout: 15_000 },
  );

  test(
    'list number formats',
    async () => {
      if (!hasApiCredentials) return;
      const formats = await tenant.numberFormats.list();
      expect(Array.isArray(formats)).toBe(true);
    },
    { timeout: 15_000 },
  );

  test(
    'expense CRUD: create, get, update, delete',
    async () => {
      if (!hasApiCredentials) return;
      const created = await tenant.expenses.create({
        total: 100,
        document_type: 'bill',
        issued_on: new Date().toISOString().slice(0, 10),
      });
      expect(created.id).toBeDefined();
      expect(Number(created.total)).toBe(100);

      try {
        const fetched = await tenant.expenses.get(created.id);
        expect(fetched.id).toBe(created.id);
        const updated = await tenant.expenses.update(created.id, { total: 200 });
        expect(Number(updated.total)).toBe(200);
      } finally {
        await tenant.expenses.delete(created.id);
      }

      const err = await tenant.expenses.get(created.id).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(FakturoidApiError);
      expect((err as FakturoidApiError).status).toBe(404);
    },
    { timeout: 30_000 },
  );

  test(
    'webhooks list and get',
    async () => {
      if (!hasApiCredentials) return;
      const webhooks = await tenant.webhooks.list();
      expect(Array.isArray(webhooks)).toBe(true);
      for (const w of webhooks) {
        expect(typeof w.id).toBe('number');
        expect(typeof w.webhook_url).toBe('string');
        const one = await tenant.webhooks.get(w.id);
        expect(one.id).toBe(w.id);
      }
    },
    { timeout: 15_000 },
  );

  test(
    'generators list and get',
    async () => {
      if (!hasApiCredentials) return;
      const generators = await tenant.generators.list({ page: 1 });
      expect(Array.isArray(generators)).toBe(true);
      for (const g of generators) {
        expect(typeof g.id).toBe('number');
        expect(typeof g.name).toBe('string');
        const one = await tenant.generators.get(g.id);
        expect(one.id).toBe(g.id);
      }
    },
    { timeout: 15_000 },
  );

  test(
    'invoice detail contains payments array (when invoice exists)',
    async () => {
      if (!hasApiCredentials) return;
      const invoices = await tenant.invoices.list({ page: 1 });
      if (invoices.length > 0) {
        const first = invoices[0];
        if (first) {
          const detail = await tenant.invoices.get(first.id);
          expect(detail.id).toBe(first.id);
          expect(detail).toHaveProperty('payments');
        }
      }
    },
    { timeout: 15_000 },
  );
});

describe('Fakturoid OAuth flow', () => {
  test('generates correct authorization URL with OAuth App credentials', () => {
    const tokenStore: FakturoidTokenStore = {
      getTokens: async () => null,
      saveTokens: async () => {},
      deleteTokens: async () => {},
    };

    const client = createFakturoidClient({
      config: {
        clientId: OAUTH_APP_CLIENT_ID,
        clientSecret: OAUTH_APP_CLIENT_SECRET,
        redirectUri: REDIRECT_URI,
        userAgent: USER_AGENT,
        environment: 'production',
      },
      tokenStore,
    });

    const state = 'test-state-abc123';
    const url = client.getAuthorizationUrl('test-tenant', state);

    expect(url.origin).toBe('https://app.fakturoid.cz');
    expect(url.pathname).toBe('/api/v3/oauth');
    expect(url.searchParams.get('client_id')).toBe(OAUTH_APP_CLIENT_ID);
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe(state);
  });
});
