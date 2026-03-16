import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { InvoiceMessagesResource } from './invoice-messages';

describe('InvoiceMessagesResource', () => {
  test('sendInvoiceByEmail allows empty payload and uses message endpoint', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 'tok', slug: 'acme' })
    );
    const requestMock = mock((opts: { method: string; path: string; body?: unknown }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/acme/invoices/42/message.json');
      expect(opts.body).toEqual({});
      return Promise.resolve(undefined);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoiceMessagesResource(http, getAuth);

    await resource.sendInvoiceByEmail(42);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
