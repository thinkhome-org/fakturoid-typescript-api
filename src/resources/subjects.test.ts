import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { SubjectsResource } from './subjects';

describe('SubjectsResource', () => {
  test('list builds path with slug and optional query params', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 'tok', slug: 'mycompany' })
    );
    const requestMock = mock(
      (_opts: { method: string; path: string; accessToken: string; query?: URLSearchParams }) => {
        expect(_opts.path).toBe('/api/v3/accounts/mycompany/subjects.json');
        expect(_opts.method).toBe('GET');
        expect(_opts.accessToken).toBe('tok');
        expect(_opts.query?.get('page')).toBe('1');
        return Promise.resolve([{ id: 1, name: 'Subject A' }]);
      }
    );

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new SubjectsResource(http, getAuth);

    const result = await resource.list({ page: 1 });
    expect(result).toEqual([{ id: 1, name: 'Subject A' }]);
    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('get builds path with slug and id', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 'tok', slug: 'acme' })
    );
    const requestMock = mock((opts: { path: string }) => {
      expect(opts.path).toBe('/api/v3/accounts/acme/subjects/42.json');
      return Promise.resolve({ id: 42, name: 'Acme' });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new SubjectsResource(http, getAuth);

    const result = await resource.get(42);
    expect(result).toEqual({ id: 42, name: 'Acme' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('search builds search path with query param', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { path: string; query?: URLSearchParams }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/subjects/search.json');
      expect(opts.query?.get('query')).toBe('Apple');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new SubjectsResource(http, getAuth);

    await resource.search('Apple');
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('create builds POST path and sends body', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { method: string; path: string; body?: unknown }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/subjects.json');
      expect(opts.body).toEqual({
        name: 'New Co',
        type: 'customer',
        webinvoice_history: 'recent',
      });
      return Promise.resolve({
        id: 10,
        name: 'New Co',
        type: 'customer',
        webinvoice_history: 'recent',
      });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new SubjectsResource(http, getAuth);
    const result = await resource.create({
      name: 'New Co',
      type: 'customer',
      webinvoice_history: 'recent',
    });
    expect(result.id).toBe(10);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('update builds PATCH path and sends body', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { method: string; path: string; body?: unknown }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/subjects/5.json');
      expect(opts.body).toEqual({ name: 'Updated Name' });
      return Promise.resolve({ id: 5, name: 'Updated Name' });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new SubjectsResource(http, getAuth);
    const result = await resource.update(5, { name: 'Updated Name' });
    expect(result.name).toBe('Updated Name');
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('delete builds DELETE path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' })
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('DELETE');
      expect(opts.path).toBe('/api/v3/accounts/s/subjects/7.json');
      return Promise.resolve(undefined);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new SubjectsResource(http, getAuth);
    await resource.delete(7);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
