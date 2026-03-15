import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, MoneyAmount, PaginationOptions } from '../types/common';
export type InventoryItemArticleNumberType = 'ian' | 'ean' | 'isbn';
export type InventoryItemVatRate = 'standard' | 'reduced' | 'reduced2' | 'zero';
export type InventoryItemSupplyType = 'goods' | 'service';
export type InventoryItemSuggestFor = 'invoices' | 'expenses' | 'both';
export interface InventoryItemRetailPrice {
    id: number;
    currency: string;
    amount: MoneyAmount;
    created_at: DateString;
    updated_at: DateString;
    [key: string]: unknown;
}
export interface InventoryItemRetailPriceInput {
    id?: number;
    currency: string;
    amount: MoneyAmount;
    _destroy?: boolean;
    [key: string]: unknown;
}
/**
 * Inventory item as returned by Fakturoid API v3.
 * Decimal fields (quantity, prices) may be returned as strings by the API.
 * @see https://www.fakturoid.cz/api/v3/inventory-items
 */
export interface InventoryItem {
    id: number;
    name: string;
    sku?: string | null;
    article_number_type?: InventoryItemArticleNumberType | null;
    article_number?: string | null;
    unit_name?: string | null;
    track_quantity: boolean;
    /** Quantity in stock. API may return as string (e.g. "1998.0"). */
    quantity?: MoneyAmount;
    min_quantity?: MoneyAmount | null;
    max_quantity?: MoneyAmount | null;
    allow_below_zero?: boolean;
    low_quantity_date?: DateString | null;
    /** Unit purchase price without VAT in account currency. */
    native_purchase_price?: MoneyAmount | null;
    /** Unit retail price without VAT in account currency. */
    native_retail_price?: MoneyAmount | null;
    vat_rate?: InventoryItemVatRate | null;
    average_native_purchase_price?: MoneyAmount | null;
    supply_type?: InventoryItemSupplyType;
    archived: boolean;
    private_note?: string | null;
    suggest_for?: InventoryItemSuggestFor | null;
    created_at?: DateString;
    updated_at?: DateString;
    retail_prices?: InventoryItemRetailPrice[];
    [key: string]: unknown;
}
export interface ListInventoryItemsOptions extends PaginationOptions {
    since?: DateString;
    until?: DateString;
    updated_since?: DateString;
    updated_until?: DateString;
    article_number?: string;
    sku?: string;
}
/** Payload for creating an inventory item. */
export interface NewInventoryItem {
    name: string;
    sku?: string;
    article_number_type?: InventoryItemArticleNumberType;
    article_number?: string;
    unit_name?: string;
    track_quantity?: boolean;
    quantity?: MoneyAmount;
    min_quantity?: MoneyAmount;
    max_quantity?: MoneyAmount;
    allow_below_zero?: boolean;
    native_purchase_price?: MoneyAmount;
    native_retail_price?: MoneyAmount;
    vat_rate?: InventoryItemVatRate;
    supply_type?: InventoryItemSupplyType;
    private_note?: string;
    suggest_for?: InventoryItemSuggestFor;
    retail_prices?: InventoryItemRetailPriceInput[];
    [key: string]: unknown;
}
export type UpdateInventoryItem = Partial<NewInventoryItem>;
export declare class InventoryItemsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListInventoryItemsOptions): Promise<InventoryItem[]>;
    get(id: number): Promise<InventoryItem>;
    create(data: NewInventoryItem): Promise<InventoryItem>;
    update(id: number, data: UpdateInventoryItem): Promise<InventoryItem>;
    delete(id: number): Promise<void>;
    listArchived(options?: ListInventoryItemsOptions): Promise<InventoryItem[]>;
    listLowQuantity(options?: {
        page?: number;
    }): Promise<InventoryItem[]>;
    search(queryParam: string, page?: number): Promise<InventoryItem[]>;
    archive(id: number): Promise<InventoryItem>;
    unarchive(id: number): Promise<InventoryItem>;
    /**
     * Async generator that iterates through all pages of inventory items.
     * Yields individual inventory items. Use with `for await...of`.
     */
    listAll(options?: Omit<ListInventoryItemsOptions, 'page'>): AsyncGenerator<InventoryItem, void, undefined>;
    /**
     * Async generator that iterates through all pages of archived inventory items.
     * Yields individual inventory items. Use with `for await...of`.
     */
    listAllArchived(options?: Omit<ListInventoryItemsOptions, 'page'>): AsyncGenerator<InventoryItem, void, undefined>;
}
//# sourceMappingURL=inventory-items.d.ts.map