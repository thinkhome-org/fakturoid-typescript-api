export interface HttpClientOptions {
    baseUrl: string;
    userAgent: string;
    /** Request timeout in milliseconds. Default 30000. */
    requestTimeoutMs?: number;
    /** Max concurrent requests. Omitted = no limit. */
    maxConcurrency?: number;
}
export interface AuthorizedRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    accessToken: string;
    query?: URLSearchParams;
    body?: unknown;
}
export declare class HttpClient {
    private readonly baseUrl;
    private readonly userAgent;
    private readonly requestTimeoutMs;
    private readonly maxConcurrency;
    private readonly concurrencyWaitQueue;
    private readonly concurrencyActive;
    constructor(options: HttpClientOptions);
    /**
     * Builds request URL; only appends query string when params are present.
     */
    private buildUrl;
    /**
     * Single attempt: fetch with timeout. Caller handles retry and body consumption.
     */
    private executeOneAttempt;
    /**
     * Shared retry loop. Returns the final Response on success.
     * On retryable status, consumes body then delays and retries.
     */
    private executeWithRetry;
    private runWithOptionalConcurrencyLimit;
    /**
     * Makes a raw HTTP request returning the Response object directly.
     * Handles retries and timeouts but does NOT parse the body.
     * Useful for binary downloads (PDF, attachments).
     */
    requestRaw(options: AuthorizedRequestOptions): Promise<Response>;
    request<TResponse>(options: AuthorizedRequestOptions): Promise<TResponse>;
}
//# sourceMappingURL=http-client.d.ts.map