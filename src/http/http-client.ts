import { FakturoidApiError } from '../types/common';

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

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

const MAX_RETRIES = 3;

const RETRY_BASE_DELAY_MS = 250;

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/**
 * Parses X-RateLimit header (e.g. "default;r=398;t=55") and returns delay in ms.
 * Uses `t` (remaining seconds until reset). Falls back to defaultDelayMs if missing or invalid.
 * @see https://www.fakturoid.cz/api/v3 (Rate-limiting)
 */
function get429RetryDelayMs(response: Response, defaultDelayMs: number): number {
  const raw = response.headers.get('X-RateLimit');
  if (!raw) return defaultDelayMs;
  const match = raw.match(/;t=(\d+)/);
  const tStr = match?.[1];
  if (tStr === undefined) return defaultDelayMs;
  const seconds = Number.parseInt(tStr, 10);
  if (Number.isNaN(seconds) || seconds < 0) return defaultDelayMs;
  return Math.min(seconds * 1000, 60_000);
}

/** Consumes response body to avoid connection leaks when retrying. */
async function consumeResponseBody(response: Response): Promise<void> {
  await response.text();
}

function buildErrorFromResponse(response: Response, bodyText: string | null): FakturoidApiError {
  let details: Record<string, unknown> | undefined;
  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') details = parsed;
    } catch {
      // ignore parse errors
    }
  }
  const message =
    details && details.error_description != null
      ? String(details.error_description)
      : details && details.message != null
        ? String(details.message)
        : `Fakturoid API request failed with status ${response.status}`;
  return new FakturoidApiError(response.status, message, {
    errors: details?.errors as Record<string, unknown> | undefined,
    ...details,
  });
}

/**
 * Simple semaphore: limits concurrent operations to maxConcurrency.
 */
async function withConcurrencyLimit<T>(
  maxConcurrency: number,
  waitQueue: Array<() => void>,
  activeCount: { current: number },
  fn: () => Promise<T>,
): Promise<T> {
  if (activeCount.current >= maxConcurrency) {
    await new Promise<void>((resolve) => {
      waitQueue.push(resolve);
    });
  }
  activeCount.current += 1;
  try {
    return await fn();
  } finally {
    activeCount.current -= 1;
    const next = waitQueue.shift();
    if (next) next();
  }
}

export class HttpClient {
  private readonly baseUrl: string;

  private readonly userAgent: string;

  private readonly requestTimeoutMs: number;

  private readonly maxConcurrency: number | undefined;

  private readonly concurrencyWaitQueue: Array<() => void> = [];

  private readonly concurrencyActive = { current: 0 };

  public constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.userAgent = options.userAgent;
    this.requestTimeoutMs =
      options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    this.maxConcurrency = options.maxConcurrency;
  }

  /**
   * Builds request URL; only appends query string when params are present.
   */
  private buildUrl(options: AuthorizedRequestOptions): URL {
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
  private async executeOneAttempt(
    url: URL,
    options: AuthorizedRequestOptions,
    headers: Record<string, string>,
  ): Promise<Response> {
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
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new FakturoidApiError(
          408,
          `Request timed out after ${this.requestTimeoutMs}ms`,
        );
      }
      throw err;
    }
  }

  /**
   * Shared retry loop. Returns the final Response on success.
   * On retryable status, consumes body then delays and retries.
   */
  private async executeWithRetry(
    options: AuthorizedRequestOptions,
    headers: Record<string, string>,
  ): Promise<Response> {
    const url = this.buildUrl(options);
    let attempt = 0;

    for (;;) {
      const response = await this.executeOneAttempt(url, options, headers);

      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
        await consumeResponseBody(response);
        const fallbackDelay = RETRY_BASE_DELAY_MS * 2 ** attempt;
        const delay =
          response.status === 429
            ? get429RetryDelayMs(response, fallbackDelay)
            : fallbackDelay;
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt += 1;
        continue;
      }

      return response;
    }
  }

  private async runWithOptionalConcurrencyLimit<T>(
    fn: () => Promise<T>,
  ): Promise<T> {
    if (this.maxConcurrency != null && this.maxConcurrency > 0) {
      return withConcurrencyLimit(
        this.maxConcurrency,
        this.concurrencyWaitQueue,
        this.concurrencyActive,
        fn,
      );
    }
    return fn();
  }

  /**
   * Makes a raw HTTP request returning the Response object directly.
   * Handles retries and timeouts but does NOT parse the body.
   * Useful for binary downloads (PDF, attachments).
   */
  public async requestRaw(options: AuthorizedRequestOptions): Promise<Response> {
    return this.runWithOptionalConcurrencyLimit(async () => {
      const response = await this.executeWithRetry(options, {});

      if (!response.ok && response.status !== 204) {
        const text = await response.text();
        throw buildErrorFromResponse(response, text);
      }

      return response;
    });
  }

  public async request<TResponse>(options: AuthorizedRequestOptions): Promise<TResponse> {
    return this.runWithOptionalConcurrencyLimit(async () => {
      const headers: Record<string, string> = {
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
        return undefined as TResponse;
      }

      const data = (await response.json()) as TResponse;
      return data;
    });
  }
}
