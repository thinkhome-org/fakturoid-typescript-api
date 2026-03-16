ZavÅÃ­t menu

[Fakturoid web â](/)

*   [Introduction](/api/v3)
*   [Changelog](/api/v3/changelog)
*   [Authorization](/api/v3/authorization)
    *   [Authorization Code Flow](#authorization-code-flow)
    *   [Client Credentials Flow](#client-credentials-flow)
    *   [How to use access token](#how-to-use-access-token)
*   [Users](/api/v3/users)
*   [Account](/api/v3/account)
*   [Bank Accounts](/api/v3/bank-accounts)
*   [Number Formats](/api/v3/number-formats)
*   [Subjects](/api/v3/subjects)
*   [Invoices](/api/v3/invoices)
*   [Invoice Payments](/api/v3/invoice-payments)
*   [Invoice Messages](/api/v3/invoice-messages)
*   [Expenses](/api/v3/expenses)
*   [Expense Payments](/api/v3/expense-payments)
*   [Inbox Files](/api/v3/inbox-files)
*   [Inventory Items](/api/v3/inventory-items)
*   [Inventory Moves](/api/v3/inventory-moves)
*   [Generators](/api/v3/generators)
*   [Recurring Generators](/api/v3/recurring-generators)
*   [Events](/api/v3/events)
*   [Todos](/api/v3/todos)
*   [Webhooks](/api/v3/webhooks)

# Authorization

* * *

Authorization is provided via OAuth 2.0. Fakturoid supports [Authorization Code Flow](#authorization-code-flow) and [Client Credentials Flow](#client-credentials-flow).

Authorization Code Flow should be used for multi-tenant applications (e.g. Shopify) where you need toÂ provide access for multiple users toÂ their accounts.

Client Credentials Flow can be used for the cases of creating either scripts without server component or if you want your own service toÂ access just your Fakturoid account. Using Client Credential Flow for multi-tenant applications is not recommended and can lead toÂ removal of access toÂ your integration.

For development purposes, we recommend configuring your `hosts` file toÂ point any **custom domain** toÂ your `localhost`. You can then use this **custom domain** at your "URL for redirect". This method serves as one of the possible workarounds of usual development needs, as we doÂ not permit the direct use of `localhost` as the "URL for redirect" for security reasons.

## [Authorization Code Flow](#authorization-code-flow)

Before you can use Authorization Code Flow you need toÂ create an integration in Fakturoid. If you don't already have an account, [create aÂ new one](https://app.fakturoid.cz/pub/accounts/new). In your account, go toÂ _Settings â Connect other apps â OAuth 2 for app developers_ and create aÂ new integration.

After creating the integration you will receive **Client ID** and **Client Secret** which you will need toÂ use in the communication with API.

We recommend you toÂ create at least two integrations once for testing and second for production. This way you can test your integration without affecting your production data.

You can find complete description of Authorization Code Flow in [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1).

### [Obtaining an authorization code](#obtaining-an-authorization-code)

Redirect the user from your application toÂ the following URL with query parameters:

#### [URL](#url)

`https://app.fakturoid.cz/api/v3/oauth` Copy

#### [Query Parameters](#query-parameters)

Name

Type

Description

Example

Required attribute

`client_id`

`String(40)`

Integration Client ID  
_Copy from integration settings_

`9ae1â¦f3d8` (truncated)

Required attribute

`redirect_uri`

`String`

Integration "URL for redirect" (must match the one from Fakturoid integration settings)

`https://www.example.org/redirect`

Required attribute

`response_type`

`String`

Tell server we want an authorization code  
Value must be set toÂ `"code"`

`code`

`state`

`String`

Custom value toÂ maintain between request and callback (for user identification and CSRF prevention)

`abcd1234`

If user is already logged into Fakturoid aÂ confirmation page will be shown where he can allow the integration access the his account. Logged-out user will be presented with aÂ log-in form with an option toÂ create an account if he doesn't have one.

After the user allows the access Fakturoid will redirect the user toÂ the Redirect URL specified in the integration settings with authorization code passed via query parameters (see below).

#### [Query Parameters](#query-parameters)

Name

Type

Description

Example

Required attribute

`code`

`String(80)`

Authorization code, expires after 5 minutes

`1d4eâ¦981d` (truncated)

`state`

`String`

Custom value toÂ maintain between request and callback (for user identification and CSRF prevention)

`abcd1234`

### [Obtain Access and Refresh Token](#obtain-access-and-refresh-token)

Make sure toÂ call this endpoint within 5 minutes after obtaining the authorization code. Failure toÂ doÂ so will require the user toÂ allow integration access again.

`POST` `/oauth/token`

### Request

`POST` `https://app.fakturoid.cz/api/v3/oauth/token` Copy

#### Headers

Name

Value

`User-Agent`

_Please set your user agent in the format of `YourApplicationName (your.email@example.org)`_

`Content-Type`

`application/json` or `application/x-www-form-urlencoded`

`Accept`

`application/json`

`Authorization`

HTTP Basic authentication  
Example: `Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=` where `Y2xpâ¦ZXQ=` is urlsafe Base64-encoded string of `client_id:client_secret` (replace both client\_id and client\_secret with tokens obtained from your **integration** settings in Fakturoid).

#### Body Attributes

Name

Type

Description

Required attribute

`grant_type`

`String`

We are authorizing with the authorization code  
Value must be set toÂ `"authorization_code"`

Required attribute

`code`

`String(80)`

Pass the value from request query parameter `code`

Required attribute

`redirect_uri`

`String`

Integration "URL for redirect" (must match the one from Fakturoid integration settings)

#### Body

```
{
  "grant_type": "authorization_code",
  "code": "1d4eâ¦981d",
  "redirect_uri": "https://www.example.org/redirect"
}
```

### Response

#### Headers

Name

Value

`Content-Type`

`application/json`

`Status` `200 OK`

#### Body

```
{
  "access_token": "26e53aa3244b4c0aed56cb54a0223484e9c4aea49b09a03e4600ba995811b6af06428afc223c4c0c",
  "token_type": "Bearer",
  "expires_in": 7200,
  "refresh_token": "55cfe5cc5e38e8da9646395958d4d681dd9385597f1c346aa6495ebd5b922024cd180b9b61077861"
}
```

Refresh token doesn't have an expiry date but can be deleted via revoke endpoint.

### [Refresh Access Token](#refresh-access-token)

Access token expires after 2 hours and will need toÂ be refreshed. Refreshing doesn't require the user toÂ allow integration access again.

`POST` `/oauth/token`

### Request

`POST` `https://app.fakturoid.cz/api/v3/oauth/token` Copy

#### Headers

Name

Value

`User-Agent`

_Please set your user agent in the format of `YourApplicationName (your.email@example.org)`_

`Content-Type`

`application/json` or `application/x-www-form-urlencoded`

`Accept`

`application/json`

`Authorization`

HTTP Basic authentication  
Example: `Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=` where `Y2xpâ¦ZXQ=` is urlsafe Base64-encoded string of `client_id:client_secret` (replace both client\_id and client\_secret with tokens obtained from your **integration** settings in Fakturoid).

#### Body Attributes

Name

Type

Description

Required attribute

`grant_type`

`String`

We are authorizing with the refresh token  
Value must be set toÂ `"refresh_token"`

Required attribute

`refresh_token`

`String(80)`

Refresh token

```
{
  "grant_type": "refresh_token",
  "refresh_token": "55cfâ¦7861"
}
```

### Response

#### Headers

Name

Value

`Content-Type`

`application/json`

`Status` `200 OK`

#### Body

```
{
  "access_token": "63cfcf07492268ab0e3c58e9fa48096dc5bf0a9b7bbd2f6f45e0a6fa9fc2074a4523af3538f0df5c",
  "token_type": "Bearer",
  "expires_in": 7200
}
```

### [Revoke access](#revoke-access)

Revoking deletes both access and refresh tokens (the user will need toÂ allow integration access again if needed).

`POST` `/oauth/revoke`

### Request

`POST` `https://app.fakturoid.cz/api/v3/oauth/revoke` Copy

#### Headers

Name

Value

`User-Agent`

_Please set your user agent in the format of `YourApplicationName (your.email@example.org)`_

`Content-Type`

`application/json` or `application/x-www-form-urlencoded`

`Accept`

`application/json`

`Authorization`

HTTP Basic authentication  
Example: `Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=` where `Y2xpâ¦ZXQ=` is urlsafe Base64-encoded string of `client_id:client_secret` (replace both client\_id and client\_secret with tokens obtained from your **integration** settings in Fakturoid).

#### Body Attributes

Name

Type

Description

Required attribute

`token`

`String(80)`

Refresh token

```
{
  "token": "55cfâ¦7861"
}
```

### Response

`Status` `200 OK`

## [Client Credentials Flow](#client-credentials-flow)

Before you start, go toÂ your Fakturoid account and download your **Client ID** and **Client Secret** from your user screen _Settings â User account_. You can generate multiple credentials in your account and use them for authorization.

You can find aÂ complete description of Client Credentials Flow in [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4).

### [Obtain Access Token](#obtain-access-token)

Access token expires after 2 hours after which needs toÂ be obtained again (there is noÂ refresh endpoint).

`POST` `/oauth/token`

### Request

`POST` `https://app.fakturoid.cz/api/v3/oauth/token` Copy

#### Headers

Name

Value

`User-Agent`

_Please set your user agent in the format of `YourApplicationName (your.email@example.org)`_

`Content-Type`

`application/json` or `application/x-www-form-urlencoded`

`Accept`

`application/json`

`Authorization`

HTTP Basic authentication  
Example: `Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=` where `Y2xpâ¦ZXQ=` is urlsafe Base64-encoded string of `client_id:client_secret` (replace both client\_id and client\_secret with tokens obtained from your **user** settings in Fakturoid).

#### Body Attributes

Name

Type

Description

Required attribute

`grant_type`

`String`

Value must be set toÂ `"client_credentials"`

#### Body

```
{
  "grant_type": "client_credentials"
}
```

### Response

#### Headers

Name

Value

`Content-Type`

`application/json`

`Status` `200 OK`

#### Body

```
{
  "access_token": "26e53aa3244b4c0aed56cb54a0223484e9c4aea49b09a03e4600ba995811b6af06428afc223c4c0c",
  "token_type": "Bearer",
  "expires_in": 7200
}
```

## [How toÂ use access token](#how-to-use-access-token)

All requests toÂ Fakturoid API must include the access token in the Authorization header in the following format:

```

Authorization: token_type access_token
```

For example when you receive the access token from the token endpoint:

```
{
  "access_token": "26e53aa3244b4c0aed56cb54a0223484e9c4aea49b09a03e4600ba995811b6af06428afc223c4c0c",
  "token_type": "Bearer",
  "expires_in": 7200
}
```

You will use it in the Authorization header like this:

```

Authorization: Bearer 26e53aa3244b4c0aed56cb54a0223484e9c4aea49b09a03e4600ba995811b6af06428afc223c4c0c
```

* * *

1.  [API v3](/api/v3)â
2.  [Authorization](/api/v3/authorization)