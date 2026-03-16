import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
import { paginateAll } from '../types/common';

/**
 * Webhook as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3/webhooks
 */
export interface Webhook {
  id: number;
  failed_deliveries_uuid?: string;
  webhook_url: string;
  auth_header?: string;
  active: boolean;
  events: string[];
  url?: string;
  created_at?: DateString;
  updated_at?: DateString;
  [key: string]: unknown;
}

export interface NewWebhook {
  webhook_url: string;
  events: string[];
  active?: boolean;
  auth_header?: string;
  [field: string]: unknown;
}

export type UpdateWebhook = Partial<NewWebhook>;

/**
 * Single failed webhook delivery event as returned by the Failed Webhook Deliveries endpoint.
 * @see https://www.fakturoid.cz/api/v3/webhooks#failed-webhook-deliveries
 */
export interface WebhookFailedDelivery {
  id: number;
  event_name: string;
  idempotency_key: string;
  url: string;
  body: Record<string, unknown>;
  created_at: DateString;
  updated_at: DateString;
  deliveries: Array<{
    id: number;
    request_id?: string;
    response_status: string;
    response_content_type: string | null;
    response_body: string | null;
    started_at: DateString;
    finished_at: DateString;
    created_at: DateString;
  }>;
  [key: string]: unknown;
}

export interface ListWebhooksOptions extends PaginationOptions {}

export class WebhooksResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListWebhooksOptions = {}): Promise<Webhook[]> {
    const { accessToken, slug } = await this.getAuth();
    const query =
      options.page != null ? new URLSearchParams({ page: String(options.page) }) : undefined;
    return this.http.request<Webhook[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/webhooks.json`,
      accessToken,
      query,
    });
  }

  /**
   * Gets failed delivery details for a webhook by its failed_deliveries_uuid.
   * Returns an array of webhook events that failed to be delivered.
   * @see https://www.fakturoid.cz/api/v3/webhooks#failed-webhook-deliveries
   */
  public async getFailedDeliveries(failedDeliveriesUuid: string): Promise<WebhookFailedDelivery[]> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<WebhookFailedDelivery[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/webhooks/${failedDeliveriesUuid}/failed_deliveries.json`,
      accessToken,
    });
  }

  public async get(id: number): Promise<Webhook> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Webhook>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/webhooks/${id}.json`,
      accessToken,
    });
  }

  public async create(data: NewWebhook): Promise<Webhook> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Webhook>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/webhooks.json`,
      accessToken,
      body: data,
    });
  }

  public async update(id: number, data: UpdateWebhook): Promise<Webhook> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Webhook>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/webhooks/${id}.json`,
      accessToken,
      body: data,
    });
  }

  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/webhooks/${id}.json`,
      accessToken,
    });
  }

  /**
   * Async generator that iterates through all pages of webhooks.
   * Yields individual webhooks. Use with `for await...of`.
   */
  public listAll(
    options: Omit<ListWebhooksOptions, 'page'> = {}
  ): AsyncGenerator<Webhook, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
