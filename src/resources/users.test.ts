import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { UsersResource } from './users';

describe('UsersResource', () => {
  test('getCurrentUser builds GET path without slug', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/user.json');
      return Promise.resolve({ id: 1, full_name: 'John Doe' });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new UsersResource(http, getAuth);

    const result = await resource.getCurrentUser();
    expect(result.id).toBe(1);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('list builds GET path with slug', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/users.json');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new UsersResource(http, getAuth);

    await resource.list();
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
