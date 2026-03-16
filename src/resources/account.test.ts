import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { AccountResource } from './account';

describe('AccountResource', () => {
  test('getAccountInfo builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/account.json');
      return Promise.resolve({ name: 'Test Account' });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new AccountResource(http, getAuth);

    const result = await resource.getAccountInfo();
    expect(result.name).toBe('Test Account');
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
