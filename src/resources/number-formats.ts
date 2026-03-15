import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth } from '../types/common';

/**
 * Number format as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3/number-formats
 */
export interface NumberFormat {
  id: number;
  format: string;
  preview: string;
  default: boolean;
  created_at?: DateString;
  updated_at?: DateString;
  [key: string]: unknown;
}

/**
 * Document types that have number formats.
 * The current public API v3 documentation exposes only the invoices endpoint.
 * @see https://www.fakturoid.cz/api/v3/number-formats
 */
export type NumberFormatDocumentType = 'invoices';

export class NumberFormatsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  /**
   * Lists number formats for a given document type.
   * Only unarchived number formats are returned.
   * @see https://www.fakturoid.cz/api/v3/number-formats
   */
  public async list(documentType: NumberFormatDocumentType = 'invoices'): Promise<NumberFormat[]> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<NumberFormat[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/number_formats/${documentType}.json`,
      accessToken,
    });
  }
}
