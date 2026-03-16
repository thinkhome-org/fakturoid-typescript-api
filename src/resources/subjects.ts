import type { HttpClient } from '../http/http-client';
import type {
  DateString,
  FakturoidAuth,
  FakturoidLanguage,
  FakturoidVatMode,
} from '../types/common';
import { paginateAll } from '../types/common';

export type SubjectType = 'customer' | 'supplier' | 'both';

export type SubjectSettingValue = 'inherit' | 'on' | 'off';

export type SubjectWebinvoiceHistory = 'disabled' | 'recent' | 'client_portal';

export interface SubjectSettings {
  setting_update_from_ares?: SubjectSettingValue;
  ares_update?: boolean;
  setting_invoice_pdf_attachments?: SubjectSettingValue;
  setting_estimate_pdf_attachments?: SubjectSettingValue;
  setting_invoice_send_reminders?: SubjectSettingValue;
}

export interface Subject {
  id: number;
  custom_id?: string | null;
  type?: SubjectType;
  user_id?: number | null;
  name: string;
  full_name?: string | null;
  registration_no?: string | null;
  vat_no?: string | null;
  local_vat_no?: string | null;
  phone?: string | null;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  has_delivery_address?: boolean;
  delivery_name?: string | null;
  delivery_street?: string | null;
  delivery_city?: string | null;
  delivery_zip?: string | null;
  delivery_country?: string | null;
  email?: string | null;
  email_copy?: string | null;
  web?: string | null;
  bank_account?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  currency?: string | null;
  language?: FakturoidLanguage | null;
  due?: number | null;
  vat_mode?: FakturoidVatMode | null;
  variable_symbol?: string | null;
  custom_email_text?: string | null;
  overdue_email_text?: string | null;
  invoice_from_proforma_email_text?: string | null;
  thank_you_email_text?: string | null;
  custom_estimate_email_text?: string | null;
  private_note?: string | null;
  webinvoice_history?: SubjectWebinvoiceHistory | null;
  unreliable?: boolean | null;
  unreliable_checked_at?: DateString | null;
  legal_form?: string | null;
  suggestion_enabled?: boolean;
  created_at?: DateString;
  updated_at?: DateString;
  html_url?: string;
  url?: string;
  setting_update_from_ares?: SubjectSettingValue;
  ares_update?: boolean;
  setting_invoice_pdf_attachments?: SubjectSettingValue;
  setting_estimate_pdf_attachments?: SubjectSettingValue;
  setting_invoice_send_reminders?: SubjectSettingValue;
  [key: string]: unknown;
}

export interface NewSubject extends SubjectSettings {
  name: string;
  type?: SubjectType;
  custom_id?: string | null;
  full_name?: string | null;
  legal_form?: string | null;
  registration_no?: string | null;
  vat_no?: string | null;
  local_vat_no?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  has_delivery_address?: boolean;
  delivery_name?: string | null;
  delivery_street?: string | null;
  delivery_city?: string | null;
  delivery_zip?: string | null;
  delivery_country?: string | null;
  email?: string | null;
  email_copy?: string | null;
  web?: string | null;
  bank_account?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  currency?: string | null;
  language?: FakturoidLanguage | null;
  due?: number | null;
  vat_mode?: FakturoidVatMode | null;
  variable_symbol?: string | null;
  custom_email_text?: string | null;
  overdue_email_text?: string | null;
  invoice_from_proforma_email_text?: string | null;
  thank_you_email_text?: string | null;
  custom_estimate_email_text?: string | null;
  webinvoice_history?: SubjectWebinvoiceHistory | null;
  private_note?: string | null;
  suggestion_enabled?: boolean;
  [key: string]: unknown;
}

export type UpdateSubject = Partial<NewSubject>;

export interface ListSubjectsOptions {
  page?: number;
  since?: DateString;
  updated_since?: DateString;
  custom_id?: string;
}

export class SubjectsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListSubjectsOptions = {}): Promise<Subject[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.custom_id != null) query.set('custom_id', options.custom_id);

    return this.http.request<Subject[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/subjects.json`,
      accessToken,
      query,
    });
  }

  public async search(queryParam: string, page?: number): Promise<Subject[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    query.set('query', queryParam);
    if (page != null) query.set('page', String(page));

    return this.http.request<Subject[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/subjects/search.json`,
      accessToken,
      query,
    });
  }

  public async get(id: number): Promise<Subject> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Subject>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/subjects/${id}.json`,
      accessToken,
    });
  }

  public async create(data: NewSubject): Promise<Subject> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Subject>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/subjects.json`,
      accessToken,
      body: data,
    });
  }

  public async update(id: number, data: UpdateSubject): Promise<Subject> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Subject>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/subjects/${id}.json`,
      accessToken,
      body: data,
    });
  }

  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/subjects/${id}.json`,
      accessToken,
    });
  }

  /**
   * Async generator that iterates through all pages of subjects.
   * Yields individual subjects. Use with `for await...of`.
   */
  public listAll(
    options: Omit<ListSubjectsOptions, 'page'> = {}
  ): AsyncGenerator<Subject, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
