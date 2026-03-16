import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { TodosResource } from './todos';

describe('TodosResource', () => {
  test('list builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/todos.json');
      expect(opts.query?.get('page')).toBe('1');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new TodosResource(http, getAuth);

    await resource.list({ page: 1 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('toggleCompletion builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/todos/15/toggle_completion.json');
      return Promise.resolve({ id: 15 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new TodosResource(http, getAuth);

    await resource.toggleCompletion(15);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
