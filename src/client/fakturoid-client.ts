import { OAuthService } from '../auth/oauth-service';
import type { FakturoidTokenStore } from '../auth/token-store';
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
import type { FakturoidAppConfig, FakturoidAuth, FakturoidTokens } from '../types/common';

export interface CreateFakturoidClientParams {
  config: FakturoidAppConfig;
  tokenStore: FakturoidTokenStore;
}

export type TenantResources = {
  subjects: SubjectsResource;
  invoices: InvoicesResource;
  account: AccountResource;
  recurringGenerators: RecurringGeneratorsResource;
  generators: GeneratorsResource;
  invoiceMessages: InvoiceMessagesResource;
  invoicePayments: InvoicePaymentsResource;
  expenses: ExpensesResource;
  expensePayments: ExpensePaymentsResource;
  bankAccounts: BankAccountsResource;
  inventoryItems: InventoryItemsResource;
  inventoryMoves: InventoryMovesResource;
  webhooks: WebhooksResource;
  events: EventsResource;
  todos: TodosResource;
  inboxFiles: InboxFilesResource;
  users: UsersResource;
  numberFormats: NumberFormatsResource;
};

const DEFAULT_MAX_CACHE_SIZE = 1000;

export class FakturoidClient {
  public readonly subjects: SubjectsResource;

  public readonly invoices: InvoicesResource;

  public readonly account: AccountResource;

  private readonly oauth: OAuthService;

  private readonly tokenStore: FakturoidTokenStore;

  private readonly http: HttpClient;

  private readonly tenantCache = new Map<string, TenantResources>();

  private readonly maxCacheSize: number;

  public constructor(params: CreateFakturoidClientParams) {
    this.tokenStore = params.tokenStore;
    this.maxCacheSize =
      params.config.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE;
    this.http = new HttpClient({
      baseUrl: params.config.baseUrl ?? 'https://app.fakturoid.cz',
      userAgent: params.config.userAgent,
      maxConcurrency: params.config.maxConcurrency,
    });
    this.oauth = new OAuthService(params.config, params.tokenStore);

    const throwNoTenant = (): Promise<FakturoidAuth> => {
      throw new Error('Resources must be obtained via client.forTenant(tenantId)');
    };

    this.subjects = new SubjectsResource(this.http, throwNoTenant);
    this.invoices = new InvoicesResource(this.http, throwNoTenant);
    this.account = new AccountResource(this.http, throwNoTenant);
  }

  public getAuthorizationUrl(tenantId: string, state: string): URL {
    return this.oauth.getAuthorizationUrl({ tenantId, state });
  }

  public async handleOAuthCallback(params: {
    code: string;
    state: string;
    tenantId: string;
  }): Promise<FakturoidTokens> {
    return this.oauth.handleCallback({
      code: params.code,
      state: params.state,
      tenantId: params.tenantId,
    });
  }

  public async getTenantTokens(tenantId: string): Promise<FakturoidTokens | null> {
    return this.tokenStore.getTokens(tenantId);
  }

  /**
   * Connects a tenant using Client Credentials Flow (no user interaction).
   * Obtains an access token, resolves the account slug, and returns tenant resources.
   * @see https://www.fakturoid.cz/api/v3/authorization#client-credentials-flow
   */
  public async connectWithClientCredentials(
    tenantId: string,
    slug?: string,
  ): Promise<TenantResources> {
    await this.oauth.obtainClientCredentialsToken(tenantId, slug);
    return this.forTenant(tenantId);
  }

  /**
   * Revokes tokens both locally and on the Fakturoid server (if refresh token exists).
   */
  public async revokeTenant(tenantId: string): Promise<void> {
    const tokens = await this.tokenStore.getTokens(tenantId);
    this.tenantCache.delete(tenantId);

    if (tokens?.refreshToken) {
      try {
        await this.oauth.revokeToken(tokens.refreshToken);
      } catch {
        // Best-effort server-side revocation
      }
    }

    await this.tokenStore.deleteTokens(tenantId);
  }

  private getAuthForTenant(tenantId: string): () => Promise<FakturoidAuth> {
    return async (): Promise<FakturoidAuth> => {
      const tokens = await this.oauth.ensureValidTokensWithSlug(tenantId);
      if (!tokens) {
        throw new Error(`No Fakturoid tokens found for tenantId=${tenantId}`);
      }
      if (!tokens.fakturoidSlug) {
        throw new Error(
          `Fakturoid account slug not available for tenantId=${tenantId}. Complete OAuth and ensure the user has at least one account.`
        );
      }
      return { accessToken: tokens.accessToken, slug: tokens.fakturoidSlug };
    };
  }

  public forTenant(tenantId: string): TenantResources {
    const cached = this.tenantCache.get(tenantId);
    if (cached) return cached;

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

    const resources: TenantResources = {
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
      if (firstKey !== undefined) this.tenantCache.delete(firstKey);
    }
    this.tenantCache.set(tenantId, resources);
    return resources;
  }
}

export const createFakturoidClient = (params: CreateFakturoidClientParams): FakturoidClient =>
  new FakturoidClient(params);
