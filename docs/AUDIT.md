# Audit Fakturoid API v3 vs SDK

**Poslední ověření:** 15. 03. 2026 – porovnáno s [Fakturoid API v3](https://www.fakturoid.cz/api/v3) včetně changelogu.

## Stav: SDK byl znovu srovnán s API v3

Endpointy, query parametry, HTTP metody a cesty odpovídají dokumentaci na [fakturoid.cz/api/v3](https://www.fakturoid.cz/api/v3). Při revizi byly navíc opraveny i typové nesoulady v několika response modelech.

### Ověřené oblasti

| Oblast                       | Stav                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| Base URL                     | ✅ `https://app.fakturoid.cz`                                                          |
| Account-scoped cesty         | ✅ Všechny endpointy používají `/api/v3/accounts/{slug}/...`                           |
| Current user                 | ✅ `GET /api/v3/user.json` (bez slug)                                                  |
| Account detail               | ✅ `GET /api/v3/accounts/{slug}/account.json`                                          |
| OAuth                        | ✅ Auth: `/api/v3/oauth`, Token: `/api/v3/oauth/token`, Revoke: `/api/v3/oauth/revoke` |
| OAuth Basic auth             | ✅ URL-safe Base64 `client_id:client_secret` podle dokumentace                         |
| DELETE odpovědi              | ✅ HttpClient správně zpracovává 204 No Content                                        |
| Chybové odpovědi             | ✅ FakturoidApiError podporuje `errors` i `error`/`error_description`                  |
| Paginace                     | ✅ 40 záznamů na stránku, parametr `page`                                              |
| MoneyAmount                  | ✅ Typ `string                                                                         | number` (API vrací decimální stringy) |
| Rate limiting                | ✅ Retry s X-RateLimit header, 429 handling                                            |
| Changelog 2024–2026          | ✅ Dopsány novější atributy a vstupní payloady podle changelogu                        |
| Recurring generators actions | ✅ `PATCH .../pause.json`, `PATCH .../activate.json`, aktivace přijímá JSON body       |
| Number formats               | ✅ Dokumentovaný endpoint pouze `number_formats/invoices.json`                         |
| Account plan                 | ✅ `account.plan` není uzavřený enum, ale obecný `string` podle dokumentace            |
| Events user payload          | ✅ `events[].user` používá `id` a `avatar`                                             |
| Invoice delivery fields      | ✅ `client_has_delivery_address` a `client_delivery_*` doplněny do invoice modelů      |

### Specifické API omezení implementované v SDK

- **Bank accounts:** Pouze list, bez `get(id)` – API nemá detail endpoint
- **Invoice / Expense payments:** Bez `list()` – platby jsou součástí detailu dokumentu (`invoice.payments`, `expense.payments`)
- **Inventory moves:** List na ploché cestě, detail/create/update/delete vnořeny pod `/inventory_items/{id}/inventory_moves/...`
- **Inbox files:** Bez `get(id)` – API nemá detail endpoint
- **Webhooks failed_deliveries:** Cesta používá `failed_deliveries_uuid` (UUID z webhook objektu), ne webhook `id`
- **Recurring generators pause/activate:** Obě akce používají `PATCH` a vracejí aktualizovaný generator; `activate` přijímá `next_occurrence_on` v request body
- **Number formats:** Ve veřejné dokumentaci API v3 je zdokumentován pouze endpoint `/accounts/{slug}/number_formats/invoices.json`

### Datové typy ověřené s API

- **InventoryMove:** `direction`, `moved_on`, `quantity_change`, `purchase_price`
- **InboxFile:** `created_at`, `updated_at`, `ocr_status`, `download_url`
- **AccountInfo:** `subdomain` (API vrací `subdomain`, ne `slug`)
- **Account / Users / Events:** doplněny dokumentované atributy účtu, uživatele a event payloadů; `account.plan` uvolněn na `string`, `events.user` opraven na `id` + `avatar`
- **Account:** `invoice_payment_method` zpřesněn na aktuálně dokumentované hodnoty `bank | card | cash | cod | paypal | null`
- **Invoice:** doplněny `bank_account_id`, `round_total`, `rounding_adjustment`, `last_reminder_sent_at`, `lines`, `attachments`
- **Invoice:** doplněna také klientská doručovací adresa (`client_has_delivery_address`, `client_delivery_*`) a zpřesněny vnořené typy `payments`, `vat_rates_summary`, `paid_advances`, `eet_records`
- **Invoice EET records:** doplněny i starší dokumentované atributy `vat_base3`, `vat3`, `fik_received_at`, `attempts`, `last_attempt_at`, `last_uuid`, `playground`, `invoice_id`
- **Expense:** doplněny `remind_due_date`, `round_total`, `rounding_adjustment`, `lines`, `attachments`
- **Expense:** zpřesněny vnořené typy `payments` a `vat_rates_summary`
- **Invoice / Expense / Subject:** doplněny další dokumentované atributy a vstupy (`due`, `vat_mode`, `private_note`, adresní a platební pole, OSS / TTL metadata)
- **Subject:** doplněna nastavení `setting_update_from_ares`, `setting_invoice_pdf_attachments`, `setting_estimate_pdf_attachments`, `setting_invoice_send_reminders`
- **Subject:** `webinvoice_history` nyní odpovídá dokumentovaným hodnotám `disabled | recent | client_portal | null` a je dostupný i v payloadu create/update
- **Subject settings:** typy odpovídají dokumentaci (`inherit | on | off`), `ares_update` zůstává jako deprecated boolean
- **Generator / RecurringGenerator:** doplněny `round_total`, `rounding_adjustment`, `lines`, `legacy_bank_details`, plánovací a platební atributy
- **Generator / RecurringGenerator payloady:** doplněny `number_format_id`, `footer_note`, `legacy_bank_details`, `iban_visibility`, `tags`, `currency`, `custom_payment_method`, `language`, `supply_code`, `oss`

### Poznámka k payloadům

- `create()` a `update()` pro `subjects`, `invoices`, `expenses`, `generators` a `recurring-generators` už nepoužívají odvození z response modelů, ale samostatné vstupní typy odpovídající API payloadům.
- `invoiceMessages.sendInvoiceByEmail()` nově odpovídá API i v tom, že tělo requestu může být prázdné a všechny atributy jsou skutečně volitelné.

## Přehled resources a cest

| Resource             | List/Index                                      | Detail/Get                                                            | Create                                 | Update           | Delete                          | Poznámky                                                          |
| -------------------- | ----------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------- | ---------------- | ------------------------------- | ----------------------------------------------------------------- |
| subjects             | `/accounts/{slug}/subjects.json`                | `/accounts/{slug}/subjects/{id}.json`                                 | POST                                   | PATCH            | DELETE                          | search.json                                                       |
| account              | –                                               | `/accounts/{slug}/account.json`                                       | –                                      | –                | –                               |                                                                   |
| invoices             | `/accounts/{slug}/invoices.json`                | `/accounts/{slug}/invoices/{id}.json`                                 | POST                                   | PATCH            | DELETE                          | search.json, fire.json, download.pdf, attachments                 |
| users                | `/accounts/{slug}/users.json`                   | –                                                                     | –                                      | –                | –                               |                                                                   |
| current user         | –                                               | `GET /api/v3/user.json`                                               | –                                      | –                | –                               | Bez slug                                                          |
| expenses             | `/accounts/{slug}/expenses.json`                | `/accounts/{slug}/expenses/{id}.json`                                 | POST                                   | PATCH            | DELETE                          | search.json, fire.json, attachments                               |
| webhooks             | `/accounts/{slug}/webhooks.json`                | `/accounts/{slug}/webhooks/{id}.json`                                 | POST                                   | PATCH            | DELETE                          | webhooks/{failed_deliveries_uuid}/failed_deliveries.json          |
| bank-accounts        | `/accounts/{slug}/bank_accounts.json`           | –                                                                     | –                                      | –                | –                               | Pouze list                                                        |
| events               | `/accounts/{slug}/events.json`                  | –                                                                     | –                                      | –                | –                               | events/paid.json                                                  |
| todos                | `/accounts/{slug}/todos.json`                   | –                                                                     | –                                      | –                | –                               | toggle_completion.json                                            |
| number-formats       | `/accounts/{slug}/number_formats/invoices.json` | –                                                                     | –                                      | –                | –                               | Veřejná dokumentace uvádí pouze invoices                          |
| inbox-files          | `/accounts/{slug}/inbox_files.json`             | –                                                                     | POST                                   | –                | DELETE                          | send_to_ocr.json, download                                        |
| generators           | `/accounts/{slug}/generators.json`              | `/accounts/{slug}/generators/{id}.json`                               | POST                                   | PATCH            | DELETE                          |                                                                   |
| recurring-generators | `/accounts/{slug}/recurring_generators.json`    | `/accounts/{slug}/recurring_generators/{id}.json`                     | POST                                   | PATCH            | DELETE                          | pause.json, activate.json                                         |
| invoice-messages     | –                                               | –                                                                     | `POST .../invoices/{id}/message.json`  | –                | –                               |                                                                   |
| invoice-payments     | –                                               | –                                                                     | `POST .../invoices/{id}/payments.json` | –                | `DELETE .../payments/{id}.json` | create_tax_document.json                                          |
| expense-payments     | –                                               | –                                                                     | `POST .../expenses/{id}/payments.json` | –                | `DELETE .../payments/{id}.json` |                                                                   |
| inventory-items      | `/accounts/{slug}/inventory_items.json`         | `/accounts/{slug}/inventory_items/{id}.json`                          | POST                                   | PATCH            | DELETE                          | archived.json, low_quantity.json, search.json, archive, unarchive |
| inventory-moves      | `/accounts/{slug}/inventory_moves.json`         | `/accounts/{slug}/inventory_items/{itemId}/inventory_moves/{id}.json` | POST (pod item)                        | PATCH (pod item) | DELETE (pod item)               | Detail/create/update/delete vnořeny                               |
