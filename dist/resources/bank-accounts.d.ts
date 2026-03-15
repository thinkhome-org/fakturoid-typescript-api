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
export declare class BankAccountsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    /**
     * Lists all bank accounts for the account.
     * @see https://www.fakturoid.cz/api/v3/bank-accounts#banks-accounts-index
     */
    list(): Promise<BankAccount[]>;
}
//# sourceMappingURL=bank-accounts.d.ts.map