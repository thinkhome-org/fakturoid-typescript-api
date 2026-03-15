import { paginateAll } from '../types/common';
export class InboxFilesResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    /**
     * Lists inbox files (paginated, 40 per page).
     * @see https://www.fakturoid.cz/api/v3/inbox-files#inbox-files-index
     */
    async list(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = options.page != null
            ? new URLSearchParams({ page: String(options.page) })
            : undefined;
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inbox_files.json`,
            accessToken,
            query,
        });
    }
    /**
     * Uploads a file to inbox (Base64-encoded attachment as Data URI).
     * @see https://www.fakturoid.cz/api/v3/inbox-files#create-inbox-file
     */
    async create(data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/inbox_files.json`,
            accessToken,
            body: data,
        });
    }
    /**
     * Sends inbox file to OCR processing.
     * @see https://www.fakturoid.cz/api/v3/inbox-files#send-inbox-file-to-ocr
     */
    async sendToOcr(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/inbox_files/${id}/send_to_ocr.json`,
            accessToken,
        });
    }
    /**
     * Downloads inbox file binary content.
     * @see https://www.fakturoid.cz/api/v3/inbox-files#download-inbox-file
     */
    async download(id) {
        const { accessToken, slug } = await this.getAuth();
        const response = await this.http.requestRaw({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inbox_files/${id}/download`,
            accessToken,
        });
        return response.arrayBuffer();
    }
    /**
     * Deletes an inbox file.
     * @see https://www.fakturoid.cz/api/v3/inbox-files#delete-inbox-file
     */
    async delete(id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/inbox_files/${id}.json`,
            accessToken,
        });
    }
    /**
     * Async generator that iterates through all pages of inbox files.
     * Yields individual inbox files. Use with `for await...of`.
     */
    listAll() {
        return paginateAll((page) => this.list({ page }));
    }
}
//# sourceMappingURL=inbox-files.js.map