import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { InvoicesResource } from './invoices';

describe('InvoicesResource', () => {
  test('list builds path with options', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/invoices.json');
      expect(opts.query?.get('document_type')).toBe('proforma');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    await resource.list({ document_type: 'proforma' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('get builds GET path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('GET');
      expect(opts.path).toBe('/api/v3/accounts/s/invoices/10.json');
      return Promise.resolve({ id: 10 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    await resource.get(10);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('create builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/invoices.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    await resource.create({ subject_id: 1 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('update builds PATCH path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body: any }) => {
      expect(opts.method).toBe('PATCH');
      expect(opts.path).toBe('/api/v3/accounts/s/invoices/11.json');
      return Promise.resolve({ id: 11 });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    await resource.update(11, { note: 'Hello' });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('delete builds DELETE path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('DELETE');
      expect(opts.path).toBe('/api/v3/accounts/s/invoices/11.json');
      return Promise.resolve();
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    await resource.delete(11);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('fireEvent builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; query?: URLSearchParams }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/invoices/11/fire.json');
      expect(opts.query?.get('event')).toBe('lock');
      return Promise.resolve();
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    await resource.fireEvent(11, 'lock');
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('downloadPdf builds GET path and returns arrayBuffer', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestRawMock = mock((opts: { path: string }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/invoices/11/download.pdf');
      return Promise.resolve({ status: 200, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
    });

    const http = { requestRaw: requestRawMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    const buf = await resource.downloadPdf(11);
    expect(buf).toBeInstanceOf(ArrayBuffer);
  });

  test('downloadPdf returns null on 204', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestRawMock = mock((opts: { path: string }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/invoices/11/download.pdf');
      return Promise.resolve({ status: 204 });
    });

    const http = { requestRaw: requestRawMock } as unknown as HttpClient;
    const resource = new InvoicesResource(http, getAuth);

    const buf = await resource.downloadPdf(11);
    expect(buf).toBeNull();
  });
});
