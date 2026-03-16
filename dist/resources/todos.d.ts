import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
export type TodoRelatedObjectType = 'Invoice' | 'Expense' | 'Subject' | 'Generator' | 'RecurringGenerator' | 'ExpenseGenerator';
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
export declare class TodosResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListTodosOptions): Promise<Todo[]>;
    /**
     * Toggles the completion state of a todo.
     * Sets `completed_at` if null, or clears it if already completed.
     * @see https://www.fakturoid.cz/api/v3/todos#todo-toggle-completion
     */
    toggleCompletion(id: number): Promise<Todo>;
    /**
     * Async generator that iterates through all pages of todos.
     * Yields individual todos. Use with `for await...of`.
     */
    listAll(options?: Omit<ListTodosOptions, 'page'>): AsyncGenerator<Todo, void, undefined>;
}
//# sourceMappingURL=todos.d.ts.map