import type { HttpClient } from '../http/http-client';
import type {
  DateString,
  ExpenseDocumentType,
  FakturoidAuth,
  FakturoidDocumentAttachment,
  FakturoidDocumentAttachmentInput,
  FakturoidDocumentLine,
  FakturoidPaymentMethod,
  FakturoidVatPriceMode,
  FakturoidVatRateSummary,
  MoneyAmount,
  PaginationOptions,
} from '../types/common';
import { paginateAll } from '../types/common';
import type { ExpensePayment } from './expense-payments';

export type ExpenseStatus = 'open' | 'overdue' | 'paid';

export interface Expense {
  id: number;
  custom_id?: string | null;
  number: string;
  original_number?: string | null;
  variable_symbol?: string | null;
  total: MoneyAmount;
  subtotal?: MoneyAmount;
  native_subtotal?: MoneyAmount;
  native_total?: MoneyAmount;
  rounding_adjustment?: MoneyAmount;
  document_type: ExpenseDocumentType;
  issued_on: DateString;
  due_on?: DateString;
  taxable_fulfillment_due?: DateString | null;
  received_on?: DateString | null;
  paid_on?: DateString | null;
  remind_due_date?: boolean;
  locked_at?: DateString | null;
  subject_id?: number;
  status?: ExpenseStatus;
  supplier_name?: string | null;
  supplier_street?: string | null;
  supplier_city?: string | null;
  supplier_zip?: string | null;
  supplier_country?: string | null;
  supplier_registration_no?: string | null;
  supplier_vat_no?: string | null;
  supplier_local_vat_no?: string | null;
  bank_account?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  currency?: string;
  exchange_rate?: MoneyAmount | null;
  payment_method?: FakturoidPaymentMethod;
  custom_payment_method?: string | null;
  vat_price_mode?: FakturoidVatPriceMode;
  transferred_tax_liability?: boolean;
  supply_code?: string | null;
  tax_deductible?: boolean;
  proportional_vat_deduction?: number | null;
  description?: string | null;
  private_note?: string | null;
  created_at?: DateString;
  updated_at?: DateString;
  tags?: string[];
  lines?: FakturoidDocumentLine[];
  attachments?: FakturoidDocumentAttachment[] | null;
  payments?: ExpensePayment[];
  vat_rates_summary?: FakturoidVatRateSummary[];
  html_url?: string;
  url?: string;
  subject_url?: string | null;
  [key: string]: unknown;
}

export interface ListExpensesOptions extends PaginationOptions {
  since?: DateString;
  updated_since?: DateString;
  subject_id?: number;
  custom_id?: string;
  number?: string;
  variable_symbol?: string;
  status?: ExpenseStatus;
}

/**
 * Options for fulltext expense search.
 * @see https://www.fakturoid.cz/api/v3/expenses
 */
export interface ExpenseSearchOptions extends PaginationOptions {
  query?: string;
  tags?: string[];
}

/**
 * Expense action events supported by the API (lock/unlock only).
 * @see https://www.fakturoid.cz/api/v3/expenses
 */
export type ExpenseActionEvent = 'lock' | 'unlock';

export interface NewExpense {
  custom_id?: string | null;
  original_number?: string | null;
  variable_symbol?: string | null;
  document_type?: ExpenseDocumentType;
  issued_on?: DateString;
  due_on?: DateString;
  taxable_fulfillment_due?: DateString | null;
  received_on?: DateString | null;
  remind_due_date?: boolean;
  number?: string;
  bank_account?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  currency?: string;
  exchange_rate?: MoneyAmount | null;
  payment_method?: FakturoidPaymentMethod;
  custom_payment_method?: string | null;
  vat_price_mode?: FakturoidVatPriceMode;
  transferred_tax_liability?: boolean;
  supply_code?: string | null;
  tax_deductible?: boolean;
  proportional_vat_deduction?: number | null;
  description?: string | null;
  private_note?: string | null;
  tags?: string[];
  round_total?: boolean;
  subject_id: number;
  lines?: FakturoidDocumentLine[];
  attachments?: FakturoidDocumentAttachmentInput[];
  [key: string]: unknown;
}

export type UpdateExpense = Partial<NewExpense>;

export class ExpensesResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListExpensesOptions = {}): Promise<Expense[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.subject_id != null) query.set('subject_id', String(options.subject_id));
    if (options.custom_id) query.set('custom_id', options.custom_id);
    if (options.number) query.set('number', options.number);
    if (options.variable_symbol) query.set('variable_symbol', options.variable_symbol);
    if (options.status) query.set('status', options.status);

    return this.http.request<Expense[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/expenses.json`,
      accessToken,
      query,
    });
  }

  /**
   * Fulltext search across expenses.
   * @see https://www.fakturoid.cz/api/v3/expenses
   */
  public async search(options: ExpenseSearchOptions = {}): Promise<Expense[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.query) query.set('query', options.query);
    if (options.tags?.length) query.set('tags', options.tags.join(','));
    if (options.page != null) query.set('page', String(options.page));

    return this.http.request<Expense[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/expenses/search.json`,
      accessToken,
      query,
    });
  }

  public async get(id: number): Promise<Expense> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Expense>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/expenses/${id}.json`,
      accessToken,
    });
  }

  public async create(data: NewExpense): Promise<Expense> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Expense>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/expenses.json`,
      accessToken,
      body: data,
    });
  }

  public async update(id: number, data: UpdateExpense): Promise<Expense> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Expense>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/expenses/${id}.json`,
      accessToken,
      body: data,
    });
  }

  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/expenses/${id}.json`,
      accessToken,
    });
  }

  /**
   * Fire an expense action event (lock or unlock).
   * @see https://www.fakturoid.cz/api/v3/expenses
   */
  public async fireEvent(id: number, event: ExpenseActionEvent): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams({ event });
    await this.http.request<undefined>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/expenses/${id}/fire.json`,
      accessToken,
      query,
    });
  }

  /**
   * Downloads an expense attachment by ID.
   * Returns `null` if attachment is not available yet (204 No Content).
   * @see https://www.fakturoid.cz/api/v3/expenses
   */
  public async downloadAttachment(
    expenseId: number,
    attachmentId: number
  ): Promise<ArrayBuffer | null> {
    const { accessToken, slug } = await this.getAuth();
    const response = await this.http.requestRaw({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/expenses/${expenseId}/attachments/${attachmentId}/download`,
      accessToken,
    });
    if (response.status === 204) return null;
    return response.arrayBuffer();
  }

  /**
   * Async generator that iterates through all pages of expenses.
   * Yields individual expenses. Use with `for await...of`.
   */
  public listAll(
    options: Omit<ListExpensesOptions, 'page'> = {}
  ): AsyncGenerator<Expense, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
