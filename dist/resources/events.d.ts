import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
export type EventRelatedObjectType = 'Invoice' | 'Expense' | 'ExpenseGenerator' | 'Subject' | 'Generator' | 'RecurringGenerator' | 'Estimate';
export interface EventRelatedObject {
    type: EventRelatedObjectType;
    id: number;
}
export interface EventUser {
    id: number;
    full_name: string;
    avatar: string | null;
}
export interface Event {
    name: string;
    created_at: DateString;
    text: string;
    related_objects: EventRelatedObject[];
    user: EventUser | null;
    params?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface ListEventsOptions extends PaginationOptions {
    since?: DateString;
    subject_id?: number;
}
export declare class EventsResource {
    private readonly http;
    private readonly getAuth;
    constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>);
    list(options?: ListEventsOptions): Promise<Event[]>;
    /**
     * Lists paid events (invoice/expense paid notifications).
     * @see https://www.fakturoid.cz/api/v3/events
     */
    listPaid(options?: ListEventsOptions): Promise<Event[]>;
    /**
     * Async generator that iterates through all pages of events.
     * Yields individual events. Use with `for await...of`.
     */
    listAll(options?: Omit<ListEventsOptions, 'page'>): AsyncGenerator<Event, void, undefined>;
    /**
     * Async generator that iterates through all pages of paid events.
     * Yields individual events. Use with `for await...of`.
     */
    listAllPaid(options?: Omit<ListEventsOptions, 'page'>): AsyncGenerator<Event, void, undefined>;
}
//# sourceMappingURL=events.d.ts.map