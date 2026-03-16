import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, FakturoidDocumentLine, FakturoidIbanVisibility, FakturoidLanguage, FakturoidLegacyBankDetails, FakturoidOssMode, FakturoidPaymentMethod, FakturoidVatPriceMode, MoneyAmount, PaginationOptions } from '../types/common';
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
export declare class RecurringGeneratorsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListRecurringGeneratorsOptions): Promise<RecurringGenerator[]>;
    get(id: number): Promise<RecurringGenerator>;
    create(data: NewRecurringGenerator): Promise<RecurringGenerator>;
    update(id: number, data: UpdateRecurringGenerator): Promise<RecurringGenerator>;
    delete(id: number): Promise<void>;
    /**
     * Pauses a recurring generator.
     * @see https://www.fakturoid.cz/api/v3/recurring-generators
     */
    pause(id: number): Promise<RecurringGenerator>;
    /**
     * Activates a paused recurring generator.
     * The API accepts a JSON body with `next_occurrence_on`.
     * @see https://www.fakturoid.cz/api/v3/recurring-generators
     */
    activate(id: number, data?: ActivateRecurringGeneratorPayload): Promise<RecurringGenerator>;
    /**
     * Async generator that iterates through all pages of recurring generators.
     * Yields individual recurring generators. Use with `for await...of`.
     */
    listAll(options?: Omit<ListRecurringGeneratorsOptions, 'page'>): AsyncGenerator<RecurringGenerator, void, undefined>;
}
//# sourceMappingURL=recurring-generators.d.ts.map