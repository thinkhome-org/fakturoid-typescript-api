import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
/**
 * Inbox file as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3/inbox-files
 */
export interface InboxFile {
    id: number;
    filename: string;
    bytesize: number;
    send_to_ocr: boolean;
    sent_to_ocr_at: DateString | null;
    ocr_status: 'created' | 'processing' | 'processing_failed' | 'processing_rejected' | 'processed' | null;
    ocr_completed_at: DateString | null;
    download_url: string;
    created_at: DateString;
    updated_at: DateString;
    [key: string]: unknown;
}
/**
 * Payload for uploading a file to inbox (Base64-encoded Data URI content).
 * @see https://www.fakturoid.cz/api/v3/inbox-files#create-inbox-file
 */
export interface NewInboxFile {
    /** Base64-encoded file content as Data URI (e.g. "data:application/pdf;base64,..."). */
    attachment: string;
    /** Optional file name. If not provided, derived from MIME type. */
    filename?: string;
    /** Send file to OCR for automatic processing. */
    send_to_ocr?: boolean;
    [key: string]: unknown;
}
export declare class InboxFilesResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    /**
     * Lists inbox files (paginated, 40 per page).
     * @see https://www.fakturoid.cz/api/v3/inbox-files#inbox-files-index
     */
    list(options?: PaginationOptions): Promise<InboxFile[]>;
    /**
     * Uploads a file to inbox (Base64-encoded attachment as Data URI).
     * @see https://www.fakturoid.cz/api/v3/inbox-files#create-inbox-file
     */
    create(data: NewInboxFile): Promise<InboxFile>;
    /**
     * Sends inbox file to OCR processing.
     * @see https://www.fakturoid.cz/api/v3/inbox-files#send-inbox-file-to-ocr
     */
    sendToOcr(id: number): Promise<void>;
    /**
     * Downloads inbox file binary content.
     * @see https://www.fakturoid.cz/api/v3/inbox-files#download-inbox-file
     */
    download(id: number): Promise<ArrayBuffer>;
    /**
     * Deletes an inbox file.
     * @see https://www.fakturoid.cz/api/v3/inbox-files#delete-inbox-file
     */
    delete(id: number): Promise<void>;
    /**
     * Async generator that iterates through all pages of inbox files.
     * Yields individual inbox files. Use with `for await...of`.
     */
    listAll(): AsyncGenerator<InboxFile, void, undefined>;
}
//# sourceMappingURL=inbox-files.d.ts.map