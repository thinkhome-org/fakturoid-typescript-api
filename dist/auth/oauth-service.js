import { FakturoidApiError } from '../types/common';
const TOKEN_PATH = '/api/v3/oauth/token';
const REVOKE_PATH = '/api/v3/oauth/revoke';
const USER_PATH = '/api/v3/user.json';
/**
 * Builds HTTP Basic auth header value for OAuth token endpoints (client_id:client_secret).
 * Per Fakturoid API docs: Authorization: Basic <urlsafe base64(client_id:client_secret)>
 */
function buildBasicAuthHeader(clientId, clientSecret) {
    const credentials = `${clientId}:${clientSecret}`;
    const encoded = typeof Buffer !== 'undefined'
        ? Buffer.from(credentials, 'utf8').toString('base64')
        : btoa(credentials);
    const urlSafeEncoded = encoded.replaceAll('+', '-').replaceAll('/', '_');
    return `Basic ${urlSafeEncoded}`;
}
export class OAuthService {
    config;
    tokenStore;
    refreshPromises = new Map();
    constructor(config, tokenStore) {
        this.config = config;
        this.tokenStore = tokenStore;
    }
    getAuthorizationUrl(options) {
        const baseUrl = this.resolveBaseUrl();
        const url = new URL('/api/v3/oauth', baseUrl);
        url.searchParams.set('client_id', this.config.clientId);
        url.searchParams.set('redirect_uri', this.config.redirectUri);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('state', options.state);
        return url;
    }
    async handleCallback(params) {
        const baseUrl = this.resolveBaseUrl();
        const url = new URL(TOKEN_PATH, baseUrl);
        const body = new URLSearchParams();
        body.set('grant_type', 'authorization_code');
        body.set('redirect_uri', this.config.redirectUri);
        body.set('code', params.code);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': this.config.userAgent,
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: buildBasicAuthHeader(this.config.clientId, this.config.clientSecret),
            },
            body: body.toString(),
        });
        if (!response.ok) {
            await this.throwTokenError(response, 'authorization code exchange');
        }
        const json = (await response.json());
        const tokens = {
            accessToken: json.access_token,
            refreshToken: json.refresh_token,
            expiresAt: Date.now() + json.expires_in * 1000,
            scope: json.scope,
        };
        await this.tokenStore.saveTokens(params.tenantId, tokens);
        const withSlug = await this.fetchAndSaveSlugForTenant(params.tenantId, tokens.accessToken);
        return withSlug ?? tokens;
    }
    /** Returns tokens with slug filled from API if missing. */
    async ensureValidTokensWithSlug(tenantId) {
        const tokens = await this.ensureValidTokens(tenantId);
        if (!tokens)
            return null;
        if (tokens.fakturoidSlug)
            return tokens;
        const updated = await this.fetchAndSaveSlugForTenant(tenantId, tokens.accessToken);
        return updated ?? tokens;
    }
    /**
     * Fetches current user from API, extracts account slug, saves to token store and returns updated tokens.
     * Used after OAuth callback and when ensureValidTokens returns tokens without slug.
     */
    async fetchAndSaveSlugForTenant(tenantId, accessToken) {
        const slug = await this.fetchCurrentUserSlug(accessToken);
        if (!slug)
            return null;
        const current = await this.tokenStore.getTokens(tenantId);
        if (!current)
            return null;
        const updated = { ...current, fakturoidSlug: slug };
        await this.tokenStore.saveTokens(tenantId, updated);
        return updated;
    }
    /**
     * GET /api/v3/user.json (no slug in path). Returns first account slug or default_account.
     */
    async fetchCurrentUserSlug(accessToken) {
        const baseUrl = this.resolveBaseUrl();
        const url = new URL(USER_PATH, baseUrl);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': this.config.userAgent,
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok)
            return null;
        const data = (await response.json());
        const slug = data.default_account ?? data.accounts?.[0]?.slug ?? null;
        return slug ?? null;
    }
    /**
     * Obtains an access token via Client Credentials Flow (no user interaction).
     * Useful for server-to-server integrations and scripts accessing your own account.
     * @see https://www.fakturoid.cz/api/v3/authorization#client-credentials-flow
     */
    async obtainClientCredentialsToken(tenantId, slug) {
        const baseUrl = this.resolveBaseUrl();
        const url = new URL(TOKEN_PATH, baseUrl);
        const body = new URLSearchParams();
        body.set('grant_type', 'client_credentials');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': this.config.userAgent,
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: buildBasicAuthHeader(this.config.clientId, this.config.clientSecret),
            },
            body: body.toString(),
        });
        if (!response.ok) {
            await this.throwTokenError(response, 'client credentials');
        }
        const json = (await response.json());
        const tokens = {
            accessToken: json.access_token,
            expiresAt: Date.now() + json.expires_in * 1000,
            scope: json.scope,
            fakturoidSlug: slug,
        };
        await this.tokenStore.saveTokens(tenantId, tokens);
        if (!slug) {
            const withSlug = await this.fetchAndSaveSlugForTenant(tenantId, tokens.accessToken);
            return withSlug ?? tokens;
        }
        return tokens;
    }
    async ensureValidTokens(tenantId) {
        const current = await this.tokenStore.getTokens(tenantId);
        if (!current) {
            return null;
        }
        if (current.expiresAt > Date.now() + 60_000) {
            return current;
        }
        let pending = this.refreshPromises.get(tenantId);
        if (!pending) {
            pending = current.refreshToken
                ? this.refreshTokens(tenantId, current.refreshToken)
                : this.obtainClientCredentialsToken(tenantId, current.fakturoidSlug);
            this.refreshPromises.set(tenantId, pending);
            pending.finally(() => this.refreshPromises.delete(tenantId));
        }
        return pending;
    }
    async refreshTokens(tenantId, refreshToken) {
        const baseUrl = this.resolveBaseUrl();
        const url = new URL(TOKEN_PATH, baseUrl);
        const body = new URLSearchParams();
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', refreshToken);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': this.config.userAgent,
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: buildBasicAuthHeader(this.config.clientId, this.config.clientSecret),
            },
            body: body.toString(),
        });
        if (!response.ok) {
            await this.throwTokenError(response, 'token refresh');
        }
        const json = (await response.json());
        const existing = await this.tokenStore.getTokens(tenantId);
        const tokens = {
            accessToken: json.access_token,
            refreshToken: json.refresh_token ?? existing?.refreshToken,
            expiresAt: Date.now() + json.expires_in * 1000,
            scope: json.scope,
            fakturoidSlug: existing?.fakturoidSlug,
            fakturoidAccountId: existing?.fakturoidAccountId,
        };
        await this.tokenStore.saveTokens(tenantId, tokens);
        return tokens;
    }
    /**
     * Revokes the OAuth access and refresh tokens on the Fakturoid server.
     * After revocation, the user must re-authorize.
     * @see https://www.fakturoid.cz/api/v3/authorization#revoke-access
     */
    async revokeToken(refreshToken) {
        const baseUrl = this.resolveBaseUrl();
        const url = new URL(REVOKE_PATH, baseUrl);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': this.config.userAgent,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: buildBasicAuthHeader(this.config.clientId, this.config.clientSecret),
            },
            body: JSON.stringify({ token: refreshToken }),
        });
        if (!response.ok) {
            await this.throwTokenError(response, 'token revocation');
        }
    }
    resolveBaseUrl() {
        if (this.config.baseUrl) {
            return this.config.baseUrl;
        }
        return 'https://app.fakturoid.cz';
    }
    async throwTokenError(response, context) {
        let message = `Fakturoid OAuth ${context} failed with status ${response.status}`;
        try {
            const text = await response.text();
            if (text) {
                const body = JSON.parse(text);
                if (typeof body.error_description === 'string') {
                    message = body.error_description;
                }
                else if (typeof body.error === 'string') {
                    message = body.error_description ? String(body.error_description) : body.error;
                }
            }
        }
        catch {
            // keep default message
        }
        throw new FakturoidApiError(response.status, message);
    }
}
//# sourceMappingURL=oauth-service.js.map