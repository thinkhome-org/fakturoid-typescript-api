import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, FakturoidDocumentLine, FakturoidIbanVisibility, FakturoidLanguage, FakturoidLegacyBankDetails, FakturoidOssMode, FakturoidPaymentMethod, FakturoidVatPriceMode, MoneyAmount, PaginationOptions } from '../types/common';
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
export declare class GeneratorsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListGeneratorsOptions): Promise<Generator[]>;
    get(id: number): Promise<Generator>;
    create(data: NewGenerator): Promise<Generator>;
    update(id: number, data: UpdateGenerator): Promise<Generator>;
    delete(id: number): Promise<void>;
    /**
     * Async generator that iterates through all pages of generators.
     * Yields individual generators. Use with `for await...of`.
     */
    listAll(options?: Omit<ListGeneratorsOptions, 'page'>): AsyncGenerator<Generator, void, undefined>;
}
//# sourceMappingURL=generators.d.ts.map