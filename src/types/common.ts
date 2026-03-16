export type Environment = 'test' | 'production';

/**
 * Optional structured logger for observability (e.g. request/response tracing).
 * Omitted methods are no-ops.
 */
export interface FakturoidLogger {
  debug?(message: string, meta?: Record<string, unknown>): void;
  info?(message: string, meta?: Record<string, unknown>): void;
  warn?(message: string, meta?: Record<string, unknown>): void;
  error?(message: string, meta?: Record<string, unknown>): void;
}

export interface FakturoidAppConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  userAgent: string;
  environment: Environment;
  baseUrl?: string;
  /** Optional logger for debugging and observability. */
  logger?: FakturoidLogger;
  /** Max number of tenant resource caches to keep (LRU eviction). Default 1000. */
  maxCacheSize?: number;
  /** Max concurrent HTTP requests per client. Omitted = no limit. */
  maxConcurrency?: number;
}

export interface FakturoidTokens {
  accessToken: string;
  /** Present after OAuth Authorization Code flow; empty/undefined for Client Credentials. */
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
  fakturoidAccountId?: string;
  /** Account slug for API paths: /api/v3/accounts/{slug}/... */
  fakturoidSlug?: string;
}

/** Result of getAuth() – used by resources to build account-scoped paths. */
export interface FakturoidAuth {
  accessToken: string;
  slug: string;
}

/**
 * Error details as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3#error-handling
 */
export interface FakturoidApiErrorDetails {
  /** Error code (e.g. invalid_request, forbidden). Used for most non-422 errors. */
  error?: string;
  /** Human-readable error description. */
  error_description?: string;
  /** Field-level validation errors. Used for 422 Unprocessable Content. */
  errors?: Record<string, unknown>;
  /** Legacy/alternative message field. */
  message?: string;
}

export class FakturoidApiError extends Error {
  public readonly status: number;

  public readonly details?: FakturoidApiErrorDetails;

  public constructor(status: number, message: string, details?: FakturoidApiErrorDetails) {
    super(message);
    this.name = 'FakturoidApiError';
    this.status = status;
    this.details = details;
  }
}

/** Pagination: API uses 40 records per page. Only `page` is supported. */
export interface PaginationOptions {
  page?: number;
}

const FAKTUROID_PAGE_SIZE = 40;

/**
 * Async generator that iterates through all pages of a paginated Fakturoid API endpoint.
 * Yields items one by one. Stops when a page returns fewer than 40 items.
 *
 * @param fetchPage - Async function that fetches a single page (1-indexed).
 * @returns AsyncGenerator yielding individual items from all pages.
 */
export async function* paginateAll<T>(
  fetchPage: (page: number) => Promise<T[]>
): AsyncGenerator<T, void, undefined> {
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

export type DateString = string;

/**
 * Monetary amounts in the Fakturoid API are returned as decimal strings (e.g. "1210.0").
 * When sending, both strings and numbers are accepted.
 */
export type MoneyAmount = string | number;

export type NumericString = `${number}`;

export type FakturoidLanguage =
  | 'cz'
  | 'sk'
  | 'en'
  | 'de'
  | 'fr'
  | 'it'
  | 'es'
  | 'ru'
  | 'pl'
  | 'hu'
  | 'ro';

export type FakturoidAllowedScope = 'reports' | 'expenses' | 'invoices';

export type FakturoidVatMode = 'vat_payer' | 'non_vat_payer' | 'identified_person';

export type FakturoidEstimateType = 'estimate' | 'quote';

/**
 * VAT rate values used across Fakturoid document lines.
 * The API returns a mix of numeric and symbolic values depending on the endpoint and account setup.
 */
export type FakturoidVatRate =
  | number
  | NumericString
  | 'standard'
  | 'reduced'
  | 'reduced2'
  | 'zero'
  | 'none';

/**
 * VAT price modes used across account settings and documents.
 * Account settings expose legacy values too, while document endpoints primarily use
 * `without_vat` and `from_total_with_vat`.
 */
export type FakturoidVatPriceMode =
  | 'with_vat'
  | 'without_vat'
  | 'numerical_with_vat'
  | 'from_total_with_vat';

export type FakturoidPaymentMethod = 'bank' | 'cash' | 'cod' | 'card' | 'paypal' | 'custom';

export type FakturoidIbanVisibility = 'automatically' | 'always';

export type FakturoidOssMode = 'disabled' | 'service' | 'goods';

export interface FakturoidLegacyBankDetails {
  bank_account?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
}

/**
 * Attachment object returned in invoice/expense detail responses.
 * @see https://www.fakturoid.cz/api/v3/invoices#attachments
 * @see https://www.fakturoid.cz/api/v3/expenses#attachments
 */
export interface FakturoidDocumentAttachment {
  id: number;
  filename: string;
  content_type: string;
  download_url: string;
  [key: string]: unknown;
}

/**
 * Attachment payload accepted by invoice/expense create and update endpoints.
 * @see https://www.fakturoid.cz/api/v3/invoices#attachments
 * @see https://www.fakturoid.cz/api/v3/expenses#attachments
 */
export interface FakturoidDocumentAttachmentInput {
  filename?: string;
  data_url: string;
  [key: string]: unknown;
}

/**
 * Inventory reference attached to a document line.
 */
export interface FakturoidDocumentLineInventory {
  item_id: number;
  sku: string;
  article_number_type?: 'ian' | 'ean' | 'isbn' | string;
  article_number?: string | null;
  move_id?: number | null;
  [key: string]: unknown;
}

/**
 * Shared document line model used by invoices, expenses, generators and recurring generators.
 * It intentionally covers the documented cross-resource shape while keeping room for account-specific fields.
 */
export interface FakturoidDocumentLine {
  id?: number;
  name?: string;
  quantity?: MoneyAmount;
  unit_name?: string | null;
  unit_price?: MoneyAmount;
  vat_rate?: FakturoidVatRate;
  unit_price_without_vat?: MoneyAmount;
  unit_price_with_vat?: MoneyAmount;
  total_price_without_vat?: MoneyAmount;
  total_vat?: MoneyAmount;
  native_total_price_without_vat?: MoneyAmount;
  native_total_vat?: MoneyAmount;
  inventory_item_id?: number | null;
  sku?: string | null;
  inventory?: FakturoidDocumentLineInventory | null;
  _destroy?: boolean;
  [key: string]: unknown;
}

/**
 * VAT rates summary item returned in invoice and expense detail/list responses.
 * @see https://www.fakturoid.cz/api/v3/invoices#vat-rates-summary
 * @see https://www.fakturoid.cz/api/v3/expenses#vat-rates-summary
 */
export interface FakturoidVatRateSummary {
  vat_rate: FakturoidVatRate;
  base: MoneyAmount;
  vat: MoneyAmount;
  currency: string;
  native_base: MoneyAmount;
  native_vat: MoneyAmount;
  native_currency: string;
  [key: string]: unknown;
}

/**
 * Invoice document types as returned by the API `document_type` field.
 * @see https://www.fakturoid.cz/api/v3/invoices#attributes
 */
export type InvoiceDocumentType =
  | 'invoice'
  | 'proforma'
  | 'partial_proforma'
  | 'correction'
  | 'tax_document'
  | 'final_invoice';

/**
 * Invoice status values as returned by the API `status` field.
 * @see https://www.fakturoid.cz/api/v3/invoices#invoice-status-table
 */
export type InvoiceStatus = 'open' | 'sent' | 'overdue' | 'paid' | 'cancelled' | 'uncollectible';

export type ExpenseDocumentType = 'invoice' | 'bill' | 'other';

/**
 * Inventory move direction values.
 * @see https://www.fakturoid.cz/api/v3/inventory-moves
 */
export type InventoryMoveDirection = 'in' | 'out';
