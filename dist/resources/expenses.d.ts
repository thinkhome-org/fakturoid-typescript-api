import type { HttpClient } from '../http/http-client';
import type { DateString, ExpenseDocumentType, FakturoidAuth, FakturoidDocumentAttachment, FakturoidDocumentAttachmentInput, FakturoidDocumentLine, FakturoidPaymentMethod, FakturoidVatPriceMode, FakturoidVatRateSummary, MoneyAmount, PaginationOptions } from '../types/common';
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
    round_total?: boolean;
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
    total?: MoneyAmount;
    document_type?: ExpenseDocumentType;
    issued_on?: DateString;
    due_on?: DateString;
    taxable_fulfillment_due?: DateString | null;
    received_on?: DateString | null;
    remind_due_date?: boolean;
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
    tags?: string[];
    round_total?: boolean;
    subject_id?: number;
    lines?: FakturoidDocumentLine[];
    attachments?: FakturoidDocumentAttachmentInput[];
    [key: string]: unknown;
}
export type UpdateExpense = Partial<NewExpense>;
export declare class ExpensesResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListExpensesOptions): Promise<Expense[]>;
    /**
     * Fulltext search across expenses.
     * @see https://www.fakturoid.cz/api/v3/expenses
     */
    search(options?: ExpenseSearchOptions): Promise<Expense[]>;
    get(id: number): Promise<Expense>;
    create(data: NewExpense): Promise<Expense>;
    update(id: number, data: UpdateExpense): Promise<Expense>;
    delete(id: number): Promise<void>;
    /**
     * Fire an expense action event (lock or unlock).
     * @see https://www.fakturoid.cz/api/v3/expenses
     */
    fireEvent(id: number, event: ExpenseActionEvent): Promise<void>;
    /**
     * Downloads an expense attachment by ID.
     * Returns `null` if attachment is not available yet (204 No Content).
     * @see https://www.fakturoid.cz/api/v3/expenses
     */
    downloadAttachment(expenseId: number, attachmentId: number): Promise<ArrayBuffer | null>;
    /**
     * Async generator that iterates through all pages of expenses.
     * Yields individual expenses. Use with `for await...of`.
     */
    listAll(options?: Omit<ListExpensesOptions, 'page'>): AsyncGenerator<Expense, void, undefined>;
}
//# sourceMappingURL=expenses.d.ts.map