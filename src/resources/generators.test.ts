import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { GeneratorsResource } from './generators';

describe('GeneratorsResource', () => {
  test('list builds path with optional filters', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/generators.json');
      expect(opts.query?.get('page')).toBe('2');
      expect(opts.query?.get('subject_id')).toBe('10');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new GeneratorsResource(http, getAuth);

    await resource.list({ page: 2, subject_id: 10 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('get builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/generators/10.json');
      return Promise.resolve({ id: 10 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new GeneratorsResource(http, getAuth);

    await resource.get(10);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('create builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/generators.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new GeneratorsResource(http, getAuth);

    await resource.create({ name: 'Gen', subject_id: 1 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('update builds PATCH path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/generators/11.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new GeneratorsResource(http, getAuth);

    await resource.update(11, { name: 'Gen2' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('delete builds DELETE path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('DELETE');
      expect(opts.path).toBe('/api/v3/accounts/s/generators/11.json');
      return Promise.resolve();
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new GeneratorsResource(http, getAuth);

    await resource.delete(11);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
