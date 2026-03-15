/**
 * Bank accounts are read-only. Only listing is supported via API.
 * @see https://www.fakturoid.cz/api/v3/bank-accounts
 */
export class BankAccountsResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    /**
     * Lists all bank accounts for the account.
     * @see https://www.fakturoid.cz/api/v3/bank-accounts#banks-accounts-index
     */
    async list() {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/bank_accounts.json`,
            accessToken,
        });
    }
}
//# sourceMappingURL=bank-accounts.js.map