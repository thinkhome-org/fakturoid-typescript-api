import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
export type InventoryMoveDocumentType = 'Estimate' | 'Expense' | 'ExpenseGenerator' | 'Generator' | 'Invoice';
export interface InventoryMoveDocument {
    id: number;
    type: InventoryMoveDocumentType;
    line_id: number;
}
/**
 * Inventory move as returned by Fakturoid API v3.
 * Decimal fields (quantity_change, prices) are returned as strings by the API.
 * @see https://www.fakturoid.cz/api/v3/inventory-moves
 */
export interface InventoryMove {
    id: number;
    direction: 'in' | 'out';
    moved_on: DateString;
    quantity_change: string;
    purchase_price: string;
    purchase_currency?: string | null;
    native_purchase_price?: string | null;
    retail_price?: string | null;
    retail_currency?: string | null;
    native_retail_price?: string | null;
    private_note?: string | null;
    inventory_item_id: number;
    document?: InventoryMoveDocument | null;
    created_at?: DateString;
    updated_at?: DateString;
    [key: string]: unknown;
}
/**
 * Payload for creating an inventory move.
 * @see https://www.fakturoid.cz/api/v3/inventory-moves#create-inventory-move
 */
export interface NewInventoryMove {
    direction: 'in' | 'out';
    moved_on: DateString;
    quantity_change: string | number;
    purchase_price: string | number;
    purchase_currency?: string;
    retail_price?: string | number;
    retail_currency?: string;
    native_purchase_price?: string | number;
    native_retail_price?: string | number;
    private_note?: string;
    [key: string]: unknown;
}
export type UpdateInventoryMove = Partial<NewInventoryMove>;
export interface ListInventoryMovesOptions extends PaginationOptions {
    since?: DateString;
    until?: DateString;
    updated_since?: DateString;
    updated_until?: DateString;
    inventory_item_id?: number;
}
export declare class InventoryMovesResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    /**
     * Lists inventory moves (flat endpoint, supports filtering by inventory_item_id).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#inventory-moves-index
     */
    list(options?: ListInventoryMovesOptions): Promise<InventoryMove[]>;
    /**
     * Gets a single inventory move detail (nested under inventory item).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#inventory-move-detail
     */
    get(inventoryItemId: number, id: number): Promise<InventoryMove>;
    /**
     * Creates an inventory move for the given inventory item.
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#create-inventory-move
     */
    create(inventoryItemId: number, data: NewInventoryMove): Promise<InventoryMove>;
    /**
     * Updates an inventory move (cannot update moves assigned to documents).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#update-inventory-move
     */
    update(inventoryItemId: number, id: number, data: UpdateInventoryMove): Promise<InventoryMove>;
    /**
     * Deletes an inventory move (cannot delete moves assigned to documents).
     * @see https://www.fakturoid.cz/api/v3/inventory-moves#delete-inventory-move
     */
    delete(inventoryItemId: number, id: number): Promise<void>;
    /**
     * Async generator that iterates through all pages of inventory moves.
     * Yields individual inventory moves. Use with `for await...of`.
     */
    listAll(options?: Omit<ListInventoryMovesOptions, 'page'>): AsyncGenerator<InventoryMove, void, undefined>;
}
//# sourceMappingURL=inventory-moves.d.ts.map