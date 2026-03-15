import { paginateAll } from '../types/common';
export class SubjectsResource {
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
        if (options.custom_id != null)
            query.set('custom_id', options.custom_id);
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/subjects.json`,
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
            path: `/api/v3/accounts/${slug}/subjects/search.json`,
            accessToken,
            query,
        });
    }
    async get(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/subjects/${id}.json`,
            accessToken,
        });
    }
    async create(data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/subjects.json`,
            accessToken,
            body: data,
        });
    }
    async update(id, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/subjects/${id}.json`,
            accessToken,
            body: data,
        });
    }
    async delete(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/subjects/${id}.json`,
            accessToken,
        });
    }
    /**
     * Async generator that iterates through all pages of subjects.
     * Yields individual subjects. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
}
//# sourceMappingURL=subjects.js.map