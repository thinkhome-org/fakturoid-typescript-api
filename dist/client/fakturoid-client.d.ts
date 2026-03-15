import type { FakturoidTokenStore } from '../auth/token-store';
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
import type { FakturoidAppConfig, FakturoidTokens } from '../types/common';
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
export declare class FakturoidClient {
    readonly subjects: SubjectsResource;
    readonly invoices: InvoicesResource;
    readonly account: AccountResource;
    private readonly oauth;
    private readonly tokenStore;
    private readonly http;
    private readonly tenantCache;
    private readonly maxCacheSize;
    constructor(params: CreateFakturoidClientParams);
    getAuthorizationUrl(tenantId: string, state: string): URL;
    handleOAuthCallback(params: {
        code: string;
        state: string;
        tenantId: string;
    }): Promise<FakturoidTokens>;
    getTenantTokens(tenantId: string): Promise<FakturoidTokens | null>;
    /**
     * Connects a tenant using Client Credentials Flow (no user interaction).
     * Obtains an access token, resolves the account slug, and returns tenant resources.
     * @see https://www.fakturoid.cz/api/v3/authorization#client-credentials-flow
     */
    connectWithClientCredentials(tenantId: string, slug?: string): Promise<TenantResources>;
    /**
     * Revokes tokens both locally and on the Fakturoid server (if refresh token exists).
     */
    revokeTenant(tenantId: string): Promise<void>;
    private getAuthForTenant;
    forTenant(tenantId: string): TenantResources;
}
export declare const createFakturoidClient: (params: CreateFakturoidClientParams) => FakturoidClient;
//# sourceMappingURL=fakturoid-client.d.ts.map