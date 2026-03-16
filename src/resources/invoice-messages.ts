import type { HttpClient } from '../http/http-client';
import type { FakturoidAuth } from '../types/common';

/**
 * Payload for sending invoice by email. Matches Fakturoid API v3 message.json attributes.
 * @see https://www.fakturoid.cz/api/v3/invoice-messages
 */
export interface SendInvoiceEmailPayload {
  /** Email subject. Default: from account settings. */
  subject?: string;
  /** Recipient email. Default: from invoice subject. */
  email?: string;
  /** Copy recipient. Default: from invoice subject. */
  email_copy?: string;
  /** Email body. Default: from account settings. Supports variables (#no#, #link#, #vs#, etc.). */
  message?: string;
  /** Deliver immediately when outside delivery window. Default: false. */
  deliver_now?: boolean;
}

export class InvoiceMessagesResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async sendInvoiceByEmail(
    invoiceId: number,
    payload: SendInvoiceEmailPayload = {}
  ): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/invoices/${invoiceId}/message.json`,
      accessToken,
      body: payload,
    });
  }
}
