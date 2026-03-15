import type { FakturoidTokens } from '../types/common';

export interface FakturoidTokenStore {
  getTokens(tenantId: string): Promise<FakturoidTokens | null>;

  saveTokens(tenantId: string, tokens: FakturoidTokens): Promise<void>;

  deleteTokens(tenantId: string): Promise<void>;
}
