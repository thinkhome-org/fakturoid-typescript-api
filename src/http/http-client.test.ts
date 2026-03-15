import { describe, expect, mock, test } from 'bun:test';
import { FakturoidApiError } from '../types/common';
import { HttpClient } from './http-client';

describe('HttpClient', () => {
  const baseUrl = 'https://app.fakturoid.cz';
  const userAgent = 'TestAgent (test@example.com)';
  const accessToken = 'test-token';

  test('builds URL and sends correct headers', async () => {
    const fetchMock = mock((url: string | URL, init?: RequestInit) => {
      expect(String(url)).toBe(`${baseUrl}/api/v3/accounts/myslug/subjects.json`);
      expect(init?.method).toBe('GET');
      expect(init?.headers).toBeDefined();
      const headers = (init?.headers ?? {}) as Record<string, string>;
      expect(headers['User-Agent']).toBe(userAgent);
      expect(headers.Accept).toBe('application/json');
      expect(headers.Authorization).toBe(`Bearer ${accessToken}`);
      expect(headers['Content-Type']).toBeUndefined();
      return Promise.resolve(
        new Response(JSON.stringify([{ id: 1, name: 'Foo' }]), { status: 200 })
      );
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      const result = await client.request<Array<{ id: number; name: string }>>({
        method: 'GET',
        path: '/api/v3/accounts/myslug/subjects.json',
        accessToken,
      });
      expect(result).toEqual([{ id: 1, name: 'Foo' }]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('appends query params', async () => {
    const fetchMock = mock((url: string | URL) => {
      const u = new URL(String(url));
      expect(u.searchParams.get('page')).toBe('2');
      expect(u.searchParams.get('since')).toBe('2024-01-01');
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      const query = new URLSearchParams();
      query.set('page', '2');
      query.set('since', '2024-01-01');
      await client.request({
        method: 'GET',
        path: '/api/v3/accounts/slug/subjects.json',
        accessToken,
        query,
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('sends JSON body for POST', async () => {
    const fetchMock = mock((_url: string | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ name: 'New Subject' }));
      return Promise.resolve(
        new Response(JSON.stringify({ id: 42, name: 'New Subject' }), { status: 201 })
      );
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      await client.request({
        method: 'POST',
        path: '/api/v3/accounts/slug/subjects.json',
        accessToken,
        body: { name: 'New Subject' },
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('returns undefined for 204 No Content', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response(undefined, { status: 204 })));

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      const result = await client.request<undefined>({
        method: 'DELETE',
        path: '/api/v3/accounts/slug/subjects/1.json',
        accessToken,
      });
      expect(result).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('throws FakturoidApiError with error_description message', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: 'invalid_request',
            error_description: 'Required header User-Agent is missing',
          }),
          { status: 400 }
        )
      )
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      await expect(
        client.request({
          method: 'GET',
          path: '/api/v3/accounts/slug/subjects.json',
          accessToken,
        })
      ).rejects.toThrow(FakturoidApiError);

      const err = await client.request({ method: 'GET', path: '/x', accessToken }).catch((e) => e);
      expect(err).toBeInstanceOf(FakturoidApiError);
      expect((err as FakturoidApiError).status).toBe(400);
      expect((err as FakturoidApiError).message).toContain('User-Agent');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('retries on 429 and uses X-RateLimit t for delay then succeeds', async () => {
    let callCount = 0;
    const fetchMock = mock((_url: string | URL, _init?: RequestInit) => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: 'rate_limited' }), {
            status: 429,
            headers: { 'X-RateLimit': 'default;r=0;t=1' },
          })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify([{ id: 1, name: 'Ok' }]), { status: 200 })
      );
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      const result = await client.request<Array<{ id: number; name: string }>>({
        method: 'GET',
        path: '/api/v3/accounts/slug/subjects.json',
        accessToken,
      });
      expect(result).toEqual([{ id: 1, name: 'Ok' }]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('throws FakturoidApiError with errors object for 422', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            errors: { name: ["can't be blank"] },
          }),
          { status: 422 }
        )
      )
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      try {
        await client.request({
          method: 'POST',
          path: '/api/v3/accounts/slug/subjects.json',
          accessToken,
          body: {},
        });
      } catch (e) {
        expect(e).toBeInstanceOf(FakturoidApiError);
        expect((e as FakturoidApiError).status).toBe(422);
        expect((e as FakturoidApiError).details?.errors).toEqual({ name: ["can't be blank"] });
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('throws FakturoidApiError 408 when fetch aborts (timeout)', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () => Promise.reject(abortError);

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      const err = await client
        .request({
          method: 'GET',
          path: '/api/v3/accounts/slug/subjects.json',
          accessToken,
        })
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(FakturoidApiError);
      expect((err as FakturoidApiError).status).toBe(408);
      expect((err as FakturoidApiError).message).toContain('timed out');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('after max retries on 429 throws FakturoidApiError with 429', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'rate_limited' }), {
          status: 429,
          headers: { 'X-RateLimit': 'default;r=0;t=0' },
        })
      )
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const client = new HttpClient({ baseUrl, userAgent });
      const err = await client
        .request({
          method: 'GET',
          path: '/api/v3/accounts/slug/subjects.json',
          accessToken,
        })
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(FakturoidApiError);
      expect((err as FakturoidApiError).status).toBe(429);
      expect(fetchMock).toHaveBeenCalledTimes(4);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
