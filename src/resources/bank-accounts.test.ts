import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { BankAccountsResource } from './bank-accounts';

describe('BankAccountsResource', () => {
  test('list builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/bank_accounts.json');
      return Promise.resolve([{ id: 1, name: 'Bank' }]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new BankAccountsResource(http, getAuth);

    const result = await resource.list();
    expect(result[0]?.id).toBe(1);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
