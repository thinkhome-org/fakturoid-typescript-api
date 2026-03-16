import type { HttpClient } from '../http/http-client';
import type { DateString, FakturoidAuth, PaginationOptions } from '../types/common';
import { paginateAll } from '../types/common';

export type EventRelatedObjectType =
  | 'Invoice'
  | 'Expense'
  | 'ExpenseGenerator'
  | 'Subject'
  | 'Generator'
  | 'RecurringGenerator'
  | 'Estimate';

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

export class EventsResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  public async list(options: ListEventsOptions = {}): Promise<Event[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.subject_id != null) query.set('subject_id', String(options.subject_id));

    return this.http.request<Event[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/events.json`,
      accessToken,
      query,
    });
  }

  /**
   * Lists paid events (invoice/expense paid notifications).
   * @see https://www.fakturoid.cz/api/v3/events
   */
  public async listPaid(options: ListEventsOptions = {}): Promise<Event[]> {
    const { accessToken, slug } = await this.getAuth();
    const query = new URLSearchParams();
    if (options.page != null) query.set('page', String(options.page));
    if (options.since) query.set('since', options.since);
    if (options.subject_id != null) query.set('subject_id', String(options.subject_id));

    return this.http.request<Event[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/events/paid.json`,
      accessToken,
      query,
    });
  }

  /**
   * Async generator that iterates through all pages of events.
   * Yields individual events. Use with `for await...of`.
   */
  public listAll(
    options: Omit<ListEventsOptions, 'page'> = {}
  ): AsyncGenerator<Event, void, undefined> {
    return paginateAll((page) => this.list({ ...options, page }));
  }

  /**
   * Async generator that iterates through all pages of paid events.
   * Yields individual events. Use with `for await...of`.
   */
  public listAllPaid(
    options: Omit<ListEventsOptions, 'page'> = {}
  ): AsyncGenerator<Event, void, undefined> {
    return paginateAll((page) => this.listPaid({ ...options, page }));
  }
}
