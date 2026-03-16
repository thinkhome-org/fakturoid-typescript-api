import type { HttpClient } from '../http/http-client';
import type {
  DateString,
  FakturoidAuth,
  FakturoidDocumentLine,
  FakturoidIbanVisibility,
  FakturoidLanguage,
  FakturoidLegacyBankDetails,
  FakturoidOssMode,
  FakturoidPaymentMethod,
  FakturoidVatPriceMode,
  MoneyAmount,
  PaginationOptions,
} from '../types/common';
import { paginateAll } from '../types/common';

export interface Generator {
  id: number;
  custom_id?: string | null;
  name: string;
  total: MoneyAmount;
  subtotal?: MoneyAmount;
  native_total?: MoneyAmount;
  native_subtotal?: MoneyAmount;
  subject_id?: number;
  order_number?: string | null;
  due?: number | null;
  note?: string | null;
  number_format_id?: number | null;
  footer_note?: string | null;
  legacy_bank_details?: FakturoidLegacyBankDetails | null;
  iban_visibility?: FakturoidIbanVisibility;
  proforma?: boolean;
  paypal?: boolean;
  gopay?: boolean;
  tax_date_at_end_of_last_month?: boolean;
  tags?: string[];
  currency?: string | null;
  payment_method?: FakturoidPaymentMethod;
  custom_payment_method?: string | null;
  language?: FakturoidLanguage | null;
  vat_price_mode?: FakturoidVatPriceMode;
  rounding_adjustment?: MoneyAmount;
  bank_account_id?: number | null;
  exchange_rate?: MoneyAmount | null;
  transferred_tax_liability?: boolean;
  supply_code?: string | null;
  oss?: FakturoidOssMode;
  created_at?: DateString;
  updated_at?: DateString;
  html_url?: string;
  url?: string;
  subject_url?: string | null;
  lines?: FakturoidDocumentLine[];
  [key: string]: unknown;
}

export interface ListGeneratorsOptions extends PaginationOptions {
  since?: DateString;
  updated_since?: DateString;
  subject_id?: number;
}

export interface NewGenerator {
  custom_id?: string | null;
  name: string;
  subject_id: number;
  order_number?: string | null;
  due?: number | null;
  note?: string | null;
  number_format_id?: number | null;
  footer_note?: string | null;
  iban_visibility?: FakturoidIbanVisibility;
  proforma?: boolean;
  paypal?: boolean;
  gopay?: boolean;
  tax_date_at_end_of_last_month?: boolean;
  tags?: string[];
  currency?: string | null;
  payment_method?: FakturoidPaymentMethod;
  custom_payment_method?: string | null;
  language?: FakturoidLanguage | null;
  vat_price_mode?: FakturoidVatPriceMode;
  round_total?: boolean;
  bank_account_id?: number | null;
  exchange_rate?: MoneyAmount | null;
  transferred_tax_liability?: boolean;
  supply_code?: string | null;
  oss?: FakturoidOssMode;
  lines?: FakturoidDocumentLine[];
  [key: string]: unknown;
}

export type UpdateGenerator = Partial<NewGenerator>;

export class GeneratorsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListGeneratorsOptions = {}): Promise<Generator[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.subject_id != null) query.set('subject_id', String(options.subject_id));

    return this.http.request<Generator[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/generators.json`,
      accessToken,
      query,
    });
  }

  public async get(id: number): Promise<Generator> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Generator>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/generators/${id}.json`,
      accessToken,
    });
  }

  public async create(data: NewGenerator): Promise<Generator> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Generator>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/generators.json`,
      accessToken,
      body: data,
    });
  }

  public async update(id: number, data: UpdateGenerator): Promise<Generator> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Generator>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/generators/${id}.json`,
      accessToken,
      body: data,
    });
  }

  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/generators/${id}.json`,
      accessToken,
    });
  }

  /**
   * Async generator that iterates through all pages of generators.
   * Yields individual generators. Use with `for await...of`.
   */
  public listAll(
    options: Omit<ListGeneratorsOptions, 'page'> = {}
  ): AsyncGenerator<Generator, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
