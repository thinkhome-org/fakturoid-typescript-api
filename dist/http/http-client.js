import { FakturoidApiError } from '../types/common';
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 250;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
/**
 * Parses X-RateLimit header (e.g. "default;r=398;t=55") and returns delay in ms.
 * Uses `t` (remaining seconds until reset). Falls back to defaultDelayMs if missing or invalid.
 * @see https://www.fakturoid.cz/api/v3 (Rate-limiting)
 */
function get429RetryDelayMs(response, defaultDelayMs) {
    const raw = response.headers.get('X-RateLimit');
    if (!raw)
        return defaultDelayMs;
    const match = raw.match(/;t=(\d+)/);
    const tStr = match?.[1];
    if (tStr === undefined)
        return defaultDelayMs;
    const seconds = Number.parseInt(tStr, 10);
    if (Number.isNaN(seconds) || seconds < 0)
        return defaultDelayMs;
    return Math.min(seconds * 1000, 60_000);
}
/** Consumes response body to avoid connection leaks when retrying. */
async function consumeResponseBody(response) {
    await response.text();
}
function buildErrorFromResponse(response, bodyText) {
    let details;
    if (bodyText) {
        try {
            const parsed = JSON.parse(bodyText);
            if (parsed && typeof parsed === 'object')
                details = parsed;
        }
        catch {
            // ignore parse errors
        }
    }
    const message = details && details.error_description != null
        ? String(details.error_description)
        : details && details.message != null
            ? String(details.message)
            : `Fakturoid API request failed with status ${response.status}`;
    return new FakturoidApiError(response.status, message, {
        errors: details?.errors,
        ...details,
    });
}
/**
 * Simple semaphore: limits concurrent operations to maxConcurrency.
 */
async function withConcurrencyLimit(maxConcurrency, waitQueue, activeCount, fn) {
    if (activeCount.current >= maxConcurrency) {
        await new Promise((resolve) => {
            waitQueue.push(resolve);
        });
    }
    activeCount.current += 1;
    try {
        return await fn();
    }
    finally {
        activeCount.current -= 1;
        const next = waitQueue.shift();
        if (next)
            next();
    }
}
export class HttpClient {
    baseUrl;
    userAgent;
    requestTimeoutMs;
    maxConcurrency;
    concurrencyWaitQueue = [];
    concurrencyActive = { current: 0 };
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/+$/, '');
        this.userAgent = options.userAgent;
        this.requestTimeoutMs =
            options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
        this.maxConcurrency = options.maxConcurrency;
    }
    /**
     * Builds request URL; only appends query string when params are present.
     */
    buildUrl(options) {
        const path = options.path.replace(/^\/+/, '');
        const url = new URL(path, this.baseUrl);
        if (options.query && options.query.toString().length > 0) {
            url.search = options.query.toString();
        }
        return url;
    }
    /**
     * Single attempt: fetch with timeout. Caller handles retry and body consumption.
     */
    async executeOneAttempt(url, options, headers) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);
        try {
            const response = await fetch(url, {
                method: options.method,
                headers: {
                    ...headers,
                    'User-Agent': this.userAgent,
                    Authorization: `Bearer ${options.accessToken}`,
                },
                body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        }
        catch (err) {
            clearTimeout(timeoutId);
            if (err instanceof Error && err.name === 'AbortError') {
                throw new FakturoidApiError(408, `Request timed out after ${this.requestTimeoutMs}ms`);
            }
            throw err;
        }
    }
    /**
     * Shared retry loop. Returns the final Response on success.
     * On retryable status, consumes body then delays and retries.
     */
    async executeWithRetry(options, headers) {
        const url = this.buildUrl(options);
        let attempt = 0;
        for (;;) {
            const response = await this.executeOneAttempt(url, options, headers);
            if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
                await consumeResponseBody(response);
                const fallbackDelay = RETRY_BASE_DELAY_MS * 2 ** attempt;
                const delay = response.status === 429
                    ? get429RetryDelayMs(response, fallbackDelay)
                    : fallbackDelay;
                await new Promise((resolve) => setTimeout(resolve, delay));
                attempt += 1;
                continue;
            }
            return response;
        }
    }
    async runWithOptionalConcurrencyLimit(fn) {
        if (this.maxConcurrency != null && this.maxConcurrency > 0) {
            return withConcurrencyLimit(this.maxConcurrency, this.concurrencyWaitQueue, this.concurrencyActive, fn);
        }
        return fn();
    }
    /**
     * Makes a raw HTTP request returning the Response object directly.
     * Handles retries and timeouts but does NOT parse the body.
     * Useful for binary downloads (PDF, attachments).
     */
    async requestRaw(options) {
        return this.runWithOptionalConcurrencyLimit(async () => {
            const response = await this.executeWithRetry(options, {});
            if (!response.ok && response.status !== 204) {
                const text = await response.text();
                throw buildErrorFromResponse(response, text);
            }
            return response;
        });
    }
    async request(options) {
        return this.runWithOptionalConcurrencyLimit(async () => {
            const headers = {
                Accept: 'application/json',
            };
            if (options.body !== undefined) {
                headers['Content-Type'] = 'application/json';
            }
            const response = await this.executeWithRetry(options, headers);
            if (!response.ok) {
                const text = await response.text();
                throw buildErrorFromResponse(response, text);
            }
            if (response.status === 204) {
                return undefined;
            }
            const data = (await response.json());
            return data;
        });
    }
}
//# sourceMappingURL=http-client.js.map