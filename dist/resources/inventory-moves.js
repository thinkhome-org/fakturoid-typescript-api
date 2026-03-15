import { paginateAll } from '../types/common';
export class InventoryMovesResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    /**
     * Lists inventory moves (flat endpoint, supports filtering by inventory_item_id).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#inventory-moves-index
     */
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
        if (options.inventory_item_id != null)
            query.set('inventory_item_id', String(options.inventory_item_id));
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inventory_moves.json`,
            accessToken,
            query,
        });
    }
    /**
     * Gets a single inventory move detail (nested under inventory item).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#inventory-move-detail
     */
    async get(inventoryItemId, id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
            accessToken,
        });
    }
    /**
     * Creates an inventory move for the given inventory item.
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#create-inventory-move
     */
    async create(inventoryItemId, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/inventory_items/${inventoryItemId}/inventory_moves.json`,
            accessToken,
            body: data,
        });
    }
    /**
     * Updates an inventory move (cannot update moves assigned to documents).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#update-inventory-move
     */
    async update(inventoryItemId, id, data) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'PATCH',
            path: `/api/v3/accounts/${slug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
            accessToken,
            body: data,
        });
    }
    /**
     * Deletes an inventory move (cannot delete moves assigned to documents).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#delete-inventory-move
     */
    async delete(inventoryItemId, id) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
            accessToken,
        });
    }
    /**
     * Async generator that iterates through all pages of inventory moves.
     * Yields individual inventory moves. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
}
//# sourceMappingURL=inventory-moves.js.map