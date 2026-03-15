import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, MoneyAmount, PaginationOptions } from '../types/common';
import { paginateAll } from '../types/common';

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
  native_retail_price: MoneyAmount;
  vat_rate?: InventoryItemVatRate;
  supply_type?: InventoryItemSupplyType;
  private_note?: string;
  suggest_for?: InventoryItemSuggestFor;
  retail_prices?: InventoryItemRetailPriceInput[];
  [key: string]: unknown;
}

export type UpdateInventoryItem = Partial<NewInventoryItem>;

export class InventoryItemsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListInventoryItemsOptions = {}): Promise<InventoryItem[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.until) query.set('until', options.until);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.updated_until) query.set('updated_until', options.updated_until);
    if (options.article_number) query.set('article_number', options.article_number);
    if (options.sku) query.set('sku', options.sku);

    return this.http.request<InventoryItem[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inventory_items.json`,
      accessToken,
      query,
    });
  }

  public async get(id: number): Promise<InventoryItem> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryItem>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inventory_items/${id}.json`,
      accessToken,
    });
  }

  public async create(data: NewInventoryItem): Promise<InventoryItem> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryItem>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/inventory_items.json`,
      accessToken,
      body: data,
    });
  }

  public async update(id: number, data: UpdateInventoryItem): Promise<InventoryItem> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryItem>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/inventory_items/${id}.json`,
      accessToken,
      body: data,
    });
  }

  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/inventory_items/${id}.json`,
      accessToken,
    });
  }

  public async listArchived(options: ListInventoryItemsOptions = {}): Promise<InventoryItem[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.until) query.set('until', options.until);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.updated_until) query.set('updated_until', options.updated_until);
    if (options.article_number) query.set('article_number', options.article_number);
    if (options.sku) query.set('sku', options.sku);

    return this.http.request<InventoryItem[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inventory_items/archived.json`,
      accessToken,
      query,
    });
  }

  public async listLowQuantity(options: { page?: number } = {}): Promise<InventoryItem[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));

    return this.http.request<InventoryItem[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inventory_items/low_quantity.json`,
      accessToken,
      query,
    });
  }

  public async search(queryParam: string, page?: number): Promise<InventoryItem[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    query.set('query', queryParam);
    if (page != null) query.set('page', String(page));

    return this.http.request<InventoryItem[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inventory_items/search.json`,
      accessToken,
      query,
    });
  }

  public async archive(id: number): Promise<InventoryItem> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryItem>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/inventory_items/${id}/archive.json`,
      accessToken,
    });
  }

  public async unarchive(id: number): Promise<InventoryItem> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryItem>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/inventory_items/${id}/unarchive.json`,
      accessToken,
    });
  }

  /**
   * Async generator that iterates through all pages of inventory items.
   * Yields individual inventory items. Use with `for await...of`.
   */
  public listAll(options: Omit<ListInventoryItemsOptions, 'page'> = {}): AsyncGenerator<InventoryItem, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }

  /**
   * Async generator that iterates through all pages of archived inventory items.
   * Yields individual inventory items. Use with `for await...of`.
   */
  public listAllArchived(options: Omit<ListInventoryItemsOptions, 'page'> = {}): AsyncGenerator<InventoryItem, void, undefined> {
    return paginateAll((page) => this.listArchived({ ...options, page }));
  }
}
