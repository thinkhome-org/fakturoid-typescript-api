import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, MoneyAmount } from '../types/common';
/**
 * Invoice payment as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3/invoice-payments
 */
export interface InvoicePayment {
    id: number;
    paid_on: DateString;
    currency: string;
    amount: MoneyAmount;
    native_amount: MoneyAmount;
    variable_symbol: string;
    bank_account_id: number;
    tax_document_id: number | null;
    created_at: DateString;
    updated_at: DateString;
    [key: string]: unknown;
}
/**
 * Payload for creating an invoice payment. All fields are optional with sensible defaults.
 * @see https://www.fakturoid.cz/api/v3/invoice-payments#create-payment
 */
export interface NewInvoicePayment {
    /** Payment date. Default: Today. */
    paid_on?: DateString;
    /** Paid amount in document currency. Default: Remaining amount to pay. */
    amount?: MoneyAmount;
    /** Paid amount in account currency. Default: Remaining amount converted. */
    native_amount?: MoneyAmount;
    /** Mark document as paid? Default: true if total paid >= remaining. */
    mark_document_as_paid?: boolean;
    /**
     * Issue a followup document with payment (proformas only, mark_document_as_paid must be true).
     * Values: final_invoice_paid, final_invoice, tax_document, none.
     */
    proforma_followup_document?: 'final_invoice_paid' | 'final_invoice' | 'tax_document' | 'none';
    /** Send thank-you email? mark_document_as_paid must be true. Default: from account settings. */
    send_thank_you_email?: boolean;
    /** Payment variable symbol. Default: Invoice variable symbol. */
    variable_symbol?: string;
    /** Bank account ID. Default: Invoice bank account or default bank account. */
    bank_account_id?: number;
    [key: string]: unknown;
}
export declare class InvoicePaymentsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    /**
     * Creates a payment for the given invoice.
     * @see https://www.fakturoid.cz/api/v3/invoice-payments#create-payment
     */
    create(invoiceId: number, data?: NewInvoicePayment): Promise<InvoicePayment>;
    /**
     * Creates a tax document for the given invoice payment.
     * @see https://www.fakturoid.cz/api/v3/invoice-payments#create-tax-document
     */
    createTaxDocument(invoiceId: number, paymentId: number): Promise<InvoicePayment>;
    /**
     * Deletes a payment from an invoice.
     * @see https://www.fakturoid.cz/api/v3/invoice-payments#delete-invoice-payment
     */
    delete(invoiceId: number, paymentId: number): Promise<void>;
}
//# sourceMappingURL=invoice-payments.d.ts.map