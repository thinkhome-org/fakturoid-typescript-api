import { paginateAll } from '../types/common';
export class ExpensesResource {
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
        if (options.updated_since)
            query.set('updated_since', options.updated_since);
        if (options.subject_id != null)
            query.set('subject_id', String(options.subject_id));
        if (options.custom_id)
            query.set('custom_id', options.custom_id);
        if (options.number)
            query.set('number', options.number);
        if (options.variable_symbol)
            query.set('variable_symbol', options.variable_symbol);
        if (options.status)
            query.set('status', options.status);
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/expenses.json`,
            accessToken,
            query,
        });
    }
    /**
     * Fulltext search across expenses.
     * @see https://www.fakturoid.cz/api/v3/expenses
     */
    async search(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams();
        if (options.query)
            query.set('query', options.query);
        if (options.tags?.length)
            query.set('tags', options.tags.join(','));
        if (options.page != null)
            query.set('page', String(options.page));
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/expenses/search.json`,
            accessToken,
            query,
        });
    }
    async get(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/expenses/${id}.json`,
            accessToken,
        });
    }
    async create(data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/expenses.json`,
            accessToken,
            body: data,
        });
    }
    async update(id, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/expenses/${id}.json`,
            accessToken,
            body: data,
        });
    }
    async delete(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/expenses/${id}.json`,
            accessToken,
        });
    }
    /**
     * Fire an expense action event (lock or unlock).
     * @see https://www.fakturoid.cz/api/v3/expenses
     */
    async fireEvent(id, event) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams({ event });
        await this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/expenses/${id}/fire.json`,
            accessToken,
            query,
        });
    }
    /**
     * Downloads an expense attachment by ID.
     * Returns `null` if attachment is not available yet (204 No Content).
     * @see https://www.fakturoid.cz/api/v3/expenses
     */
    async downloadAttachment(expenseId, attachmentId) {
        const { accessToken, slug } = await this.getAuth();
        const response = await this.http.requestRaw({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/expenses/${expenseId}/attachments/${attachmentId}/download`,
            accessToken,
        });
        if (response.status === 204)
            return null;
        return response.arrayBuffer();
    }
    /**
     * Async generator that iterates through all pages of expenses.
     * Yields individual expenses. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
}
//# sourceMappingURL=expenses.js.map