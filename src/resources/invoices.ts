import type { HttpClient } from '../http/http-client';
import type {
  DateString,
  FakturoidAuth,
  FakturoidDocumentAttachment,
  FakturoidDocumentAttachmentInput,
  FakturoidDocumentLine,
  FakturoidIbanVisibility,
  FakturoidLanguage,
  FakturoidOssMode,
  FakturoidPaymentMethod,
  FakturoidVatPriceMode,
  FakturoidVatRate,
  FakturoidVatRateSummary,
  InvoiceDocumentType,
  InvoiceStatus,
  MoneyAmount,
  PaginationOptions,
} from '../types/common';
import { paginateAll } from '../types/common';
import type { InvoicePayment } from './invoice-payments';

export interface InvoicePaidAdvance {
  id: number;
  number: string;
  variable_symbol: string;
  paid_on: DateString;
  vat_rate: FakturoidVatRate;
  price: MoneyAmount;
  vat: MoneyAmount;
  [key: string]: unknown;
}

export type InvoiceEetRecordStatus = 'waiting' | 'pkp' | 'fik';

export interface InvoiceEetRecord {
  id: number;
  vat_no: string;
  number: string;
  store: string;
  cash_register: string;
  paid_at: DateString;
  vat_base0: MoneyAmount;
  vat_base1: MoneyAmount;
  vat1: MoneyAmount;
  vat_base2: MoneyAmount;
  vat2: MoneyAmount;
  vat_base3: MoneyAmount;
  vat3: MoneyAmount;
  total: MoneyAmount;
  fik: string | null;
  bkp: string;
  pkp: string;
  status: InvoiceEetRecordStatus;
  fik_received_at: DateString | null;
  external: boolean;
  attempts: number;
  last_attempt_at: DateString | null;
  last_uuid: string | null;
  playground: boolean;
  invoice_id: number;
  created_at: DateString;
  updated_at: DateString;
  [key: string]: unknown;
}

export interface Invoice {
  id: number;
  custom_id?: string | null;
  document_type?: InvoiceDocumentType;
  proforma_followup_document?: 'final_invoice_paid' | 'final_invoice' | 'tax_document' | 'none';
  correction_id?: number | null;
  related_id?: number | null;
  generator_id?: number | null;
  subject_custom_id?: string | null;
  number: string;
  order_number?: string | null;
  variable_symbol?: string | null;
  total: MoneyAmount;
  subtotal?: MoneyAmount;
  native_total?: MoneyAmount;
  native_subtotal?: MoneyAmount;
  remaining_amount?: MoneyAmount;
  remaining_native_amount?: MoneyAmount;
  subject_id?: number;
  status?: InvoiceStatus;
  issued_on?: DateString;
  due_on?: DateString;
  taxable_fulfillment_due?: DateString | null;
  due?: number | null;
  paid_on?: DateString | null;
  sent_at?: DateString | null;
  last_reminder_sent_at?: DateString | null;
  reminder_sent_at?: DateString | null;
  cancelled_at?: DateString | null;
  uncollectible_at?: DateString | null;
  locked_at?: DateString | null;
  webinvoice_seen_on?: DateString | null;
  created_at?: DateString;
  updated_at?: DateString;
  your_name?: string | null;
  your_street?: string | null;
  your_city?: string | null;
  your_zip?: string | null;
  your_country?: string | null;
  your_registration_no?: string | null;
  your_vat_no?: string | null;
  your_local_vat_no?: string | null;
  client_name?: string | null;
  client_street?: string | null;
  client_city?: string | null;
  client_zip?: string | null;
  client_country?: string | null;
  client_has_delivery_address?: boolean;
  client_delivery_name?: string | null;
  client_delivery_street?: string | null;
  client_delivery_city?: string | null;
  client_delivery_zip?: string | null;
  client_delivery_country?: string | null;
  client_registration_no?: string | null;
  client_vat_no?: string | null;
  client_local_vat_no?: string | null;
  bank_account_id?: number | null;
  bank_account?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  currency?: string;
  exchange_rate?: MoneyAmount | null;
  language?: FakturoidLanguage | null;
  number_format_id?: number | null;
  payment_method?: FakturoidPaymentMethod;
  custom_payment_method?: string | null;
  iban_visibility?: FakturoidIbanVisibility;
  vat_price_mode?: FakturoidVatPriceMode;
  rounding_adjustment?: MoneyAmount;
  hide_bank_account?: boolean | null;
  show_already_paid_note_in_pdf?: boolean;
  paypal?: boolean;
  gopay?: boolean;
  token?: string | null;
  transferred_tax_liability?: boolean;
  supply_code?: string | null;
  oss?: FakturoidOssMode;
  note?: string | null;
  footer_note?: string | null;
  private_note?: string | null;
  tags?: string[];
  lines?: FakturoidDocumentLine[];
  attachments?: FakturoidDocumentAttachment[] | null;
  payments?: InvoicePayment[];
  vat_rates_summary?: FakturoidVatRateSummary[];
  paid_advances?: InvoicePaidAdvance[];
  eet_records?: InvoiceEetRecord[];
  html_url?: string;
  public_html_url?: string | null;
  url?: string;
  pdf_url?: string;
  subject_url?: string | null;
  [key: string]: unknown;
}

/**
 * Document type filter values for invoice listing.
 * @see https://www.fakturoid.cz/api/v3/invoices#invoices-index
 */
export type InvoiceDocumentTypeFilter = 'regular' | 'proforma' | 'correction' | 'tax_document';

export interface ListInvoicesOptions extends PaginationOptions {
  since?: DateString;
  until?: DateString;
  updated_since?: DateString;
  updated_until?: DateString;
  subject_id?: number;
  custom_id?: string;
  number?: string;
  status?: string;
  document_type?: InvoiceDocumentTypeFilter;
}

/**
 * Options for fulltext invoice search.
 * @see https://www.fakturoid.cz/api/v3/invoices#fulltext-search
 */
export interface InvoiceSearchOptions extends PaginationOptions {
  query?: string;
  tags?: string[];
}

export interface NewInvoice {
  custom_id?: string | null;
  document_type?: InvoiceDocumentType;
  proforma_followup_document?: 'final_invoice_paid' | 'final_invoice' | 'tax_document' | 'none';
  correction_id?: number;
  related_id?: number;
  subject_id: number;
  subject_custom_id?: string | null;
  number?: string;
  order_number?: string | null;
  variable_symbol?: string | null;
  issued_on?: DateString;
  taxable_fulfillment_due?: DateString | null;
  due?: number | null;
  client_name?: string | null;
  client_street?: string | null;
  client_city?: string | null;
  client_zip?: string | null;
  client_country?: string | null;
  client_has_delivery_address?: boolean;
  client_delivery_name?: string | null;
  client_delivery_street?: string | null;
  client_delivery_city?: string | null;
  client_delivery_zip?: string | null;
  client_delivery_country?: string | null;
  client_registration_no?: string | null;
  client_vat_no?: string | null;
  client_local_vat_no?: string | null;
  currency?: string;
  exchange_rate?: MoneyAmount | null;
  language?: FakturoidLanguage | null;
  number_format_id?: number | null;
  bank_account_id?: number | null;
  payment_method?: FakturoidPaymentMethod;
  custom_payment_method?: string | null;
  iban_visibility?: FakturoidIbanVisibility;
  vat_price_mode?: FakturoidVatPriceMode;
  tax_document_ids?: number[] | null;
  tags?: string[];
  round_total?: boolean;
  show_already_paid_note_in_pdf?: boolean;
  hide_bank_account?: boolean | null;
  paypal?: boolean;
  gopay?: boolean;
  transferred_tax_liability?: boolean;
  supply_code?: string | null;
  oss?: FakturoidOssMode;
  note?: string | null;
  footer_note?: string | null;
  private_note?: string | null;
  lines?: FakturoidDocumentLine[];
  attachments?: FakturoidDocumentAttachmentInput[];
  [key: string]: unknown;
}

export type UpdateInvoice = Partial<
  Omit<NewInvoice, 'number_format_id' | 'tax_document_ids' | 'correction_id' | 'bank_account_id'>
>;

/**
 * Invoice action events that can be fired.
 * @see https://www.fakturoid.cz/api/v3/invoices#invoice-actions
 */
export type InvoiceActionEvent =
  | 'mark_as_sent'
  | 'cancel'
  | 'undo_cancel'
  | 'lock'
  | 'unlock'
  | 'mark_as_uncollectible'
  | 'undo_uncollectible';

export class InvoicesResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListInvoicesOptions = {}): Promise<Invoice[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.until) query.set('until', options.until);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.updated_until) query.set('updated_until', options.updated_until);
    if (options.subject_id != null) query.set('subject_id', String(options.subject_id));
    if (options.custom_id) query.set('custom_id', options.custom_id);
    if (options.number) query.set('number', options.number);
    if (options.status) query.set('status', options.status);
    if (options.document_type) query.set('document_type', options.document_type);

    return this.http.request<Invoice[]>({
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
  public async search(options: InvoiceSearchOptions = {}): Promise<Invoice[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.query) query.set('query', options.query);
    if (options.tags?.length) query.set('tags', options.tags.join(','));
    if (options.page != null) query.set('page', String(options.page));

    return this.http.request<Invoice[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/invoices/search.json`,
      accessToken,
      query,
    });
  }

  public async get(id: number): Promise<Invoice> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Invoice>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/invoices/${id}.json`,
      accessToken,
    });
  }

  public async create(data: NewInvoice): Promise<Invoice> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Invoice>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/invoices.json`,
      accessToken,
      body: data,
    });
  }

  public async update(id: number, data: UpdateInvoice): Promise<Invoice> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Invoice>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/invoices/${id}.json`,
      accessToken,
      body: data,
    });
  }

  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/invoices/${id}.json`,
      accessToken,
    });
  }

  /**
   * Fire an invoice action event (e.g. mark_as_sent, lock, cancel).
   * @see https://www.fakturoid.cz/api/v3/invoices#invoice-actions
   */
  public async fireEvent(id: number, event: InvoiceActionEvent): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams({ event });
    await this.http.request<undefined>({
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
  public async downloadPdf(id: number): Promise<ArrayBuffer | null> {
    const { accessToken, slug } = await this.getAuth();
    const response = await this.http.requestRaw({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/invoices/${id}/download.pdf`,
      accessToken,
    });
    if (response.status === 204) return null;
    return response.arrayBuffer();
  }

  /**
   * Downloads an invoice attachment by ID.
   * Returns `null` if attachment is not available yet (204 No Content).
   * @see https://www.fakturoid.cz/api/v3/invoices#download-attachment
   */
  public async downloadAttachment(
    invoiceId: number,
    attachmentId: number,
  ): Promise<ArrayBuffer | null> {
    const { accessToken, slug } = await this.getAuth();
    const response = await this.http.requestRaw({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/invoices/${invoiceId}/attachments/${attachmentId}/download`,
      accessToken,
    });
    if (response.status === 204) return null;
    return response.arrayBuffer();
  }

  /**
   * Async generator that iterates through all pages of invoices.
   * Yields individual invoices. Use with `for await...of`.
   */
  public listAll(options: Omit<ListInvoicesOptions, 'page'> = {}): AsyncGenerator<Invoice, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
