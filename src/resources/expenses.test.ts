import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { ExpensesResource } from './expenses';

describe('ExpensesResource', () => {
  test('list builds path with slug and optional query params', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 'tok', slug: 'acme' })
    );
    const requestMock = mock(
      (opts: { method: string; path: string; accessToken: string; query?: URLSearchParams }) => {
        expect(opts.path).toBe('/api/v3/accounts/acme/expenses.json');
        expect(opts.method).toBe('GET');
        expect(opts.query?.get('page')).toBe('2');
        expect(opts.query?.get('subject_id')).toBe('10');
        expect(opts.query?.get('variable_symbol')).toBe('2024001');
        expect(opts.query?.has('until')).toBe(false);
        expect(opts.query?.has('document_type')).toBe(false);
        return Promise.resolve([]);
      }
    );

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new ExpensesResource(http, getAuth);

    await resource.list({ page: 2, subject_id: 10, variable_symbol: '2024001' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('search builds search path with query and tags', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { path: string; query?: URLSearchParams }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/expenses/search.json');
      expect(opts.query?.get('query')).toBe('fuel');
      expect(opts.query?.get('tags')).toBe('a,b');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new ExpensesResource(http, getAuth);

    await resource.search({ query: 'fuel', tags: ['a', 'b'] });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('fireEvent builds POST path with event query (lock)', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/expenses/1/fire.json');
      expect(opts.query?.get('event')).toBe('lock');
      return Promise.resolve(undefined);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new ExpensesResource(http, getAuth);

    await resource.fireEvent(1, 'lock');
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('fireEvent supports unlock', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { query?: URLSearchParams }) => {
      expect(opts.query?.get('event')).toBe('unlock');
      return Promise.resolve(undefined);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new ExpensesResource(http, getAuth);

    await resource.fireEvent(2, 'unlock');
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('downloadAttachment builds correct path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestRawMock = mock((opts: { path: string }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/expenses/10/attachments/20/download');
      return Promise.resolve({
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      } as Response);
    });

    const http = { requestRaw: requestRawMock } as unknown as HttpClient;
    const resource = new ExpensesResource(http, getAuth);

    await resource.downloadAttachment(10, 20);
    expect(requestRawMock).toHaveBeenCalledTimes(1);
  });
});
