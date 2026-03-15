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

export interface RecurringGenerator {
  id: number;
  custom_id?: string | null;
  name: string;
  next_occurrence_on: DateString | null;
  active: boolean;
  total: MoneyAmount;
  subtotal?: MoneyAmount;
  native_total?: MoneyAmount;
  native_subtotal?: MoneyAmount;
  subject_id?: number;
  months_period?: number | string;
  due?: number | null;
  order_number?: string | null;
  start_date?: DateString | null;
  end_date?: DateString | null;
  note?: string | null;
  send_email?: boolean;
  last_day_in_month?: boolean;
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

export interface ListRecurringGeneratorsOptions extends PaginationOptions {
  since?: DateString;
  updated_since?: DateString;
  subject_id?: number;
}

export interface NewRecurringGenerator {
  custom_id?: string | null;
  name: string;
  next_occurrence_on?: DateString | null;
  subject_id: number;
  months_period: number | string;
  due?: number | null;
  order_number?: string | null;
  start_date: DateString;
  end_date?: DateString | null;
  note?: string | null;
  send_email?: boolean;
  last_day_in_month?: boolean;
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

export type UpdateRecurringGenerator = Partial<NewRecurringGenerator>;

export interface ActivateRecurringGeneratorPayload {
  next_occurrence_on?: DateString | null;
  [key: string]: unknown;
}

export class RecurringGeneratorsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListRecurringGeneratorsOptions = {}): Promise<RecurringGenerator[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.updated_since) query.set('updated_since', options.updated_since);
    if (options.subject_id != null) query.set('subject_id', String(options.subject_id));

    return this.http.request<RecurringGenerator[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/recurring_generators.json`,
      accessToken,
      query,
    });
  }

  public async get(id: number): Promise<RecurringGenerator> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<RecurringGenerator>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/recurring_generators/${id}.json`,
      accessToken,
    });
  }

  public async create(data: NewRecurringGenerator): Promise<RecurringGenerator> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<RecurringGenerator>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/recurring_generators.json`,
      accessToken,
      body: data,
    });
  }

  public async update(
    id: number,
    data: UpdateRecurringGenerator
  ): Promise<RecurringGenerator> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<RecurringGenerator>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/recurring_generators/${id}.json`,
      accessToken,
      body: data,
    });
  }

  public async delete(id: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/recurring_generators/${id}.json`,
      accessToken,
    });
  }

  /**
   * Pauses a recurring generator.
   * @see https://www.fakturoid.cz/api/v3/recurring-generators
   */
  public async pause(id: number): Promise<RecurringGenerator> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<RecurringGenerator>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/recurring_generators/${id}/pause.json`,
      accessToken,
    });
  }

  /**
   * Activates a paused recurring generator.
   * The API accepts a JSON body with `next_occurrence_on`.
   * @see https://www.fakturoid.cz/api/v3/recurring-generators
   */
  public async activate(
    id: number,
    data: ActivateRecurringGeneratorPayload = {},
  ): Promise<RecurringGenerator> {
    const { accessToken, slug } = await this.getAuth();
    const body = Object.keys(data).length > 0 ? data : undefined;
    return this.http.request<RecurringGenerator>({
      method: 'PATCH',
      path: `/api/v3/accounts/${slug}/recurring_generators/${id}/activate.json`,
      accessToken,
      body,
    });
  }

  /**
   * Async generator that iterates through all pages of recurring generators.
   * Yields individual recurring generators. Use with `for await...of`.
   */
  public listAll(options: Omit<ListRecurringGeneratorsOptions, 'page'> = {}): AsyncGenerator<RecurringGenerator, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
