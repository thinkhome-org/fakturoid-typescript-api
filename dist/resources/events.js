import { paginateAll } from '../types/common';
export class EventsResource {
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
        if (options.subject_id != null)
            query.set('subject_id', String(options.subject_id));
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/events.json`,
            accessToken,
            query,
        });
    }
    /**
     * Lists paid events (invoice/expense paid notifications).
     * @see https://www.fakturoid.cz/api/v3/events
     */
    async listPaid(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams();
        if (options.page != null)
            query.set('page', String(options.page));
        if (options.since)
            query.set('since', options.since);
        if (options.subject_id != null)
            query.set('subject_id', String(options.subject_id));
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/events/paid.json`,
            accessToken,
            query,
        });
    }
    /**
     * Async generator that iterates through all pages of events.
     * Yields individual events. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
    /**
     * Async generator that iterates through all pages of paid events.
     * Yields individual events. Use with `for await...of`.
     */
    listAllPaid(options = {}) {
        return paginateAll((page) => this.listPaid({ ...options, page }));
    }
}
//# sourceMappingURL=events.js.map