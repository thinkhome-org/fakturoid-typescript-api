export class ExpensePaymentsResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    /**
     * Creates a payment for the given expense.
     * @see https://www.fakturoid.cz/api/v3/expense-payments#create-payment
     */
    async create(expenseId, data = {}) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/expenses/${expenseId}/payments.json`,
            accessToken,
            body: data,
        });
    }
    /**
     * Deletes a payment from an expense.
     * @see https://www.fakturoid.cz/api/v3/expense-payments#delete-expense-payment
     */
    async delete(expenseId, paymentId) {
        const { accessToken, slug } = await this.getAuth();
        await this.http.request({
            method: 'DELETE',
            path: `/api/v3/accounts/${slug}/expenses/${expenseId}/payments/${paymentId}.json`,
            accessToken,
        });
    }
}
//# sourceMappingURL=expense-payments.js.map