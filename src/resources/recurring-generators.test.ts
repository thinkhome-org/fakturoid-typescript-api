import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { RecurringGeneratorsResource } from './recurring-generators';

describe('RecurringGeneratorsResource', () => {
  test('list builds path with optional filters', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 'tok', slug: 'acme' }),
    );
    const requestMock = mock((opts: { path: string; query?: URLSearchParams }) => {
      expect(opts.path).toBe('/api/v3/accounts/acme/recurring_generators.json');
      expect(opts.query?.get('page')).toBe('2');
      expect(opts.query?.get('since')).toBe('2024-01-01');
      expect(opts.query?.get('updated_since')).toBe('2024-02-01');
      expect(opts.query?.get('subject_id')).toBe('5');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    await resource.list({
      page: 2,
      since: '2024-01-01',
      updated_since: '2024-02-01',
      subject_id: 5,
    });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('pause builds PATCH path to pause.json and returns generator', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators/42/pause.json');
      return Promise.resolve({ id: 42, active: false, next_occurrence_on: null, name: 'RG', total: '0' });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    const result = await resource.pause(42);
    expect(result.active).toBe(false);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('activate builds PATCH path to activate.json and sends body', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body?: unknown }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators/99/activate.json');
      expect(opts.body).toEqual({ next_occurrence_on: '2024-09-15' });
      return Promise.resolve({
        id: 99,
        active: true,
        next_occurrence_on: '2024-09-15',
        name: 'RG',
        total: '0',
      });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    const result = await resource.activate(99, { next_occurrence_on: '2024-09-15' });
    expect(result.active).toBe(true);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
