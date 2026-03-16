import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { WebhooksResource } from './webhooks';

describe('WebhooksResource', () => {
  test('list builds path with optional page', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 'tok', slug: 'acme' })
    );
    const requestMock = mock((opts: { path: string; query?: URLSearchParams }) => {
      expect(opts.path).toBe('/api/v3/accounts/acme/webhooks.json');
      expect(opts.query?.get('page')).toBe('2');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new WebhooksResource(http, getAuth);

    await resource.list({ page: 2 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('getFailedDeliveries builds GET path with failed_deliveries_uuid', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const failedDeliveriesUuid = 'b3518e74-5c9f-4b26-a5e2-6a8021c94a77';
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe(
        `/api/v3/accounts/s/webhooks/${failedDeliveriesUuid}/failed_deliveries.json`
      );
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new WebhooksResource(http, getAuth);

    const result = await resource.getFailedDeliveries(failedDeliveriesUuid);
    expect(Array.isArray(result)).toBe(true);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
