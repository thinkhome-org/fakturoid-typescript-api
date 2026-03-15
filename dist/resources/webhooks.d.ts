import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
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
export interface ListWebhooksOptions extends PaginationOptions {
}
export declare class WebhooksResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListWebhooksOptions): Promise<Webhook[]>;
    /**
     * Gets failed delivery details for a webhook by its failed_deliveries_uuid.
     * Returns an array of webhook events that failed to be delivered.
     * @see https://www.fakturoid.cz/api/v3/webhooks#failed-webhook-deliveries
     */
    getFailedDeliveries(failedDeliveriesUuid: string): Promise<WebhookFailedDelivery[]>;
    get(id: number): Promise<Webhook>;
    create(data: NewWebhook): Promise<Webhook>;
    update(id: number, data: UpdateWebhook): Promise<Webhook>;
    delete(id: number): Promise<void>;
    /**
     * Async generator that iterates through all pages of webhooks.
     * Yields individual webhooks. Use with `for await...of`.
     */
    listAll(options?: Omit<ListWebhooksOptions, 'page'>): AsyncGenerator<Webhook, void, undefined>;
}
//# sourceMappingURL=webhooks.d.ts.map