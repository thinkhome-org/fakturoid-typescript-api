export class NumberFormatsResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    /**
     * Lists number formats for a given document type.
     * Only unarchived number formats are returned.
     * @see https://www.fakturoid.cz/api/v3/number-formats
     */
    async list(documentType = 'invoices') {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'GET',
            path: `/api/v3/accounts/${slug}/number_formats/${documentType}.json`,
            accessToken,
        });
    }
}
//# sourceMappingURL=number-formats.js.map