import { paginateAll } from '../types/common';
export class InvoicesResource {
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
        if (options.subject_id != null)
            query.set('subject_id', String(options.subject_id));
        if (options.custom_id)
            query.set('custom_id', options.custom_id);
        if (options.number)
            query.set('number', options.number);
        if (options.status)
            query.set('status', options.status);
        if (options.document_type)
            query.set('document_type', options.document_type);
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/invoices.json`,
            accessToken,
            query,
        });
    }
    /**
     * Fulltext search across invoices.
     * Searches: number, variable_symbol, client_name, note, private_note, footer_note, lines.
     * @see https://www.fakturoid.cz/api/v3/invoices#fulltext-search
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
            path: `/api/v3/accounts/${slug}/invoices/search.json`,
            accessToken,
            query,
        });
    }
    async get(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/invoices/${id}.json`,
            accessToken,
        });
    }
    async create(data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/invoices.json`,
            accessToken,
            body: data,
        });
    }
    async update(id, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/invoices/${id}.json`,
            accessToken,
            body: data,
        });
    }
    async delete(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/invoices/${id}.json`,
            accessToken,
        });
    }
    /**
     * Fire an invoice action event (e.g. mark_as_sent, lock, cancel).
     * @see https://www.fakturoid.cz/api/v3/invoices#invoice-actions
     */
    async fireEvent(id, event) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams({ event });
        await this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/invoices/${id}/fire.json`,
            accessToken,
            query,
        });
    }
    /**
     * Downloads invoice PDF. Returns ArrayBuffer with PDF binary data.
     * Returns `null` if PDF is not ready yet (204 No Content).
     * @see https://www.fakturoid.cz/api/v3/invoices#download-invoice-pdf
     */
    async downloadPdf(id) {
        const { accessToken, slug } = await this.getAuth();
        const response = await this.http.requestRaw({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/invoices/${id}/download.pdf`,
            accessToken,
        });
        if (response.status === 204)
            return null;
        return response.arrayBuffer();
    }
    /**
     * Downloads an invoice attachment by ID.
     * Returns `null` if attachment is not available yet (204 No Content).
     * @see https://www.fakturoid.cz/api/v3/invoices#download-attachment
     */
    async downloadAttachment(invoiceId, attachmentId) {
        const { accessToken, slug } = await this.getAuth();
        const response = await this.http.requestRaw({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/invoices/${invoiceId}/attachments/${attachmentId}/download`,
            accessToken,
        });
        if (response.status === 204)
            return null;
        return response.arrayBuffer();
    }
    /**
     * Async generator that iterates through all pages of invoices.
     * Yields individual invoices. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
}
//# sourceMappingURL=invoices.js.map