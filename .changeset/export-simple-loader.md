---
"@codecks/fetch": minor
---

- Export `createSimpleLoader` and its `TransportOptions`, the loader `buildFetchers` uses. With
  `buildFetchersFromLoader` it takes any auth headers, or a `fetch` that adds them per request, e.g.
  a session and an `X-Account` that change at runtime.
- `buildLegacyFetchers` without a `baseUrl` reaches `https://api.codecks.io/`; it sent a relative
  url.
