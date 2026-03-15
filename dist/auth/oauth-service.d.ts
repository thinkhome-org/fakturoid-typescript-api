import type { FakturoidAppConfig, FakturoidTokens } from '../types/common';
import type { FakturoidTokenStore } from './token-store';
export interface AuthorizationUrlOptions {
    tenantId: string;
    state: string;
}
export interface OAuthCallbackParams {
    code: string;
    state: string;
    tenantId: string;
}
export declare class OAuthService {
    private readonly config;
    private readonly tokenStore;
    private readonly refreshPromises;
    constructor(config: FakturoidAppConfig, tokenStore: FakturoidTokenStore);
    getAuthorizationUrl(options: AuthorizationUrlOptions): URL;
    handleCallback(params: OAuthCallbackParams): Promise<FakturoidTokens>;
    /** Returns tokens with slug filled from API if missing. */
    ensureValidTokensWithSlug(tenantId: string): Promise<FakturoidTokens | null>;
    /**
     * Fetches current user from API, extracts account slug, saves to token store and returns updated tokens.
     * Used after OAuth callback and when ensureValidTokens returns tokens without slug.
     */
    fetchAndSaveSlugForTenant(tenantId: string, accessToken: string): Promise<FakturoidTokens | null>;
    /**
     * GET /api/v3/user.json (no slug in path). Returns first account slug or default_account.
     */
    fetchCurrentUserSlug(accessToken: string): Promise<string | null>;
    /**
     * Obtains an access token via Client Credentials Flow (no user interaction).
     * Useful for server-to-server integrations and scripts accessing your own account.
     * @see https://www.fakturoid.cz/api/v3/authorization#client-credentials-flow
     */
    obtainClientCredentialsToken(tenantId: string, slug?: string): Promise<FakturoidTokens>;
    ensureValidTokens(tenantId: string): Promise<FakturoidTokens | null>;
    private refreshTokens;
    /**
     * Revokes the OAuth access and refresh tokens on the Fakturoid server.
     * After revocation, the user must re-authorize.
     * @see https://www.fakturoid.cz/api/v3/authorization#revoke-access
     */
    revokeToken(refreshToken: string): Promise<void>;
    private resolveBaseUrl;
    private throwTokenError;
}
//# sourceMappingURL=oauth-service.d.ts.map