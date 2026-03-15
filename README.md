# Fakturoid TypeScript SDK (backend, multi-tenant, Convex-ready)

Backendová TypeScript knihovna pro integraci s Fakturoid API v3, navržená pro
multi-tenant aplikace (tisíce tenantů) a snadné použití v Convex backendu.

## Základní koncepty

- **Authorization Code OAuth2 flow** pro každého tenant uživatele.
- **Abstraktní `FakturoidTokenStore`** – vy rozhodujete, kde a jak ukládáte tokeny
  (Convex databáze, Postgres, Redis, ...).
- **Account slug** – po dokončení OAuth se automaticky získá slug účtu (voláním
  `GET /api/v3/user.json`) a uloží do tokenů. Všechny volání API pak používají
  cestu `accounts/{slug}/...` podle dokumentace Fakturoid API v3.
- **Doménové moduly**: `subjects`, `invoices`, `account`, `expenses`, `webhooks`, atd.

## Rychlý start

```ts
import { createFakturoidClient } from 'fakturoid-typescript-api';

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

// 1) Přesměrování uživatele na Fakturoid OAuth (URL: /api/v3/oauth)
const url = client.getAuthorizationUrl(tenantId, state);

// 2) Zpracování callbacku (např. v API route) – uloží tokeny a doplní slug z API
await client.handleOAuthCallback({ code, state, tenantId });

// 3) Práce s daty pro konkrétního tenanta (všechny requesty jdou na accounts/{slug}/...)
const tenant = client.forTenant(tenantId);
const account = await tenant.account.getAccountInfo();
const invoices = await tenant.invoices.list();
const subjects = await tenant.subjects.list();
```

## Přehled podporovaných resources

Pro každého tenanta (`const t = client.forTenant(tenantId)`) máš k dispozici:

- `t.subjects` – klienti/dodavatelé
- `t.invoices` – faktury
- `t.recurringGenerators` – opakované faktury
- `t.generators` – jednorázové šablony
- `t.invoiceMessages` – odesílání faktur e‑mailem
- `t.invoicePayments` – platby faktur
- `t.expenses` – nákladové doklady
- `t.expensePayments` – platby nákladů
- `t.bankAccounts` – bankovní účty
- `t.inventoryItems` – skladové položky
- `t.inventoryMoves` – skladové pohyby
- `t.webhooks` – webhooky
- `t.events` – události
- `t.todos` – úkoly
- `t.inboxFiles` – příchozí soubory
- `t.users` – uživatelé
- `t.numberFormats` – číselné řady

## Integrace s Convexem (náčrt)

V Convex komponentě vytvořte implementaci `FakturoidTokenStore` nad Convex DB a
poskytněte helper funkce:

- `getFakturoidClient(ctx)` – vytvoří klienta s Convex token store.
- `startFakturoidOAuth(ctx, tenantId)` – vrátí redirect URL.
- `completeFakturoidOAuth(ctx, params)` – uloží tokeny po callbacku.

Na to pak navážete své `query`/`mutation`/`action` funkce, které budou volat
doménové metody `subjects`, `invoices` a `account`.

## Testování

- **Unit testy:** `bun test` (spustí testy pro HttpClient, OAuthService, resources).
- **Integrační testy:** testy v `tests/integration/` se spouští jen při nastavených
  proměnných prostředí. Pro běh proti reálnému účtu nastav:
  - `FAKTUROID_CLIENT_ID`
  - `FAKTUROID_CLIENT_SECRET`
  - `FAKTUROID_REFRESH_TOKEN` (získej jednorázově po dokončení OAuth – přihlášení
    do Fakturoidu, schválení aplikace, z callbacku nebo z token store uložení).

Slug účtu se při integračních testech získá automaticky z API po refreshi tokenu.
