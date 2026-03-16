import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { InvoicePaymentsResource } from './invoice-payments';

describe('InvoicePaymentsResource', () => {
  test('createTaxDocument builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe(
        '/api/v3/accounts/s/invoices/100/payments/200/create_tax_document.json'
      );
      return Promise.resolve({
        id: 200,
        amount: 100,
        paid_on: '2024-01-15',
      });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoicePaymentsResource(http, getAuth);

    const result = await resource.createTaxDocument(100, 200);
    expect(result.id).toBe(200);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
