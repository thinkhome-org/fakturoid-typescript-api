import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
import { paginateAll } from '../types/common';

export type InventoryMoveDocumentType =
  | 'Estimate'
  | 'Expense'
  | 'ExpenseGenerator'
  | 'Generator'
  | 'Invoice';

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

export class InventoryMovesResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  /**
   * Lists inventory moves (flat endpoint, supports filtering by inventory_item_id).
   * @see https://www.fakturoid.cz/api/v3/inventory-moves#inventory-moves-index
   */
  public async list(options: ListInventoryMovesOptions = {}): Promise<InventoryMove[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.until) query.set('until', options.until);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.updated_until) query.set('updated_until', options.updated_until);
    if (options.inventory_item_id != null)
      query.set('inventory_item_id', String(options.inventory_item_id));

    return this.http.request<InventoryMove[]>({
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
  public async get(inventoryItemId: number, id: number): Promise<InventoryMove> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryMove>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
      accessToken,
    });
  }

  /**
   * Creates an inventory move for the given inventory item.
   * @see https://www.fakturoid.cz/api/v3/inventory-moves#create-inventory-move
   */
  public async create(inventoryItemId: number, data: NewInventoryMove): Promise<InventoryMove> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryMove>({
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
  public async update(
    inventoryItemId: number,
    id: number,
    data: UpdateInventoryMove
  ): Promise<InventoryMove> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<InventoryMove>({
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
  public async delete(inventoryItemId: number, id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
      accessToken,
    });
  }

  /**
   * Async generator that iterates through all pages of inventory moves.
   * Yields individual inventory moves. Use with `for await...of`.
   */
  public listAll(
    options: Omit<ListInventoryMovesOptions, 'page'> = {}
  ): AsyncGenerator<InventoryMove, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
