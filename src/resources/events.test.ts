import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { EventsResource } from './events';

describe('EventsResource', () => {
  test('list builds path with optional subject_id', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 'tok', slug: 'acme' }),
    );
    const requestMock = mock((opts: { path: string; query?: URLSearchParams }) => {
      expect(opts.path).toBe('/api/v3/accounts/acme/events.json');
      expect(opts.query?.get('subject_id')).toBe('42');
      expect(opts.query?.get('since')).toBe('2024-01-01');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new EventsResource(http, getAuth);

    await resource.list({ subject_id: 42, since: '2024-01-01' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('listPaid builds path to events/paid.json', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { path: string }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/events/paid.json');
      return Promise.resolve([{ name: 'invoice_paid', created_at: '2024-01-01', text: 'Invoice #1 paid' }]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new EventsResource(http, getAuth);

    const result = await resource.listPaid({ page: 1 });
    expect(result).toHaveLength(1);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
