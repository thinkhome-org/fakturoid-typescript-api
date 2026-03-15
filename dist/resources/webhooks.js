import { paginateAll } from '../types/common';
export class WebhooksResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    async list(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = options.page != null
            ? new URLSearchParams({ page: String(options.page) })
            : undefined;
        return this.http.request({
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
    async getFailedDeliveries(failedDeliveriesUuid) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/webhooks/${failedDeliveriesUuid}/failed_deliveries.json`,
            accessToken,
        });
    }
    async get(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/webhooks/${id}.json`,
            accessToken,
        });
    }
    async create(data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/webhooks.json`,
            accessToken,
            body: data,
        });
    }
    async update(id, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/webhooks/${id}.json`,
            accessToken,
            body: data,
        });
    }
    async delete(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/webhooks/${id}.json`,
            accessToken,
        });
    }
    /**
     * Async generator that iterates through all pages of webhooks.
     * Yields individual webhooks. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
}
//# sourceMappingURL=webhooks.js.map