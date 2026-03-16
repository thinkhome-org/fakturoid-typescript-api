import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { InventoryItemsResource } from './inventory-items';

describe('InventoryItemsResource', () => {
  test('list builds GET path with options', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items.json');
      expect(opts.query?.get('sku')).toBe('123');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryItemsResource(http, getAuth);

    await resource.list({ sku: '123' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('get builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/10.json');
      return Promise.resolve({ id: 10 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryItemsResource(http, getAuth);

    await resource.get(10);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('create builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryItemsResource(http, getAuth);

    await resource.create({ name: 'Item', native_retail_price: 100 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('update builds PATCH path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/11.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryItemsResource(http, getAuth);

    await resource.update(11, { name: 'Item2' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('delete builds DELETE path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('DELETE');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/11.json');
      return Promise.resolve();
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryItemsResource(http, getAuth);

    await resource.delete(11);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('archive builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/11/archive.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryItemsResource(http, getAuth);

    await resource.archive(11);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('unarchive builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/11/unarchive.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryItemsResource(http, getAuth);

    await resource.unarchive(11);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
