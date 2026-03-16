import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
import { paginateAll } from '../types/common';

/**
 * Inbox file as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3/inbox-files
 */
export interface InboxFile {
  id: number;
  filename: string;
  bytesize: number;
  send_to_ocr: boolean;
  sent_to_ocr_at: DateString | null;
  ocr_status:
    | 'created'
    | 'processing'
    | 'processing_failed'
    | 'processing_rejected'
    | 'processed'
    | null;
  ocr_completed_at: DateString | null;
  download_url: string;
  created_at: DateString;
  updated_at: DateString;
  [key: string]: unknown;
}

/**
 * Payload for uploading a file to inbox (Base64-encoded Data URI content).
 * @see https://www.fakturoid.cz/api/v3/inbox-files#create-inbox-file
 */
export interface NewInboxFile {
  /** Base64-encoded file content as Data URI (e.g. "data:application/pdf;base64,..."). */
  attachment: string;
  /** Optional file name. If not provided, derived from MIME type. */
  filename?: string;
  /** Send file to OCR for automatic processing. */
  send_to_ocr?: boolean;
  [key: string]: unknown;
}

export class InboxFilesResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  /**
   * Lists inbox files (paginated, 40 per page).
   * @see https://www.fakturoid.cz/api/v3/inbox-files#inbox-files-index
   */
  public async list(options: PaginationOptions = {}): Promise<InboxFile[]> {
    const { accessToken, slug } = await this.getAuth();
    const query =
      options.page != null ? new URLSearchParams({ page: String(options.page) }) : undefined;
    return this.http.request<InboxFile[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inbox_files.json`,
      accessToken,
      query,
    });
  }

  /**
   * Uploads a file to inbox (Base64-encoded attachment as Data URI).
   * @see https://www.fakturoid.cz/api/v3/inbox-files#create-inbox-file
   */
  public async create(data: NewInboxFile): Promise<InboxFile> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InboxFile>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/inbox_files.json`,
      accessToken,
      body: data,
    });
  }

  /**
   * Sends inbox file to OCR processing.
   * @see https://www.fakturoid.cz/api/v3/inbox-files#send-inbox-file-to-ocr
   */
  public async sendToOcr(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/inbox_files/${id}/send_to_ocr.json`,
      accessToken,
    });
  }

  /**
   * Downloads inbox file binary content.
   * @see https://www.fakturoid.cz/api/v3/inbox-files#download-inbox-file
   */
  public async download(id: number): Promise<ArrayBuffer> {
    const { accessToken, slug } = await this.getAuth();
    const response = await this.http.requestRaw({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inbox_files/${id}/download`,
      accessToken,
    });
    return response.arrayBuffer();
  }

  /**
   * Deletes an inbox file.
   * @see https://www.fakturoid.cz/api/v3/inbox-files#delete-inbox-file
   */
  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/inbox_files/${id}.json`,
      accessToken,
    });
  }

  /**
   * Async generator that iterates through all pages of inbox files.
   * Yields individual inbox files. Use with `for await...of`.
   */
  public listAll(): AsyncGenerator<InboxFile, void, undefined> {
    return paginateAll((page) => this.list({ page }));
  }
}
