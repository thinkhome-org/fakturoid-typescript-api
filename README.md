# Fakturoid TypeScript API

TypeScript SDK for the [Fakturoid API v3](https://www.fakturoid.cz/api/v3), built for backend use cases, OAuth-based multi-tenant apps, and strongly typed integrations.

The library is designed around tenant-scoped access to Fakturoid accounts. It handles OAuth token exchange, token refresh, account slug discovery, and exposes typed resource clients for the main Fakturoid API endpoints.

The repository uses Bun as the primary package manager, test runner, and release toolchain. Node.js remains a supported runtime target for consumers of the published package. The package is published under the scoped name `@thinkhome-org/fakturoid-typescript-api`.

## Features

- TypeScript-first API client with exported request and response types
- OAuth 2.0 Authorization Code flow support
- Multi-tenant architecture via pluggable token storage
- Account slug resolution from `GET /api/v3/user.json`
- Resource clients for invoices, subjects, expenses, generators, webhooks, inventory, and more
- Backend-friendly design with no framework lock-in

## Installation

```bash
bun add @thinkhome-org/fakturoid-typescript-api
```

Node.js / npm fallback:

```bash
npm install @thinkhome-org/fakturoid-typescript-api
```

## Quick Start

```ts
import { createFakturoidClient } from '@thinkhome-org/fakturoid-typescript-api';

const client = createFakturoidClient({
  config: {
    clientId: process.env.FAKTUROID_CLIENT_ID!,
    clientSecret: process.env.FAKTUROID_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/api/fakturoid/callback',
    userAgent: 'YourAppName (you@example.com)',
    environment: 'production',
  },
  tokenStore: yourTokenStoreImplementation,
});

const authorizationUrl = client.getAuthorizationUrl('tenant-123', 'opaque-state');

await client.handleOAuthCallback({
  code: 'oauth-code',
  state: 'opaque-state',
  tenantId: 'tenant-123',
});

const fakturoid = client.forTenant('tenant-123');
const account = await fakturoid.account.getAccountInfo();
const invoices = await fakturoid.invoices.list();
const subjects = await fakturoid.subjects.list();
```

## Core Concepts

### 1. Token Store

You provide your own `FakturoidTokenStore` implementation. This keeps the SDK storage-agnostic and suitable for Convex, PostgreSQL, Redis, DynamoDB, or custom persistence layers.

The SDK stores:

- `accessToken`
- `refreshToken`
- `expiresAt`
- `scope`
- `fakturoidAccountId`
- `fakturoidSlug`

### 2. Tenant-Scoped Resources

After OAuth is completed, use `client.forTenant(tenantId)` to get resource clients bound to one tenant's tokens and Fakturoid account slug.

### 3. Account Slug Resolution

Fakturoid API v3 uses account-scoped routes in the form:

```text
/api/v3/accounts/{slug}/...
```

The SDK resolves the slug automatically after OAuth and stores it in the token store, so resource calls can work without additional manual setup.

## Authentication Flow

Typical backend flow:

1. Create the client with your app configuration and token store.
2. Redirect the user to `client.getAuthorizationUrl(tenantId, state)`.
3. Handle the callback and call `client.handleOAuthCallback(...)`.
4. Use `client.forTenant(tenantId)` for all subsequent API calls.

## Resource Clients

Each tenant client exposes typed resource modules:

- `account`
- `bankAccounts`
- `events`
- `expensePayments`
- `expenses`
- `generators`
- `inboxFiles`
- `inventoryItems`
- `inventoryMoves`
- `invoiceMessages`
- `invoicePayments`
- `invoices`
- `numberFormats`
- `recurringGenerators`
- `subjects`
- `todos`
- `users`
- `webhooks`

Example:

```ts
const tenant = client.forTenant('tenant-123');

const invoice = await tenant.invoices.create({
  subject_id: 123,
  lines: [
    {
      name: 'Consulting',
      quantity: 2,
      unit_price: 2500,
    },
  ],
});
```

## Type Safety

The package exports shared domain types and resource-specific payloads, for example:

- `NewInvoice`, `UpdateInvoice`, `Invoice`
- `NewSubject`, `UpdateSubject`, `Subject`
- `NewExpense`, `UpdateExpense`, `Expense`
- `NewGenerator`, `RecurringGenerator`
- `FakturoidDocumentLine`, `FakturoidVatRate`, `MoneyAmount`

This makes it suitable for backend services, internal SDK wrappers, and typed app integrations.

## Convex / Server Integration

The SDK is framework-agnostic, but it fits naturally into backend runtimes such as:

- Convex
- Next.js API routes
- Express
- Fastify
- NestJS
- serverless functions

For Convex-style usage, a typical pattern is:

- `getFakturoidClient(ctx)` to construct the SDK with your token store
- `startFakturoidOAuth(ctx, tenantId)` to initiate OAuth
- `completeFakturoidOAuth(ctx, params)` to finalize OAuth and persist tokens

## Documentation Alignment

This repository is being aligned against the provided Fakturoid API v3 documentation with emphasis on:

- required vs. optional fields
- read-only vs. write-only fields
- request payload correctness
- response type fidelity

Audit notes live in [docs/AUDIT.md](/Users/samuel/projects/fakturoid-typescript-api/docs/AUDIT.md).

## Development

Install dependencies:

```bash
bun install
```

Build:

```bash
bun run build
```

Type-check:

```bash
bun run typecheck
```

Test:

```bash
bun test
```

Format and lint:

```bash
bun run format
bun run lint
```

## Publishing

- `Publish to npmjs` publishes the package to the public npm registry using Bun-native `bun publish`.
- `Publish to GitHub npm Registry` publishes the same scoped package to GitHub Packages using Bun-native registry configuration.
- Both release workflows resolve the Bun version from `package.json` and do not depend on `setup-node`.

## Integration Tests

Tests in `tests/integration/` require real Fakturoid credentials. Depending on your setup, configure environment variables such as:

- `FAKTUROID_CLIENT_ID`
- `FAKTUROID_CLIENT_SECRET`
- `FAKTUROID_REFRESH_TOKEN`

The SDK can obtain the account slug automatically after token refresh.
