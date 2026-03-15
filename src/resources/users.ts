import type { HttpClient } from '../http/http-client';
import type { FakturoidAllowedScope, FakturoidAuth } from '../types/common';

/**
 * User as returned by the account users list endpoint.
 * @see https://www.fakturoid.cz/api/v3/users#users-index
 */
export interface User {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  permission: string;
  allowed_scope: FakturoidAllowedScope[];
  [key: string]: unknown;
}

/**
 * Account entry in the current user response.
 * @see https://www.fakturoid.cz/api/v3/users#current-user
 */
export interface UserAccount {
  slug: string;
  logo: string | null;
  name: string;
  registration_no: string | null;
  permission: string;
  allowed_scope: FakturoidAllowedScope[];
}

/**
 * Current user as returned by GET /user.json.
 * @see https://www.fakturoid.cz/api/v3/users#current-user
 */
export interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  default_account: string | null;
  accounts: UserAccount[];
  [key: string]: unknown;
}

export class UsersResource {
  private readonly http: HttpClient;

  private readonly getAuth: () => Promise<FakturoidAuth>;

  public constructor(http: HttpClient, getAuth: () => Promise<FakturoidAuth>) {
    this.http = http;
    this.getAuth = getAuth;
  }

  /**
   * Gets the current authenticated user and their accounts (no slug in path).
   * @see https://www.fakturoid.cz/api/v3/users#current-user
   */
  public async getCurrentUser(): Promise<CurrentUser> {
    const { accessToken } = await this.getAuth();
    return this.http.request<CurrentUser>({
      method: 'GET',
      path: '/api/v3/user.json',
      accessToken,
    });
  }

  /**
   * Lists users for the account.
   * @see https://www.fakturoid.cz/api/v3/users#users-index
   */
  public async list(): Promise<User[]> {
    const { accessToken, slug } = await this.getAuth();
    return this.http.request<User[]>({
      method: 'GET',
      path: `/api/v3/accounts/${slug}/users.json`,
      accessToken,
    });
  }
}
