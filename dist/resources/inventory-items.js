import { paginateAll } from '../types/common';
export class InventoryItemsResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    async list(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams();
        if (options.page != null)
            query.set('page', String(options.page));
        if (options.since)
            query.set('since', options.since);
        if (options.until)
            query.set('until', options.until);
        if (options.updated_since)
            query.set('updated_since', options.updated_since);
        if (options.updated_until)
            query.set('updated_until', options.updated_until);
        if (options.article_number)
            query.set('article_number', options.article_number);
        if (options.sku)
            query.set('sku', options.sku);
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inventory_items.json`,
            accessToken,
            query,
        });
    }
    async get(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inventory_items/${id}.json`,
            accessToken,
        });
    }
    async create(data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/inventory_items.json`,
            accessToken,
            body: data,
        });
    }
    async update(id, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/inventory_items/${id}.json`,
            accessToken,
            body: data,
        });
    }
    async delete(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/inventory_items/${id}.json`,
            accessToken,
        });
    }
    async listArchived(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams();
        if (options.page != null)
            query.set('page', String(options.page));
        if (options.since)
            query.set('since', options.since);
        if (options.until)
            query.set('until', options.until);
        if (options.updated_since)
            query.set('updated_since', options.updated_since);
        if (options.updated_until)
            query.set('updated_until', options.updated_until);
        if (options.article_number)
            query.set('article_number', options.article_number);
        if (options.sku)
            query.set('sku', options.sku);
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inventory_items/archived.json`,
            accessToken,
            query,
        });
    }
    async listLowQuantity(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams();
        if (options.page != null)
            query.set('page', String(options.page));
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inventory_items/low_quantity.json`,
            accessToken,
            query,
        });
    }
    async search(queryParam, page) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams();
        query.set('query', queryParam);
        if (page != null)
            query.set('page', String(page));
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inventory_items/search.json`,
            accessToken,
            query,
        });
    }
    async archive(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/inventory_items/${id}/archive.json`,
            accessToken,
        });
    }
    async unarchive(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/inventory_items/${id}/unarchive.json`,
            accessToken,
        });
    }
    /**
     * Async generator that iterates through all pages of inventory items.
     * Yields individual inventory items. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
    /**
     * Async generator that iterates through all pages of archived inventory items.
     * Yields individual inventory items. Use with `for await...of`.
     */
    listAllArchived(options = {}) {
        return paginateAll((page) => this.listArchived({ ...options, page }));
    }
}
//# sourceMappingURL=inventory-items.js.map