import { OAuthService } from '../auth/oauth-service';
import { HttpClient } from '../http/http-client';
import { AccountResource } from '../resources/account';
import { BankAccountsResource } from '../resources/bank-accounts';
import { EventsResource } from '../resources/events';
import { ExpensePaymentsResource } from '../resources/expense-payments';
import { ExpensesResource } from '../resources/expenses';
import { GeneratorsResource } from '../resources/generators';
import { InboxFilesResource } from '../resources/inbox-files';
import { InventoryItemsResource } from '../resources/inventory-items';
import { InventoryMovesResource } from '../resources/inventory-moves';
import { InvoiceMessagesResource } from '../resources/invoice-messages';
import { InvoicePaymentsResource } from '../resources/invoice-payments';
import { InvoicesResource } from '../resources/invoices';
import { NumberFormatsResource } from '../resources/number-formats';
import { RecurringGeneratorsResource } from '../resources/recurring-generators';
import { SubjectsResource } from '../resources/subjects';
import { TodosResource } from '../resources/todos';
import { UsersResource } from '../resources/users';
import { WebhooksResource } from '../resources/webhooks';
const DEFAULT_MAX_CACHE_SIZE = 1000;
export class FakturoidClient {
    subjects;
    invoices;
    account;
    oauth;
    tokenStore;
    http;
    tenantCache = new Map();
    maxCacheSize;
    constructor(params) {
        this.tokenStore = params.tokenStore;
        this.maxCacheSize =
            params.config.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE;
        this.http = new HttpClient({
            baseUrl: params.config.baseUrl ?? 'https://app.fakturoid.cz',
            userAgent: params.config.userAgent,
            maxConcurrency: params.config.maxConcurrency,
        });
        this.oauth = new OAuthService(params.config, params.tokenStore);
        const throwNoTenant = () => {
            throw new Error('Resources must be obtained via client.forTenant(tenantId)');
        };
        this.subjects = new SubjectsResource(this.http, throwNoTenant);
        this.invoices = new InvoicesResource(this.http, throwNoTenant);
        this.account = new AccountResource(this.http, throwNoTenant);
    }
    getAuthorizationUrl(tenantId, state) {
        return this.oauth.getAuthorizationUrl({ tenantId, state });
    }
    async handleOAuthCallback(params) {
        return this.oauth.handleCallback({
            code: params.code,
            state: params.state,
            tenantId: params.tenantId,
        });
    }
    async getTenantTokens(tenantId) {
        return this.tokenStore.getTokens(tenantId);
    }
    /**
     * Connects a tenant using Client Credentials Flow (no user interaction).
     * Obtains an access token, resolves the account slug, and returns tenant resources.
     * @see https://www.fakturoid.cz/api/v3/authorization#client-credentials-flow
     */
    async connectWithClientCredentials(tenantId, slug) {
        await this.oauth.obtainClientCredentialsToken(tenantId, slug);
        return this.forTenant(tenantId);
    }
    /**
     * Revokes tokens both locally and on the Fakturoid server (if refresh token exists).
     */
    async revokeTenant(tenantId) {
        const tokens = await this.tokenStore.getTokens(tenantId);
        this.tenantCache.delete(tenantId);
        if (tokens?.refreshToken) {
            try {
                await this.oauth.revokeToken(tokens.refreshToken);
            }
            catch {
                // Best-effort server-side revocation
            }
        }
        await this.tokenStore.deleteTokens(tenantId);
    }
    getAuthForTenant(tenantId) {
        return async () => {
            const tokens = await this.oauth.ensureValidTokensWithSlug(tenantId);
            if (!tokens) {
                throw new Error(`No Fakturoid tokens found for tenantId=${tenantId}`);
            }
            if (!tokens.fakturoidSlug) {
                throw new Error(`Fakturoid account slug not available for tenantId=${tenantId}. Complete OAuth and ensure the user has at least one account.`);
            }
            return { accessToken: tokens.accessToken, slug: tokens.fakturoidSlug };
        };
    }
    forTenant(tenantId) {
        const cached = this.tenantCache.get(tenantId);
        if (cached)
            return cached;
        const getAuth = this.getAuthForTenant(tenantId);
        const subjects = new SubjectsResource(this.http, getAuth);
        const invoices = new InvoicesResource(this.http, getAuth);
        const account = new AccountResource(this.http, getAuth);
        const recurringGenerators = new RecurringGeneratorsResource(this.http, getAuth);
        const generators = new GeneratorsResource(this.http, getAuth);
        const invoiceMessages = new InvoiceMessagesResource(this.http, getAuth);
        const invoicePayments = new InvoicePaymentsResource(this.http, getAuth);
        const expenses = new ExpensesResource(this.http, getAuth);
        const expensePayments = new ExpensePaymentsResource(this.http, getAuth);
        const bankAccounts = new BankAccountsResource(this.http, getAuth);
        const inventoryItems = new InventoryItemsResource(this.http, getAuth);
        const inventoryMoves = new InventoryMovesResource(this.http, getAuth);
        const webhooks = new WebhooksResource(this.http, getAuth);
        const events = new EventsResource(this.http, getAuth);
        const todos = new TodosResource(this.http, getAuth);
        const inboxFiles = new InboxFilesResource(this.http, getAuth);
        const users = new UsersResource(this.http, getAuth);
        const numberFormats = new NumberFormatsResource(this.http, getAuth);
        const resources = {
            subjects,
            invoices,
            account,
            recurringGenerators,
            generators,
            invoiceMessages,
            invoicePayments,
            expenses,
            expensePayments,
            bankAccounts,
            inventoryItems,
            inventoryMoves,
            webhooks,
            events,
            todos,
            inboxFiles,
            users,
            numberFormats,
        };
        if (this.tenantCache.size >= this.maxCacheSize) {
            const firstKey = this.tenantCache.keys().next().value;
            if (firstKey !== undefined)
                this.tenantCache.delete(firstKey);
        }
        this.tenantCache.set(tenantId, resources);
        return resources;
    }
}
export const createFakturoidClient = (params) => new FakturoidClient(params);
//# sourceMappingURL=fakturoid-client.js.map