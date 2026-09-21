---
"@codecks/fetch": major
---

Authenticate with the new API tokens over `Authorization: Bearer`.

- `buildFetchers({token})` takes an organization (`cdxat_…`) or personal (`cdxut_…`) token and
  sends it as a bearer header. Other token formats throw, since the API would ignore them and
  answer as if logged out. `baseUrl` defaults to `https://api.codecks.io/`; no subdomain is needed.
- The previous `buildFetchersWithSimpleLoader` is renamed to `buildLegacyFetchers` and keeps sending
  `X-Auth-Token` / `X-Account`. The API stops accepting `X-Auth-Token` on 2026-12-31.
- The previous `buildFetchers(loader)` is renamed to `buildFetchersFromLoader(loader)`.
- `ApiRequester` (`@codecks/fetch/_exploration/api-requester`) now requires `token` and uses bearer auth.
- A non-2xx answer throws `CodecksApiError` with `status`, `code`, `path` and the parsed `body`,
  also when the body isn't JSON.
- The `timeout` option now aborts the request; it was accepted but ignored before.
