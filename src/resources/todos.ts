import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
import { paginateAll } from '../types/common';

export type TodoRelatedObjectType =
  | 'Invoice'
  | 'Expense'
  | 'Subject'
  | 'Generator'
  | 'RecurringGenerator'
  | 'ExpenseGenerator';

/**
 * Object related to a todo (e.g. Invoice, Subject, Expense).
 * @see https://www.fakturoid.cz/api/v3/todos
 */
export interface TodoRelatedObject {
  type: TodoRelatedObjectType;
  id: number;
}

/**
 * Fakturoid todo (system-generated notification).
 * Todos cannot be created/edited/deleted via API - only listed and toggled.
 * @see https://www.fakturoid.cz/api/v3/todos
 */
export interface Todo {
  id: number;
  name: string;
  created_at: DateString;
  completed_at: DateString | null;
  text: string;
  related_objects: TodoRelatedObject[];
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ListTodosOptions extends PaginationOptions {
  since?: DateString;
}

export class TodosResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListTodosOptions = {}): Promise<Todo[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);

    return this.http.request<Todo[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/todos.json`,
      accessToken,
      query,
    });
  }

  /**
   * Toggles the completion state of a todo.
   * Sets `completed_at` if null, or clears it if already completed.
   * @see https://www.fakturoid.cz/api/v3/todos#todo-toggle-completion
   */
  public async toggleCompletion(id: number): Promise<Todo> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<Todo>({
      method: 'POST',
      path: `/api/v3/accounts/${slug}/todos/${id}/toggle_completion.json`,
      accessToken,
    });
  }

  /**
   * Async generator that iterates through all pages of todos.
   * Yields individual todos. Use with `for await...of`.
   */
  public listAll(options: Omit<ListTodosOptions, 'page'> = {}): AsyncGenerator<Todo, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }
}
