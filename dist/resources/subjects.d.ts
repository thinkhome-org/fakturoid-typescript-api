import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, FakturoidLanguage, FakturoidVatMode } from '../types/common';
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
export declare class SubjectsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListSubjectsOptions): Promise<Subject[]>;
    search(queryParam: string, page?: number): Promise<Subject[]>;
    get(id: number): Promise<Subject>;
    create(data: NewSubject): Promise<Subject>;
    update(id: number, data: UpdateSubject): Promise<Subject>;
    delete(id: number): Promise<void>;
    /**
     * Async generator that iterates through all pages of subjects.
     * Yields individual subjects. Use with `for await...of`.
     */
    listAll(options?: Omit<ListSubjectsOptions, 'page'>): AsyncGenerator<Subject, void, undefined>;
}
//# sourceMappingURL=subjects.d.ts.map