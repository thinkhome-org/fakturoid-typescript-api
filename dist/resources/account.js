export class AccountResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    async getAccountInfo() {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/account.json`,
            accessToken,
        });
    }
}
//# sourceMappingURL=account.js.map