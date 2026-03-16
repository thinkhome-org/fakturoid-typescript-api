import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { RecurringGeneratorsResource } from './recurring-generators';

describe('RecurringGeneratorsResource', () => {
  test('list builds path with optional filters', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators.json');
      expect(opts.query?.get('page')).toBe('2');
      expect(opts.query?.get('subject_id')).toBe('10');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    await resource.list({ page: 2, subject_id: 10 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('get builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators/10.json');
      return Promise.resolve({ id: 10 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    await resource.get(10);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('create builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    await resource.create({ name: 'Gen', subject_id: 1, start_date: '2024-01-01', months_period: 1 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('update builds PATCH path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators/11.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    await resource.update(11, { name: 'Gen2' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('delete builds DELETE path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('DELETE');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators/11.json');
      return Promise.resolve();
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    await resource.delete(11);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('pause builds PATCH path to pause.json and returns generator', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators/10/pause.json');
      return Promise.resolve({ id: 10, active: false });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    const result = await resource.pause(10);
    expect(result.id).toBe(10);
    expect(result.active).toBe(false);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('activate builds PATCH path to activate.json and sends body', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body?: any }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/recurring_generators/10/activate.json');
      expect(opts.body).toEqual({ next_occurrence_on: '2025-01-01' });
      return Promise.resolve({ id: 10, active: true });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new RecurringGeneratorsResource(http, getAuth);

    const result = await resource.activate(10, { next_occurrence_on: '2025-01-01' });
    expect(result.id).toBe(10);
    expect(result.active).toBe(true);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
