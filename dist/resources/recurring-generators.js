import { paginateAll } from '../types/common';
export class RecurringGeneratorsResource {
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
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/recurring_generators.json`,
            accessToken,
            query,
        });
    }
    async get(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/recurring_generators/${id}.json`,
            accessToken,
        });
    }
    async create(data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/recurring_generators.json`,
            accessToken,
            body: data,
        });
    }
    async update(id, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/recurring_generators/${id}.json`,
            accessToken,
            body: data,
        });
    }
    async delete(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/recurring_generators/${id}.json`,
            accessToken,
        });
    }
    /**
     * Pauses a recurring generator.
     * @see https://www.fakturoid.cz/api/v3/recurring-generators
     */
    async pause(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/recurring_generators/${id}/pause.json`,
            accessToken,
        });
    }
    /**
     * Activates a paused recurring generator.
     * The API accepts a JSON body with `next_occurrence_on`.
     * @see https://www.fakturoid.cz/api/v3/recurring-generators
     */
    async activate(id, data = {}) {
        const { accessToken, slug } = await this.getAuth();
        const body = Object.keys(data).length > 0 ? data : undefined;
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/recurring_generators/${id}/activate.json`,
            accessToken,
            body,
        });
    }
    /**
     * Async generator that iterates through all pages of recurring generators.
     * Yields individual recurring generators. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
}
//# sourceMappingURL=recurring-generators.js.map