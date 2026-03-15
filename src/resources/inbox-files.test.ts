import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';
import { InboxFilesResource } from './inbox-files';

describe('InboxFilesResource', () => {
  test('list builds path with optional page', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { path: string; query?: URLSearchParams }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/inbox_files.json');
      expect(opts.query?.get('page')).toBe('3');
      return Promise.resolve([]);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InboxFilesResource(http, getAuth);

    await resource.list({ page: 3 });
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('create builds POST path and sends attachment', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string; body?: unknown }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/inbox_files.json');
      expect((opts.body as { attachment: string }).attachment).toBe('base64data');
      return Promise.resolve({ id: 1, filename: 'doc.pdf', created_at: '2024-01-01' });
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InboxFilesResource(http, getAuth);

    const result = await resource.create({ attachment: 'base64data' });
    expect(result.id).toBe(1);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('download uses requestRaw', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const buf = new ArrayBuffer(8);
    const requestRawMock = mock((opts: { path: string }) => {
      expect(opts.path).toBe('/api/v3/accounts/s/inbox_files/3/download');
      return Promise.resolve({
        status: 200,
        arrayBuffer: () => Promise.resolve(buf),
      } as Response);
    });

    const http = { requestRaw: requestRawMock } as unknown as HttpClient;
    const resource = new InboxFilesResource(http, getAuth);

    const result = await resource.download(3);
    expect(result).toBe(buf);
    expect(requestRawMock).toHaveBeenCalledTimes(1);
  });

  test('sendToOcr builds POST path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('POST');
      expect(opts.path).toBe('/api/v3/accounts/s/inbox_files/5/send_to_ocr.json');
      return Promise.resolve(undefined);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InboxFilesResource(http, getAuth);

    await resource.sendToOcr(5);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('delete builds DELETE path', async () => {
    const getAuth = mock(
      (): Promise<FakturoidAuth> => Promise.resolve({ accessToken: 't', slug: 's' }),
    );
    const requestMock = mock((opts: { method: string; path: string }) => {
      expect(opts.method).toBe('DELETE');
      expect(opts.path).toBe('/api/v3/accounts/s/inbox_files/7.json');
      return Promise.resolve(undefined);
    });

    const http = { request: requestMock } as unknown as HttpClient;
    const resource = new InboxFilesResource(http, getAuth);

    await resource.delete(7);
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
