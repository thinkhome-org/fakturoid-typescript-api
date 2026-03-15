import { paginateAll } from '../types/common';
export class TodosResource {
    http;
    getAuth;
    constructor(http, getAuth) {
        this.http = http;
        this.getAuth = getAuth;
    }
    async list(options = {}) {
        const { accessToken, slug } = await this.getAuth();
        const query = new URLSearchParams();
        if (options.page != null)
            query.set('page', String(options.page));
        if (options.since)
            query.set('since', options.since);
        return this.http.request({
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
    async toggleCompletion(id) {
        const { accessToken, slug } = await this.getAuth();
        return this.http.request({
            method: 'POST',
            path: `/api/v3/accounts/${slug}/todos/${id}/toggle_completion.json`,
            accessToken,
        });
    }
    /**
     * Async generator that iterates through all pages of todos.
     * Yields individual todos. Use with `for await...of`.
     */
    listAll(options = {}) {
        return paginateAll((page) => this.list({ ...options, page }));
    }
}
//# sourceMappingURL=todos.js.map