import type { HttpClient } from '../http/http-client';
import type {
  DateString,
  FakturoidAuth,
  FakturoidEstimateType,
  FakturoidLanguage,
  FakturoidVatMode,
  FakturoidVatPriceMode,
  FakturoidVatRate,
} from '../types/common';

/**
 * Account plan as returned by the API.
 * Public docs describe this as a free-form string (for example "Na maximum").
 * @see https://www.fakturoid.cz/api/v3/account
 */
export type AccountPlan = string;

export type AccountInvoicePaymentMethod = 'bank' | 'card' | 'cash' | 'cod' | 'paypal';

export type InvoiceHideBankAccountPaymentMethod = 'card' | 'cash' | 'cod' | 'paypal';

export interface AccountInfo {
  subdomain: string;
  name: string;
  full_name: string | null;
  registration_no: string;
  vat_no: string | null;
  local_vat_no: string | null;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone: string | null;
  web: string | null;
  invoice_email: string | null;
  currency: string;
  unit_name: string;
  vat_rate: FakturoidVatRate;
  displayed_note: string;
  invoice_note: string;
  due: number;
  vat_mode: FakturoidVatMode;
  vat_price_mode: FakturoidVatPriceMode;
  invoice_language: FakturoidLanguage;
  invoice_payment_method: AccountInvoicePaymentMethod | null;
  invoice_proforma: boolean;
  invoice_hide_bank_account_for_payments: InvoiceHideBankAccountPaymentMethod[] | null;
  fixed_exchange_rate: boolean;
  invoice_selfbilling: boolean;
  default_estimate_type: FakturoidEstimateType | null;
  send_overdue_email: boolean;
  overdue_email_days: number;
  send_repeated_reminders: boolean;
  send_invoice_from_proforma_email: boolean;
  send_thank_you_email: boolean;
  invoice_paypal: boolean;
  invoice_gopay: boolean;
  plan: AccountPlan;
  plan_price: number;
  plan_paid_users: number;
  digitoo_enabled: boolean;
  digitoo_auto_processing_enabled: boolean;
  digitoo_remaining_extractions: number;
  created_at: DateString;
  updated_at: DateString;
  [key: string]: unknown;
}

export class AccountResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async getAccountInfo(): Promise<AccountInfo> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<AccountInfo>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/account.json`,
      accessToken,
    });
  }
}
