import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { InventoryMovesResource } from './inventory-moves';

describe('InventoryMovesResource', () => {
  test('list builds path with options', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_moves.json');
      expect(opts.query?.get('inventory_item_id')).toBe('5');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryMovesResource(http, getAuth);

    await resource.list({ inventory_item_id: 5 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('get builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/1/inventory_moves/2.json');
      return Promise.resolve({ id: 2 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryMovesResource(http, getAuth);

    await resource.get(1, 2);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('create builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/1/inventory_moves.json');
      return Promise.resolve({ id: 2 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryMovesResource(http, getAuth);

    await resource.create(1, { direction: 'in', moved_on: '2025-01-01', quantity_change: 5, purchase_price: 100 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('update builds PATCH path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/1/inventory_moves/2.json');
      return Promise.resolve({ id: 2 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryMovesResource(http, getAuth);

    await resource.update(1, 2, { quantity_change: 10 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('delete builds DELETE path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('DELETE');
      expect(opts.path).toBe('/api/v3/accounts/s/inventory_items/1/inventory_moves/2.json');
      return Promise.resolve();
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InventoryMovesResource(http, getAuth);

    await resource.delete(1, 2);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
