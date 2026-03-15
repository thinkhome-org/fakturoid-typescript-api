export class InvoiceMessagesResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    async sendInvoiceByEmail(invoiceId, payload = {}) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/invoices/${invoiceId}/message.json`,
            accessToken,
            body: payload,
        });
    }
}
//# sourceMappingURL=invoice-messages.js.map