import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth } from '../types/common';
/**
 * Number format as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3/number-formats
 */
export interface NumberFormat {
    id: number;
    format: string;
    preview: string;
    default: boolean;
    created_at?: DateString;
    updated_at?: DateString;
    [key: string]: unknown;
}
/**
 * Document types that have number formats.
 * The current public API v3 documentation exposes only the invoices endpoint.
 * @see https://www.fakturoid.cz/api/v3/number-formats
 */
export type NumberFormatDocumentType = 'invoices';
export declare class NumberFormatsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    /**
     * Lists number formats for a given document type.
     * Only unarchived number formats are returned.
     * @see https://www.fakturoid.cz/api/v3/number-formats
     */
    list(documentType?: NumberFormatDocumentType): Promise<NumberFormat[]>;
}
//# sourceMappingURL=number-formats.d.ts.map