import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth } from '../types/common';

/**
 * Bank account as returned by Fakturoid API v3 (read-only).
 * @see https://www.fakturoid.cz/api/v3/bank-accounts
 */
export interface BankAccount {
  id: number;
  name: string;
  currency: string;
  number: string;
  iban: string | null;
  swift_bic: string | null;
  pairing: boolean;
  expense_pairing: boolean;
  payment_adjustment: boolean;
  default: boolean;
  created_at: DateString;
  updated_at: DateString;
  [key: string]: unknown;
}

/**
 * Bank accounts are read-only. Only listing is supported via API.
 * @see https://www.fakturoid.cz/api/v3/bank-accounts
 */
export class BankAccountsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  /**
   * Lists all bank accounts for the account.
   * @see https://www.fakturoid.cz/api/v3/bank-accounts#banks-accounts-index
   */
  public async list(): Promise<BankAccount[]> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<BankAccount[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/bank_accounts.json`,
      accessToken,
    });
  }
}
