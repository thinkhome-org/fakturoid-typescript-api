export class UsersResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    /**
     * Gets the current authenticated user and their accounts (no slug in path).
     * @see https://www.fakturoid.cz/api/v3/users#current-user
     */
    async getCurrentUser() {
        const { accessToken } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: '/api/v3/user.json',
            accessToken,
        });
    }
    /**
     * Lists users for the account.
     * @see https://www.fakturoid.cz/api/v3/users#users-index
     */
    async list() {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/users.json`,
            accessToken,
        });
    }
}
//# sourceMappingURL=users.js.map