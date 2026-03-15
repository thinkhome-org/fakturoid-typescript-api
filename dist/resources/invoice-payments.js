export class InvoicePaymentsResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    /**
     * Creates a payment for the given invoice.
     * @see https://www.fakturoid.cz/api/v3/invoice-payments#create-payment
     */
    async create(invoiceId, data = {}) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/invoices/${invoiceId}/payments.json`,
            accessToken,
            body: data,
        });
    }
    /**
     * Creates a tax document for the given invoice payment.
     * @see https://www.fakturoid.cz/api/v3/invoice-payments#create-tax-document
     */
    async createTaxDocument(invoiceId, paymentId) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/invoices/${invoiceId}/payments/${paymentId}/create_tax_document.json`,
            accessToken,
        });
    }
    /**
     * Deletes a payment from an invoice.
     * @see https://www.fakturoid.cz/api/v3/invoice-payments#delete-invoice-payment
     */
    async delete(invoiceId, paymentId) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/invoices/${invoiceId}/payments/${paymentId}.json`,
            accessToken,
        });
    }
}
//# sourceMappingURL=invoice-payments.js.map