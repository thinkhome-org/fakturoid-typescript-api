export class FakturoidApiError extends Error {
    status;
    details;
    constructor(status, message, details) {
        super(message);
        this.name = 'FakturoidApiError';
        this.status = status;
        this.details = details;
    }
}
const FAKTUROID_PAGE_SIZE = 40;
/**
 * Async generator that iterates through all pages of a paginated Fakturoid API endpoint.
 * Yields items one by one. Stops when a page returns fewer than 40 items.
 *
 * @param fetchPage - Async function that fetches a single page (1-indexed).
 * @returns AsyncGenerator yielding individual items from all pages.
 */
export async function* paginateAll(fetchPage) {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        const items = await fetchPage(page);
        for (const item of items) {
            yield item;
        }
        hasMore = items.length >= FAKTUROID_PAGE_SIZE;
        page += 1;
    }
}
//# sourceMappingURL=common.js.map