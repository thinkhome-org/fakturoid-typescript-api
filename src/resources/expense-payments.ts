import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, MoneyAmount } from '../types/common';

/**
 * Expense payment as returned by Fakturoid API v3.
 * @see https://www.fakturoid.cz/api/v3/expense-payments
 */
export interface ExpensePayment {
  id: number;
  paid_on: DateString;
  currency: string;
  amount: MoneyAmount;
  native_amount: MoneyAmount;
  variable_symbol: string;
  bank_account_id: number;
  created_at: DateString;
  updated_at: DateString;
  [key: string]: unknown;
}

/**
 * Payload for creating an expense payment. All fields are optional with sensible defaults.
 * @see https://www.fakturoid.cz/api/v3/expense-payments#create-payment
 */
export interface NewExpensePayment {
  /** Payment date. Default: Today. */
  paid_on?: DateString;
  /** Paid amount in document currency. Default: Remaining amount to pay. */
  amount?: MoneyAmount;
  /** Paid amount in account currency. Default: Remaining amount converted. */
  native_amount?: MoneyAmount;
  /** Mark document as paid? Default: true if total paid >= remaining. */
  mark_document_as_paid?: boolean;
  /** Payment variable symbol. Default: Expense variable symbol. */
  variable_symbol?: string;
  /** Bank account ID. Default: Expense bank account or default bank account. */
  bank_account_id?: number;
  [key: string]: unknown;
}

export class ExpensePaymentsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  /**
   * Creates a payment for the given expense.
   * @see https://www.fakturoid.cz/api/v3/expense-payments#create-payment
   */
  public async create(expenseId: number, data: NewExpensePayment = {}): Promise<ExpensePayment> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<ExpensePayment>({
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
  public async delete(expenseId: number, paymentId: number): Promise<void> {
    const { accessToken, slug } = await this.getAuth();
    await this.http.request<undefined>({
      method: 'DELETE',
      path: `/api/v3/accounts/${slug}/expenses/${expenseId}/payments/${paymentId}.json`,
      accessToken,
    });
  }
}
